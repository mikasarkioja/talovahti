import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "./ProjectDetailClient";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      observation: true,
      bids: {
        include: { vendor: true },
        orderBy: { amount: "asc" },
      },
      tenders: true,
    },
  });

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={JSON.parse(JSON.stringify(project))} />;
}
