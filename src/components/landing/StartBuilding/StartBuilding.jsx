import Link from 'next/link';

const StartBuilding = () => {
  return (
    <section className="py-24 px-6 relative bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="premium-card bg-linear-to-br from-orange-500/10 to-transparent border-orange-500/10 p-12 text-center group">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            START EXPLORING CELESTIX
          </h2>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Animations, components, backgrounds - everything you need to build the next-generation web experience.
          </p>

          <Link href="/text-animations/text-devider" className="btn-premium-primary inline-flex">
            Explore Components
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StartBuilding;
