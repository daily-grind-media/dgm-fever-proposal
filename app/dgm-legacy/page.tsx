import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Grind Media × Legacy Performance Institute — The Legacy Trainer System',
}

export default function DgmLegacyProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Daily Grind Media × Legacy Performance Institute proposal"
        src="/dgm-legacy.html"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  )
}
