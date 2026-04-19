import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.JSX.Element;
  gradient: string;
  onViewDetail?: () => void;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  gradient,
  onViewDetail,
}: StatCardProps) {
  // Convert old gradient classes to EventIO colors
  const getEventIOGradient = (oldGradient: string) => {
    if (oldGradient.includes('purple') || oldGradient.includes('pink')) {
      return 'from-[#1a3a5c] to-[#4a6fa5]'; // Navy to Blue
    }
    if (oldGradient.includes('green') || oldGradient.includes('emerald')) {
      return 'from-[#4a6fa5] to-[#6b8db8]'; // Blue to Dusty
    }
    if (oldGradient.includes('blue') || oldGradient.includes('cyan')) {
      return 'from-[#6b8db8] to-[#a8c0d8]'; // Dusty to Light
    }
    if (oldGradient.includes('orange') || oldGradient.includes('red')) {
      return 'from-[#c9a96e] to-[#1a3a5c]'; // Gold to Navy
    }
    return 'from-[#1a3a5c] to-[#4a6fa5]'; // Default Navy to Blue
  };

  const eventioGradient = getEventIOGradient(gradient);

  return (
    <div className="card-eventio group">
      <div className="flex items-start gap-4 mb-6">
        <div 
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${eventioGradient} flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-dusty mb-2 truncate tracking-[0.025em] uppercase">
            {title}
          </h3>
          <div className="flex items-end gap-3 flex-wrap">
            <p className="font-serif text-4xl font-light text-navy leading-none tracking-tight">
              {value}
            </p>
            {change && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  changeType === 'positive'
                    ? 'bg-[#dce8f2] text-[#4a6fa5]'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {onViewDetail && (
        <button
          onClick={onViewDetail}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-blue bg-pale/50 hover:bg-pale rounded-xl transition-all duration-300 group/btn"
        >
          <span className="tracking-[0.025em]">Voir le détail</span>
          <svg
            className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
