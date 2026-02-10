// src/lib/notifications.ts

export type PushRecipient =
  | "RESIDENT"
  | "BOARD"
  | "MAINTENANCE"
  | "ALL_RESIDENTS";

export const notificationService = {
  async sendPush(
    recipient: PushRecipient,
    title: string,
    message: string,
    payload?: unknown,
  ) {
    // In a real application, this would interface with Firebase Cloud Messaging (FCM), Expo Push, or OneSignal.
    // We would resolve 'recipient' to specific device tokens from the User database.

    console.log(`[PUSH NOTIFICATION] To: ${recipient}`);
    console.log(`Title: ${title}`);
    console.log(`Message: ${message}`);
    if (payload) console.log(`Payload:`, payload);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return { success: true, timestamp: new Date() };
  },
};

import { prisma } from "@/lib/db";

export async function sendResidentUpdate(
  ticketId: string,
  status: "ROUTINE" | "PROJECT",
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { createdBy: true },
  });

  if (!ticket || !ticket.createdBy.email) return;

  const subject = `Päivitys vikailmoitukseesi: ${ticket.title}`;
  const message =
    status === "PROJECT"
      ? "Asiantuntija on nimetty tarkastamaan raporttisi. Se on nyt osa rakennuksen teknistä ylläpitosuunnitelmaa."
      : "Raporttisi on siirretty huoltotiimille rutiinikorjausta varten.";

  // Tässä kohtaa integroitaisiin sähköposti- tai push-palvelu (esim. Resend, Supabase Auth)
  console.log(
    `[ILMOITUS] Lähetetään ${status}-päivitys käyttäjälle ${ticket.createdBy.email}`,
  );
  console.log(`Aihe: ${subject}`);
  console.log(`Viesti: ${message}`);

  return { success: true };
}
