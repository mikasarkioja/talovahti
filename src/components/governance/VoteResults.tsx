import { VoteResult } from "@/lib/voting-logic";

export function VoteResults({ result }: { result: VoteResult }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
        {result.yesPercentage > 0 && (
          <div
            style={{ width: `${result.yesPercentage}%` }}
            className="bg-green-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
          >
            {result.yesPercentage > 10 && "JAA"}
          </div>
        )}
        {result.noPercentage > 0 && (
          <div
            style={{ width: `${result.noPercentage}%` }}
            className="bg-red-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
          >
            {result.noPercentage > 10 && "EI"}
          </div>
        )}
        {result.abstainPercentage > 0 && (
          <div
            style={{ width: `${result.abstainPercentage}%` }}
            className="bg-slate-400 h-full flex items-center justify-center text-[10px] text-white font-bold"
          >
            {result.abstainPercentage > 10 && "TYHJÄ"}
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
        <span className="flex items-center gap-1 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          JAA: {result.yes} ({result.yesPercentage.toFixed(1)}%)
        </span>
        <span className="flex items-center gap-1 text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          EI: {result.no} ({result.noPercentage.toFixed(1)}%)
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          TYHJÄ: {result.abstain} ({result.abstainPercentage.toFixed(1)}%)
        </span>
      </div>
      {result.turnoutPercentage !== undefined && (
        <div className="text-xs text-right text-slate-400">
          Äänestysaktiivisuus: {result.turnoutPercentage.toFixed(1)}% (Edustetut
          osakkeet)
        </div>
      )}
    </div>
  );
}
