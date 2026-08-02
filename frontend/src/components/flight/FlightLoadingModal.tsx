import React from 'react';

export interface FlightLoadingProps {
  originCity?: string;
  destinationCity?: string;
  subtitle?: string;
}

export const FlightLoadingModal: React.FC<FlightLoadingProps> = ({
  originCity = 'Hanoi',
  destinationCity = 'Ho Chi Minh City',
  subtitle = 'Searching for flights from 400+ airlines...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 font-sans select-none min-h-[340px]">
      {/* Circle backdrop with floating plane illustration */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Grey Circle Backdrop */}
        <div className="w-28 h-28 rounded-full bg-[#d8e2ed] absolute" />

        {/* Animated Wind Lines (Drifting back) */}
        <svg
          className="absolute w-40 h-32 pointer-events-none opacity-60"
          viewBox="0 0 120 90"
          fill="none"
        >
          <path
            d="M 15 48 L 40 48"
            stroke="#8fa0b5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          <path
            d="M 28 62 L 50 62"
            stroke="#8fa0b5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: '200ms' }}
          />
          <path
            d="M 10 34 L 30 34"
            stroke="#8fa0b5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: '400ms' }}
          />
        </svg>

        {/* Airplane Vector Graphic matching screenshot */}
        <div className="relative z-10 animate-bounce" style={{ animationDuration: '2.5s' }}>
          <svg
            width="130"
            height="75"
            viewBox="0 0 140 80"
            fill="none"
            className="drop-shadow-xs -rotate-6"
          >
            {/* Main Fuselage Body */}
            <path
              d="M 28 44 Q 65 20 122 28 Q 136 32 131 40 Q 120 48 92 48 Q 48 48 28 44 Z"
              fill="#ffffff"
              stroke="#b0bec5"
              strokeWidth="1.5"
            />

            {/* Cockpit Window */}
            <path
              d="M 116 30 Q 125 30 126 35 L 119 36 Z"
              fill="#90a4ae"
            />

            {/* Passenger Windows (5 Blue Dots) */}
            <circle cx="74" cy="36" r="2.5" fill="#3b82f6" />
            <circle cx="83" cy="35" r="2.5" fill="#3b82f6" />
            <circle cx="92" cy="34" r="2.5" fill="#3b82f6" />
            <circle cx="101" cy="33" r="2.5" fill="#3b82f6" />
            <circle cx="110" cy="33" r="2.5" fill="#3b82f6" />

            {/* Tail Fin (Yellow) */}
            <path
              d="M 35 42 L 18 21 Q 25 19 33 24 L 47 40 Z"
              fill="#e6a100"
              stroke="#c88b00"
              strokeWidth="1"
            />

            {/* Main Wing (Yellow engine accent) */}
            <path
              d="M 70 46 L 57 59 Q 65 61 74 57 L 84 46 Z"
              fill="#e6a100"
              stroke="#c88b00"
              strokeWidth="1"
            />

            {/* Engine Under Wing */}
            <rect
              x="76"
              y="46"
              width="14"
              height="8"
              rx="4"
              fill="#78909c"
            />
          </svg>
        </div>
      </div>

      {/* Typography Route & Subtitle */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#141d38] tracking-tight mt-5 text-center">
        {originCity} to {destinationCity}
      </h2>
      <p className="text-sm text-[#526077] font-normal mt-1.5 text-center">
        {subtitle}
      </p>
    </div>
  );
};
