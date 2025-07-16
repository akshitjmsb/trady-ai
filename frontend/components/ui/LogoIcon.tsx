// frontend/components/ui/LogoIcon.tsx

import React from 'react';

/**
 * A simple, reusable SVG logo component.
 */
const LogoIcon: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-blue-500">
    <path d="M4 16L4 4M4 16L12 16M4 16C4 16 6 13 8 10C10 7 12 4 12 4M12 4L12 9M12 4L20 4M20 4V16M20 16L12 16M20 16C20 16 18 13 16 10C14 7 12 4 12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default LogoIcon;
