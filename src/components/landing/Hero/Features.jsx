import { memo } from 'react';
import { FiZap, FiLayers, FiGithub, FiEye } from 'react-icons/fi';

const Features = memo(() => {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl md:text-7xl font-black mb-6 gradient-text tracking-tighter">
            ENGINEERED FOR EXCELLENCE
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Every component is a masterpiece of design and engineering, optimized for the next generation of web applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {/* Main Bento Card */}
          <div className="md:col-span-2 md:row-span-2 premium-card flex flex-col justify-end group overflow-hidden relative border-white/5 bg-white/[0.02]">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-30 transition-opacity duration-700">
              <FiZap className="w-64 h-64 text-blue-400 rotate-12" />
            </div>

            <div className="relative z-10 p-4 md:p-8">
              <div className="mb-8 p-4 bg-blue-500/10 rounded-3xl w-fit backdrop-blur-xl border border-blue-500/20">
                <FiZap className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">INFINITE PERFORMANCE</h3>
              <p className="text-white/50 text-xl max-w-lg leading-relaxed">
                Zero compromise on speed. Next-gen performance optimized for React 19 and Next.js 15.
              </p>
            </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="premium-card group relative flex flex-col justify-between border-white/5 bg-white/[0.02]">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="p-4 bg-purple-500/10 rounded-2xl w-fit border border-purple-500/20">
              <FiLayers className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">GLASSMORPHISM 2.0</h3>
              <p className="text-white/40 text-sm leading-relaxed">Adaptive translucent layers for a modern, futuristic aesthetic.</p>
            </div>
          </div>

          {/* Open Source Card */}
          <div className="premium-card group relative flex flex-col justify-between border-white/5 bg-white/[0.02]">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="p-4 bg-green-500/10 rounded-2xl w-fit border border-green-500/20">
              <FiGithub className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">OPEN SOURCE</h3>
              <p className="text-white/40 text-sm leading-relaxed">100% free and open. Built for the community development.</p>
            </div>
          </div>

          {/* Accessibility Wide Card */}
          <div className="md:col-span-3 premium-card flex flex-col md:flex-row items-center justify-between group gap-8 border-white/5 bg-white/[0.02]">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <FiEye className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">ACCESSIBILITY FIRST</h3>
              </div>
              <p className="text-white/40 text-lg max-w-3xl leading-relaxed">
                Every component is accessibility-tested, following WAI-ARIA guidelines for a truly inclusive experience.
              </p>
            </div>
            <div className="hidden md:block opacity-20 group-hover:opacity-50 transition-all duration-700 group-hover:scale-110">
              <FiEye className="w-24 h-24 text-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Features.displayName = 'Features';

export default Features;
