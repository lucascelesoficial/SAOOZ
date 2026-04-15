import { SaoozWordmark } from '@/components/ui/SaoozLogo'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg, #06080f)' }}>

      {/* Very subtle dot grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Logo */}
      <div className="mb-10 relative z-10">
        <SaoozWordmark size="lg" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}
