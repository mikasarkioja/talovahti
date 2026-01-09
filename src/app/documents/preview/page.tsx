'use client'
import React from 'react';
import { useStore } from '@/lib/store'
import { generateIsannointitodistus } from '@/lib/docs-generator'
import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

export default function DocumentPreviewPage() {
  const { currentUser, finance, renovations } = useStore()

  // Generate real data from store
  const docData = currentUser ? generateIsannointitodistus(currentUser, finance, renovations) : null

  // Transform to match template props
  const data = docData ? {
    companyName: docData.companyName,
    yTunnus: docData.businessId,
    apartmentNumber: currentUser?.apartmentId || 'A 1',
    sqm: 60.5, // Mock hardcoded as missing in store user apartment link
    shareRange: '1-100', // Mock
    shareCount: docData.shareCount,
    hoitovastike: docData.monthlyVastike.toFixed(2),
    shareOfLoans: docData.shareOfLoans.toFixed(2),
    pastRenovations: docData.renovations.filter(r => r.type === 'DONE').map(r => ({ id: r.description, year: r.year, title: r.description })),
    upcomingRenovations: docData.renovations.filter(r => r.type === 'PLANNED').map(r => ({ id: r.description, year: r.year, title: r.description }))
  } : null

  if (!data) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center px-4">
        <Link href="/documents/order" className="text-slate-600 hover:text-slate-900 flex items-center gap-2">
            <ArrowLeft size={20} /> Takaisin
        </Link>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-blue-700">
            <Printer size={20} /> Tulosta PDF
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto p-12 bg-white text-slate-900 font-sans leading-tight border border-gray-100 shadow-xl print:shadow-none">
        {/* Header with Branding & Stamp */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
              Isännöitsijäntodistus
            </h1>
            <p className="text-sm text-slate-500 mt-1">Latauspäivämäärä: {new Date().toLocaleDateString('fi-FI')}</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold uppercase mb-2 inline-block">
              Virallinen Asiakirja
            </div>
            <p className="font-bold text-lg">{data.companyName}</p>
            <p className="text-sm text-slate-600">Y-tunnus: {data.yTunnus}</p>
          </div>
        </div>

        {/* 1. Kohde- ja perustiedot (The Property) */}
        <section className="mb-8">
          <h2 className="bg-slate-100 px-2 py-1 text-xs font-bold uppercase mb-3 tracking-widest text-slate-600">
            1. Huoneiston ja Rakennuksen tiedot
          </h2>
          <div className="grid grid-cols-2 gap-y-4 text-sm border-l-2 border-slate-200 pl-4">
            <div><span className="text-slate-500 block text-xs uppercase">Huoneisto</span> <span className="font-semibold text-base">{data.apartmentNumber}</span></div>
            <div><span className="text-slate-500 block text-xs uppercase">Pinta-ala</span> <span className="font-semibold text-base">{data.sqm} m²</span></div>
            <div><span className="text-slate-500 block text-xs uppercase">Osakkeiden numerot</span> <span className="font-semibold text-base">{data.shareRange}</span></div>
            <div><span className="text-slate-500 block text-xs uppercase">Osakemäärä</span> <span className="font-semibold text-base">{data.shareCount} kpl</span></div>
          </div>
        </section>

        {/* 2. Taloudellinen tilanne (The Money) */}
        <section className="mb-8">
          <h2 className="bg-slate-100 px-2 py-1 text-xs font-bold uppercase mb-3 tracking-widest text-slate-600">
            2. Taloudelliset tiedot
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
              <p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Hoitovastike</p>
              <p className="text-xl font-bold tracking-tight">{data.hoitovastike} € / kk</p>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-sm">
              <p className="text-[10px] uppercase text-indigo-600 mb-1 font-bold">Lainaosuus (Velaton hinta)</p>
              <p className="text-xl font-bold text-indigo-900 tracking-tight">{data.shareOfLoans} €</p>
            </div>
          </div>
        </section>

        {/* 3. Kunnossapito (The Maintenance) */}
        <section className="mb-8">
          <h2 className="bg-slate-100 px-2 py-1 text-xs font-bold uppercase mb-3 tracking-widest text-slate-600">
            3. Tehdyt ja tulevat korjaukset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-100 pb-1">Viimeisimmät korjaukset</p>
              <ul className="text-sm space-y-2 border-l-2 border-emerald-500 pl-4">
                {data.pastRenovations.length > 0 ? data.pastRenovations.map(r => (
                  <li key={r.id} className="grid grid-cols-[40px_1fr]">
                    <strong className="text-slate-500">{r.year}</strong> 
                    <span>{r.title}</span>
                  </li>
                )) : <li className="text-slate-400 italic">Ei merkittäviä korjauksia.</li>}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-100 pb-1">Kunnossapitotarveselvitys (PTS 5v)</p>
              <ul className="text-sm space-y-2 border-l-2 border-amber-500 pl-4">
                {data.upcomingRenovations.length > 0 ? data.upcomingRenovations.map(r => (
                  <li key={r.id} className="grid grid-cols-[40px_1fr]">
                    <strong className="text-slate-500">{r.year}</strong> 
                    <span>{r.title}</span>
                  </li>
                )) : <li className="text-slate-400 italic">Ei suunniteltuja korjauksia.</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Footer / Verification QR */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end opacity-75">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
            Tämä on automaattisesti generoitu asiakirja.<br />
            Taloyhtiö OS - As Oy Esimerkki<br />
            Varmentaminen: mml.fi/huoneistotietojarjestelma
          </div>
          <div className="w-16 h-16 bg-white border border-slate-900 flex items-center justify-center">
             {/* Mock QR */}
             <div className="w-12 h-12 bg-slate-900" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
