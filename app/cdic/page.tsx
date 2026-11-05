import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'California Direct Importing Company × Daily Grind Media — Research Briefing',
}

export default function CdicBriefing() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="California Direct Importing Company research briefing"
        src="/cdic.html"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  )
}
