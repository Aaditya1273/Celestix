import React from 'react';
import { FiCode, FiEye, FiTerminal } from 'react-icons/fi';
import './ResponsiveHeader.css';

const ResponsiveHeader = ({ title, onTabChange }) => {
  const [activeTab, setActiveTab] = React.useState('preview');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="responsive-header-container">
      {/* Left side - Title */}
      <h1 className="responsive-header-title">{title}</h1>
      
      {/* Right side - Buttons */}
      <div className="responsive-header-tabs">
        <button 
          className={`responsive-header-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => handleTabClick('preview')}
        >
          <FiEye className="responsive-header-tab-icon" /> Preview
        </button>
        <button 
          className={`responsive-header-tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => handleTabClick('code')}
        >
          <FiCode className="responsive-header-tab-icon" /> Code
        </button>
        <button 
          className={`responsive-header-tab ${activeTab === 'cli' ? 'active' : ''}`}
          onClick={() => handleTabClick('cli')}
        >
          <FiTerminal className="responsive-header-tab-icon" /> CLI
        </button>
      </div>
    </div>
  );
};

export default ResponsiveHeader;