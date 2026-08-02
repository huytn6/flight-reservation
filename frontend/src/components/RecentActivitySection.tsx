import React from 'react';
import { Plane, Luggage } from 'lucide-react';

export interface RecentActivityItem {
  id: string;
  type: 'package' | 'flight';
  title: string;
  subtitle: string;
  dateRange: string;
}

const DEFAULT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: '1',
    type: 'package',
    title: 'Packages to Hanoi',
    subtitle: 'Flight + stay',
    dateRange: 'Aug 14 - Aug 21',
  },
  {
    id: '2',
    type: 'flight',
    title: 'Flights to Hanoi',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 14 - Aug 21',
  },
  {
    id: '3',
    type: 'flight',
    title: 'Flights to Hanoi',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 12 - Aug 19',
  },
  {
    id: '4',
    type: 'flight',
    title: 'Flights to Ho Chi Minh City',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 12 - Aug 19',
  },
];

interface RecentActivitySectionProps {
  title?: string;
  activities?: RecentActivityItem[];
  onSelectActivity?: (item: RecentActivityItem) => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  title = 'Your recent activity',
  activities = DEFAULT_ACTIVITIES,
  onSelectActivity,
}) => {
  return (
    <section className="max-w-[1240px] mx-auto px-4 md:px-8 mb-12">
      {/* Section Heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#141d38] mb-5 tracking-tight">
        {title}
      </h2>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activities.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectActivity?.(item)}
            className="flex items-center gap-3.5 hover:opacity-85 transition-opacity cursor-pointer group"
          >
            {/* Icon Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#edf2f7] group-hover:bg-[#e4ebf3] flex items-center justify-center shrink-0 transition-colors">
              {item.type === 'package' ? (
                <div className="relative flex items-center justify-center">
                  <Plane className="w-6 h-6 text-[#2b437e] transform -rotate-45" strokeWidth={2.2} />
                  <div className="absolute -bottom-2.5 -right-2.5 flex items-center gap-0.5 bg-[#edf2f7] group-hover:bg-[#e4ebf3] p-0.5 rounded-md">
                    <Luggage className="w-3.5 h-3.5 text-[#355c7d]" strokeWidth={2} />
                  </div>
                </div>
              ) : (
                <Plane className="w-7 h-7 text-[#2b437e] transform -rotate-45" strokeWidth={2.2} />
              )}
            </div>

            {/* Text Stack */}
            <div className="flex flex-col justify-center min-w-0">
              <span 
                className="font-bold text-xs sm:text-sm text-slate-900 truncate leading-tight group-hover:text-[#0065eb] transition-colors" 
                title={item.title}
              >
                {item.title}
              </span>
              <span className="text-xs text-slate-500 font-normal mt-0.5 leading-tight truncate">
                {item.subtitle}
              </span>
              <span className="text-xs text-slate-500 font-normal mt-0.5 leading-tight">
                {item.dateRange}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
