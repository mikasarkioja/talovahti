import { format } from 'date-fns'
import { fi } from 'date-fns/locale'

// Define a shape that covers what we need for minutes
export interface MeetingMinutesData {
  title: string
  date: Date | string
  type: 'GENERAL' | 'BOARD'
  location?: string
  chairmanName: string
  secretaryName: string
  attendeeCount: number
  totalSharesRepresented: number
  decisions: Array<{
    title: string
    description: string
    proposal: string
    decision: 'PASSED' | 'REJECTED' | 'TABLED'
    voteResult?: {
      yes: number
      no: number
      abstain: number
    }
  }>
}

export function generateMinutesMarkdown(data: MeetingMinutesData): string {
  const dateStr = format(new Date(data.date), 'd.M.yyyy HH:mm', { locale: fi })
  
  return `# Pöytäkirja - ${data.title}

**Aika:** ${dateStr}
**Paikka:** ${data.location || 'Taloyhtiö OS - Virtuaalikokous'}

**Läsnä:** ${data.attendeeCount} osakasta, edustaen ${data.totalSharesRepresented} osaketta.

**Puheenjohtaja:** ${data.chairmanName}
**Sihteeri:** ${data.secretaryName}

---

## 1. Kokouksen avaus
Kokous avattiin ajassa ${dateStr.split(' ')[1]}. Todettiin kokouksen laillisuus ja päätösvaltaisuus.

## 2. Järjestäytyminen
Valittiin kokouksen puheenjohtajaksi ${data.chairmanName} ja sihteeriksi ${data.secretaryName}.

## 3. Käsiteltävät asiat

${data.decisions.map((item, index) => `### 3.${index + 1} ${item.title}

**Kuvaus:**
${item.description}

**Ehdotus:**
${item.proposal}

**Päätös:**
${item.decision === 'PASSED' ? 'Ehdotus hyväksyttiin.' : item.decision === 'REJECTED' ? 'Ehdotus hylättiin.' : 'Asia jätettiin pöydälle.'}

${item.voteResult ? `**Äänestystulos:**
- JAA: ${item.voteResult.yes} ääntä
- EI: ${item.voteResult.no} ääntä
- TYHJÄ: ${item.voteResult.abstain} ääntä` : ''}
`).join('\n')}

---

## 4. Kokouksen päättäminen
Puheenjohtaja päätti kokouksen.

**Allekirjoitukset**

_________________________
${data.chairmanName}, Puheenjohtaja

_________________________
${data.secretaryName}, Sihteeri
`
}
