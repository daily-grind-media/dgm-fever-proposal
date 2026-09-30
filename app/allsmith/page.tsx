import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALLSMITH — Authority Growth Blueprint · Daily Grind Media',
}

export default function AllsmithProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="ALLSMITH Authority Growth Blueprint proposal"
        src="/allsmith.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
