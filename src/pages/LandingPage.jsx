import { useEffect, memo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/landing/Footer/Footer";
import Hero from "../components/landing/Hero/Hero";
const Features = lazy(() => import("../components/landing/Hero/Features"));

// Optimized LandingPage component with minimal JavaScript for better performance
const LandingPage = memo(() => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="landing-wrapper">
      <title>PixenFlow - High-Performance React UI Components</title>
      
      {/* Navigation */}
      <nav className="hero-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L26 8V24L16 30L6 24V8L16 2Z" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M16 6L22 10V22L16 26L10 22V10L16 6Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <path d="M16 10L18 12V20L16 22L14 20V12L16 10Z" fill="white"/>
              </svg>
            </div>
            <span className="logo-text">Pixen Flow</span>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link" color="Orange" >Home</Link>
            <Link to="/text-animations/text-devider" className="nav-link">Components</Link>
          </div>
        </div>
      </nav>
      
      <Hero />
      <Suspense fallback={null}>
        <Features />
      </Suspense>
      <Footer />
    </section>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
