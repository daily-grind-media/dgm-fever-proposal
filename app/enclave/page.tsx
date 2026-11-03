import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enclave Design & Build × Daily Grind Media — Growth Partnership Proposal',
}

export default function EnclaveProposal() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <iframe
        title="Enclave Design & Build × Daily Grind Media proposal"
        src="/enclave.html"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  )
}
