import pdf from 'pdf-parse'

export type FinancialData = {
    hoitovastike: number | null
    rahoitusvastike: number | null
    lainaosuus: number | null
    year: number | null
}

export async function extractMaintenanceData(pdfBuffer: Buffer): Promise<FinancialData> {
    try {
        const data = await pdf(pdfBuffer)
        const text = data.text

        // Regex patterns (Finnish)
        const hoitovastikeRegex = /hoitovastike.*?(\d+[.,]\d{2})/i
        const rahoitusvastikeRegex = /rahoitusvastike.*?(\d+[.,]\d{2})/i
        const lainaosuusRegex = /lainaosuus.*?(\d+[.,]\d{2})/i
        const yearRegex = /tilikausi.*?(\d{4})/i

        const parseAmount = (match: RegExpMatchArray | null) => {
            if (!match) return null
            return parseFloat(match[1].replace(',', '.'))
        }

        return {
            hoitovastike: parseAmount(text.match(hoitovastikeRegex)),
            rahoitusvastike: parseAmount(text.match(rahoitusvastikeRegex)),
            lainaosuus: parseAmount(text.match(lainaosuusRegex)),
            year: text.match(yearRegex) ? parseInt(text.match(yearRegex)![1]) : new Date().getFullYear()
        }

    } catch (error) {
        console.error("PDF Parse Error", error)
        throw new Error("Failed to parse PDF")
    }
}
