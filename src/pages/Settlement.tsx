import { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import { useTourStore } from '../store/useTourStore';
import { Card, CardBody, CardHeader, SectionTitle } from '../components/Card';
import { ShowStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function SettlementPage() {
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

  const showsWithSettlement = useMemo(() => {
    return shows.map((show) => {
      const settlement = settlements.find((s) => s.showId === show.id);
      return { show, settlement };
    });
  }, [shows, settlements]);

  const selectedSettlement = selectedShow
    ? settlements.find((s) => s.showId === selectedShow)
    : null;

  useEffect(() => {
    if (selectedSettlement) {
      setSettlementForm({
        ticketSoldVip: selectedSettlement.ticketSoldVip || 0,
        ticketSoldStandard: selectedSettlement.ticketSoldStandard || 0,
        actualBoxOffice: selectedSettlement.actualBoxOffice,
        guaranteeFee: selectedSettlement.guaranteeFee,
        shareRatio: selectedSettlement.shareRatio,
        expenses: selectedSettlement.expenses || 0,
      });
      setIsEditing(false);
    }
  }, [selectedSettlement]);

  const handleSaveSettlement = () => {
    if (selectedShow) {
      updateSettlement(selectedShow, settlementForm);
      setIsEditing(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedSettlement?.isArchived) {
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
    setShowSummaryModal(true);
  };

  const handleArchive = (showId: string) => {
    if (confirm('确定要归档这场演出吗？归档后将无法修改。')) {
      archiveShow(showId);
    }
  };

  const generateSummaryText = (showId: string) => {
    const show = shows.find((s) => s.id === showId);
    const settlement = settlements.find((s) => s.showId === showId);
    const showPersonnel = personnel.filter((p) => p.showId === showId);
    const showEquipment = equipment.filter((e) => e.showId === showId);
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
    const shareAmount = Math.round(actualBoxOffice * shareRatio / 100);
    const netIncome = actualBoxOffice - expenses - Math.max(guaranteeFee, shareAmount);

    return `【${show.city}站 · ${show.venue}】
演出日期：${show.date}
演出时间：${show.startTime} - ${show.endTime}
进场时间：${show.loadInTime}
彩排时间：${show.rehearsalTime}
撤场时间：${show.loadOutTime}
场馆对接：${show.venueContact || '-'} (${show.venuePhone || '-'})

━━━ 票务信息 ━━━
总票数：${show.ticketTotal} 张
VIP票价：¥${show.ticketPriceVip}
普通票价：¥${show.ticketPriceStandard}
票房目标：¥${(show.ticketTotal * show.ticketPriceStandard).toLocaleString()}

━━━ 售票统计 ━━━
VIP票售出：${vipSold} 张
普通票售出：${stdSold} 张
总售票数：${totalSold} 张
售票率：${show.ticketTotal > 0 ? Math.round(totalSold / show.ticketTotal * 100) : 0}%
实际票房：¥${actualBoxOffice.toLocaleString()}

━━━ 人员名单 ━━━
【演员】
${castList.map((p) => `  ${p.name} - ${p.role}`).join('\n')}

【工作人员】
${crewList.map((p) => `  ${p.name} - ${p.role}`).join('\n')}

━━━ 设备清单 ━━━
${showEquipment.map((e) => `  ${e.name} × ${e.quantity}`).join('\n')}

━━━ 物料状态 ━━━
${showMaterials.map((m) => `  ${m.name} - ${getStatusText(m.status)}`).join('\n')}

━━━ 待办事项 ━━━
${showIssues.map((i) => `  [${i.status === 'resolved' ? '✓' : ' '}] ${i.title} (${i.assignee})`).join('\n')}

━━━ 结算口径 ━━━
保底费用：¥${guaranteeFee.toLocaleString()}
分成比例：${shareRatio}%
演出成本：¥${expenses.toLocaleString()}
实际分成：¥${shareAmount.toLocaleString()}
结算金额：¥${Math.max(guaranteeFee, shareAmount).toLocaleString()}
净收入：¥${netIncome.toLocaleString()}

${settlement?.isArchived ? '【已归档】' : ''}
---
交接摘要由巡演统筹系统生成
`;
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

  const handleCopySummary = () => {
    if (summaryShowId) {
      const text = generateSummaryText(summaryShowId);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              <p className="text-2xl font-bold text-wine-700">
                {shows.length}
              </p>
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
                    onClick={() => setSelectedShow(show.id)}
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
                      !selectedShowData.settlement?.isArchived &&
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
                  {selectedShowData.settlement?.isArchived && (
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
                    disabled={selectedShowData.settlement?.isArchived}
                    className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Archive className="w-4 h-4" />
                    {selectedShowData.settlement?.isArchived
                      ? '已归档'
                      : '归档场次'}
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
              <div className="flex items-start gap-2 p-2 rounded bg-amber-50 border border-amber-200/50">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800">上海场待结算</p>
                  <p className="text-xs text-amber-600">演出已结束，请尽快结算</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-blue-50 border border-blue-200/50">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">北京场待确认</p>
                  <p className="text-xs text-blue-600">合同签署中</p>
                </div>
              </div>
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
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>
          </div>
        }
      >
        {summaryShowId && (
          <div className="bg-cream-50 rounded-lg p-6 border border-gold-200/50 font-mono text-sm whitespace-pre-wrap text-charcoal-700">
            {generateSummaryText(summaryShowId)}
          </div>
        )}
      </Modal>
    </div>
  );
}
