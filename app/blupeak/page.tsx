import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Grind Media × BluPeak Federal Credit Union — Creative Production Partnership',
}

export default function BluPeakProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Daily Grind Media and BluPeak Federal Credit Union proposal"
        src="/blupeak.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
