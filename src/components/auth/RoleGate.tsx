"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { UserRole } from "@prisma/client";

interface RoleGateProps {
  children: React.ReactNode;
  allowed: (UserRole | "BOARD_ANY")[];
  fallback?: React.ReactNode;
}

/**
 * RoleGate provides visibility control based on the current user's role.
 * Wraps sensitive UI parts to ensure clear separation of concerns.
 */
export function RoleGate({
  children,
  allowed,
  fallback = null,
}: RoleGateProps) {
  const { currentUser } = useStore();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Helper for checking any board-like role
  const isAllowed = allowed.some((a) => {
    if (a === "BOARD_ANY") {
      return role === "BOARD" || role === "BOARD_MEMBER" || role === "MANAGER";
    }
    return a === role;
  });

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
