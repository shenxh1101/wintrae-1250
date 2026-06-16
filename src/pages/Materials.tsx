import { useState, useMemo } from 'react';
import {
  Package,
  Filter,
  Search,
  Plus,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import { MaterialStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { MaterialStatus, MaterialCategory } from '../types';

const statusFlow: { status: MaterialStatus; label: string; icon: typeof Clock }[] = [
  { status: 'not_started', label: '未制作', icon: XCircle },
  { status: 'in_production', label: '制作中', icon: Clock },
  { status: 'shipped', label: '已寄送', icon: Truck },
  { status: 'delivered', label: '已到位', icon: CheckCircle },
];

const categoryLabels: Record<MaterialCategory, string> = {
  poster: '海报',
  ticket: '票夹',
  flyer: '宣传单',
  merchandise: '周边',
  other: '其他',
};

export default function MaterialsPage() {
  const shows = useTourStore((state) => state.shows);
  const materials = useTourStore((state) => state.materials);
  const updateMaterialStatus = useTourStore((state) => state.updateMaterialStatus);
  const addMaterial = useTourStore((state) => state.addMaterial);

  const [selectedShow, setSelectedShow] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    showId: '',
    name: '',
    category: 'other' as MaterialCategory,
    quantity: 0,
  });

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchShow = selectedShow === 'all' || m.showId === selectedShow;
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchShow && matchCategory && matchSearch;
    });
  }, [materials, selectedShow, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: materials.length,
      not_started: materials.filter((m) => m.status === 'not_started').length,
      in_production: materials.filter((m) => m.status === 'in_production').length,
      shipped: materials.filter((m) => m.status === 'shipped').length,
      delivered: materials.filter((m) => m.status === 'delivered').length,
    };
  }, [materials]);

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.showId) {
      addMaterial({
        showId: newMaterial.showId,
        name: newMaterial.name,
        category: newMaterial.category,
        status: 'not_started',
        quantity: newMaterial.quantity || undefined,
      });
      setNewMaterial({ showId: '', name: '', category: 'other', quantity: 0 });
      setShowAddModal(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: MaterialStatus) => {
    updateMaterialStatus(id, newStatus);
  };

  const materialsByShow = useMemo(() => {
    const map: Record<string, typeof materials> = {};
    filteredMaterials.forEach((m) => {
      if (!map[m.showId]) map[m.showId] = [];
      map[m.showId].push(m);
    });
    return map;
  }, [filteredMaterials]);

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif-sc text-2xl font-bold text-wine-800 mb-2">
          物料清单
        </h1>
        <p className="text-charcoal-500">跟踪各场次物料制作、寄送和到位状态</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="总物料数" value={stats.total} color="wine" icon={Package} />
        <StatCard label="未制作" value={stats.not_started} color="slate" icon={XCircle} />
        <StatCard label="制作中" value={stats.in_production} color="gold" icon={Clock} />
        <StatCard label="运输中" value={stats.shipped} color="blue" icon={Truck} />
        <StatCard label="已到位" value={stats.delivered} color="emerald" icon={CheckCircle} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="搜索物料..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gold-200/50 rounded-md text-sm focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400 w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-charcoal-400" />
            <select
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="px-3 py-2 bg-white border border-gold-200/50 rounded-md text-sm focus:outline-none focus:border-wine-400"
            >
              <option value="all">全部场次</option>
              {shows.map((show) => (
                <option key={show.id} value={show.id}>
                  {show.city} - {show.venue.slice(0, 10)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-gold-200/50 rounded-md text-sm focus:outline-none focus:border-wine-400"
            >
              <option value="all">全部分类</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加物料
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(materialsByShow).map(([showId, showMaterials]) => {
          const show = shows.find((s) => s.id === showId);
          if (!show) return null;

          return (
            <Card key={showId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-wine-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-wine-600" />
                    </div>
                    <div>
                      <h3 className="font-serif-sc text-lg font-semibold text-wine-700">
                        {show.city}站 · {show.venue}
                      </h3>
                      <p className="text-xs text-charcoal-400">
                        {show.date} · 共 {showMaterials.length} 项物料
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusFlow.map((step) => {
                      const count = showMaterials.filter(
                        (m) => m.status === step.status
                      ).length;
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.status}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-cream-50 text-xs text-charcoal-500"
                        >
                          <Icon className="w-3 h-3" />
                          <span>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-3">
                  {showMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-cream-50/50 rounded-lg border border-gold-100 hover:border-gold-200 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gold-200/50 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gold-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-charcoal-700">
                              {material.name}
                            </h4>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-wine-100 text-wine-600">
                              {categoryLabels[material.category]}
                            </span>
                            {material.quantity && (
                              <span className="text-xs text-charcoal-400">
                                × {material.quantity}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-400">
                            {material.trackingNumber && (
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {material.trackingNumber}
                              </span>
                            )}
                            {material.receiver && (
                              <span>收件人: {material.receiver}</span>
                            )}
                            {material.shippedDate && (
                              <span>寄出: {material.shippedDate}</span>
                            )}
                            <span>更新于 {material.updatedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MaterialStatusBadge status={material.status} />

                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded hover:bg-wine-50 text-charcoal-400 hover:text-wine-600">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {statusFlow.map((step, index) => {
                            const Icon = step.icon;
                            const currentIndex = statusFlow.findIndex(
                              (s) => s.status === material.status
                            );
                            const isActive = index <= currentIndex;
                            const isCurrent = step.status === material.status;

                            return (
                              <button
                                key={step.status}
                                onClick={() =>
                                  handleStatusChange(material.id, step.status)
                                }
                                title={step.label}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                  isCurrent
                                    ? 'bg-wine-600 text-white shadow-md'
                                    : isActive
                                    ? 'bg-gold-100 text-gold-600'
                                    : 'bg-cream-100 text-charcoal-300 hover:bg-cream-200'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}

        {filteredMaterials.length === 0 && (
          <Card>
            <CardBody className="text-center py-12">
              <Package className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
              <p className="text-charcoal-400">暂无匹配的物料</p>
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加物料"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddMaterial} className="btn-primary">
              添加
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              所属场次
            </label>
            <select
              value={newMaterial.showId}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, showId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            >
              <option value="">请选择场次</option>
              {shows.map((show) => (
                <option key={show.id} value={show.id}>
                  {show.city} - {show.venue}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              物料名称
            </label>
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, name: e.target.value })
              }
              placeholder="例如：主视觉海报"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                分类
              </label>
              <select
                value={newMaterial.category}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    category: e.target.value as MaterialCategory,
                  })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                数量
              </label>
              <input
                type="number"
                value={newMaterial.quantity || ''}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="数量"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: 'wine' | 'gold' | 'blue' | 'emerald' | 'slate';
  icon: typeof Package;
}) {
  const colorClasses: Record<string, string> = {
    wine: 'from-wine-50 to-wine-100 text-wine-700 border-wine-200/50',
    gold: 'from-gold-50 to-gold-100 text-gold-700 border-gold-200/50',
    blue: 'from-blue-50 to-blue-100 text-blue-700 border-blue-200/50',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200/50',
    slate: 'from-slate-50 to-slate-100 text-slate-600 border-slate-200/50',
  };

  const iconBg: Record<string, string> = {
    wine: 'bg-wine-200/50 text-wine-600',
    gold: 'bg-gold-200/50 text-gold-600',
    blue: 'bg-blue-200/50 text-blue-600',
    emerald: 'bg-emerald-200/50 text-emerald-600',
    slate: 'bg-slate-200/50 text-slate-500',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 border`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <div className={`w-8 h-8 rounded-full ${iconBg[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold font-serif-sc">{value}</p>
    </div>
  );
}
