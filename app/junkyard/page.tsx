import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Junkyard Sports Bar & Grill × Daily Grind Media — Marketing Partnership Proposal',
}

export default function JunkyardProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Junkyard Sports Bar & Grill × Daily Grind Media proposal"
        src="/junkyard.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
