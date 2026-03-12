import React from 'react';

export const Logo = () => {
  return (
    <svg
      width="160"
      height="40"
      viewBox="0 0 160 40"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'none' }}
    >
      <g transform="scale(0.35) translate(5, 5)">
        <path d="M57.5 0L106.066 28.75V86.25L57.5 115L8.93398 86.25V28.75L57.5 0Z" fill="none"/>
        <path d="M57.5 11.5L94.566 34.75V81.25L57.5 104.5L20.434 81.25V34.75L57.5 11.5Z" stroke="#FFFFFF" strokeWidth="5"/>
        <path d="M57.5 23L83.066 40.75V76.25L57.5 94L31.934 76.25V40.75L57.5 23Z" stroke="#FFFFFF" strokeWidth="5"/>
        <path d="M57.5 34.5L71.566 46.75V71.25L57.5 83.5L43.434 71.25V46.75L57.5 34.5Z" stroke="#FFFFFF" strokeWidth="5"/>
        <path d="M57.5 46L59.566 52.75V66.25L57.5 73L48.434 66.25V52.75L57.5 46Z" stroke="#FFFFFF" strokeWidth="5"/>
      </g>
      <text x="98" y="26" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="36" fontWeight="600" fill="#ff8c00">
        Pixen Flow
      </text>
    </svg>
  );
};
