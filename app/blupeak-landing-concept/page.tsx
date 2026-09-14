import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BluRipple Checking — BluPeak Credit Union',
}

export default function BluPeakLandingConcept() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="BluRipple Checking — BluPeak Credit Union"
        src="/blupeak-landing-concept.html"
        className="h-full w-full border-0"
      />
    </main>
  )
}
