import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Swiss Winter Village — Commercial Photo + Video Production · Daily Grind Media',
}

export default function FeverProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Swiss Winter Village commercial photo and video production proposal"
        src="/fever.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
