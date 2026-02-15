import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { completeProjectAction } from "@/app/actions/project-actions";

export default async function ProjectHandoverPage({ params }: { params: { id: string } }) {
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: { observation: true, building: true }
  });

  if (!project) return <div>Projektia ei löytynyt.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Urakan päätöskatselmus: {project.observation.technicalVerdict}</h1>
        <Badge variant="secondary">Vaihe: Luovutus</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tarkistuslista hallitukselle</CardTitle>
          <p className="text-xs text-slate-500">Varmista nämä asiat ennen urakan loppuun kuittaamista.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox id="docs" />
            <label htmlFor="docs" className="text-sm">Kaikki loppudokumentit (piirustukset, käyttöohjeet) on vastaanotettu.</label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="inspection" />
            <label htmlFor="inspection" className="text-sm">Valvoja on suorittanut vastaanottotarkastuksen ja hyväksynyt laadun.</label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="guarantee" />
            <label htmlFor="guarantee" className="text-sm">Urakoitsija on toimittanut YSE 1998 mukaisen vakuuden takuuajalle.</label>
          </div>
          
          <div className="pt-6 border-t">
            <form action={completeProjectAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">
                Hyväksy vastaanotto ja aloita takuuaika
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}