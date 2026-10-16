import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Supreme Balance × Daily Grind Media — Let’s Bring Your Brand to Life',
}

export default function SupremeBalanceProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Supreme Balance × Daily Grind Media introductory presentation"
        src="/supreme-balance.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
