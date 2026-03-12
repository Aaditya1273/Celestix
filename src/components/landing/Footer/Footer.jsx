import { useEffect, useRef } from 'react';
import Particles from '../Particles/Particles';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Logo } from '../../common/Misc/SVGComponents';
import { FiInfo, FiStar, FiSettings } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    // Animate footer elements
    gsap.fromTo(
      footerRef.current.querySelectorAll('.footer-animate'),
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
        },
      }
    );

    // Animations for duplicated feature cards removed.
  }, []);

  // Data for duplicated feature cards removed.

  return (
    <footer className="landing-footer">
      <Particles
        className="landing-particles"
        particleCount={150}
        particleSpread={12}
        speed={0.1}
        particleColors={["#ff8c00", "#ffffff", "#ffd700"]}
        alphaParticles={true}
        particleBaseSize={2}
        sizeRandomness={0.8}
        cameraDistance={15}
        disableRotation={false}
      />
      <div ref={footerRef}>

        <div className="footer-section">
          <h2 className="footer-title footer-animate">Explore the Possibilities</h2>
          <p className="footer-subtitle footer-animate">Start building your Next-Level UI/UX with PixenFlow</p>
        </div>
        <div className="footer-main">
          <div className="footer-left footer-animate">

            <div className="footer-logo">
              <Logo />
            </div>
            <div className="footer-tagline">
              Beautiful UI components for React developers
            </div>
            <div className="footer-copyright">
              Made with Love by Pixen Flow since 2025.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;