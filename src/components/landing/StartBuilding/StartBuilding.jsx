import { Link } from 'react-router-dom';
import './StartBuilding.css';

const StartBuilding = () => {
  return (
    <section className="start-building-section">
      <div className="start-building-container">
        <div className="start-building-card">
          <h2 className="start-building-title">Start exploring Pixen Flow</h2>
          <p className="start-building-subtitle">Animations, components, backgrounds - it&apos;s all here</p>

          <Link to="/text-animations/text-devider" className="start-building-button">Explore Components</Link>
        </div>
      </div>
    </section>
  );
};

export default StartBuilding;
