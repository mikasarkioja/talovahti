import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  section: {
    marginVertical: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#bfbfbf",
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: "center",
    color: "#888888",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 10,
  },
});

interface Task {
  id: string;
  title: string;
  quarter: string; // e.g., 'Q1', 'Q2'
  deadline?: Date | string | null;
  estimatedCost?: number;
  description?: string | null;
}

interface MaintenanceNeedsReportProps {
  data: {
    company: {
      name: string;
      businessId: string;
    };
    tasks: Task[];
    generatedAt: string;
    startYear: number;
    // TCO Metrics (optional)
    metrics?: {
      pki: number; // Peruskorjausindeksi
      ph: number; // PTS Horizon
      kai: number; // Korjausaktiivisuusindeksi
      rdr: number; // Renovation Debt Ratio
    };
  };
}

export const MaintenanceNeedsReport = ({
  data,
}: MaintenanceNeedsReportProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.company.name}</Text>
          <Text style={styles.subtitle}>
            Kunnossapitotarveselvitys {data.startYear}–{data.startYear + 4}
          </Text>
          <Text style={[styles.subtitle, { marginTop: 4 }]}>
            Y-tunnus: {data.company.businessId}
          </Text>
        </View>

        {/* Intro */}
        <View style={styles.section}>
          <Text style={{ fontSize: 10, marginBottom: 10 }}>
            Hallituksen selvitys kunnossapitotarpeista (Asunto-osakeyhtiölaki
            6:3§ / Yhtiökokous). Tämä raportti kattaa seuraavan viiden vuoden
            suunnitellut kunnossapitotyöt.
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Vuosi</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "45%" }]}>
              <Text style={styles.tableCellHeader}>Toimenpide</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCellHeader}>Arvio (€)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCellHeader}>Huomiot</Text>
            </View>
          </View>

          {/* Data Rows */}
          {data.tasks.map((task, i) => {
            // Logic to determine year. If deadline exists, use it. Else map quarter?
            // User: "Implement a plannedYear calculation logic that derives the year from your FiscalConfiguration and AnnualTask.quarter."
            // Assuming the task object passed here already has the year resolved or we resolve it.
            // Since we receive 'tasks' for 5 years, they should ideally have a date.
            // If deadline is string/date:
            const year = task.deadline
              ? new Date(task.deadline).getFullYear()
              : "N/A";

            return (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={styles.tableCell}>{year}</Text>
                </View>
                <View style={[styles.tableCol, { width: "45%" }]}>
                  <Text style={styles.tableCell}>{task.title}</Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text style={styles.tableCell}>
                    {task.estimatedCost
                      ? task.estimatedCost.toLocaleString("fi-FI", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : "-"}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text style={styles.tableCell}>{task.quarter}</Text>
                </View>
              </View>
            );
          })}
          {data.tasks.length === 0 && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "100%" }]}>
                <Text style={styles.tableCell}>
                  Ei kirjattuja kunnossapitotarpeita.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Statutory Value Summary */}
        {data.metrics && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Helvetica-Bold",
                marginBottom: 8,
              }}
            >
              Lakisääteinen Arvioselvitys
            </Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: "50%" }]}>
                  <Text style={styles.tableCellHeader}>Mittari</Text>
                </View>
                <View style={[styles.tableColHeader, { width: "50%" }]}>
                  <Text style={styles.tableCellHeader}>Arvo</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>
                    PKI (Peruskorjausindeksi)
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>
                    {data.metrics.pki} vuotta
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>PH (PTS Horisontti)</Text>
                </View>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>{data.metrics.ph} vuotta</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>
                    KAI (Korjausaktiivisuusindeksi)
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>
                    {data.metrics.kai.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>RDR (Korjausvelkasuhde)</Text>
                </View>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>
                    {data.metrics.rdr.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontSize: 8,
                color: "#666666",
                marginTop: 10,
                fontStyle: "italic",
              }}
            >
              Huomio: Nämä arviot perustuvat RT-kortiston keskiarvoihin ja
              teknisen eliniän laskentaan. Ne eivät ole sertifioitu
              rakennustarkastus eikä ne korvaa ammattitaitoista arviointia.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Asunto-osakeyhtiölaki 2 luku 11 § • {data.company.name}</Text>
          <Text style={{ marginTop: 4 }}>
            Luotu: {new Date(data.generatedAt).toLocaleDateString("fi-FI")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
