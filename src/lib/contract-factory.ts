import { prisma } from "./db";

export const contractFactory = {
  async generateYSE1998Contract(projectId: string, bidId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { housingCompany: true },
    });

    const bid = await prisma.tenderBid.findUnique({
      where: { id: bidId },
    });

    if (!project) throw new Error("Project not found");
    if (!bid) throw new Error("Bid not found");

    // Generate Contract Text
    const contractText = `
URAKKASOPIMUS (YSE 1998)

1. OSAPUOLET
   Tilaaja: As Oy ${project.housingCompany.name} (Y-tunnus: ${project.housingCompany.businessId})
   Urakoitsija: ${bid.companyName}

2. URAKKAKKOHDE
   Hanke: ${project.title}
   Osoite: ${project.housingCompany.address}, ${project.housingCompany.city}
   
   Urakan laajuus on määritelty tarjouspyyntöasiakirjoissa ja urakoitsijan tarjouksessa pvm ${bid.createdAt.toLocaleDateString("fi-FI")}.

3. URAKKA-AIKA
   Aloitus: ${bid.startDate.toLocaleDateString("fi-FI")}
   Valmistuminen: ${bid.endDate.toLocaleDateString("fi-FI")}
   
   Työ on luovutettava tilaajalle täysin valmiina viimeistään yllä mainittuna päivänä.

4. URAKKAHINTA
   Kokonaisurakkahinta: ${bid.price.toLocaleString("fi-FI")} EUR (alv 0%)
   
   Hinta on kiinteä eikä siihen lisätä indeksikorotuksia.

5. MAKSUEHDOT
   Maksut suoritetaan maksuerätaulukon mukaisesti työn etenemisen perusteella.
   Maksuaika: 14 vrk hyväksytystä laskusta.
   
   Maksuerät (Esimerkki):
   1. Aloitus: 10%
   2. Työvaihe 1 (Purku): 20%
   3. Työvaihe 2 (Asennus): 40%
   4. Valmistuminen: 20%
   5. Takuuajan vakuus: 10%

6. YLEISET EHDOT
   Noudatetaan Rakennusurakan yleisiä sopimusehtoja YSE 1998.
   
   6.1 Viivästyssakko
   Mikäli työ viivästyy urakoitsijasta johtuvasta syystä, on urakoitsija velvollinen maksamaan tilaajalle viivästyssakkona 0.05% arvonlisäverottomasta urakkahinnasta jokaiselta alkavalta työpäivältä.
   
   6.2 Vakuudet
   Urakoitsija asettaa tilaajalle YSE 1998 36 §:n mukaisen työnaikaisen vakuuden (10% urakkahinnasta) ja takuuajan vakuuden (2% urakkahinnasta).

7. VALVOJA
   Tilaajan nimeämä valvoja: Insinööritoimisto Valvonta Oy.

8. RIITAISUUDET
   Erimielisyydet pyritään ratkaisemaan ensisijaisesti neuvottelemalla. Mikäli sovintoon ei päästä, ratkaistaan riidat käräjäoikeudessa.

Tämä sopimus on allekirjoitettu sähköisesti.
`;
    return contractText;
  },

  async createContractDraft(projectId: string, bidId: string) {
    const bid = await prisma.tenderBid.findUnique({ where: { id: bidId } });
    if (!bid) throw new Error("Bid not found");

    // Create contract
    const contract = await prisma.legalContract.create({
      data: {
        projectId,
        contractorId: bid.companyName, // Using name as ID for mock
        contractorName: bid.companyName,
        status: "DRAFT",
        content: await this.generateYSE1998Contract(projectId, bidId),
      },
    });

    // Create default milestones based on price (Mock logic)
    const total = bid.price;
    await prisma.milestone.createMany({
      data: [
        {
          projectId,
          contractId: contract.id,
          title: "Ennakkomaksu / Materiaalit",
          amount: total * 0.2,
          dueDate: new Date(Date.now() + 7 * 86400000),
        },
        {
          projectId,
          contractId: contract.id,
          title: "Työvaihe 1: Purkutyöt",
          amount: total * 0.3,
          dueDate: new Date(Date.now() + 30 * 86400000),
        },
        {
          projectId,
          contractId: contract.id,
          title: "Työvaihe 2: Asennus",
          amount: total * 0.4,
          dueDate: new Date(Date.now() + 60 * 86400000),
        },
        {
          projectId,
          contractId: contract.id,
          title: "Vastaanottotarkastus",
          amount: total * 0.1,
          dueDate: new Date(Date.now() + 90 * 86400000),
        },
      ],
    });

    return contract;
  },
};
