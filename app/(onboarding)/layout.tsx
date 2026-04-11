import { SaoozWordmark } from '@/components/ui/SaoozLogo'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1a3a 0%, #07091a 60%)' }}>

      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '48px 48px' }}
      />

      {/* Glow orb */}
      <div className="pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
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
