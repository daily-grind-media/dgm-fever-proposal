import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Encinitas Glass Company × Daily Grind Media — Digital Growth Proposal',
}

export default function EncinitasGlassProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Encinitas Glass Company × Daily Grind Media proposal"
        src="/encinitas-glass.html"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  )
}
