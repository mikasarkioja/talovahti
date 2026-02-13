import { prisma } from "@/lib/db";
import { KanbanBoard } from "@/components/governance/KanbanBoard";
import { VotingClient } from "../voting/VotingClient";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PipelinePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  const company = await prisma.housingCompany.findFirst();
  const housingCompanyId = company?.id || "default-company-id";

  // 1. Fetch User (Dynamic Switcher pattern)
  let user = null;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: {
        housingCompanyId: housingCompanyId,
        email: { contains: userQuery, mode: "insensitive" },
      },
    });
  }

  // Fallback to default Board Member
  if (!user && !userQuery) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: housingCompanyId, role: UserRole.BOARD_MEMBER },
    });
  }

  // Final fallback for development
  if (!user) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: housingCompanyId },
    });
  }

  const initiatives = await prisma.initiative.findMany({
    where: { housingCompanyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <VotingClient housingCompanyId={housingCompanyId} userId={user?.id} />

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          initialInitiatives={initiatives}
          currentUserRole={user?.role}
        />
      </div>
    </div>
  );
}
