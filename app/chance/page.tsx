import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Grind Media — Content System Proposal for Chance Dyck',
}

export default function ChanceProposal() {
  return (
    <iframe
      src="/chance.html"
      title="Daily Grind Media — Content System Proposal for Chance Dyck"
      style={{
        border: 'none',
        display: 'block',
        height: '100vh',
        width: '100%',
      }}
    />
  )
}
