import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  Theater,
  Package,
  MessageSquare,
  FileArchive,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';

const navItems = [
  { path: '/', label: '日历总览', icon: Calendar },
  { path: '/materials', label: '物料清单', icon: Package },
  { path: '/communications', label: '沟通记录', icon: MessageSquare },
  { path: '/settlement', label: '结算归档', icon: FileArchive },
];

export default function Sidebar() {
  const location = useLocation();
  const reminders = useTourStore((state) => state.reminders);
  const urgentCount = reminders.filter((r) => r.isUrgent).length;

  return (
    <aside className="w-64 bg-wine-800 text-cream-100 flex flex-col min-h-screen">
      <div className="p-6 border-b border-wine-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="font-serif-sc text-lg font-semibold text-gold-200">
              巡演统筹
            </h1>
            <p className="text-xs text-cream-400">Tour Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === '/' && location.pathname.startsWith('/shows'));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-wine-600/80 text-gold-200 shadow-inner'
                  : 'text-cream-200 hover:bg-wine-700/50 hover:text-cream-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.path === '/communications' && urgentCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-gold-500 text-wine-900 text-xs flex items-center justify-center font-bold">
                  {urgentCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-wine-700/50">
        <div className="bg-wine-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-200">待办提醒</span>
          </div>
          <p className="text-xs text-cream-300">
            {urgentCount} 项紧急，{reminders.length} 项待处理
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-wine-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-500/30 flex items-center justify-center">
            <span className="text-sm font-medium text-gold-200">周</span>
          </div>
          <div>
            <p className="text-sm font-medium">巡演统筹</p>
            <p className="text-xs text-cream-400">周老师</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
