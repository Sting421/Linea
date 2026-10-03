import { CanonicalStatus, STATUS_LABELS } from '~/utils/status';

type StatusDotSize = 'sm' | 'md' | 'lg';

type StatusDotBase = {
  status: CanonicalStatus;
  size?: StatusDotSize;
  pulse?: boolean;
  className?: string;
};

type StatusDotProps = StatusDotBase &
  ({ label?: string; decorative?: false } | { label?: never; decorative: true });

const STATUS_CLASSES: Record<CanonicalStatus, string> = {
  normal: 'bg-status-normal',
  offline: 'bg-status-offline',
  warning: 'bg-status-warning',
  fault: 'bg-status-fault',
  anomaly: 'bg-status-anomaly',
};

const SIZE_CLASSES: Record<StatusDotSize, string> = {
  sm: 'w-[7px] h-[7px]',
  md: 'w-[9px] h-[9px]',
  lg: 'w-[11px] h-[11px]',
};

const StatusDot = ({
  status,
  size = 'md',
  label,
  pulse = false,
  decorative = false,
  className = '',
}: StatusDotProps) => {
  const hasLabel = label != null && label !== '';
  const silent = decorative || hasLabel;

  return (
    <span className={`inline-flex items-center gap-[7px] align-middle ${className}`.trim()}>
      <span className="relative inline-flex flex-none">
        {pulse && (
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full opacity-55 animate-status-pulse ${STATUS_CLASSES[status]}`}
          />
        )}
        <span
          aria-hidden={silent ? true : undefined}
          aria-label={silent ? undefined : STATUS_LABELS[status]}
          className={`relative inline-block rounded-full shadow-[0_0_0_2px_#fff] ${STATUS_CLASSES[status]} ${SIZE_CLASSES[size]}`}
        />
      </span>
      {hasLabel && <span className="text-[13px] text-hue-ink-800">{label}</span>}
    </span>
  );
};

export default StatusDot;
