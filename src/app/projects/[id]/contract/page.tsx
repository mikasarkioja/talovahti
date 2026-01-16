import React from "react";
import ContractDashboard from "@/components/projects/ContractDashboard";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Pass the ID to the client component which handles the interactive simulation
  return <ContractDashboard projectId={id} />;
}
