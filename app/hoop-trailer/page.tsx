import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hoop Trailer × Touchdown Trailer × Daily Grind Media — Creative Partnership',
  robots: { index: false, follow: false },
}

export default function HoopTrailerProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Hoop Trailer × Touchdown Trailer × Daily Grind Media proposal"
        src="/hoop-trailer.html"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  )
}
