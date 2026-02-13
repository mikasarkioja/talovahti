import { prisma } from "@/lib/db";

interface Achievement {
  slug: string;
  name: string;
  description: string;
  date: Date;
}

interface ActionMetadata {
  speedDays?: number;
  amount?: number;
}

/**
 * GamificationEngine handles board XP and achievement logic.
 * Focuses on HOW the board manages the building.
 */
export const GamificationEngine = {
  /**
   * Calculates XP boost based on an audit log entry.
   * Rewards speed, expert usage, and proactive decisions.
   */
  async processAuditAction(
    userId: string,
    actionType: string,
    metadata: ActionMetadata,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { housingCompany: { include: { boardProfile: true } } },
    });

    if (!user || !user.housingCompany) return;

    const companyId = user.housingCompanyId;
    let xpBoost = 10; // Default base XP

    // 1. Logic for XP multipliers
    if (
      actionType.includes("APPROVED") &&
      metadata.speedDays !== undefined &&
      metadata.speedDays <= 3
    ) {
      xpBoost = 50; // Speed bonus
    }

    if (actionType.includes("EXPERT_ORDERED")) {
      xpBoost = 100; // Major reward for using experts
    }

    if (actionType.includes("PREVENTIVE_MAINTENANCE")) {
      xpBoost = 75; // Proactive reward
    }

    // 2. Update Board Profile
    let profile = user.housingCompany.boardProfile;
    if (!profile) {
      profile = await prisma.boardProfile.create({
        data: { housingCompanyId: companyId },
      });
    }

    const newTotalXP = profile.totalXP + xpBoost;
    const newLevel = Math.floor(newTotalXP / 1000) + 1;

    // 3. Check for Achievements
    const currentAchievements =
      (profile.achievements as unknown as Achievement[]) || [];
    const newAchievements = [...currentAchievements];

    // Example: "Expert Seeker" - Order 3 experts
    if (!currentAchievements.find((a) => a.slug === "expert-seeker")) {
      const expertOrders = await prisma.auditLog.count({
        where: {
          userId,
          action: { contains: "asiantuntija" },
        },
      });

      if (expertOrders >= 3) {
        newAchievements.push({
          slug: "expert-seeker",
          name: "Asiantuntijan etsijä",
          description: "Hallitus on tilannut vähintään 3 asiantuntija-arviota.",
          date: new Date(),
        });
      }
    }

    await prisma.boardProfile.update({
      where: { id: profile.id },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        achievements: newAchievements as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });

    return {
      xpBoost,
      newLevel,
      earnedAchievement: newAchievements.length > currentAchievements.length,
    };
  },
};
