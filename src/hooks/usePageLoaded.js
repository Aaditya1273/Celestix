import { useState, useEffect } from 'react';

const usePageLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If the page is already loaded, set the state immediately.
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      // Otherwise, listen for the 'load' event.
      const handleLoad = () => {
        setIsLoaded(true);
      };
      window.addEventListener('load', handleLoad);

      // Cleanup the event listener when the component unmounts.
      return () => {
        window.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  return isLoaded;
};

export default usePageLoaded;
