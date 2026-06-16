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
  Route,
  Calendar as CalendarIcon,
  Truck,
  Users,
  Package,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import { ShowStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { Show } from '../types';

export default function CalendarPage() {
  const navigate = useNavigate();
  const shows = useTourStore((state) => state.shows);
  const duplicateShow = useTourStore((state) => state.duplicateShow);
  const addShow = useTourStore((state) => state.addShow);
  const materials = useTourStore((state) => state.materials);
  const issues = useTourStore((state) => state.issues);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'route'>('calendar');
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [transitionPair, setTransitionPair] = useState<{ from: Show; to: Show } | null>(null);
  const [resolvedRisks, setResolvedRisks] = useState<Set<string>>(new Set());
  const [newShow, setNewShow] = useState({
    city: '',
    venue: '',
    venueAddress: '',
    venueContact: '',
    venuePhone: '',
    date: '',
    startTime: '19:30',
    endTime: '21:30',
    loadInTime: '',
    rehearsalTime: '',
    loadOutTime: '',
    ticketTotal: 300,
    ticketPriceVip: 380,
    ticketPriceStandard: 180,
    status: 'pending' as const,
  });

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

  const sortedShows = useMemo(() => {
    return [...shows].sort((a, b) => a.date.localeCompare(b.date));
  }, [shows]);

  const handleDuplicate = (showId: string) => {
    const newId = duplicateShow(showId);
    if (newId) {
      navigate(`/shows/${newId}`);
    }
  };

  const handleAddShow = () => {
    if (newShow.city && newShow.venue && newShow.date) {
      addShow({
        ...newShow,
        loadInTime: newShow.loadInTime || `${newShow.date} 14:00`,
        rehearsalTime: newShow.rehearsalTime || `${newShow.date} 16:00`,
        loadOutTime: newShow.loadOutTime || `${newShow.date} 23:00`,
      });
      setNewShow({
        city: '',
        venue: '',
        venueAddress: '',
        venueContact: '',
        venuePhone: '',
        date: '',
        startTime: '19:30',
        endTime: '21:30',
        loadInTime: '',
        rehearsalTime: '',
        loadOutTime: '',
        ticketTotal: 300,
        ticketPriceVip: 380,
        ticketPriceStandard: 180,
        status: 'pending',
      });
      setShowAddModal(false);
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

  const getDaysBetween = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-emerald-500',
      pending: 'bg-amber-500',
      completed: 'bg-charcoal-400',
      cancelled: 'bg-red-400',
      archived: 'bg-charcoal-300',
    };
    return map[status] || 'bg-charcoal-300';
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif-sc text-2xl font-bold text-wine-800 mb-2">
            巡演日历总览
          </h1>
          <p className="text-charcoal-500">查看全巡演排期，快速跳转到指定场次</p>
        </div>
        <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-wine-700 shadow-sm font-medium'
                : 'text-charcoal-500 hover:text-charcoal-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            日历
          </button>
          <button
            onClick={() => setViewMode('route')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'route'
                ? 'bg-white text-wine-700 shadow-sm font-medium'
                : 'text-charcoal-500 hover:text-charcoal-700'
            }`}
          >
            <Route className="w-4 h-4" />
            线路
          </button>
        </div>
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
        {viewMode === 'calendar' ? (
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
        ) : (
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Route className="w-5 h-5 text-gold-500" />}
                  title="巡演线路"
                />
              </CardHeader>
              <CardBody>
                {sortedShows.length === 0 ? (
                  <p className="text-sm text-charcoal-400 text-center py-8">暂无排期</p>
                ) : (
                  <div className="relative">
                    {sortedShows.map((show, index) => {
                      const gapDays =
                        index < sortedShows.length - 1
                          ? getDaysBetween(show.date, sortedShows[index + 1].date)
                          : null;

                      return (
                        <div key={show.id}>
                          <div
                            onClick={() => navigate(`/shows/${show.id}`)}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream-50 cursor-pointer transition-colors group border border-transparent hover:border-gold-200"
                          >
                            <div className="relative flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full ${getStatusColor(show.status)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                              >
                                {index + 1}
                              </div>
                              {index < sortedShows.length - 1 && (
                                <div className="w-0.5 h-8 bg-gold-300 mt-2"></div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif-sc text-lg font-semibold text-wine-800">
                                  {show.city}
                                </h3>
                                <ShowStatusBadge status={show.status} />
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-charcoal-500">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {show.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {show.startTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {show.venue}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicate(show.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-charcoal-400 hover:text-wine-600 transition-all"
                                title="复制配置"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-charcoal-300" />
                            </div>
                          </div>

                          {gapDays !== null && (
                            <div className="flex items-center gap-3 pl-4 pb-2">
                              <div className="w-10 flex justify-center">
                                <div className="w-0.5 h-4 bg-gold-300"></div>
                              </div>
                              <div className="flex items-center gap-2 text-xs flex-1">
                                <div className="flex-1 h-px bg-gold-200"></div>
                                <button
                                  onClick={() => {
                                    setTransitionPair({ from: show, to: sortedShows[index + 1] });
                                    setShowTransitionModal(true);
                                  }}
                                  className={`px-3 py-1 rounded-full font-medium cursor-pointer hover:shadow-md transition-all border ${
                                    gapDays <= 2
                                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                      : gapDays <= 4
                                      ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >
                                  转场 {gapDays} 天
                                </button>
                                <div className="flex-1 h-px bg-gold-200"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

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
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加新场次
              </button>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加新场次"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddShow} className="btn-primary">
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                城市 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newShow.city}
                onChange={(e) => setNewShow({ ...newShow, city: e.target.value })}
                placeholder="如：上海"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                场馆 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newShow.venue}
                onChange={(e) => setNewShow({ ...newShow, venue: e.target.value })}
                placeholder="如：上海大剧院"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              场馆地址
            </label>
            <input
              type="text"
              value={newShow.venueAddress}
              onChange={(e) => setNewShow({ ...newShow, venueAddress: e.target.value })}
              placeholder="请输入场馆详细地址"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                演出日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newShow.date}
                onChange={(e) => setNewShow({ ...newShow, date: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  开始时间
                </label>
                <input
                  type="time"
                  value={newShow.startTime}
                  onChange={(e) => setNewShow({ ...newShow, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  结束时间
                </label>
                <input
                  type="time"
                  value={newShow.endTime}
                  onChange={(e) => setNewShow({ ...newShow, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
                />
              </div>
            </div>
          </div>

          <div className="gold-divider"></div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                进场时间
              </label>
              <input
                type="datetime-local"
                value={newShow.loadInTime}
                onChange={(e) => setNewShow({ ...newShow, loadInTime: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                彩排时间
              </label>
              <input
                type="datetime-local"
                value={newShow.rehearsalTime}
                onChange={(e) => setNewShow({ ...newShow, rehearsalTime: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                撤场时间
              </label>
              <input
                type="datetime-local"
                value={newShow.loadOutTime}
                onChange={(e) => setNewShow({ ...newShow, loadOutTime: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>

          <div className="gold-divider"></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                场馆对接人
              </label>
              <input
                type="text"
                value={newShow.venueContact}
                onChange={(e) => setNewShow({ ...newShow, venueContact: e.target.value })}
                placeholder="请输入对接人姓名"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                联系电话
              </label>
              <input
                type="tel"
                value={newShow.venuePhone}
                onChange={(e) => setNewShow({ ...newShow, venuePhone: e.target.value })}
                placeholder="请输入联系电话"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>

          <div className="gold-divider"></div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                总票数
              </label>
              <input
                type="number"
                value={newShow.ticketTotal}
                onChange={(e) => setNewShow({ ...newShow, ticketTotal: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                VIP票价（元）
              </label>
              <input
                type="number"
                value={newShow.ticketPriceVip}
                onChange={(e) => setNewShow({ ...newShow, ticketPriceVip: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                普通票价（元）
              </label>
              <input
                type="number"
                value={newShow.ticketPriceStandard}
                onChange={(e) => setNewShow({ ...newShow, ticketPriceStandard: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTransitionModal && transitionPair !== null}
        onClose={() => setShowTransitionModal(false)}
        title={transitionPair ? `${transitionPair.from.city} → ${transitionPair.to.city} 转场复盘` : '转场复盘'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowTransitionModal(false)}
              className="btn-secondary"
            >
              关闭
            </button>
          </div>
        }
      >
        {transitionPair && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-wine-50 to-gold-50 rounded-lg p-4 border border-gold-200/50">
              <div className="text-right">
                <p className="text-xs text-charcoal-400">上一站</p>
                <p className="font-serif-sc text-xl font-bold text-wine-700">{transitionPair.from.city}</p>
                <p className="text-sm text-charcoal-500">{transitionPair.from.venue}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-white mb-1">
                  <Truck className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gold-700">
                  {getDaysBetween(transitionPair.from.date, transitionPair.to.date)} 天转场
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-charcoal-400">下一站</p>
                <p className="font-serif-sc text-xl font-bold text-wine-700">{transitionPair.to.city}</p>
                <p className="text-sm text-charcoal-500">{transitionPair.to.venue}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <SectionTitle
                    icon={<Clock className="w-4 h-4 text-gold-500" />}
                    title="上一站撤场"
                  />
                </CardHeader>
                <CardBody className="space-y-3 text-sm">
                  <div>
                    <span className="text-charcoal-400">演出日期</span>
                    <p className="font-medium text-charcoal-700">{transitionPair.from.date}</p>
                  </div>
                  <div>
                    <span className="text-charcoal-400">演出时间</span>
                    <p className="font-medium text-charcoal-700">{transitionPair.from.startTime} - {transitionPair.from.endTime}</p>
                  </div>
                  <div>
                    <span className="text-charcoal-400">撤场时间</span>
                    <p className="font-medium text-wine-700">{transitionPair.from.loadOutTime}</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <SectionTitle
                    icon={<CalendarDays className="w-4 h-4 text-gold-500" />}
                    title="下一站进场"
                  />
                </CardHeader>
                <CardBody className="space-y-3 text-sm">
                  <div>
                    <span className="text-charcoal-400">演出日期</span>
                    <p className="font-medium text-charcoal-700">{transitionPair.to.date}</p>
                  </div>
                  <div>
                    <span className="text-charcoal-400">演出时间</span>
                    <p className="font-medium text-charcoal-700">{transitionPair.to.startTime} - {transitionPair.to.endTime}</p>
                  </div>
                  <div>
                    <span className="text-charcoal-400">进场时间</span>
                    <p className="font-medium text-emerald-700">{transitionPair.to.loadInTime}</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Package className="w-4 h-4 text-gold-500" />}
                  title="物料运输"
                />
              </CardHeader>
              <CardBody>
                <div className="text-sm text-charcoal-500 mb-3">
                  可用时间窗口：{transitionPair.from.date} 演出结束后 至 {transitionPair.to.date} 演出开始前
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-cream-50 rounded-lg">
                    <p className="text-2xl font-serif-sc font-bold text-wine-700">
                      {getDaysBetween(transitionPair.from.date, transitionPair.to.date)}
                    </p>
                    <p className="text-xs text-charcoal-400">总天数</p>
                  </div>
                  <div className="p-3 bg-cream-50 rounded-lg">
                    <p className="text-2xl font-serif-sc font-bold text-amber-700">
                      {Math.max(0, getDaysBetween(transitionPair.from.date, transitionPair.to.date) - 1)}
                    </p>
                    <p className="text-xs text-charcoal-400">运输日</p>
                  </div>
                  <div className="p-3 bg-cream-50 rounded-lg">
                    <p className="text-2xl font-serif-sc font-bold text-emerald-700">1</p>
                    <p className="text-xs text-charcoal-400">搭建日</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Users className="w-4 h-4 text-gold-500" />}
                  title="人员转场"
                />
              </CardHeader>
              <CardBody>
                <div className="text-sm">
                  <div className="flex justify-between py-2 border-b border-gold-100">
                    <span className="text-charcoal-500">建议出发时间</span>
                    <span className="font-medium text-charcoal-700">{transitionPair.from.date} 演出结束后</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gold-100">
                    <span className="text-charcoal-500">建议到达时间</span>
                    <span className="font-medium text-charcoal-700">{transitionPair.to.loadInTime}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-charcoal-500">交通方式</span>
                    <span className="font-medium text-wine-700">根据两城距离选择高铁/航班/大巴</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {(() => {
              const gapDays = getDaysBetween(transitionPair.from.date, transitionPair.to.date);
              const fromMaterials = materials.filter((m) => m.showId === transitionPair.from.id);
              const toMaterials = materials.filter((m) => m.showId === transitionPair.to.id);
              const fromIssues = issues.filter((i) => i.showId === transitionPair.from.id && i.status !== 'resolved');
              const toIssues = issues.filter((i) => i.showId === transitionPair.to.id && i.status !== 'resolved');
              const undeliveredMaterials = toMaterials.filter((m) => m.status !== 'delivered');

              const risks: { id: string; level: 'high' | 'medium' | 'low'; category: string; title: string; suggestion: string }[] = [];

              if (gapDays <= 1) {
                risks.push({
                  id: 'time-tight',
                  level: 'high',
                  category: '时间',
                  title: '转场时间极紧',
                  suggestion: '安排当晚连夜撤场运输，提前联系下一站确认可提前进场',
                });
              } else if (gapDays <= 2) {
                risks.push({
                  id: 'time-short',
                  level: 'medium',
                  category: '时间',
                  title: '转场时间偏紧',
                  suggestion: '确认运输方案已落实，预留搭建缓冲时间',
                });
              }

              if (undeliveredMaterials.length > 0) {
                risks.push({
                  id: 'material-undelivered',
                  level: undeliveredMaterials.some((m) => m.status === 'not_started') ? 'high' : 'medium',
                  category: '物料',
                  title: `${undeliveredMaterials.length} 项物料未到位`,
                  suggestion: `联系物流确认到达时间：${undeliveredMaterials.map((m) => m.name).join('、')}`,
                });
              }

              fromIssues.forEach((issue) => {
                risks.push({
                  id: `from-issue-${issue.id}`,
                  level: 'medium',
                  category: '待办',
                  title: `上一站未解决：${issue.title}`,
                  suggestion: `由 ${issue.assignee} 跟进处理`,
                });
              });

              toIssues.forEach((issue) => {
                risks.push({
                  id: `to-issue-${issue.id}`,
                  level: 'low',
                  category: '待办',
                  title: `下一站待办：${issue.title}`,
                  suggestion: `提前确认 ${issue.assignee} 已知晓并准备`,
                });
              });

              const toggleRisk = (riskId: string) => {
                setResolvedRisks((prev) => {
                  const next = new Set(prev);
                  if (next.has(riskId)) {
                    next.delete(riskId);
                  } else {
                    next.add(riskId);
                  }
                  return next;
                });
              };

              const resolvedCount = risks.filter((r) => resolvedRisks.has(r.id)).length;

              return risks.length > 0 ? (
                <Card>
                  <CardHeader>
                    <SectionTitle
                      icon={<AlertCircle className="w-4 h-4 text-gold-500" />}
                      title={`转场风险清单 (${resolvedCount}/${risks.length} 已处理)`}
                    />
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {risks.map((risk) => {
                        const isResolved = resolvedRisks.has(risk.id);
                        return (
                          <div
                            key={risk.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                              isResolved
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : risk.level === 'high'
                                ? 'bg-red-50/50 border-red-200'
                                : risk.level === 'medium'
                                ? 'bg-amber-50/50 border-amber-200'
                                : 'bg-cream-50 border-gold-200'
                            }`}
                          >
                            <button
                              onClick={() => toggleRisk(risk.id)}
                              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isResolved
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : 'border-charcoal-300 hover:border-wine-400'
                              }`}
                            >
                              {isResolved && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  risk.level === 'high' ? 'bg-red-100 text-red-700' :
                                  risk.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-cream-100 text-charcoal-600'
                                }`}>{risk.category}</span>
                                <span className={`text-sm font-medium ${isResolved ? 'text-charcoal-400 line-through' : 'text-charcoal-700'}`}>
                                  {risk.title}
                                </span>
                              </div>
                              <p className={`text-xs ${isResolved ? 'text-charcoal-300' : 'text-charcoal-500'}`}>
                                💡 {risk.suggestion}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody className="text-center py-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-600 font-medium">暂无转场风险</p>
                  </CardBody>
                </Card>
              );
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/shows/${transitionPair.from.id}`)}
                className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
              >
                查看 {transitionPair.from.city} 详情
              </button>
              <button
                onClick={() => navigate(`/shows/${transitionPair.to.id}`)}
                className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
              >
                查看 {transitionPair.to.city} 详情
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
