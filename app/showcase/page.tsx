import Link from 'next/link';

export default function ShowcasePage() {
    return (
        <section className="showcase-wrapper">
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
                        <Link href="/" className="nav-link">Home</Link>
                        <Link href="/showcase" className="nav-link active">Showcase</Link>
                        <Link href="/text-animations/text-devider" className="nav-link">Components</Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="showcase-content">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-center mb-8">Component Showcase</h1>
                    <p className="text-lg text-center mb-12 text-gray-400">
                        Explore our collection of high-performance React UI components
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="showcase-item p-6 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                            <h3 className="text-xl font-semibold mb-2">Text Animations</h3>
                            <p className="text-gray-400 mb-4">Beautiful text animation components</p>
                            <Link href="/text-animations/text-devider" className="text-[#ff8c00] hover:underline">
                                View Components →
                            </Link>
                        </div>

                        <div className="showcase-item p-6 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                            <h3 className="text-xl font-semibold mb-2">Backgrouds</h3>
                            <p className="text-gray-400 mb-4">Engaging visual effects</p>
                            <Link href="/backgrounds/orb" className="text-[#ff8c00] hover:underline">
                                View Components →
                            </Link>
                        </div>

                        <div className="showcase-item p-6 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                            <h3 className="text-xl font-semibold mb-2">Components</h3>
                            <p className="text-gray-400 mb-4">Essential UI building blocks</p>
                            <Link href="/components/stack" className="text-[#ff8c00] hover:underline">
                                View Components →
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}
