"use client";

export default function WearHouseLogo({ size = 40, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A90E2" />
          <stop offset="100%" stopColor="#2E5C91" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#F0F0F0" />
        </linearGradient>
      </defs>
      
      <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" stroke="white" strokeWidth="2"/>
      
      {/* Central clothing icon - stylized t-shirt */}
      <g transform="translate(25, 20)" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15 L 40 15 L 45 25 L 35 25 L 35 55 L 15 55 L 15 25 L 5 25 L 10 15 Z" />
        <path d="M25 15 C 20 15 20 10 25 10 C 30 10 30 15 25 15" />
      </g>
      
      {/* Letters W and H */}
      <g>
        <text x="28" y="80" fontSize="24" fontWeight="bold" fill="url(#textGradient)" fontFamily="Arial, sans-serif">W</text>
        <text x="52" y="80" fontSize="24" fontWeight="bold" fill="url(#textGradient)" fontFamily="Arial, sans-serif">H</text>
      </g>
      
      {/* Small decorative dots */}
      <circle cx="20" cy="25" r="2" fill="white" opacity="0.5"/>
      <circle cx="80" cy="35" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="25" cy="80" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="75" cy="75" r="2" fill="white" opacity="0.5"/>
    </svg>
  );
}