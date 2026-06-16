import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileArchive,
  DollarSign,
  Ticket,
  FileText,
  Copy,
  Download,
  Archive,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Edit3,
  Lock,
  ChevronDown,
  AlignLeft,
  Briefcase,
  Users,
  Settings,
  Package,
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import { ShowStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';

type SummarySection = 'basic' | 'ticket' | 'personnel' | 'equipment' | 'material' | 'issue' | 'settlement';

const SUMMARY_SECTIONS: { key: SummarySection; label: string }[] = [
  { key: 'basic', label: '基础信息' },
  { key: 'ticket', label: '票务结算' },
  { key: 'personnel', label: '人员名单' },
  { key: 'equipment', label: '设备清单' },
  { key: 'material', label: '物料状态' },
  { key: 'issue', label: '待办问题' },
  { key: 'settlement', label: '结算口径' },
];

export default function SettlementPage() {
  const [searchParams] = useSearchParams();
  const urlShowId = searchParams.get('showId');
  const urlPersonnelIds = searchParams.get('personnelIds');
  const urlEquipmentIds = searchParams.get('equipmentIds');

  const shows = useTourStore((state) => state.shows);
  const settlements = useTourStore((state) => state.settlements);
  const updateSettlement = useTourStore((state) => state.updateSettlement);
  const personnel = useTourStore((state) => state.personnel);
  const equipment = useTourStore((state) => state.equipment);
  const materials = useTourStore((state) => state.materials);
  const issues = useTourStore((state) => state.issues);
  const archiveShow = useTourStore((state) => state.archiveShow);

  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryShowId, setSummaryShowId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    ticketSoldVip: 0,
    ticketSoldStandard: 0,
    actualBoxOffice: 0,
    guaranteeFee: 0,
    shareRatio: 50,
    expenses: 0,
  });
  const [summarySections, setSummarySections] = useState<SummarySection[]>(
    SUMMARY_SECTIONS.map((s) => s.key)
  );
  const [filteredPersonnelIds, setFilteredPersonnelIds] = useState<string[] | null>(null);
  const [filteredEquipmentIds, setFilteredEquipmentIds] = useState<string[] | null>(null);
  const [summaryViewMode, setSummaryViewMode] = useState<'text' | 'package'>('text');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'contact']));

  useEffect(() => {
    if (urlShowId) {
      setSelectedShow(urlShowId);
      if (urlPersonnelIds || urlEquipmentIds) {
        setFilteredPersonnelIds(urlPersonnelIds ? urlPersonnelIds.split(',') : null);
        setFilteredEquipmentIds(urlEquipmentIds ? urlEquipmentIds.split(',') : null);
        setSummaryShowId(urlShowId);
        const sections: SummarySection[] = ['basic'];
        if (urlPersonnelIds) sections.push('personnel');
        if (urlEquipmentIds) sections.push('equipment');
        setSummarySections(sections);
        setShowSummaryModal(true);
      }
    }
  }, [urlShowId, urlPersonnelIds, urlEquipmentIds]);

  const showsWithSettlement = useMemo(() => {
    return shows.map((show) => {
      const settlement = settlements.find((s) => s.showId === show.id);
      return { show, settlement };
    });
  }, [shows, settlements]);

  const selectedSettlement = selectedShow
    ? settlements.find((s) => s.showId === selectedShow)
    : null;

  const isArchived = selectedSettlement?.isArchived ?? false;

  useEffect(() => {
    if (selectedShow) {
      const s = settlements.find((st) => st.showId === selectedShow);
      setSettlementForm({
        ticketSoldVip: s?.ticketSoldVip || 0,
        ticketSoldStandard: s?.ticketSoldStandard || 0,
        actualBoxOffice: s?.actualBoxOffice || 0,
        guaranteeFee: s?.guaranteeFee || 0,
        shareRatio: s?.shareRatio || 50,
        expenses: s?.expenses || 0,
      });
      if (s?.isArchived) {
        setIsEditing(false);
      }
    }
  }, [selectedShow, settlements]);

  useEffect(() => {
    if (isArchived && isEditing) {
      setIsEditing(false);
    }
  }, [isArchived, isEditing]);

  const handleSelectShow = (showId: string) => {
    if (showId !== selectedShow) {
      setSelectedShow(showId);
      setIsEditing(false);
    }
  };

  const handleSaveSettlement = () => {
    if (selectedShow) {
      updateSettlement(selectedShow, settlementForm);
      setIsEditing(false);
    }
  };

  const handleStartEdit = () => {
    if (!isArchived) {
      setIsEditing(true);
    }
  };

  const archivedCount = showsWithSettlement.filter(
    (s) => s.settlement?.isArchived
  ).length;

  const totalBoxOffice = settlements.reduce(
    (sum, s) => sum + s.actualBoxOffice,
    0
  );

  const handleGenerateSummary = (showId: string) => {
    setSummaryShowId(showId);
    setSummarySections(SUMMARY_SECTIONS.map((s) => s.key));
    setFilteredPersonnelIds(null);
    setFilteredEquipmentIds(null);
    setSummaryViewMode('text');
    setExpandedSections(new Set(['basic', 'contact']));
    setShowSummaryModal(true);
  };

  const handleArchive = (showId: string) => {
    if (confirm('确定要归档这场演出吗？归档后将无法修改。')) {
      archiveShow(showId);
    }
  };

  const toggleSection = (key: SummarySection) => {
    setSummarySections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllSections = () => {
    setSummarySections(SUMMARY_SECTIONS.map((s) => s.key));
  };

  const deselectAllSections = () => {
    setSummarySections([]);
  };

  const toggleSectionExpand = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      not_started: '未制作',
      in_production: '制作中',
      shipped: '已寄送',
      delivered: '已到位',
    };
    return map[status] || status;
  };

  const generateSummaryText = useCallback(
    (showId: string, sections: SummarySection[] = SUMMARY_SECTIONS.map((s) => s.key)) => {
      const show = shows.find((s) => s.id === showId);
      const settlement = settlements.find((s) => s.showId === showId);
      const showPersonnel = filteredPersonnelIds
        ? personnel.filter((p) => p.showId === showId && filteredPersonnelIds.includes(p.id))
        : personnel.filter((p) => p.showId === showId);
      const showEquipment = filteredEquipmentIds
        ? equipment.filter((e) => e.showId === showId && filteredEquipmentIds.includes(e.id))
        : equipment.filter((e) => e.showId === showId);
      const showMaterials = materials.filter((m) => m.showId === showId);
      const showIssues = issues.filter((i) => i.showId === showId);

      if (!show) return '';

      const castList = showPersonnel.filter((p) => p.type === 'cast');
      const crewList = showPersonnel.filter((p) => p.type === 'crew');
      const vipSold = settlement?.ticketSoldVip || 0;
      const stdSold = settlement?.ticketSoldStandard || 0;
      const totalSold = vipSold + stdSold;
      const actualBoxOffice = settlement?.actualBoxOffice || 0;
      const guaranteeFee = settlement?.guaranteeFee || 0;
      const shareRatio = settlement?.shareRatio || 0;
      const expenses = settlement?.expenses || 0;
      const shareAmount = Math.round((actualBoxOffice * shareRatio) / 100);
      const netIncome = actualBoxOffice - expenses - Math.max(guaranteeFee, shareAmount);

      const parts: string[] = [];

      parts.push(`【${show.city}站 · ${show.venue}】`);

      if (sections.includes('basic')) {
        parts.push(`演出日期：${show.date}
演出时间：${show.startTime} - ${show.endTime}
进场时间：${show.loadInTime}
彩排时间：${show.rehearsalTime}
撤场时间：${show.loadOutTime}
场馆对接：${show.venueContact || '-'} (${show.venuePhone || '-'})`);
      }

      if (sections.includes('ticket')) {
        parts.push(`━━━ 票务信息 ━━━
总票数：${show.ticketTotal} 张
VIP票价：¥${show.ticketPriceVip}
普通票价：¥${show.ticketPriceStandard}
票房目标：¥${(show.ticketTotal * show.ticketPriceStandard).toLocaleString()}

━━━ 售票统计 ━━━
VIP票售出：${vipSold} 张
普通票售出：${stdSold} 张
总售票数：${totalSold} 张
售票率：${show.ticketTotal > 0 ? Math.round((totalSold / show.ticketTotal) * 100) : 0}%
实际票房：¥${actualBoxOffice.toLocaleString()}`);
      }

      if (sections.includes('personnel')) {
        parts.push(`━━━ 人员名单 ━━━
【演员】
${castList.map((p) => `  ${p.name} - ${p.role}`).join('\n')}

【工作人员】
${crewList.map((p) => `  ${p.name} - ${p.role}`).join('\n')}`);
      }

      if (sections.includes('equipment')) {
        parts.push(`━━━ 设备清单 ━━━
${showEquipment.map((e) => `  ${e.name} × ${e.quantity}`).join('\n')}`);
      }

      if (sections.includes('material')) {
        parts.push(`━━━ 物料状态 ━━━
${showMaterials.map((m) => `  ${m.name} - ${getStatusText(m.status)}`).join('\n')}`);
      }

      if (sections.includes('issue')) {
        parts.push(`━━━ 待办事项 ━━━
${showIssues.map((i) => `  [${i.status === 'resolved' ? '✓' : ' '}] ${i.title} (${i.assignee})`).join('\n')}`);
      }

      if (sections.includes('settlement')) {
        parts.push(`━━━ 结算口径 ━━━
保底费用：¥${guaranteeFee.toLocaleString()}
分成比例：${shareRatio}%
演出成本：¥${expenses.toLocaleString()}
实际分成：¥${shareAmount.toLocaleString()}
结算金额：¥${Math.max(guaranteeFee, shareAmount).toLocaleString()}
净收入：¥${netIncome.toLocaleString()}`);
      }

      if (settlement?.isArchived) {
        parts.push('【已归档】');
      }

      parts.push('---\n交接摘要由巡演统筹系统生成');

      return parts.join('\n\n');
    },
    [shows, settlements, personnel, equipment, materials, issues, filteredPersonnelIds, filteredEquipmentIds]
  );

  const handleCopySummary = () => {
    if (summaryShowId) {
      const text = generateSummaryText(summaryShowId, summarySections);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSummary = () => {
    if (summaryShowId) {
      const show = shows.find((s) => s.id === summaryShowId);
      const text = generateSummaryText(summaryShowId, summarySections);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${show?.city || '交接'}站_交接摘要_${show?.date || ''}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const selectedShowData = selectedShow
    ? showsWithSettlement.find((s) => s.show.id === selectedShow)
    : null;

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif-sc text-2xl font-bold text-wine-800 mb-2">
          结算归档
        </h1>
        <p className="text-charcoal-500">
          管理票务结算、生成交接摘要、归档历史场次
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-wine-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-wine-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-wine-700">{shows.length}</p>
              <p className="text-sm text-charcoal-500">总场次</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                ¥{totalBoxOffice.toLocaleString()}
              </p>
              <p className="text-sm text-charcoal-500">累计票房</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gold-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gold-700">
                {shows.length - archivedCount}
              </p>
              <p className="text-sm text-charcoal-500">待结算</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Archive className="w-6 h-6 text-charcoal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-700">
                {archivedCount}
              </p>
              <p className="text-sm text-charcoal-500">已归档</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <SectionTitle
                icon={<FileArchive className="w-5 h-5 text-gold-500" />}
                title="场次列表"
              />
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gold-100">
                {showsWithSettlement.map(({ show, settlement }) => (
                  <div
                    key={show.id}
                    className={`p-4 hover:bg-cream-50 cursor-pointer transition-colors ${
                      selectedShow === show.id ? 'bg-wine-50' : ''
                    }`}
                    onClick={() => handleSelectShow(show.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-wine-500 to-gold-400 flex items-center justify-center text-white font-serif-sc text-sm font-bold">
                          {show.city.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-charcoal-700">
                              {show.city}站
                            </h3>
                            <ShowStatusBadge status={show.status} />
                            {settlement?.isArchived && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-charcoal-100 text-charcoal-500">
                                已归档
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {show.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {show.venue.slice(0, 15)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-wine-700">
                            ¥{(settlement?.guaranteeFee || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-charcoal-400">保底</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-charcoal-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedShowData ? (
            <>
              <Card>
                <CardHeader>
                  <SectionTitle
                    icon={<DollarSign className="w-5 h-5 text-gold-500" />}
                    title="结算详情"
                    action={
                      !isArchived &&
                      !isEditing && (
                        <button
                          onClick={handleStartEdit}
                          className="btn-ghost text-sm flex items-center gap-1"
                        >
                          <Edit3 className="w-4 h-4" />
                          编辑
                        </button>
                      )
                    }
                  />
                </CardHeader>
                <CardBody className="space-y-4">
                  {isArchived && (
                    <div className="flex items-center gap-2 p-2 rounded bg-charcoal-100 text-charcoal-600 text-sm">
                      <Lock className="w-4 h-4" />
                      已归档，无法编辑
                    </div>
                  )}

                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-charcoal-500 mb-1">
                            VIP票售出（张）
                          </label>
                          <input
                            type="number"
                            value={settlementForm.ticketSoldVip}
                            onChange={(e) =>
                              setSettlementForm({
                                ...settlementForm,
                                ticketSoldVip: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 border border-gold-200 rounded-md bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-charcoal-500 mb-1">
                            普通票售出（张）
                          </label>
                          <input
                            type="number"
                            value={settlementForm.ticketSoldStandard}
                            onChange={(e) =>
                              setSettlementForm({
                                ...settlementForm,
                                ticketSoldStandard: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 border border-gold-200 rounded-md bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-charcoal-500 mb-1">
                          实际票房（元）
                        </label>
                        <input
                          type="number"
                          value={settlementForm.actualBoxOffice}
                          onChange={(e) =>
                            setSettlementForm({
                              ...settlementForm,
                              actualBoxOffice: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 border border-gold-200 rounded-md bg-white text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-charcoal-500 mb-1">
                            保底费用（元）
                          </label>
                          <input
                            type="number"
                            value={settlementForm.guaranteeFee}
                            onChange={(e) =>
                              setSettlementForm({
                                ...settlementForm,
                                guaranteeFee: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 border border-gold-200 rounded-md bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-charcoal-500 mb-1">
                            分成比例（%）
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={settlementForm.shareRatio}
                            onChange={(e) =>
                              setSettlementForm({
                                ...settlementForm,
                                shareRatio: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 border border-gold-200 rounded-md bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-charcoal-500 mb-1">
                          演出成本（元）
                        </label>
                        <input
                          type="number"
                          value={settlementForm.expenses}
                          onChange={(e) =>
                            setSettlementForm({
                              ...settlementForm,
                              expenses: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 border border-gold-200 rounded-md bg-white text-sm"
                        />
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 btn-secondary text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSaveSettlement}
                          className="flex-1 btn-primary text-sm"
                        >
                          保存
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-charcoal-500">保底费用</span>
                        <span className="font-medium text-charcoal-700">
                          ¥{(selectedShowData.settlement?.guaranteeFee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-charcoal-500">分成比例</span>
                        <span className="font-medium text-charcoal-700">
                          {selectedShowData.settlement?.shareRatio || 0}%
                        </span>
                      </div>
                      <div className="gold-divider"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-charcoal-500">VIP票售出</span>
                        <span className="font-medium text-charcoal-700">
                          {selectedShowData.settlement?.ticketSoldVip || 0} 张
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-charcoal-500">普通票售出</span>
                        <span className="font-medium text-charcoal-700">
                          {selectedShowData.settlement?.ticketSoldStandard || 0} 张
                        </span>
                      </div>
                      <div className="gold-divider"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-charcoal-500">实际票房</span>
                        <span className="text-lg font-serif-sc font-bold text-wine-700">
                          ¥{(selectedShowData.settlement?.actualBoxOffice || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-charcoal-500">演出成本</span>
                        <span className="font-medium text-charcoal-700">
                          ¥{(selectedShowData.settlement?.expenses || 0).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-3">
                  <button
                    onClick={() => handleGenerateSummary(selectedShowData.show.id)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    生成交接摘要
                  </button>
                  <button
                    onClick={() => handleArchive(selectedShowData.show.id)}
                    disabled={isArchived}
                    className={`w-full flex items-center justify-center gap-2 ${
                      isArchived
                        ? 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium'
                        : 'btn-secondary'
                    }`}
                  >
                    {isArchived ? (
                      <>
                        <Lock className="w-4 h-4" />
                        已归档
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        归档场次
                      </>
                    )}
                  </button>
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <FileArchive className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
                <p className="text-charcoal-400">请选择一个场次查看</p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <SectionTitle
                icon={<AlertCircle className="w-5 h-5 text-gold-500" />}
                title="待办提醒"
              />
            </CardHeader>
            <CardBody className="space-y-2">
              {showsWithSettlement
                .filter(({ settlement, show }) => !settlement?.isArchived && show.status !== 'archived')
                .slice(0, 3)
                .map(({ show }) => (
                  <div
                    key={show.id}
                    className="flex items-start gap-2 p-2 rounded bg-amber-50 border border-amber-200/50"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800">{show.city}场待结算</p>
                      <p className="text-xs text-amber-600">{show.date} · {show.venue}</p>
                    </div>
                  </div>
                ))}
              {showsWithSettlement.filter(({ settlement }) => !settlement?.isArchived).length === 0 && (
                <p className="text-sm text-charcoal-400 text-center py-2">所有场次已归档</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="场次交接摘要"
        size="xl"
        footer={
          <div className="flex justify-between">
            <button
              onClick={handleCopySummary}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? '已复制' : '复制文本'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="btn-secondary"
              >
                关闭
              </button>
              <button
                onClick={handleDownloadSummary}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>
          </div>
        }
      >
        {summaryShowId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-1">
                <button
                  onClick={() => setSummaryViewMode('text')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    summaryViewMode === 'text'
                      ? 'bg-white text-wine-700 shadow-sm font-medium'
                      : 'text-charcoal-500 hover:text-charcoal-700'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  文本摘要
                </button>
                <button
                  onClick={() => setSummaryViewMode('package')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    summaryViewMode === 'package'
                      ? 'bg-white text-wine-700 shadow-sm font-medium'
                      : 'text-charcoal-500 hover:text-charcoal-700'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  交接包
                </button>
              </div>
              <div>
                <div className="flex items-center justify-end mb-2">
                  <p className="text-sm font-medium text-charcoal-700 mr-3">导出范围</p>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllSections}
                      className="text-xs text-wine-600 hover:text-wine-700"
                    >
                      全选
                    </button>
                    <span className="text-charcoal-300">|</span>
                    <button
                      onClick={deselectAllSections}
                      className="text-xs text-charcoal-400 hover:text-charcoal-600"
                    >
                      全不选
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {SUMMARY_SECTIONS.map((section) => (
                    <label
                      key={section.key}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-colors border ${
                        summarySections.includes(section.key)
                          ? 'bg-wine-100 border-wine-300 text-wine-700'
                          : 'bg-cream-50 border-gold-200 text-charcoal-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={summarySections.includes(section.key)}
                        onChange={() => toggleSection(section.key)}
                        className="sr-only"
                      />
                      {summarySections.includes(section.key) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-current"></span>
                      )}
                      {section.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {summaryViewMode === 'text' ? (
              <div className="bg-cream-50 rounded-lg p-6 border border-gold-200/50 font-mono text-sm whitespace-pre-wrap text-charcoal-700 max-h-[55vh] overflow-y-auto">
                {generateSummaryText(summaryShowId, summarySections)}
              </div>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                {(() => {
                  const show = shows.find((s) => s.id === summaryShowId);
                  const settlement = settlements.find((s) => s.showId === summaryShowId);
                  const showPersonnel = filteredPersonnelIds
                    ? personnel.filter((p) => p.showId === summaryShowId && filteredPersonnelIds.includes(p.id))
                    : personnel.filter((p) => p.showId === summaryShowId);
                  const showEquipment = filteredEquipmentIds
                    ? equipment.filter((e) => e.showId === summaryShowId && filteredEquipmentIds.includes(e.id))
                    : equipment.filter((e) => e.showId === summaryShowId);
                  const showMaterials = materials.filter((m) => m.showId === summaryShowId);
                  const showIssues = issues.filter((i) => i.showId === summaryShowId);

                  if (!show) return null;

                  const castList = showPersonnel.filter((p) => p.type === 'cast');
                  const crewList = showPersonnel.filter((p) => p.type === 'crew');
                  const vipSold = settlement?.ticketSoldVip || 0;
                  const stdSold = settlement?.ticketSoldStandard || 0;
                  const totalSold = vipSold + stdSold;
                  const actualBoxOffice = settlement?.actualBoxOffice || 0;
                  const guaranteeFee = settlement?.guaranteeFee || 0;
                  const shareRatio = settlement?.shareRatio || 0;
                  const expenses = settlement?.expenses || 0;
                  const shareAmount = Math.round((actualBoxOffice * shareRatio) / 100);

                  const packageSections = [
                    {
                      key: 'basic',
                      icon: <Calendar className="w-4 h-4" />,
                      title: '基础信息',
                      section: 'basic' as SummarySection,
                      content: (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-charcoal-400">演出日期</span>
                            <p className="text-charcoal-700 font-medium">{show.date}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">演出时间</span>
                            <p className="text-charcoal-700 font-medium">{show.startTime} - {show.endTime}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">城市</span>
                            <p className="text-charcoal-700 font-medium">{show.city}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">场馆</span>
                            <p className="text-charcoal-700 font-medium">{show.venue}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">进场时间</span>
                            <p className="text-charcoal-700 font-medium">{show.loadInTime}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">撤场时间</span>
                            <p className="text-charcoal-700 font-medium">{show.loadOutTime}</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'contact',
                      icon: <Users className="w-4 h-4" />,
                      title: '联系人',
                      section: 'basic' as SummarySection,
                      content: (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-charcoal-400">场馆对接人</span>
                            <p className="text-charcoal-700 font-medium">{show.venueContact || '-'}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">联系电话</span>
                            <p className="text-charcoal-700 font-medium">{show.venuePhone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">场馆地址</span>
                            <p className="text-charcoal-700 font-medium">{show.venueAddress || '-'}</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'ticket',
                      icon: <Ticket className="w-4 h-4" />,
                      title: '票务结算',
                      section: 'ticket' as SummarySection,
                      content: (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-charcoal-400">总票数</span>
                            <p className="text-charcoal-700 font-medium">{show.ticketTotal} 张</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">总售票数</span>
                            <p className="text-charcoal-700 font-medium">{totalSold} 张 ({show.ticketTotal > 0 ? Math.round((totalSold / show.ticketTotal) * 100) : 0}%)</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">VIP票价</span>
                            <p className="text-charcoal-700 font-medium">¥{show.ticketPriceVip} (售出 {vipSold} 张)</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">普通票价</span>
                            <p className="text-charcoal-700 font-medium">¥{show.ticketPriceStandard} (售出 {stdSold} 张)</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-charcoal-400">实际票房</span>
                            <p className="text-lg font-serif-sc font-bold text-wine-700">¥{actualBoxOffice.toLocaleString()}</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'personnel',
                      icon: <Users className="w-4 h-4" />,
                      title: `人员名单 (${showPersonnel.length})`,
                      section: 'personnel' as SummarySection,
                      content: (
                        <div className="space-y-4">
                          {castList.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gold-600 mb-2">演员 ({castList.length})</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {castList.map((p) => (
                                  <div key={p.id} className="flex items-center gap-2 p-2 bg-cream-50 rounded">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wine-400 to-gold-400 flex items-center justify-center text-white text-xs font-medium">
                                      {p.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-charcoal-700 font-medium">{p.name}</p>
                                      <p className="text-xs text-charcoal-400">{p.role}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {crewList.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gold-600 mb-2">工作人员 ({crewList.length})</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {crewList.map((p) => (
                                  <div key={p.id} className="flex items-center gap-2 p-2 bg-cream-50 rounded">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-charcoal-400 flex items-center justify-center text-white text-xs font-medium">
                                      {p.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-charcoal-700 font-medium">{p.name}</p>
                                      <p className="text-xs text-charcoal-400">{p.role}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'equipment',
                      icon: <Settings className="w-4 h-4" />,
                      title: `设备清单 (${showEquipment.length})`,
                      section: 'equipment' as SummarySection,
                      content: (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-charcoal-400 border-b border-gold-100">
                                <th className="pb-2 font-medium">设备名称</th>
                                <th className="pb-2 font-medium text-center">数量</th>
                                <th className="pb-2 font-medium">分类</th>
                                <th className="pb-2 font-medium">提供方</th>
                                <th className="pb-2 font-medium">备注</th>
                              </tr>
                            </thead>
                            <tbody>
                              {showEquipment.map((e) => (
                                <tr key={e.id} className="border-b border-gold-50 last:border-0">
                                  <td className="py-2 text-charcoal-700">{e.name}</td>
                                  <td className="py-2 text-charcoal-700 text-center font-medium">{e.quantity}</td>
                                  <td className="py-2 text-charcoal-500 text-sm">
                                    {e.category === 'lighting' ? '灯光' : e.category === 'sound' ? '音响' : e.category === 'stage' ? '舞台' : e.category === 'video' ? '视频' : '其他'}
                                  </td>
                                  <td className="py-2">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${e.providedBy === 'tour' ? 'bg-wine-100 text-wine-700' : e.providedBy === 'venue' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {e.providedBy === 'tour' ? '自带' : e.providedBy === 'venue' ? '场馆' : '租赁'}
                                    </span>
                                  </td>
                                  <td className="py-2 text-charcoal-500 text-sm">{e.note || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ),
                    },
                    {
                      key: 'material',
                      icon: <Package className="w-4 h-4" />,
                      title: `物料状态 (${showMaterials.length})`,
                      section: 'material' as SummarySection,
                      content: (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {showMaterials.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-2 bg-cream-50 rounded">
                              <div>
                                <p className="text-charcoal-700 font-medium">{m.name}</p>
                                {m.quantity > 0 && <p className="text-xs text-charcoal-400">数量: {m.quantity}</p>}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : m.status === 'shipped' ? 'bg-blue-100 text-blue-700' : m.status === 'in_production' ? 'bg-amber-100 text-amber-700' : 'bg-charcoal-100 text-charcoal-700'}`}>
                                {getStatusText(m.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'issue',
                      icon: <AlertCircle className="w-4 h-4" />,
                      title: `待办问题 (${showIssues.length})`,
                      section: 'issue' as SummarySection,
                      content: (
                        <div className="space-y-2 text-sm">
                          {showIssues.map((i) => (
                            <div key={i.id} className="flex items-start gap-3 p-2 bg-cream-50 rounded">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${i.status === 'resolved' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                {i.status === 'resolved' ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${i.status === 'resolved' ? 'text-charcoal-400 line-through' : 'text-charcoal-700'}`}>
                                  {i.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-400">
                                  <span>负责人: {i.assignee}</span>
                                  {i.dueDate && <span>截止: {i.dueDate}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'settlement',
                      icon: <DollarSign className="w-4 h-4" />,
                      title: '结算口径',
                      section: 'settlement' as SummarySection,
                      content: (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-charcoal-400">保底费用</span>
                            <p className="text-charcoal-700 font-medium">¥{guaranteeFee.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">分成比例</span>
                            <p className="text-charcoal-700 font-medium">{shareRatio}%</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">演出成本</span>
                            <p className="text-charcoal-700 font-medium">¥{expenses.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-charcoal-400">实际分成</span>
                            <p className="text-charcoal-700 font-medium">¥{shareAmount.toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-charcoal-400">结算金额 (取保底与分成较高者)</span>
                            <p className="text-lg font-serif-sc font-bold text-wine-700">¥{Math.max(guaranteeFee, shareAmount).toLocaleString()}</p>
                          </div>
                        </div>
                      ),
                    },
                  ];

                  return packageSections
                    .filter((s) => summarySections.includes(s.section))
                    .map((ps) => (
                      <div key={ps.key} className="border border-gold-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSectionExpand(ps.key)}
                          className="w-full flex items-center justify-between p-3 bg-cream-50 hover:bg-cream-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-wine-100 text-wine-600 flex items-center justify-center">
                              {ps.icon}
                            </span>
                            <span className="font-medium text-charcoal-700">{ps.title}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-charcoal-400 transition-transform ${expandedSections.has(ps.key) ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.has(ps.key) && (
                          <div className="p-4 border-t border-gold-100">{ps.content}</div>
                        )}
                      </div>
                    ));
                })()}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
