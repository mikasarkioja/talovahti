/**
 * Rakennusurakan yleiset ehdot YSE 1998
 * Sopimuspohja urakoitsijan ja taloyhtiön välille.
 */
export function generateYSE1998(data: {
  companyName: string;
  contractorName: string;
  projectTitle: string;
  contractPrice: number;
}) {
  const date = new Date().toLocaleDateString("fi-FI");
  
  return `
URAKKASOPIMUS (YSE 1998)

1. OSAPUOLET
Rakennuttaja: ${data.companyName}
Urakoitsija: ${data.contractorName}

2. URAKKA-ALUE JA LAAJUUS
Hanke: ${data.projectTitle}
Urakka käsittää projektisuunnitelman mukaiset työt täysin valmiiksi saatettuna.

3. URAKKAHINTA JA MAKSUEHDOT
Urakkahinta: ${data.contractPrice.toLocaleString("fi-FI")} € (alv 0%)
Talovahti-palvelun komissio (5 %): ${(data.contractPrice * 0.05).toLocaleString("fi-FI")} €

4. SOPIMUSEHDOT
Tähän sopimukseen sovelletaan Rakennusurakan yleisiä ehtoja YSE 1998.

5. URAKKA-AIKA
Työn aloitus ja valmistuminen sovitaan erillisen aikataulun mukaisesti.

6. TAKUUAIKA
Takuuaika on kaksi (2) vuotta vastaanotosta, ellei toisin sovita.

7. ALLEKIRJOITUKSET
Päiväys: ${date}

Rakennuttaja: ____________________    Urakoitsija: ____________________
  `.trim();
}
