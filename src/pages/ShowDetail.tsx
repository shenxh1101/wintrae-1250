import { useState, useMemo, useEffect } from 'react';
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
  Trash2,
  Pencil,
  X,
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
  const addPersonnel = useTourStore((state) => state.addPersonnel);
  const updatePersonnel = useTourStore((state) => state.updatePersonnel);
  const deletePersonnel = useTourStore((state) => state.deletePersonnel);
  const addEquipment = useTourStore((state) => state.addEquipment);
  const updateEquipment = useTourStore((state) => state.updateEquipment);
  const deleteEquipment = useTourStore((state) => state.deleteEquipment);
  const addVenuePhoto = useTourStore((state) => state.addVenuePhoto);
  const deleteVenuePhoto = useTourStore((state) => state.deleteVenuePhoto);

  const show = shows.find((s) => s.id === id);
  const personnel = allPersonnel.filter((p) => p.showId === id);
  const equipment = allEquipment.filter((e) => e.showId === id);
  const issues = allIssues.filter((i) => i.showId === id);
  const photos = allPhotos.filter((p) => p.showId === id);
  const materials = allMaterials.filter((m) => m.showId === id);

  const [activeTab, setActiveTab] = useState<'info' | 'personnel' | 'equipment' | 'issues'>('info');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', assignee: '', dueDate: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editShow, setEditShow] = useState({
    city: '',
    venue: '',
    venueAddress: '',
    venueContact: '',
    venuePhone: '',
    date: '',
    startTime: '',
    endTime: '',
    loadInTime: '',
    rehearsalTime: '',
    loadOutTime: '',
    notes: '',
    ticketTotal: 0,
    ticketPriceVip: 0,
    ticketPriceStandard: 0,
    status: 'pending' as const,
  });
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [personnelForm, setPersonnelForm] = useState({
    name: '',
    role: '',
    phone: '',
    type: 'cast' as const,
  });
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    quantity: 1,
    category: 'lighting' as const,
    note: '',
    providedBy: 'tour' as const,
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    url: '',
    description: '',
  });
  const [personnelType, setPersonnelType] = useState<'cast' | 'crew'>('cast');
  const [equipmentCategory, setEquipmentCategory] = useState<EquipmentCategory>('lighting');

  useEffect(() => {
    if (show) {
      setEditShow({
        city: show.city,
        venue: show.venue,
        venueAddress: show.venueAddress || '',
        venueContact: show.venueContact || '',
        venuePhone: show.venuePhone || '',
        date: show.date,
        startTime: show.startTime,
        endTime: show.endTime,
        loadInTime: show.loadInTime,
        rehearsalTime: show.rehearsalTime,
        loadOutTime: show.loadOutTime,
        notes: show.notes || '',
        ticketTotal: show.ticketTotal,
        ticketPriceVip: show.ticketPriceVip,
        ticketPriceStandard: show.ticketPriceStandard,
        status: show.status,
      });
    }
  }, [show]);

  const handleOpenEdit = () => {
    if (show) {
      setEditShow({
        city: show.city,
        venue: show.venue,
        venueAddress: show.venueAddress || '',
        venueContact: show.venueContact || '',
        venuePhone: show.venuePhone || '',
        date: show.date,
        startTime: show.startTime,
        endTime: show.endTime,
        loadInTime: show.loadInTime,
        rehearsalTime: show.rehearsalTime,
        loadOutTime: show.loadOutTime,
        notes: show.notes || '',
        ticketTotal: show.ticketTotal,
        ticketPriceVip: show.ticketPriceVip,
        ticketPriceStandard: show.ticketPriceStandard,
        status: show.status,
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (id) {
      updateShow(id, editShow);
      setShowEditModal(false);
    }
  };

  const handleOpenAddPersonnel = (type: 'cast' | 'crew') => {
    setPersonnelType(type);
    setEditingPersonnel(null);
    setPersonnelForm({ name: '', role: '', phone: '', type });
    setShowPersonnelModal(true);
  };

  const handleOpenEditPersonnel = (person: Personnel) => {
    setEditingPersonnel(person);
    setPersonnelForm({
      name: person.name,
      role: person.role,
      phone: person.phone,
      type: person.type,
    });
    setShowPersonnelModal(true);
  };

  const handleSavePersonnel = () => {
    if (id && personnelForm.name) {
      if (editingPersonnel) {
        updatePersonnel(editingPersonnel.id, personnelForm);
      } else {
        addPersonnel({ ...personnelForm, showId: id });
      }
      setShowPersonnelModal(false);
      setPersonnelForm({ name: '', role: '', phone: '', type: 'cast' });
    }
  };

  const handleDeletePersonnel = (personId: string) => {
    if (confirm('确定要删除这个人员吗？')) {
      deletePersonnel(personId);
    }
  };

  const handleOpenAddEquipment = (category: EquipmentCategory) => {
    setEquipmentCategory(category);
    setEditingEquipment(null);
    setEquipmentForm({
      name: '',
      quantity: 1,
      category,
      note: '',
      providedBy: 'tour',
    });
    setShowEquipmentModal(true);
  };

  const handleOpenEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setEquipmentForm({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      note: item.note || '',
      providedBy: item.providedBy || 'tour',
    });
    setShowEquipmentModal(true);
  };

  const handleSaveEquipment = () => {
    if (id && equipmentForm.name) {
      if (editingEquipment) {
        updateEquipment(editingEquipment.id, equipmentForm);
      } else {
        addEquipment({ ...equipmentForm, showId: id });
      }
      setShowEquipmentModal(false);
      setEquipmentForm({
        name: '',
        quantity: 1,
        category: 'lighting',
        note: '',
        providedBy: 'tour',
      });
    }
  };

  const handleDeleteEquipment = (itemId: string) => {
    if (confirm('确定要删除这个设备吗？')) {
      deleteEquipment(itemId);
    }
  };

  const handleOpenAddPhoto = () => {
    setPhotoForm({ url: '', description: '' });
    setShowPhotoModal(true);
  };

  const handleSavePhoto = () => {
    if (id && photoForm.url) {
      addVenuePhoto({
        showId: id,
        url: photoForm.url,
        description: photoForm.description,
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
      setShowPhotoModal(false);
      setPhotoForm({ url: '', description: '' });
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('确定要删除这张照片吗？')) {
      deleteVenuePhoto(photoId);
    }
  };

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
            <button
              onClick={handleOpenEdit}
              className="btn-primary flex items-center gap-2"
            >
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
                    <button
                      onClick={handleOpenAddPhoto}
                      className="btn-ghost text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      上传照片
                    </button>
                  }
                />
              </CardHeader>
              <CardBody>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-video rounded-md overflow-hidden"
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
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded hover:bg-red-600 transition-colors"
                            title="删除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400 text-center py-8">
                    暂无场地照片，点击右上角添加
                  </p>
                )}
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
                  <button
                    onClick={() => handleOpenAddPersonnel('cast')}
                    className="btn-ghost text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                }
              />
            </CardHeader>
            <CardBody>
              <PersonnelList
                list={castMembers}
                onEdit={handleOpenEditPersonnel}
                onDelete={handleDeletePersonnel}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle
                icon={<Settings className="w-5 h-5 text-gold-500" />}
                title="工作人员"
                action={
                  <button
                    onClick={() => handleOpenAddPersonnel('crew')}
                    className="btn-ghost text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                }
              />
            </CardHeader>
            <CardBody>
              <PersonnelList
                list={crewMembers}
                onEdit={handleOpenEditPersonnel}
                onDelete={handleDeletePersonnel}
              />
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {(['lighting', 'sound', 'stage', 'video', 'other'] as EquipmentCategory[]).map((category) => (
            <Card key={category}>
              <CardHeader>
                <SectionTitle
                  title={categoryLabels[category]}
                  action={
                    <button
                      onClick={() => handleOpenAddEquipment(category)}
                      className="btn-ghost text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      添加
                    </button>
                  }
                />
              </CardHeader>
              <CardBody>
                {equipmentByCategory[category].length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-charcoal-400 border-b border-gold-100">
                          <th className="pb-2 font-medium">设备名称</th>
                          <th className="pb-2 font-medium text-center">数量</th>
                          <th className="pb-2 font-medium">提供方</th>
                          <th className="pb-2 font-medium">备注</th>
                          <th className="pb-2 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipmentByCategory[category].map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gold-50 last:border-0 hover:bg-cream-50/50 transition-colors"
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
                            <td className="py-3 text-sm text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditEquipment(item)}
                                  className="p-1 text-charcoal-400 hover:text-wine-600 transition-colors"
                                  title="编辑"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEquipment(item.id)}
                                  className="p-1 text-charcoal-400 hover:text-red-500 transition-colors"
                                  title="删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400 text-center py-4">
                    暂无设备，点击右上角添加
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
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

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑场次"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveEdit} className="btn-primary">
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                城市
              </label>
              <input
                type="text"
                value={editShow.city}
                onChange={(e) => setEditShow({ ...editShow, city: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                场馆
              </label>
              <input
                type="text"
                value={editShow.venue}
                onChange={(e) => setEditShow({ ...editShow, venue: e.target.value })}
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
              value={editShow.venueAddress}
              onChange={(e) => setEditShow({ ...editShow, venueAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                演出日期
              </label>
              <input
                type="date"
                value={editShow.date}
                onChange={(e) => setEditShow({ ...editShow, date: e.target.value })}
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
                  value={editShow.startTime}
                  onChange={(e) => setEditShow({ ...editShow, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  结束时间
                </label>
                <input
                  type="time"
                  value={editShow.endTime}
                  onChange={(e) => setEditShow({ ...editShow, endTime: e.target.value })}
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
                type="text"
                value={editShow.loadInTime}
                onChange={(e) => setEditShow({ ...editShow, loadInTime: e.target.value })}
                placeholder="如：2026-06-20 14:00"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                彩排时间
              </label>
              <input
                type="text"
                value={editShow.rehearsalTime}
                onChange={(e) => setEditShow({ ...editShow, rehearsalTime: e.target.value })}
                placeholder="如：2026-06-20 16:00"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                撤场时间
              </label>
              <input
                type="text"
                value={editShow.loadOutTime}
                onChange={(e) => setEditShow({ ...editShow, loadOutTime: e.target.value })}
                placeholder="如：2026-06-20 23:00"
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
                value={editShow.venueContact}
                onChange={(e) => setEditShow({ ...editShow, venueContact: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                联系电话
              </label>
              <input
                type="tel"
                value={editShow.venuePhone}
                onChange={(e) => setEditShow({ ...editShow, venuePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              备注
            </label>
            <textarea
              value={editShow.notes}
              onChange={(e) => setEditShow({ ...editShow, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400 resize-none"
            />
          </div>

          <div className="gold-divider"></div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                总票数
              </label>
              <input
                type="number"
                value={editShow.ticketTotal}
                onChange={(e) => setEditShow({ ...editShow, ticketTotal: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                VIP票价（元）
              </label>
              <input
                type="number"
                value={editShow.ticketPriceVip}
                onChange={(e) => setEditShow({ ...editShow, ticketPriceVip: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                普通票价（元）
              </label>
              <input
                type="number"
                value={editShow.ticketPriceStandard}
                onChange={(e) => setEditShow({ ...editShow, ticketPriceStandard: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPersonnelModal}
        onClose={() => setShowPersonnelModal(false)}
        title={editingPersonnel ? '编辑人员' : '添加人员'}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPersonnelModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSavePersonnel} className="btn-primary">
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                类型
              </label>
              <select
                value={personnelForm.type}
                onChange={(e) =>
                  setPersonnelForm({
                    ...personnelForm,
                    type: e.target.value as 'cast' | 'crew',
                  })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              >
                <option value="cast">演员</option>
                <option value="crew">工作人员</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={personnelForm.name}
              onChange={(e) =>
                setPersonnelForm({ ...personnelForm, name: e.target.value })
              }
              placeholder="请输入姓名"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              角色/职位
            </label>
            <input
              type="text"
              value={personnelForm.role}
              onChange={(e) =>
                setPersonnelForm({ ...personnelForm, role: e.target.value })
              }
              placeholder="如：主演、导演、灯光师"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              联系电话
            </label>
            <input
              type="tel"
              value={personnelForm.phone}
              onChange={(e) =>
                setPersonnelForm({ ...personnelForm, phone: e.target.value })
              }
              placeholder="请输入联系电话"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        title={editingEquipment ? '编辑设备' : '添加设备'}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEquipmentModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveEquipment} className="btn-primary">
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                设备分类
              </label>
              <select
                value={equipmentForm.category}
                onChange={(e) =>
                  setEquipmentForm({
                    ...equipmentForm,
                    category: e.target.value as EquipmentCategory,
                  })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              >
                <option value="lighting">灯光设备</option>
                <option value="sound">音响设备</option>
                <option value="stage">舞台设备</option>
                <option value="video">视频设备</option>
                <option value="other">其他设备</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                提供方
              </label>
              <select
                value={equipmentForm.providedBy}
                onChange={(e) =>
                  setEquipmentForm({
                    ...equipmentForm,
                    providedBy: e.target.value as 'venue' | 'tour' | 'rental',
                  })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              >
                <option value="tour">自带</option>
                <option value="venue">场馆提供</option>
                <option value="rental">租赁</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                设备名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={equipmentForm.name}
                onChange={(e) =>
                  setEquipmentForm({ ...equipmentForm, name: e.target.value })
                }
                placeholder="如：摇头灯、无线麦"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                数量
              </label>
              <input
                type="number"
                min="1"
                value={equipmentForm.quantity}
                onChange={(e) =>
                  setEquipmentForm({
                    ...equipmentForm,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              备注
            </label>
            <input
              type="text"
              value={equipmentForm.note}
              onChange={(e) =>
                setEquipmentForm({ ...equipmentForm, note: e.target.value })
              }
              placeholder="特殊要求或说明"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="添加场地照片"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSavePhoto} className="btn-primary">
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              图片链接 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={photoForm.url}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, url: e.target.value })
              }
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              照片描述
            </label>
            <input
              type="text"
              value={photoForm.description}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, description: e.target.value })
              }
              placeholder="如：舞台全景、后台入口"
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
            />
          </div>
          {photoForm.url && (
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                预览
              </label>
              <img
                src={photoForm.url}
                alt="预览"
                className="w-full h-40 object-cover rounded-md border border-gold-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
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

function PersonnelList({
  list,
  onEdit,
  onDelete,
}: {
  list: Personnel[];
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}) {
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
          <span className="text-xs text-charcoal-400 hidden sm:block">
            {person.phone}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(person)}
              className="p-1 text-charcoal-400 hover:text-wine-600 transition-colors"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(person.id)}
              className="p-1 text-charcoal-400 hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <p className="text-sm text-charcoal-400 text-center py-4">
          暂无人员，点击右上角添加
        </p>
      )}
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
