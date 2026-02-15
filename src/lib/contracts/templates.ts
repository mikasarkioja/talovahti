// src/lib/contracts/templates.ts

interface ContractData {
  buildingName: string;
  vendorName: string;
  projectTitle: string;
  amount: number;
}

/**
 * Generates a contract template for Consultants (KSA 2013)
 * Use for technical managers and inspectors.
 */
export const generateKSA2013 = (data: ContractData) => {
  return {
    title: `Konsulttisopimus (KSA 2013): ${data.projectTitle}`,
    content: `
      OSAPUOLET: ${data.buildingName} ja ${data.vendorName}
      KOHDE: ${data.projectTitle}
      SOPIMUSEHDOT: Tässä sopimuksessa noudatetaan Konsulttitoiminnan yleisiä sopimusehtoja KSA 2013.
      PALKKIO: ${data.amount} EUR (alv 0%).
      VALVONTA: Konsultti toimii taloyhtiön edunvalvojana ja teknisenä asiantuntijana.
    `,
    terms: "KSA 2013",
  };
};

/**
 * Generates a contract template for Contractors (YSE 1998)
 * Use for physical renovation work.
 */
export const generateYSE1998 = (data: ContractData) => {
  return {
    title: `Urakkasopimus (YSE 1998): ${data.projectTitle}`,
    content: `
      OSAPUOLET: ${data.buildingName} ja ${data.vendorName}
      KOHDE: ${data.projectTitle}
      SOPIMUSEHDOT: Tässä sopimuksessa noudatetaan Rakennusurakan yleisiä sopimusehtoja YSE 1998.
      URAKKAHINTA: ${data.amount} EUR (alv 0%).
      TAKUUAIKA: YSE 1998 mukainen (pääsääntöisesti 2 vuotta).
    `,
    terms: "YSE 1998",
  };
};