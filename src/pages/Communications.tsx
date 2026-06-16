import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Filter,
  Search,
  Plus,
  Send,
  Tag,
  MapPin,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import { RoleBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { Role } from '../types';

export default function CommunicationsPage() {
  const shows = useTourStore((state) => state.shows);
  const communications = useTourStore((state) => state.communications);
  const addCommunication = useTourStore((state) => state.addCommunication);

  const [selectedShow, setSelectedShow] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComm, setNewComm] = useState({
    showId: '',
    topic: '',
    content: '',
    author: '巡演统筹-周老师',
    role: 'coordinator' as Role,
  });

  const filteredComms = useMemo(() => {
    const filtered = communications.filter((c) => {
      const matchShow = selectedShow === 'all' || c.showId === selectedShow;
      const matchRole = selectedRole === 'all' || c.role === selectedRole;
      const matchSearch =
        c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topic.toLowerCase().includes(searchQuery.toLowerCase());
      return matchShow && matchRole && matchSearch;
    });
    return filtered.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [communications, selectedShow, selectedRole, searchQuery]);

  const topics = useMemo(() => {
    const set = new Set(communications.map((c) => c.topic));
    return Array.from(set);
  }, [communications]);

  const commsByDate = useMemo(() => {
    const groups: Record<string, typeof communications> = {};
    filteredComms.forEach((c) => {
      const date = c.time.split(' ')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(c);
    });
    return groups;
  }, [filteredComms]);

  const handleAddComm = () => {
    if (newComm.showId && newComm.content) {
      addCommunication({
        showId: newComm.showId,
        author: newComm.author,
        role: newComm.role,
        time: new Date().toISOString().slice(0, 16).replace('T', ' '),
        content: newComm.content,
        topic: newComm.topic || '其他',
      });
      setNewComm({
        showId: '',
        topic: '',
        content: '',
        author: '巡演统筹-周老师',
        role: 'coordinator',
      });
      setShowAddModal(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif-sc text-2xl font-bold text-wine-800 mb-2">
          沟通记录
        </h1>
        <p className="text-charcoal-500">
          集中管理所有场次沟通记录，按场次和主题筛选查看
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-wine-700">
              {communications.length}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">总沟通数</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-gold-600">{topics.length}</p>
            <p className="text-sm text-charcoal-500 mt-1">沟通主题</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {shows.filter((s) =>
                communications.some((c) => c.showId === s.id)
              ).length}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">涉及场次</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-emerald-600">今日 0</p>
            <p className="text-sm text-charcoal-500 mt-1">今日新增</p>
          </CardBody>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="搜索沟通内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gold-200/50 rounded-md text-sm focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400 w-72"
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

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-white border border-gold-200/50 rounded-md text-sm focus:outline-none focus:border-wine-400"
          >
            <option value="all">全部角色</option>
            <option value="coordinator">统筹</option>
            <option value="venue_contact">场馆</option>
            <option value="tech_lead">技术</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          记录沟通
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(commsByDate).map(([date, dayComms]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-wine-500"></div>
              <span className="font-serif-sc text-lg font-semibold text-wine-700">
                {date}
              </span>
              <span className="text-sm text-charcoal-400">
                {dayComms.length} 条记录
              </span>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-1 top-0 bottom-0 w-px bg-gold-300/50"></div>
              <div className="space-y-4">
                {dayComms.map((comm, index) => {
                  const show = shows.find((s) => s.id === comm.showId);
                  return (
                    <div
                      key={comm.id}
                      className="relative animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-gold-400 border-2 border-cream-50"></div>

                      <Card hover>
                        <CardBody>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-wine-400 to-gold-400 flex items-center justify-center text-white text-sm font-medium">
                                {comm.author.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-charcoal-700">
                                    {comm.author}
                                  </span>
                                  <RoleBadge role={comm.role} />
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-charcoal-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {show?.city || '未知'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {comm.topic}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-charcoal-400 whitespace-nowrap">
                              {comm.time.split(' ')[1]}
                            </span>
                          </div>
                          <div className="pl-12">
                            <p className="text-sm text-charcoal-600 leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {filteredComms.length === 0 && (
          <Card>
            <CardBody className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
              <p className="text-charcoal-400">暂无沟通记录</p>
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="记录沟通"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddComm} className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" />
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                场次
              </label>
              <select
                value={newComm.showId}
                onChange={(e) =>
                  setNewComm({ ...newComm, showId: e.target.value })
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
                主题
              </label>
              <input
                type="text"
                value={newComm.topic}
                onChange={(e) =>
                  setNewComm({ ...newComm, topic: e.target.value })
                }
                placeholder="例如：物料寄送"
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                记录人
              </label>
              <input
                type="text"
                value={newComm.author}
                onChange={(e) =>
                  setNewComm({ ...newComm, author: e.target.value })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                角色
              </label>
              <select
                value={newComm.role}
                onChange={(e) =>
                  setNewComm({
                    ...newComm,
                    role: e.target.value as Role,
                  })
                }
                className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400"
              >
                <option value="coordinator">统筹</option>
                <option value="venue_contact">场馆</option>
                <option value="tech_lead">技术</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              沟通内容
            </label>
            <textarea
              value={newComm.content}
              onChange={(e) =>
                setNewComm({ ...newComm, content: e.target.value })
              }
              placeholder="请记录沟通内容..."
              rows={5}
              className="w-full px-3 py-2 border border-gold-200 rounded-md bg-white focus:outline-none focus:border-wine-400 focus:ring-1 focus:ring-wine-400 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
