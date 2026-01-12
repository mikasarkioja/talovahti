import React from 'react'
import ContractDashboard from '@/components/projects/ContractDashboard'

export default function ContractPage({ params }: { params: { id: string } }) {
  // Pass the ID to the client component which handles the interactive simulation
  return <ContractDashboard projectId={params.id} />
}
