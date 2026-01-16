import { useGovernanceStore } from "@/lib/useGovernanceStore";

export function useParticipationMap() {
  const setParticipatedApartmentIds = useGovernanceStore(
    (s) => s.setParticipatedApartmentIds,
  );

  const highlightParticipation = (apartmentIds: string[]) => {
    setParticipatedApartmentIds(apartmentIds);
  };

  const clearParticipation = () => {
    setParticipatedApartmentIds([]);
  };

  const getStaircaseStats = (participatingApartments: { name: string }[]) => {
    const stats: Record<string, number> = {};

    participatingApartments.forEach((apt) => {
      // Assume format "A 12" or similar. Grab first letter.
      const staircase = apt.name.trim().charAt(0).toUpperCase();
      if (/[A-Z]/.test(staircase)) {
        stats[staircase] = (stats[staircase] || 0) + 1;
      }
    });

    // Format: "Staircase A: 5 | Staircase B: 2"
    return Object.entries(stats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([staircase, count]) => `Rappu ${staircase}: ${count}`)
      .join(" | ");
  };

  return { highlightParticipation, clearParticipation, getStaircaseStats };
}
