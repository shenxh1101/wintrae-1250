import type { ShowStatus, MaterialStatus, IssueStatus } from '../types';

interface ShowStatusBadgeProps {
  status: ShowStatus;
}

export function ShowStatusBadge({ status }: ShowStatusBadgeProps) {
  const configs: Record<ShowStatus, { label: string; className: string }> = {
    pending: {
      label: '待确认',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    confirmed: {
      label: '已确认',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    in_progress: {
      label: '进行中',
      className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    completed: {
      label: '已完成',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    archived: {
      label: '已归档',
      className: 'bg-purple-100 text-purple-700 border-purple-200',
    },
  };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
}

interface MaterialStatusBadgeProps {
  status: MaterialStatus;
}

export function MaterialStatusBadge({ status }: MaterialStatusBadgeProps) {
  const configs: Record<MaterialStatus, { label: string; className: string }> =
    {
      not_started: {
        label: '未制作',
        className: 'bg-slate-100 text-slate-500 border-slate-200',
      },
      in_production: {
        label: '制作中',
        className:
          'bg-gold-100 text-gold-700 border-gold-300 animate-pulse-gold',
      },
      shipped: {
        label: '已寄送',
        className: 'bg-blue-100 text-blue-600 border-blue-200',
      },
      delivered: {
        label: '已到位',
        className: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      },
    };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

interface IssueStatusBadgeProps {
  status: IssueStatus;
}

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  const configs: Record<IssueStatus, { label: string; className: string }> = {
    open: {
      label: '待处理',
      className: 'bg-red-100 text-red-600 border-red-200',
    },
    in_progress: {
      label: '处理中',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    resolved: {
      label: '已解决',
      className: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    },
  };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleColors: Record<string, string> = {
    coordinator: 'bg-wine-100 text-wine-700 border-wine-200',
    venue_contact: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    tech_lead: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const labels: Record<string, string> = {
    coordinator: '统筹',
    venue_contact: '场馆',
    tech_lead: '技术',
  };

  const colorClass = roleColors[role] || 'bg-slate-100 text-slate-600 border-slate-200';
  const label = labels[role] || role;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
    >
      {label}
    </span>
  );
}
