import type { ReactNode } from 'react';

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  content?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gold-300/50"></div>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative pl-10 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-cream-100 border-2 border-gold-400 flex items-center justify-center">
              {item.icon || (
                <div className="w-2 h-2 rounded-full bg-gold-500"></div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gold-200/30 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-wine-700">
                    {item.title}
                  </span>
                  {item.badge}
                </div>
                <span className="text-xs text-charcoal-400 whitespace-nowrap">
                  {item.time}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-charcoal-600 mb-2">
                  {item.description}
                </p>
              )}
              {item.content && (
                <div className="text-sm text-charcoal-700">{item.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
