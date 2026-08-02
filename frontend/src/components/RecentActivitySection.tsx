import React, { useEffect, useState } from 'react';
import { Plane, Luggage } from 'lucide-react';
import { bookingService } from '@/services/booking';
import { useAuthStore } from '@/store/use-auth';

export interface RecentActivityItem {
  id: string;
  type: 'package' | 'flight';
  title: string;
  subtitle: string;
  dateRange: string;
}

const FALLBACK_ACTIVITIES: RecentActivityItem[] = [
  {
    id: '1',
    type: 'flight',
    title: 'Flights to Hanoi',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 14 - Aug 21',
  },
  {
    id: '2',
    type: 'flight',
    title: 'Flights to Da Nang',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 15 - Aug 22',
  },
  {
    id: '3',
    type: 'flight',
    title: 'Flights to Bangkok',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 18 - Aug 25',
  },
  {
    id: '4',
    type: 'flight',
    title: 'Flights to Singapore',
    subtitle: 'From Ho Chi Minh City',
    dateRange: 'Aug 20 - Aug 27',
  },
];

interface RecentActivitySectionProps {
  title?: string;
  onSelectActivity?: (item: RecentActivityItem) => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  title = 'Your recent activity',
  onSelectActivity,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState<RecentActivityItem[]>(FALLBACK_ACTIVITIES);

  useEffect(() => {
    if (isAuthenticated) {
      bookingService.getMyBookings().then((res) => {
        const items = res.items || (Array.isArray(res) ? res : []);
        if (items.length > 0) {
          setActivities(
            items.slice(0, 4).map((b: any) => ({
              id: b.id,
              type: 'flight',
              title: `Booking #${b.booking_code || b.id.substring(0, 8)}`,
              subtitle: `${b.status || 'CONFIRMED'} • $${b.total_amount || 0}`,
              dateRange: new Date(b.created_at || Date.now()).toLocaleDateString(),
            }))
          );
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <section className="max-w-[1240px] mx-auto px-4 md:px-8 mb-12 font-sans">
      {/* Section Heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 tracking-tight">
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
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors border border-slate-200">
              {item.type === 'package' ? (
                <div className="relative flex items-center justify-center">
                  <Plane className="w-6 h-6 text-blue-700 transform -rotate-45" strokeWidth={2.2} />
                  <div className="absolute -bottom-2.5 -right-2.5 flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md">
                    <Luggage className="w-3.5 h-3.5 text-blue-800" strokeWidth={2} />
                  </div>
                </div>
              ) : (
                <Plane className="w-7 h-7 text-blue-700 transform -rotate-45" strokeWidth={2.2} />
              )}
            </div>

            {/* Text Stack */}
            <div className="flex flex-col justify-center min-w-0">
              <span 
                className="font-bold text-xs sm:text-sm text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors" 
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
