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

          <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/text-animations/text-devider" className="btn-premium-primary">
              Get Started
            </Link>
            <Link href="/showcase" className="btn-premium-secondary">
              View Showcase
            </Link>
          </div>

          {/* Premium Horizontal Stats Row */}
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-16 max-w-4xl mx-auto pt-12 border-t border-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>

            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors">80+</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">Components</div>
            </div>

            <div className="text-center group py-6 sm:py-0 border-y sm:border-y-0 sm:border-x border-white/5 sm:px-12">
              <div className="text-4xl md:text-5xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">10k+</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">Developers</div>
            </div>

            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors">100%</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">Open Source</div>
            </div>
          </div>
        </div>

        {/* Lazy-loaded visual elements */}
        <div className="mt-20 opacity-30 scale-90 md:scale-100 grayscale hover:grayscale-0 transition-all duration-1000">
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