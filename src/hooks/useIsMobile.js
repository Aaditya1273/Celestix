import { useState, useEffect } from 'react';

const useIsMobile = (maxWidth = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= maxWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= maxWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [maxWidth]);

  return isMobile;
};

export default useIsMobile;
