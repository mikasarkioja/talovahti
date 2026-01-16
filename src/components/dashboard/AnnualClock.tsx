"use client";

import React, { useState, useTransition } from "react";
import { useTemporalStore } from "@/lib/useTemporalStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnnualTask, FiscalQuarter } from "@prisma/client";
import { Briefcase, Calendar, CheckCircle2, Circle } from "lucide-react";
import { toggleTaskCompletion } from "@/app/actions/governance";
import { toast } from "sonner";

const QUARTERS: FiscalQuarter[] = ["Q1", "Q2", "Q3", "Q4"];

const QuarterSegment = ({
  quarter,
  startAngle,
  endAngle,
  color,
  isActive,
  onClick,
  tasks,
}: {
  quarter: FiscalQuarter;
  startAngle: number;
  endAngle: number;
  color: string;
  isActive: boolean;
  onClick: () => void;
  tasks: AnnualTask[];
}) => {
  const { setHoveredTask } = useTemporalStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Convert angles to radians (subtract 90 deg to start from top)
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  // Calculate path commands
  const x1 = 50 + 50 * Math.cos(startRad);
  const y1 = 50 + 50 * Math.sin(startRad);
  const x2 = 50 + 50 * Math.cos(endRad);
  const y2 = 50 + 50 * Math.sin(endRad);

  // SVG Path for a wedge
  const d = [`M 50 50`, `L ${x1} ${y1}`, `A 50 50 0 0 1 ${x2} ${y2}`, `Z`].join(
    " ",
  );

  // Center point for label
  const midAngle = (startAngle + endAngle) / 2;
  const midRad = (midAngle - 90) * (Math.PI / 180);
  const labelX = 50 + 35 * Math.cos(midRad);
  const labelY = 50 + 35 * Math.sin(midRad);

  const handleToggle = async (task: AnnualTask) => {
    startTransition(async () => {
      const result = await toggleTaskCompletion(task.id, !task.isCompleted);
      if (!result.success) {
        toast.error("Virhe päivitettäessä tehtävää");
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <g
          onClick={onClick}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="cursor-pointer transition-all duration-300 hover:opacity-90"
        >
          <path
            d={d}
            fill={isActive ? color : "#e2e8f0"}
            stroke="white"
            strokeWidth="1"
            className={cn(
              "transition-all duration-300",
              isActive ? "scale-105 origin-center" : "",
            )}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isActive ? "white" : "#64748b"}
            className="text-[8px] font-bold pointer-events-none select-none"
          >
            {quarter}
          </text>
        </g>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" side="right">
        <div className="p-3 bg-slate-50 border-b">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {quarter} Tehtävät
          </h4>
        </div>
        <div className="p-2 max-h-60 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-4">
              Ei tehtäviä tässä kvartaalissa.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-2 rounded border border-slate-100 shadow-sm text-xs hover:bg-blue-50 transition-colors flex items-start gap-2 cursor-pointer"
                  onMouseEnter={() => setHoveredTask(task)}
                  onMouseLeave={() => setHoveredTask(null)}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent quarter click if needed
                    handleToggle(task);
                  }}
                >
                  <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-brand-emerald transition-colors">
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="font-medium mb-1 flex justify-between items-start">
                      <span
                        className={
                          task.isCompleted ? "line-through text-slate-400" : ""
                        }
                      >
                        {task.title}
                      </span>
                      {task.isStatutory && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 ml-1 flex-shrink-0"
                        >
                          Laki
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-500 line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export interface AnnualClockData {
  fiscalYearStart: number;
  monthlyGroups: { month: number; tasks: AnnualTask[] }[];
  totalTasks: number;
  completedTasks: number;
}

export function AnnualClock({ data }: { data: AnnualClockData }) {
  const { currentActiveQuarter, setActiveQuarter } = useTemporalStore();

  const startMonth = data.fiscalYearStart;

  const handleQuarterClick = (q: FiscalQuarter) => {
    setActiveQuarter(currentActiveQuarter === q ? null : q);
  };

  const getQuarterColor = (q: FiscalQuarter) => {
    switch (q) {
      case "Q1":
        return "#3b82f6";
      case "Q2":
        return "#22c55e";
      case "Q3":
        return "#eab308";
      case "Q4":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Vuosikello
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {QUARTERS.map((q, i) => {
              const startAngle = i * 90;
              const endAngle = (i + 1) * 90;
              const isSelected = currentActiveQuarter === q;
              const isDimmed = currentActiveQuarter !== null && !isSelected;

              // Calculate tasks for this quarter
              // Q1 = months [start, start+1, start+2]
              const quarterMonths: number[] = [];
              for (let m = 0; m < 3; m++) {
                const month = ((startMonth - 1 + i * 3 + m) % 12) + 1;
                quarterMonths.push(month);
              }

              const tasks = data.monthlyGroups
                .filter((g) => quarterMonths.includes(g.month))
                .flatMap((g) => g.tasks);

              return (
                <QuarterSegment
                  key={q}
                  quarter={q}
                  startAngle={startAngle}
                  endAngle={endAngle}
                  color={getQuarterColor(q)}
                  isActive={!isDimmed}
                  onClick={() => handleQuarterClick(q)}
                  tasks={tasks}
                />
              );
            })}

            <circle
              cx="50"
              cy="50"
              r="15"
              fill="white"
              className="shadow-inner"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-slate-700"
            >
              {new Date().getFullYear()}
            </text>
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 w-full">
          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
            <span className="font-bold block text-slate-700">Tilikausi</span>
            Alkaa: Kk {startMonth}
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
            <span className="font-bold block text-slate-700">Edistyminen</span>
            {data.completedTasks}/{data.totalTasks}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
