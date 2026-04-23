import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'

type Variant = 'positive' | 'warning' | 'negative' | 'neutral'

interface StatusCardProps {
  variant: Variant
  label: string
  description: string
  action?: React.ReactNode
}

const VARIANT_CONFIG: Record<Variant, {
  icon: React.ElementType
  color: string
  glow: string
  bg: string
  border: string
  badge: string
}> = {
  positive: {
    icon: CheckCircle2,
    color: '#026648',
    glow: '0 0 16px #02664845',
    bg: 'linear-gradient(135deg, #0d2318 0%, #07091a 100%)',
    border: '#02664822',
    badge: 'text-[#026648]',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    glow: '0 0 16px #f59e0b55',
    bg: 'linear-gradient(135deg, #1f1608 0%, #07091a 100%)',
    border: '#f59e0b22',
    badge: 'text-[#f59e0b]',
  },
  negative: {
    icon: XCircle,
    color: '#f87171',
    glow: '0 0 16px #f8717155',
    bg: 'linear-gradient(135deg, #1f0d0d 0%, #07091a 100%)',
    border: '#f8717122',
    badge: 'text-[#f87171]',
  },
  neutral: {
    icon: Info,
    color: '#04a372',
    glow: '0 0 16px #02664855',
    bg: 'linear-gradient(135deg, #132419 0%, #0a1710 100%)',
    border: '#02664822',
    badge: 'text-[#04a372]',
  },
}

export function StatusCard({ variant, label, description, action }: StatusCardProps) {
  const cfg = VARIANT_CONFIG[variant]
  const Icon = cfg.icon

  return (
    <div
      className="rounded-[12px] p-5 flex flex-col gap-4 h-full"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `inset 0 1px 0 #ffffff06, ${cfg.glow}`,
      }}
    >
      <div className="flex items-center gap-3">
        <Icon
          className="h-7 w-7 shrink-0"
          style={{
            color: cfg.color,
            filter: `drop-shadow(0 0 6px ${cfg.color}88)`,
          }}
          aria-hidden
        />
        <div>
          <p className="text-xs text-[#4a6080] uppercase tracking-widest font-semibold">
            Status Atual
          </p>
          <p className={`font-bold text-sm mt-0.5 ${cfg.badge}`}
            style={{ textShadow: `0 0 10px ${cfg.color}66` }}>
            {label}
          </p>
        </div>
      </div>

      <p className="text-sm text-[#8899bb] leading-relaxed flex-1">{description}</p>

      {action && <div>{action}</div>}
    </div>
  )
}
