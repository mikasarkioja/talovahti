/**
 * Konsulttitoiminnan yleiset ehdot KSA 2013
 * Sopimuspohja valvojan ja taloyhtiön välille.
 */
export function generateKSA2013(data: {
  companyName: string;
  expertName: string;
  projectTitle: string;
  fee: number;
}) {
  const date = new Date().toLocaleDateString("fi-FI");
  
  return `
VALVONTASOPIMUS (KSA 2013)

1. OSAPUOLET
Tilaaja: ${data.companyName}
Konsultti: ${data.expertName}

2. KOHDE
Hanke: ${data.projectTitle}
Tehtävä: Rakennustyön valvonta ja suunnittelun ohjaus.

3. SOPIMUSEHDOT
Tähän sopimukseen sovelletaan Konsulttitoiminnan yleisiä ehtoja KSA 2013.

4. PALKKIO JA KOMISSIO
Konsulttipalkkio: ${data.fee.toLocaleString("fi-FI")} € (alv 0%)
Talovahti-palvelun komissio (5 %): ${(data.fee * 0.05).toLocaleString("fi-FI")} €

5. VALVONNAN LAAJUUS
Valvoja toimii tilaajan edunvalvojana työmaalla, tarkastaa työvaiheet ja varmistaa laadunvarmistuksen toteutumisen.

6. ALLEKIRJOITUKSET
Päiväys: ${date}

Tilaaja: ____________________    Konsultti: ____________________
  `.trim();
}
