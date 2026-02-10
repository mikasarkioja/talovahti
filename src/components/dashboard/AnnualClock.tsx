"use client";

import React, { useState, useTransition } from "react";
import { useTemporalStore } from "@/lib/useTemporalStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnnualTask, FiscalQuarter, TaskCategory } from "@prisma/client";
import { Briefcase, Calendar, CheckCircle2, Circle, Plus } from "lucide-react";
import {
  toggleTaskCompletion,
  createAnnualTask,
} from "@/app/actions/governance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [, startTransition] = useTransition();

  // Convert angles to radians (subtract 90 deg to start from top)
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  // Calculate path commands
  const x1 = (50 + 50 * Math.cos(startRad)).toFixed(2);
  const y1 = (50 + 50 * Math.sin(startRad)).toFixed(2);
  const x2 = (50 + 50 * Math.cos(endRad)).toFixed(2);
  const y2 = (50 + 50 * Math.sin(endRad)).toFixed(2);

  // SVG Path for a wedge
  const d = [`M 50 50`, `L ${x1} ${y1}`, `A 50 50 0 0 1 ${x2} ${y2}`, `Z`].join(
    " ",
  );

  // Center point for label
  const midAngle = (startAngle + endAngle) / 2;
  const midRad = (midAngle - 90) * (Math.PI / 180);
  const labelX = (50 + 35 * Math.cos(midRad)).toFixed(2);
  const labelY = (50 + 35 * Math.sin(midRad)).toFixed(2);

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
                    e.stopPropagation();
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
                    {task.description && (
                      <p className="text-slate-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}
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

interface AnnualClockProps {
  data: AnnualClockData;
  isBoard?: boolean;
  housingCompanyId?: string;
}

export function AnnualClock({
  data,
  isBoard,
  housingCompanyId,
}: AnnualClockProps) {
  const { currentActiveQuarter, setActiveQuarter } = useTemporalStore();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!housingCompanyId) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as TaskCategory;
    const month = parseInt(formData.get("month") as string);
    const isStatutory = formData.get("isStatutory") === "on";
    const description = formData.get("description") as string;

    startTransition(async () => {
      const result = await createAnnualTask({
        title,
        category,
        month,
        housingCompanyId,
        isStatutory,
        description,
      });

      if (result.success) {
        toast.success("Tehtävä lisätty vuosikelloon!");
        setIsAddTaskOpen(false);
      } else {
        toast.error(result.error || "Virhe lisättäessä tehtävää.");
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Vuosikello
        </CardTitle>
        {isBoard && (
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-brand-navy"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddTask}>
                <DialogHeader>
                  <DialogTitle>Lisää tehtävä vuosikelloon</DialogTitle>
                  <DialogDescription>
                    Lisää uusi toistuva tai kertaluonteinen tehtävä taloyhtiön
                    kalenteriin.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Otsikko</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Esim. Kevättalkoot"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="month">Kuukausi</Label>
                      <Select name="month" defaultValue="1">
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse kk" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(2024, i, 1).toLocaleString("fi-FI", {
                                month: "long",
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategoria</Label>
                      <Select name="category" defaultValue="MAINTENANCE">
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse kategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAINTENANCE">
                            Kunnossapito
                          </SelectItem>
                          <SelectItem value="FINANCE">Talous</SelectItem>
                          <SelectItem value="GOVERNANCE">Hallinto</SelectItem>
                          <SelectItem value="LEGAL">Laki</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isStatutory"
                      name="isStatutory"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isStatutory">Lakisääteinen tehtävä</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Kuvaus (Valinnainen)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Lyhyt kuvaus tehtävästä..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-[#002f6c]"
                    disabled={isPending}
                  >
                    {isPending ? "Tallennetaan..." : "Tallenna"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {QUARTERS.map((q, i) => {
              const startAngle = i * 90;
              const endAngle = (i + 1) * 90;
              const isSelected = currentActiveQuarter === q;
              const isDimmed = currentActiveQuarter !== null && !isSelected;

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
