import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request received — Daily Grind Media × Legacy Performance Institute',
  robots: { index: false },
}

export default function DgmLegacyThankYou() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Request received"
        src="/dgm-legacy-thank-you.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
