"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { supportInitiativeAction } from "@/app/actions/resident-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SupportButton({
  initiativeId,
  userId,
  isSupported,
  disabled,
}: {
  initiativeId: string;
  userId: string;
  isSupported: boolean;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSupport = () => {
    startTransition(async () => {
      const result = await supportInitiativeAction({ initiativeId, userId });
      if (result.success) {
        toast.success("Kiitos kannatuksesta!");
        router.refresh();
      } else {
        toast.error("Virhe: " + result.error);
      }
    });
  };

  if (isSupported) {
    return (
      <Button
        variant="ghost"
        disabled
        className="text-brand-emerald font-bold gap-2"
      >
        <ThumbsUp size={16} fill="currentColor" />
        Kannatettu
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || isPending}
      onClick={handleSupport}
      className="border-brand-emerald text-brand-emerald hover:bg-emerald-50 font-bold px-6 rounded-xl transition-all"
    >
      <ThumbsUp size={16} className="mr-2" />
      {isPending ? "Käsitellään..." : "Kannata"}
    </Button>
  );
}
