import Link from "next/link";
import { memo, lazy, Suspense } from "react";


const HeroVisual = lazy(() => import('./HeroVisual'));

// Optimized Hero component with minimal JavaScript for better performance
const Hero = memo(() => {
  return (
    <>
      {/* Navigation */}


      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">

            <h1 className="hero-title">
              <span className="title-line">Build Stunning UI/UX</span>
              <br />
              <span className="title-line gradient-text">Faster Than Ever</span>
            </h1>

            <p className="hero-description">
              A curated library of production-ready React components to bring your creative visions to life.
            </p>

            <div className="hero-actions">
              <Link href="/text-animations/text-devider" className="btn btn-primary">
                <span>Explore Components</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>

          {/* Lazy-loaded visual elements */}
          <Suspense fallback={<div style={{ height: '500px' }} />}>
            <HeroVisual />
          </Suspense>

        </div>
      </div>

      {/* Floating Elements Background */}
      <div className="bg-elements">
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
      </div>

      {/* The Features component has been moved to LandingPage.jsx */}
    </>
  );
});

Hero.displayName = 'Hero';

export default Hero;