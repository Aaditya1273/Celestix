import { memo, useState, useEffect, useRef } from 'react';
import './Features.css';

const Features = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const features = [
    {
      id: 1,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      ),
      title: "Responsive Design",
      description: "Components that look great on any device, from mobile to desktop.",
      gradient: "from-orange-400 to-orange-600",
      shadowColor: "shadow-orange-500/30",
      borderColor: "border-orange-500/40",
      hoverBorder: "hover:border-orange-400/80"
    },
    {
      id: 2,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12.22 2h-4.44a2 2 0 0 0-2 2v.78a2 2 0 0 1-1.11 1.79l-1.33.88a2 2 0 0 0-.89 2.63l1.22 2.16a2 2 0 0 1 .36 1.18v2.96a2 2 0 0 0 2 2h4.44a2 2 0 0 0 2-2v-2.96a2 2 0 0 1 .36-1.18l1.22-2.16a2 2 0 0 0-.89-2.63l-1.33-.88a2 2 0 0 1-1.11-1.79V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
      title: "Customizable",
      description: "Easily adapt components to match your brand's unique style and requirements.",
      gradient: "from-orange-400 to-orange-600",
      shadowColor: "shadow-orange-500/30",
      borderColor: "border-orange-500/40",
      hoverBorder: "hover:border-orange-400/80"
    },
    {
      id: 3,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ),
      title: "Production Ready",
      description: "Thoroughly tested components that are ready for your production environment.",
      gradient: "from-orange-400 to-orange-600",
      shadowColor: "shadow-orange-500/30",
      borderColor: "border-orange-500/40",
      hoverBorder: "hover:border-orange-400/80"
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{
            right: `${mousePosition.x * 0.03}px`,
            bottom: `${mousePosition.y * 0.03}px`,
          }}
        ></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i * 7)}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Features Grid */}
        <div className="flex gap-8 justify-center max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group feature-card relative transition-all duration-1000 ease-out ${ 
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Border Gradient */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 h-full border ${feature.borderColor} ${feature.hoverBorder} transition-all duration-500 group-hover:transform group-hover:-translate-y-2 group-hover:${feature.shadowColor} group-hover:shadow-2xl`}>
                
                {/* Glowing Background Effect */}
                <div className="card-glow absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon Section */}
                <div className="relative feature-icon mb-8">
                  {/* Icon Background Glow */}
                  <div className={`absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500`}></div>
                  
                  {/* Icon Container */}
                  <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                    <div className={`transition-all duration-300 ${hoveredCard === feature.id ? 'animate-pulse' : ''}`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Animated Ring */}
                  <div className={`icon-ring absolute top-0 left-0 w-14 h-14 rounded-2xl border-2 border-orange-400/30 transform transition-all duration-1000 ${hoveredCard === feature.id ? 'scale-150 opacity-0 rotate-180' : 'scale-100 opacity-100 rotate-0'}`}></div>
                  
                  {/* Secondary Ring */}
                  <div className={`absolute top-0 left-0 w-14 h-14 rounded-2xl border border-orange-400/20 transform transition-all duration-700 ${hoveredCard === feature.id ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`}></div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className={`text-2xl font-bold mb-4 transition-all duration-500 ${hoveredCard === feature.id ? 'text-transparent bg-gradient-to-r bg-clip-text from-orange-400 to-orange-600 feature-title-hover' : 'text-orange-400'}`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-300 leading-relaxed transition-colors duration-300 group-hover:text-slate-200">
                    {feature.description}
                  </p>
                </div>

                {/* Floating Particles on Hover */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  {hoveredCard === feature.id && [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="hover-particle absolute w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-60"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random()}s`
                      }}
                    ></div>
                  ))}
                </div>

                {/* Bottom Highlight */}
                <div className={`bottom-highlight absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full`}></div>
              </div>

              {/* External Glow */}
              <div className={`external-glow absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 -z-10`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Features.displayName = 'Features';

export default Features;
