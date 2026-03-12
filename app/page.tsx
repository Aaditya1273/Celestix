import Link from 'next/link';
import Footer from '@/components/landing/Footer/Footer';
import Hero from '../src/components/landing/Hero/Hero';
import dynamic from 'next/dynamic';

const Features = dynamic(() => import('@/components/landing/Hero/Features'), { ssr: false });

export default function Home() {
    return (
        <section className="landing-wrapper">
            {/* Navigation */}
            <nav className="hero-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 2L26 8V24L16 30L6 24V8L16 2Z" stroke="white" strokeWidth="2" fill="none" />
                                <path d="M16 6L22 10V22L16 26L10 22V10L16 6Z" stroke="white" strokeWidth="1.5" fill="none" />
                                <path d="M16 10L18 12V20L16 22L14 20V12L16 10Z" fill="white" />
                            </svg>
                        </div>
                        <span className="logo-text">Pixen Flow</span>
                    </div>
                    <div className="nav-links">
                        <Link href="/" className="nav-link active">Home</Link>
                        <Link href="/showcase" className="nav-link">Showcase</Link>
                        <Link href="/text-animations/text-devider" className="nav-link">Components</Link>
                    </div>
                </div>
            </nav>

            <Hero />
            <Features />
            <Footer />
        </section>
    );
}
