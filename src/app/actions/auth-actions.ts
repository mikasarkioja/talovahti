"use server";

import { prisma } from "@/lib/db";
import { login, logout } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function switchUserAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return { success: false, error: "Käyttäjää ei löytynyt." };
    }

    await login({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    revalidatePath("/");
    revalidatePath("/resident");
    revalidatePath("/digital-twin");

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Switch User Error:", error);
    return { success: false, error: "Kirjautuminen epäonnistui." };
  }
}

export async function logoutAction() {
  await logout();
  revalidatePath("/");
}
