import Link from "next/link";
import { memo, lazy, Suspense } from "react";
import Aurora from "../../../ts-tailwind/Backgrounds/Aurora/Aurora";

const HeroVisual = lazy(() => import('./HeroVisual'));

const Hero = memo(() => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#00d2ff", "#3a7bd5", "#00d2ff"]}
          amplitude={1.2}
          speed={0.5}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
      </div>

      <div className="hero-container relative z-10 w-full max-w-7xl px-6">
        <div className="hero-content text-center max-w-4xl mx-auto">
          <div className="animate-float mb-6 inline-block">
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Introducing Celestix 2.0
            </span>
          </div>

          <h1 className="hero-title text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="title-line text-white">BUILD BEYOND</span>
            <br />
            <span className="title-line gradient-text">IMAGINATION</span>
          </h1>

          <p className="hero-description text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            The world's most sophisticated React component library. Crafted for developers who demand visual excellence and peak performance.
          </p>

          <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/text-animations/text-devider" className="btn-premium-primary">
              Get Started
            </Link>
            <Link href="/showcase" className="btn-premium-secondary">
              View Showcase
            </Link>
          </div>
        </div>

        {/* Lazy-loaded visual elements (Optional floating cards) */}
        <div className="mt-20 opacity-50 scale-90 md:scale-100">
          <Suspense fallback={null}>
            <HeroVisual />
          </Suspense>
        </div>
      </div>

      {/* Decorative Overlays */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-black to-transparent pointer-events-none"></div>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;