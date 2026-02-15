import { getOpsBoardItems } from "@/app/actions/ops-actions";
import { OpsKanbanBoard } from "@/components/ops/OpsKanbanBoard";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function OpsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  // 1. Fetch User (Support Dev Switcher)
  let user;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: {
        email: { contains: userQuery, mode: "insensitive" },
      },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: UserRole.BOARD_MEMBER },
    });
  }

  if (!user || (user.role !== "BOARD_MEMBER" && user.role !== "ADMIN")) {
    return <div className="p-10 text-center">Pääsy evätty.</div>;
  }

  const items = await getOpsBoardItems(user.id);

  return (
    <div className="p-8 max-w-[100vw] min-h-screen bg-slate-50/50 flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Projektinhallinta
          </h1>
          <p className="text-slate-500 mt-1">
            Hallitse taloyhtiön kunnossapidon työnkulkua keskitetysti.
          </p>
        </div>
      </header>

      <div className="flex-1 -mx-8 px-8 overflow-hidden">
        <OpsKanbanBoard items={items} />
      </div>
    </div>
  );
}
