export type StatusType = 'PENDING' | 'CONSOLIDATED' | 'UNKNOWN';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<StatusType, string> = {
    PENDING: 'bg-amber-500 text-white',
    CONSOLIDATED: 'bg-emerald-500 text-white',
    UNKNOWN: 'bg-red-500 text-white'
  };

  const appliedClasses = colorMap[status] || 'bg-slate-500 text-white';

  return (
    <span
      className={`
        text-[10px] 
        font-bold 
        px-2 
        py-0.5 
        rounded-full 
        uppercase 
        tracking-wide 
        ${appliedClasses}
      `}
    >
      {status}
    </span>
  );
}