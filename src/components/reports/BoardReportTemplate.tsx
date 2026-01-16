import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#112233",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#112233",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#112233",
    backgroundColor: "#F0F2F5",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingVertical: 5,
    alignItems: "center",
  },
  label: {
    width: "60%",
    fontSize: 10,
  },
  value: {
    width: "20%",
    fontSize: 10,
    textAlign: "right",
  },
  valueBold: {
    width: "20%",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statutoryBox: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E74C3C",
    backgroundColor: "#FDEDEC",
  },
  statutoryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#C0392B",
    marginBottom: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: "center",
    color: "#888888",
  },
});

interface BoardReportTemplateProps {
  data: {
    companyName: string;
    generatedAt: string;
    finance: {
      totalActual: number;
      totalBudgeted: number;
      categories: Array<{
        category: string;
        actual: number;
        budgeted: number;
        variance: number;
      }>;
    };
    maintenance: {
      statutory: Array<{
        title: string;
        dueDate: Date | string | null;
        description?: string | null;
      }>;
      upcoming: Array<{ title: string; quarter: string; category: string }>;
    };
  };
}

export const BoardReportTemplate = ({ data }: BoardReportTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.companyName}</Text>
        <Text style={styles.subtitle}>
          Hallitusraportti •{" "}
          {new Date(data.generatedAt).toLocaleDateString("fi-FI")}
        </Text>
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Talouden Yhteenveto (Kuluva Tilikausi)
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: "60%" }]}>
            Kategoria
          </Text>
          <Text
            style={[
              styles.tableHeaderCell,
              { width: "20%", textAlign: "right" },
            ]}
          >
            Toteutunut
          </Text>
          <Text
            style={[
              styles.tableHeaderCell,
              { width: "20%", textAlign: "right" },
            ]}
          >
            Budjetti
          </Text>
        </View>

        {data.finance.categories.map((cat, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{cat.category}</Text>
            <Text style={styles.value}>
              {cat.actual.toLocaleString("fi-FI")} €
            </Text>
            <Text style={styles.value}>
              {cat.budgeted.toLocaleString("fi-FI")} €
            </Text>
          </View>
        ))}

        <View
          style={[
            styles.row,
            { borderTopWidth: 2, borderTopColor: "#000000", marginTop: 5 },
          ]}
        >
          <Text style={[styles.label, { fontWeight: "bold" }]}>YHTEENSÄ</Text>
          <Text style={styles.valueBold}>
            {data.finance.totalActual.toLocaleString("fi-FI")} €
          </Text>
          <Text style={styles.valueBold}>
            {data.finance.totalBudgeted.toLocaleString("fi-FI")} €
          </Text>
        </View>
      </View>

      {/* Statutory Maintenance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Lakisääteinen Kunnossapito & Hallinto
        </Text>

        {data.maintenance.statutory.length > 0 ? (
          data.maintenance.statutory.map((task, i) => (
            <View key={i} style={styles.statutoryBox}>
              <Text style={styles.statutoryTitle}>⚠️ {task.title}</Text>
              <Text style={{ fontSize: 10, marginBottom: 4 }}>
                Määräpäivä:{" "}
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("fi-FI")
                  : "Ei määritelty"}
              </Text>
              {task.description && (
                <Text style={{ fontSize: 10, fontStyle: "italic" }}>
                  {task.description}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 10, fontStyle: "italic", padding: 10 }}>
            Ei avoimia lakisääteisiä tehtäviä.
          </Text>
        )}
      </View>

      {/* Upcoming Maintenance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tulevat Vuosikellon Tehtävät</Text>
        {data.maintenance.upcoming.length > 0 ? (
          data.maintenance.upcoming.map((task, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.label, { width: "70%" }]}>{task.title}</Text>
              <Text style={[styles.value, { width: "30%" }]}>
                {task.quarter} • {task.category}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 10, fontStyle: "italic", padding: 10 }}>
            Ei tulevia tehtäviä kirjattu.
          </Text>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Tämä raportti on luotu automaattisesti Talovahti-järjestelmästä.
      </Text>
    </Page>
  </Document>
);
