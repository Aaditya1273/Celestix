// lib/infra/llm.js
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = "https://evmrpc-testnet.0g.ai";
const LLAMA_PROVIDER_ADDRESS = "0xf07240Efa67755B5311bc75784a061eDB47165Dd";
const MINIMUM_DEPOSIT_AMOUNT = "1.1";

export class ZeroGravityAI {
    constructor() {
        this.broker = null;
        this.wallet = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        const privateKey = process.env.OG_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("CRITICAL: OG_PRIVATE_KEY environment variable is not set!");
        }

        console.log("🤖 Initializing 0G Compute Broker...");
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            this.wallet = new ethers.Wallet(privateKey, provider);
            this.broker = await createZGComputeNetworkBroker(this.wallet);
            
            await this._ensureLedgerFunded();
            await this._acknowledgeProvider();

            this.isInitialized = true;
            console.log(`✅ 0G Compute initialized with wallet: ${this.wallet.address}`);
        } catch (error) {
            console.error("❌ Failed to initialize 0G Compute:", error);
            throw error;
        }
    }

    async _ensureLedgerFunded() {
        let computeLedger;
        try {
            computeLedger = await this.broker.ledger.getLedger();
        } catch (error) {
            if (error.code === 'BAD_DATA' || (error.revert && error.revert.name === 'LedgerNotExists')) {
                computeLedger = null;
            } else {
                throw error;
            }
        }

        const requiredLedgerBalance = ethers.parseEther(MINIMUM_DEPOSIT_AMOUNT);
        const currentBalance = computeLedger ? computeLedger.totalBalance : 0n;
        const amountToDeposit = requiredLedgerBalance - currentBalance;

        if (amountToDeposit > 0n) {
            const amountToDepositEther = ethers.formatEther(amountToDeposit);
            console.log(`💰 Funding 0G Compute Ledger with ${amountToDepositEther} OG...`);
            
            try {
                if (!computeLedger) {
                    await this.broker.ledger.addLedger(parseFloat(amountToDepositEther));
                } else {
                    await this.broker.ledger.depositFund(parseFloat(amountToDepositEther));
                }
            } catch (err) {
                console.warn(`⚠️ Warning: Failed to fund ledger. Proceeding anyway. Error: ${err.message}`);
            }
        }
    }

    async _acknowledgeProvider() {
        try {
            await this.broker.inference.acknowledgeProviderSigner(LLAMA_PROVIDER_ADDRESS);
        } catch (e) {
            if (!e.message || !e.message.includes("already exists")) {
                console.warn(`⚠️ Warning: Failed to acknowledge provider. Proceeding anyway. Error: ${e.message}`);
            }
        }
    }

    async generate(prompt) {
        if (!this.isInitialized) await this.initialize();

        try {
            console.log("📡 Sending inference request to 0G...");
            const targetProvider = LLAMA_PROVIDER_ADDRESS;
            const headers = await this.broker.inference.getRequestHeaders(targetProvider, prompt);
            const { endpoint, model } = await this.broker.inference.getServiceMetadata(targetProvider);

            const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    model: model,
                }),
            });

            if (!response.ok) throw new Error(`0G Provider error: ${response.statusText}`);

            const data = await response.json();
            const answer = data.choices[0].message.content;

            try {
                await this.broker.inference.processResponse(targetProvider, answer, data.id);
            } catch (verifErr) {
                console.warn(`⚠️ Warning: On-chain verification failed. Error: ${verifErr.message}`);
            }

            return this._cleanJsonResponse(answer);
        } catch (error) {
            console.error(`❌ 0G Compute catastrophic failure: ${error.message}`);
            
            // Production Circuit Breaker: Failover to Gemini 2.5 Flash
            if (process.env.GEMINI_API_KEY) {
                console.log("🔄 0G Network offline. Failing over to Gemini 2.5 Flash...");
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
                        })
                    }
                );

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(`Gemini 2.5 Flash failover failed: ${response.status} — ${JSON.stringify(errData)}`);
                }
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("Invalid response format from Gemini 2.5 Flash");

                return this._cleanJsonResponse(text);
            } else {
                throw new Error("0G Galileo Testnet Inference Contracts are currently unresponsive. Please provide a GEMINI_API_KEY in .env to enable the emergency failover circuit breaker and resume gameplay.");
            }
        }
    }

    _cleanJsonResponse(text) {
        text = text.trim();
        if (text.startsWith("```json")) text = text.slice(7);
        if (text.endsWith("```")) text = text.slice(0, -3);
        return text.trim();
    }
}
