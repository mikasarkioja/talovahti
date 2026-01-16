"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  Send,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Mock Data
const MOCK_BIDS = [
  {
    id: "1",
    contractor: "Rakennus Oy Laatu",
    price: 125000,
    riskScore: 15, // 0-100 (Low is good)
    roiImpact: 85, // Score
    warranty: 5,
    duration: 45,
    status: "RECEIVED",
  },
  {
    id: "2",
    contractor: "Halpis-Remontti Tmi",
    price: 85000, // Very low
    riskScore: 75, // High risk
    roiImpact: 60,
    warranty: 2,
    duration: 30,
    status: "RECEIVED",
  },
  {
    id: "3",
    contractor: "Premium Saneeraus",
    price: 145000,
    riskScore: 5,
    roiImpact: 90,
    warranty: 10,
    duration: 50,
    status: "RECEIVED",
  },
];

// Mock Project Stats
const PROJECT_ROI = {
  payback: 7.5,
  npv: 45000,
};

import { useParams } from "next/navigation";

// ... existing imports ...

export default function TenderingPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [bids, setBids] = useState(MOCK_BIDS);
  const [selectedBid, setSelectedBid] = useState<string | null>(null);

  // Weighted Scoring Logic (50% Price, 30% Quality/ROI, 20% Risk)
  const avgPrice = bids.reduce((acc, b) => acc + b.price, 0) / bids.length;

  const scoredBids = bids
    .map((bid) => {
      // Price Score (Lower is better): Normalize against average
      // If price is 50% of average, score 100. If 150%, score 0.
      const priceRatio = bid.price / avgPrice;
      let priceScore = 100 - (priceRatio - 0.8) * 100; // Rough linear map
      priceScore = Math.max(0, Math.min(100, priceScore));

      // Risk Score (Lower risk is better) -> Invert
      const riskComponent = 100 - bid.riskScore;

      const totalScore =
        priceScore * 0.5 + bid.roiImpact * 0.3 + riskComponent * 0.2;

      // Risk Warning
      const isRisk = bid.price < avgPrice * 0.8 || bid.riskScore > 50;

      return { ...bid, totalScore, isRisk };
    })
    .sort((a, b) => b.totalScore - a.totalScore); // Rank descending

  const optimalBid = scoredBids[0];

  const handleApprove = () => {
    alert(
      `Valinta hyväksytty: ${optimalBid.contractor}.\n\nSiirrytään hallituksen äänestykseen.`,
    );
  };

  const handleSendRFQ = () => {
    alert(
      "Tarjouspyyntö (RFQ) lähetetty 5 valitulle kumppanille.\n\nLiitteet: 3D-energiaskannaus, Kuntoarvio.",
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Kilpailutus & Vertailu
          </h1>
          <p className="text-slate-500">Ikkunaremontti (ID: {id})</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendRFQ}>
            <Send className="w-4 h-4 mr-2" /> Lähetä Tarjouspyynnöt
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleApprove}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Hyväksy Valinta
          </Button>
        </div>
      </div>

      {/* ROI Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Takaisinmaksuaika
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {PROJECT_ROI.payback} Vuotta
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              10v NPV (Nykyarvo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              +{PROJECT_ROI.npv.toLocaleString()} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Saapuneet Tarjoukset (Ranking)</CardTitle>
          <CardDescription>
            Järjestetty painotetun pisteytyksen mukaan (Hinta 50%, Laatu 30%,
            Riski 20%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-4 font-medium">Urakoitsija</th>
                  <th className="p-4 font-medium">Hinta</th>
                  <th className="p-4 font-medium">Pisteet (0-100)</th>
                  <th className="p-4 font-medium">Riski</th>
                  <th className="p-4 font-medium">Takuu</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {scoredBids.map((bid, index) => (
                  <tr
                    key={bid.id}
                    className={`border-b last:border-0 ${index === 0 ? "bg-emerald-50/50" : "hover:bg-slate-50"}`}
                  >
                    <td className="p-4">
                      <div className="font-medium">{bid.contractor}</div>
                      {index === 0 && (
                        <Badge className="mt-1 bg-emerald-600">
                          Optimaalinen
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-base">
                      {bid.price.toLocaleString()} €
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {Math.round(bid.totalScore)}
                        </span>
                        <Progress value={bid.totalScore} className="w-20 h-2" />
                      </div>
                    </td>
                    <td className="p-4">
                      {bid.isRisk ? (
                        <Badge
                          variant="destructive"
                          className="flex w-fit items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" /> Korkea
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          Matala
                        </Badge>
                      )}
                      {bid.price < avgPrice * 0.8 && (
                        <div className="text-xs text-red-500 mt-1">
                          Poikkeuksellisen halpa
                        </div>
                      )}
                    </td>
                    <td className="p-4">{bid.warranty}v</td>
                    <td className="p-4 text-slate-500">{bid.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hintavertailu</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoredBids}>
                <XAxis
                  dataKey="contractor"
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="price" name="Hinta (€)">
                  {scoredBids.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#059669" : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riskianalyysi (Score)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoredBids} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis
                  dataKey="contractor"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar dataKey="riskScore" name="Riski-indeksi">
                  {scoredBids.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isRisk ? "#ef4444" : "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
