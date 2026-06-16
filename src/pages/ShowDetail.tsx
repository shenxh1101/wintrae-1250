import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Settings,
  AlertTriangle,
  Image,
  Copy,
  Edit3,
  Plus,
  Star,
  Ticket,
  Phone,
  Building,
  Package,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import {
  ShowStatusBadge,
  IssueStatusBadge,
  MaterialStatusBadge,
} from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { Personnel, Equipment, Issue, EquipmentCategory } from '../types';

export default function ShowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const shows = useTourStore((state) => state.shows);
  const allPersonnel = useTourStore((state) => state.personnel);
  const allEquipment = useTourStore((state) => state.equipment);
  const allIssues = useTourStore((state) => state.issues);
  const allPhotos = useTourStore((state) => state.venuePhotos);
  const allMaterials = useTourStore((state) => state.materials);
  const updateShow = useTourStore((state) => state.updateShow);
  const addIssue = useTourStore((state) => state.addIssue);
  const updateIssue = useTourStore((state) => state.updateIssue);
  const duplicateShow = useTourStore((state) => state.duplicateShow);

  const show = shows.find((s) => s.id === id);
  const personnel = allPersonnel.filter((p) => p.showId === id);
  const equipment = allEquipment.filter((e) => e.showId === id);
  const issues = allIssues.filter((i) => i.showId === id);
  const photos = allPhotos.filter((p) => p.showId === id);
  const materials = allMaterials.filter((m) => m.showId === id);

  const [activeTab, setActiveTab] = useState<'info' | 'personnel' | 'equipment' | 'issues'>('info');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', assignee: '', dueDate: '' });

  const castMembers = personnel.filter((p) => p.type === 'cast');
  const crewMembers = personnel.filter((p) => p.type === 'crew');

  const equipmentByCategory = useMemo(() => {
    const categories: Record<EquipmentCategory, Equipment[]> = {
      lighting: [],
      sound: [],
      stage: [],
      video: [],
      other: [],
    };
    equipment.forEach((e) => {
      categories[e.category].push(e);
    });
    return categories;
  }, [equipment]);

  const categoryLabels: Record<EquipmentCategory, string> = {
    lighting: '灯光设备',
    sound: '音响设备',
    stage: '舞台设备',
    video: '视频设备',
    other: '其他设备',
  };

  const keyIssues = issues.filter((i) => i.isKeyReminder);
  const openIssues = issues.filter((i) => i.status !== 'resolved');

  const handleAddIssue = () => {
    if (newIssue.title && id) {
      addIssue({
        showId: id,
        title: newIssue.title,
        assignee: newIssue.assignee || '未分配',
        dueDate: newIssue.dueDate || show?.date || '',
        status: 'open',
        isKeyReminder: false,
      });
      setNewIssue({ title: '', assignee: '', dueDate: '' });
      setShowIssueModal(false);
    }
  };

  const handleDuplicate = () => {
    if (id) {
      const newId = duplicateShow(id);
      if (newId) {
        navigate(`/shows/${newId}`);
      }
    }
  };

  if (!show) {
    return (
      <div className="p-6">
        <p className="text-charcoal-500">场次不存在</p>
      </div>
    );
  }

  const tabs = [
    { key: 'info', label: '基本信息', icon: MapPin },
    { key: 'personnel', label: '人员名单', icon: Users },
    { key: 'equipment', label: '设备需求', icon: Settings },
    { key: 'issues', label: '待确认问题', icon: AlertTriangle },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-charcoal-500 hover:text-wine-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回日历
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif-sc text-2xl font-bold text-wine-800">
                {show.city}站 · {show.venue}
              </h1>
              <ShowStatusBadge status={show.status} />
            </div>
            <div className="flex items-center gap-4 text-charcoal-500 text-sm">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {show.date} {show.startTime} - {show.endTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {show.venueAddress}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制配置
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              编辑场次
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gold-200/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
                isActive
                  ? 'border-wine-600 text-wine-700 font-medium'
                  : 'border-transparent text-charcoal-500 hover:text-wine-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'issues' && openIssues.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center">
                  {openIssues.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Clock className="w-5 h-5 text-gold-500" />}
                  title="演出时间节点"
                />
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <TimeNode
                    label="进场时间"
                    time={show.loadInTime}
                    icon={<Package className="w-4 h-4" />}
                  />
                  <TimeNode
                    label="彩排时间"
                    time={show.rehearsalTime}
                    icon={<Star className="w-4 h-4" />}
                  />
                  <TimeNode
                    label="演出开始"
                    time={`${show.date} ${show.startTime}`}
                    icon={<Ticket className="w-4 h-4" />}
                    highlight
                  />
                  <TimeNode
                    label="撤场时间"
                    time={show.loadOutTime}
                    icon={<Settings className="w-4 h-4" />}
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Building className="w-5 h-5 text-gold-500" />}
                  title="场馆信息"
                />
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="场馆名称" value={show.venue} />
                  <InfoItem label="场馆地址" value={show.venueAddress || '-'} />
                  <InfoItem label="对接人" value={show.venueContact || '-'} />
                  <InfoItem
                    label="联系电话"
                    value={show.venuePhone || '-'}
                    icon={<Phone className="w-3.5 h-3.5" />}
                  />
                </div>
                {show.notes && (
                  <>
                    <div className="gold-divider my-4"></div>
                    <div>
                      <p className="text-xs text-charcoal-400 mb-1">备注</p>
                      <p className="text-sm text-charcoal-600">{show.notes}</p>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Image className="w-5 h-5 text-gold-500" />}
                  title="场地照片"
                  action={
                    <button className="btn-ghost text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      上传照片
                    </button>
                  }
                />
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-4 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-video rounded-md overflow-hidden cursor-pointer"
                    >
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="absolute bottom-2 left-2 text-xs text-white">
                          {photo.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Ticket className="w-5 h-5 text-gold-500" />}
                  title="票务信息"
                />
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal-500">总票数</span>
                  <span className="font-medium text-charcoal-700">
                    {show.ticketTotal} 张
                  </span>
                </div>
                <div className="gold-divider"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-gold-500" />
                    VIP票
                  </span>
                  <span className="font-medium text-gold-600">
                    ¥{show.ticketPriceVip}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal-500">普通票</span>
                  <span className="font-medium text-charcoal-700">
                    ¥{show.ticketPriceStandard}
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<AlertTriangle className="w-5 h-5 text-gold-500" />}
                  title="关键提醒"
                />
              </CardHeader>
              <CardBody>
                {keyIssues.length > 0 ? (
                  <div className="space-y-2">
                    {keyIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200/50"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            {issue.title}
                          </p>
                          <p className="text-xs text-amber-600">
                            截止: {issue.dueDate} · {issue.assignee}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400 text-center py-4">
                    暂无关键提醒
                  </p>
                )}
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="w-full mt-3 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加待办
                </button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={<Package className="w-5 h-5 text-gold-500" />}
                  title="物料概览"
                />
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-charcoal-600 truncate">
                        {material.name}
                      </span>
                      <MaterialStatusBadge status={material.status} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/materials')}
                  className="w-full mt-3 text-sm text-wine-600 hover:text-wine-700 text-center"
                >
                  查看全部物料 →
                </button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'personnel' && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <SectionTitle
                icon={<Star className="w-5 h-5 text-gold-500" />}
                title="演员名单"
                action={
                  <button className="btn-ghost text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                }
              />
            </CardHeader>
            <CardBody>
              <PersonnelList list={castMembers} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle
                icon={<Settings className="w-5 h-5 text-gold-500" />}
                title="工作人员"
                action={
                  <button className="btn-ghost text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                }
              />
            </CardHeader>
            <CardBody>
              <PersonnelList list={crewMembers} />
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {Object.entries(equipmentByCategory).map(([category, items]) =>
            items.length > 0 ? (
              <Card key={category}>
                <CardHeader>
                  <SectionTitle
                    title={categoryLabels[category as EquipmentCategory]}
                    action={
                      <button className="btn-ghost text-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        添加
                      </button>
                    }
                  />
                </CardHeader>
                <CardBody>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-charcoal-400 border-b border-gold-100">
                          <th className="pb-2 font-medium">设备名称</th>
                          <th className="pb-2 font-medium text-center">数量</th>
                          <th className="pb-2 font-medium">提供方</th>
                          <th className="pb-2 font-medium">备注</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gold-50 last:border-0"
                          >
                            <td className="py-3 text-sm text-charcoal-700">
                              {item.name}
                            </td>
                            <td className="py-3 text-sm text-charcoal-700 text-center font-medium">
                              {item.quantity}
                            </td>
                            <td className="py-3 text-sm">
                              <ProvidedBadge type={item.providedBy || 'tour'} />
                            </td>
                            <td className="py-3 text-sm text-charcoal-500">
                              {item.note || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            ) : null
          )}
        </div>
      )}

      {activeTab === 'issues' && (
        <Card>
          <CardHeader>
            <SectionTitle
              icon={<AlertTriangle className="w-5 h-5 text-gold-500" />}
              title="待确认问题清单"
              action={
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加问题
                </button>
              }
            />
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    issue.status === 'resolved'
                      ? 'bg-cream-50/50 border-gold-100'
                      : 'bg-white border-gold-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={issue.status === 'resolved'}
                        onChange={() =>
                          updateIssue(issue.id, {
                            status:
                              issue.status === 'resolved' ? 'open' : 'resolved',
                          })
                        }
                        className="mt-1 w-4 h-4 rounded border-gold-300 text-wine-600 focus:ring-wine-500"
                      />
                      <div>
                        <p
                          className={`font-medium ${
                            issue.status === 'resolved'
                              ? 'text-charcoal-400 line-through'
                              : 'text-charcoal-700'
                          }`}
                        >
                          {issue.title}
                          {issue.isKeyReminder && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                              关键
                            </span>
                          )}
                        </p>
                        {issue.description && (
                          <p className="text-sm text-charcoal-500 mt-1">
                            {issue.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-400">
                          <span>责任人: {issue.assignee}</span>
                          <span>截止: {issue.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <IssueStatusBadge status={issue.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="添加待确认问题"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowIssueModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddIssue} className="btn-primary">
              添加
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              问题标题
            </label>
            <input
              type="text"
              value={newIssue.title}
              onChange={(e) =>
                setNewIssue({ ...newIssue, title: e.target.value })
              }
              placeholder="请输入问题描述"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              责任人
            </label>
            <input
              type="text"
              value={newIssue.assignee}
              onChange={(e) =>
                setNewIssue({ ...newIssue, assignee: e.target.value })
              }
              placeholder="请输入责任人"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              截止日期
            </label>
            <input
              type="date"
              value={newIssue.dueDate}
              onChange={(e) =>
                setNewIssue({ ...newIssue, dueDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return <Clock className={className} />;
}

function TimeNode({
  label,
  time,
  icon,
  highlight = false,
}: {
  label: string;
  time: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight
          ? 'bg-wine-50 border-wine-200/50'
          : 'bg-cream-50/50 border-gold-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={highlight ? 'text-wine-600' : 'text-gold-500'}
        >
          {icon}
        </span>
        <span
          className={`text-sm font-medium ${
            highlight ? 'text-wine-700' : 'text-charcoal-600'
          }`}
        >
          {label}
        </span>
      </div>
      <p
        className={`font-serif-sc text-lg ${
          highlight ? 'text-wine-800' : 'text-charcoal-700'
        }`}
      >
        {time}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-charcoal-400 mb-1">{label}</p>
      <p className="text-sm text-charcoal-700 flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}

function PersonnelList({ list }: { list: Personnel[] }) {
  return (
    <div className="space-y-2">
      {list.map((person) => (
        <div
          key={person.id}
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wine-400 to-gold-400 flex items-center justify-center text-white font-medium">
            {person.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-charcoal-700">{person.name}</p>
            <p className="text-xs text-charcoal-400">{person.role}</p>
          </div>
          <span className="text-xs text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {person.phone}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProvidedBadge({ type }: { type: 'venue' | 'tour' | 'rental' }) {
  const configs = {
    venue: { label: '场馆提供', className: 'bg-emerald-100 text-emerald-700' },
    tour: { label: '自带', className: 'bg-wine-100 text-wine-700' },
    rental: { label: '租赁', className: 'bg-amber-100 text-amber-700' },
  };
  const config = configs[type];
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs rounded ${config.className}`}
    >
      {config.label}
    </span>
  );
}
