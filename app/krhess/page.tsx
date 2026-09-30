import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KR Hess Law — Podcast + Content Production Proposal · Daily Grind Media',
}

export default function KRHessProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="KR Hess Law — Podcast + Content Production Proposal"
        src="/krhess.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
