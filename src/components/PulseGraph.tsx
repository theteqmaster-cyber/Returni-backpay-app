'use client';

import React from 'react';

interface PulseGraphProps {
  data: { day: string; count: number }[];
  height?: number;
  showDots?: boolean;
  animate?: boolean;
}

const PulseGraph: React.FC<PulseGraphProps> = ({ 
  data, 
  height = 40, 
  showDots = true, 
  animate = true 
}) => {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((s) => s.count), 5);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.count / maxCount) * 70 - 15
  }));

  // Generate Smooth Path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = points[i].x + (points[i+1].x - points[i].x) / 2;
    pathD += ` C ${cp1x} ${points[i].y}, ${cp1x} ${points[i+1].y}, ${points[i+1].x} ${points[i+1].y}`;
  }

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className={`relative w-full select-none`} style={{ height: `${height}px` }}>
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pulseAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulseLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
          </linearGradient>
          <filter id="pulsePremiumGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sub-subtle Grid lines */}
        <line x1="0" y1="20" x2="100" y2="20" stroke="#E2E8F0" strokeWidth="0.15" strokeDasharray="1 1" />
        <line x1="0" y1="40" x2="100" y2="40" stroke="#E2E8F0" strokeWidth="0.15" strokeDasharray="1 1" />
        <line x1="0" y1="60" x2="100" y2="60" stroke="#E2E8F0" strokeWidth="0.15" strokeDasharray="1 1" />
        <line x1="0" y1="80" x2="100" y2="80" stroke="#E2E8F0" strokeWidth="0.15" strokeDasharray="1 1" />
        
        {/* Area Fill */}
        <path d={areaD} fill="url(#pulseAreaGradient)" />

        {/* The Smooth Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pulseLineGradient)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pulsePremiumGlow)"
          style={animate ? { 
            strokeDasharray: 500, 
            strokeDashoffset: 500, 
            animation: 'pulseDraw 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' 
          } : {}}
        />

        {/* Solid Dots */}
        {showDots && points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} cy={p.y} 
            r="1.2" 
            className="fill-returni-green drop-shadow-[0_0_3px_rgba(16,185,129,0.4)]"
          />
        ))}
      </svg>
      <style jsx>{`
        @keyframes pulseDraw { 
          from { stroke-dashoffset: 500; }
          to { stroke-dashoffset: 0; } 
        }
      `}</style>
    </div>
  );
};

export default PulseGraph;
