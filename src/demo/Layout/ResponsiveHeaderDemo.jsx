import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { CliTab, CodeTab, PreviewTab, TabbedLayout } from '../../components/common/TabbedLayout';
import ResponsiveHeader from '../../components/common/ResponsiveHeader';
import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';
import CliInstallation from '../../components/code/CliInstallation';

const responsiveHeaderCode = {
  jsx: `import React from 'react';
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
          className={\`responsive-header-tab \${activeTab === 'preview' ? 'active' : ''}\`}
          onClick={() => handleTabClick('preview')}
        >
          <FiEye className="responsive-header-tab-icon" /> Preview
        </button>
        <button 
          className={\`responsive-header-tab \${activeTab === 'code' ? 'active' : ''}\`}
          onClick={() => handleTabClick('code')}
        >
          <FiCode className="responsive-header-tab-icon" /> Code
        </button>
        <button 
          className={\`responsive-header-tab \${activeTab === 'cli' ? 'active' : ''}\`}
          onClick={() => handleTabClick('cli')}
        >
          <FiTerminal className="responsive-header-tab-icon" /> CLI
        </button>
      </div>
    </div>
  );
};

export default ResponsiveHeader;`,
  
  css: `/* ResponsiveHeader.css */
.responsive-header-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.responsive-header-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFA500;
  line-height: 1.2;
  margin: 0;
}

.responsive-header-tabs {
  display: flex;
  gap: 0.5rem;
}

.responsive-header-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 0.5rem;
  border: 1px solid #392e4e;
  transition: all 0.2s ease;
}

.responsive-header-tab:hover {
  background-color: #271E37;
}

.responsive-header-tab.active {
  background-color: #170D27;
  color: #B19EEF;
  border-color: #B19EEF;
}

.responsive-header-tab-icon {
  margin-right: 0.5rem;
}

/* Media Queries for Responsive Design */
@media (max-width: 768px) {
  .responsive-header-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .responsive-header-title {
    font-size: 2rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .responsive-header-tabs {
    width: 100%;
    justify-content: center;
  }
  
  .responsive-header-tab {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}`,
  
  installation: {
    npm: 'npm install react-icons',
    yarn: 'yarn add react-icons',
    pnpm: 'pnpm add react-icons'
  }
};

const ResponsiveHeaderDemo = () => {
  const [activeTab, setActiveTab] = useState('preview');
  
  const propData = [
    { name: 'title', type: 'string', default: '""', description: 'The title text to display on the left side.' },
    { name: 'onTabChange', type: 'function', default: 'undefined', description: 'Callback function when a tab is clicked. Receives the tab name as parameter.' },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.log(`Tab changed to: ${tab}`);
  };

  return (
    <TabbedLayout>
      <PreviewTab>
        <Box className="demo-container" minH={100} display="flex" alignItems="center" justifyContent="center" width="100%">
          <ResponsiveHeader 
            title="Text Divider" 
            onTabChange={handleTabChange} 
          />
        </Box>
        
        <Box mt={4} p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
          <p>Active Tab: <strong>{activeTab}</strong></p>
        </Box>
        
        <PropTable data={propData} />
      </PreviewTab>
      
      <CodeTab>
        <CodeExample code={responsiveHeaderCode.jsx} language="jsx" />
        <Box mt={4}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>CSS</h3>
          <CodeExample code={responsiveHeaderCode.css} language="css" />
        </Box>
      </CodeTab>
      
      <CliTab>
        <CliInstallation packages={responsiveHeaderCode.installation} />
      </CliTab>
    </TabbedLayout>
  );
};

export default ResponsiveHeaderDemo;