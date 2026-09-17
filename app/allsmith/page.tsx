import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALLSMITH — 90-Day Authority Growth Proposal · Daily Grind Media',
}

export default function Allsmith90Proposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="ALLSMITH 90-Day Authority Growth Proposal"
        src="/90-day-growth.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
