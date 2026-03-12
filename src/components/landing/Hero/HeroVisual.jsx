import { memo } from 'react';

const HeroVisual = memo(() => {
  return (
    <div className="hero-visual">
      <div className="floating-elements">
        {/* Card 1: Dots */}
        <div className="floating-card card-1">
          <div className="card-dots">
            {[...Array(9)].map((_, i) => <div key={i} className="dot"></div>)}
          </div>
        </div>
        {/* Card 2: Code Snippet */}
        <div className="floating-card card-2">
          <div className="code-lines">
            <div className="code-line">
              <span className="code-keyword">const</span>
              <span className="code-var">animation</span>
              <span className="code-operator">=</span>
              <span className="code-string">"fadeIn"</span>;
            </div>
            <div className="code-line">
              <span className="code-keyword">export default</span>
              <span className="code-var">Component</span>;
            </div>
          </div>
        </div>
        {/* Card 3: Grid Pattern */}
        <div className="floating-card card-3">
          <div className="grid-pattern">
            <div className="grid-line"></div>
            <div className="grid-line"></div>
            <div className="grid-line"></div>
            <div className="grid-line"></div>
          </div>
        </div>
        <div className="hero-glow"></div>
      </div>
    </div>
  );
});

HeroVisual.displayName = 'HeroVisual';

export default HeroVisual;
