'use client';
import Link from 'next/link';
import Footer from '@/components/landing/Footer/Footer';
import Hero from '../src/components/landing/Hero/Hero';
import dynamic from 'next/dynamic';

const Features = dynamic(() => import('@/components/landing/Hero/Features'), { ssr: false });

export default function Home() {
    return (
        <section className="landing-wrapper">
            <Hero />
            <Features />
            <Footer />
        </section>
    );
}
