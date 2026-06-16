import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Copy,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import { ShowStatusBadge } from '../components/StatusBadge';
import type { Show } from '../types';

export default function CalendarPage() {
  const navigate = useNavigate();
  const shows = useTourStore((state) => state.shows);
  const duplicateShow = useTourStore((state) => state.duplicateShow);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const showsByDate = useMemo(() => {
    const map: Record<string, Show[]> = {};
    shows.forEach((show) => {
      if (!map[show.date]) map[show.date] = [];
      map[show.date].push(show);
    });
    return map;
  }, [shows]);

  const showsByCity = useMemo(() => {
    const map: Record<string, Show[]> = {};
    shows.forEach((show) => {
      if (!map[show.city]) map[show.city] = [];
      map[show.city].push(show);
    });
    return map;
  }, [shows]);

  const statusStats = useMemo(() => {
    return {
      total: shows.length,
      confirmed: shows.filter((s) => s.status === 'confirmed').length,
      pending: shows.filter((s) => s.status === 'pending').length,
      completed: shows.filter((s) => s.status === 'completed').length,
    };
  }, [shows]);

  const handleDuplicate = (showId: string) => {
    const newId = duplicateShow(showId);
    if (newId) {
      navigate(`/shows/${newId}`);
    }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ];

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif-sc text-2xl font-bold text-wine-800 mb-2">
          巡演日历总览
        </h1>
        <p className="text-charcoal-500">查看全巡演排期，快速跳转到指定场次</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-wine-700">{statusStats.total}</p>
            <p className="text-sm text-charcoal-500 mt-1">总场次</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="text-3xl font-bold text-emerald-600">
                {statusStats.confirmed}
              </p>
            </div>
            <p className="text-sm text-charcoal-500 mt-1">已确认</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <p className="text-3xl font-bold text-amber-600">
                {statusStats.pending}
              </p>
            </div>
            <p className="text-sm text-charcoal-500 mt-1">待确认</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-3xl font-bold text-red-500">2</p>
            </div>
            <p className="text-sm text-charcoal-500 mt-1">紧急待办</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-gold-500" />
                  <h2 className="font-serif-sc text-lg font-semibold text-wine-700">
                    {year} 年 {monthNames[month]}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-md hover:bg-wine-50 text-charcoal-500 hover:text-wine-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-md hover:bg-wine-50 text-charcoal-500 hover:text-wine-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-charcoal-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-20"></div>;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayShows = showsByDate[dateStr] || [];
                  const isToday = day === 16 && month === 5 && year === 2026;

                  return (
                    <div
                      key={day}
                      className={`h-20 p-1.5 rounded-md border transition-colors ${
                        isToday
                          ? 'bg-gold-50 border-gold-300'
                          : 'bg-cream-50/50 border-transparent hover:border-gold-200'
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-gold-600' : 'text-charcoal-600'
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayShows.slice(0, 2).map((show) => (
                          <div
                            key={show.id}
                            onClick={() => navigate(`/shows/${show.id}`)}
                            className="text-xs truncate px-1.5 py-0.5 rounded bg-wine-100 text-wine-700 cursor-pointer hover:bg-wine-200 transition-colors"
                          >
                            <span className="font-medium">{show.city}</span>
                          </div>
                        ))}
                        {dayShows.length > 2 && (
                          <div className="text-xs text-charcoal-400 px-1">
                            +{dayShows.length - 2} 场
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <SectionTitle
                icon={<MapPin className="w-5 h-5 text-gold-500" />}
                title="按城市排期"
              />
            </CardHeader>
            <CardBody className="py-2">
              <div className="space-y-4">
                {Object.entries(showsByCity).map(([city, cityShows]) => (
                  <div key={city}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-wine-500"></span>
                      <span className="font-medium text-wine-700">{city}</span>
                      <span className="text-xs text-charcoal-400">
                        {cityShows.length} 场
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-4">
                      {cityShows.map((show) => (
                        <div
                          key={show.id}
                          onClick={() => navigate(`/shows/${show.id}`)}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-wine-50 cursor-pointer transition-colors group"
                        >
                          <div>
                            <p className="text-sm text-charcoal-700">
                              {show.date.slice(5)} {show.startTime}
                            </p>
                            <p className="text-xs text-charcoal-400 truncate max-w-[140px]">
                              {show.venue}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(show.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-400 hover:text-wine-600 transition-all"
                              title="复制配置"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <ShowStatusBadge status={show.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                添加新场次
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
