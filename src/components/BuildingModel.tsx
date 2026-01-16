"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Billboard, Html } from "@react-three/drei";
import { useStore } from "@/lib/store";
import { useTemporalStore } from "@/lib/useTemporalStore";
import { useGovernanceStore } from "@/lib/useGovernanceStore";
import { useMemo, Suspense, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  RotateCcw,
  Thermometer,
  Droplets,
  Calendar,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuildingXray } from "@/hooks/useBuildingXray";
import { BuildingGenerator, POI } from "@/lib/three/BuildingGenerator";
import { HudCard } from "@/components/ui/hud-card";
import { ApartmentMesh } from "./three/ApartmentMesh";
import { InfrastructureMesh } from "./three/InfrastructureMesh";

function XrayEffect({ enabled }: { enabled: boolean }) {
  useBuildingXray(enabled);
  return null;
}

function PoiMarker({ data }: { data: POI }) {
  return (
    <group position={data.position}>
      <Billboard>
        <mesh>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {data.type === "SAUNA" ? "♨️" : data.type === "LAUNDRY" ? "👕" : "⚙️"}
        </Text>
      </Billboard>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#1e293b"
        anchorX="center"
        anchorY="top"
      >
        {data.label}
      </Text>
    </group>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TemporalHUD({ hoveredTask }: { hoveredTask: any }) {
  if (!hoveredTask) return null;

  // Position HUD roughly based on context, or fixed top-center of canvas?
  // "Floating <Html> tooltip over the 3D model"
  // If we can map task to a position, great. If not, maybe just a general overlay.
  // For now, let's put it in a fixed position inside the canvas area but "floating".
  // Or better, if the task has a `meshId`, attach it there!

  // Since we don't have mesh positions easily accessible here without state,
  // let's display it as a high-level overlay or attach to center.

  return (
    <Html position={[0, 10, 0]} center style={{ pointerEvents: "none" }}>
      <div className="flex flex-col items-center gap-2 transition-all duration-300 transform translate-y-0 opacity-100">
        <div className="bg-white/95 backdrop-blur shadow-xl rounded-xl border-2 border-blue-500 p-4 w-64 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold mb-1">
            <Calendar size={16} />
            <span>{hoveredTask.quarter} Milestone</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            {hoveredTask.title}
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            {hoveredTask.description}
          </p>
          {hoveredTask.statutory && (
            <Badge variant="secondary" className="text-[10px]">
              Lakisääteinen
            </Badge>
          )}
        </div>
        {/* Connecting Line (fake) */}
        <div className="w-0.5 h-8 bg-blue-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
      </div>
    </Html>
  );
}

export function BuildingModel({
  onApartmentClick,
  highlightId,
}: {
  onApartmentClick?: (id: string) => void;
  highlightId?: string;
}) {
  const { tickets, initiatives } = useStore();
  const { currentActiveQuarter, hoveredTask } = useTemporalStore();
  const { participatedApartmentIds } = useGovernanceStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [xrayEnabled, setXrayEnabled] = useState(false);

  // Generate Layout
  const { apartments, pois } = useMemo(
    () => BuildingGenerator.generateLayout(),
    [],
  );

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setSelectedFloor(null);
    setSelectedAptId(null);
  };

  const handleAptClick = (id: string) => {
    setSelectedAptId(id === selectedAptId ? null : id); // Toggle
    if (onApartmentClick) onApartmentClick(id);
  };

  return (
    <div
      className="h-[600px] w-full bg-slate-50 rounded-2xl overflow-hidden border border-surface-greige relative shadow-inner touch-none group"
      aria-label="3D Malli Taloyhtiöstä"
    >
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none select-none">
        <HudCard className="w-auto min-w-[150px]">
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />{" "}
              <span>Hälytys (Vuoto)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />{" "}
              <span>Päätöksenteko</span>
            </div>
            {currentActiveQuarter && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />{" "}
                <span>{currentActiveQuarter} Huolto</span>
              </div>
            )}
          </div>
        </HudCard>
      </div>

      {/* Floor Controls */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 flex flex-col gap-2">
        <div className="bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200 flex flex-col gap-1">
          <Button
            size="sm"
            variant={selectedFloor === null ? "primary" : "ghost"}
            className="h-8 w-8 p-0 text-xs font-bold"
            onClick={() => setSelectedFloor(null)}
          >
            ALL
          </Button>
          {[4, 3, 2, 1].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={selectedFloor === f ? "primary" : "ghost"}
              className="h-8 w-8 p-0 text-xs"
              onClick={() => setSelectedFloor(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Legend Overlay */}
      <AnimatePresence>
        {xrayEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-4 z-20 bg-slate-900/90 backdrop-blur text-white p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-none select-none"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2 text-slate-400">
              Vastuunjako (X-Ray)
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span>Yhtiö (Rakenteet)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-transparent shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span>Osakas (Pinnat)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant={xrayEnabled ? "default" : "secondary"}
          className={`backdrop-blur shadow-sm h-9 text-xs transition-all ${xrayEnabled ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/50" : "bg-white/90 text-slate-700"}`}
          onClick={() => setXrayEnabled(!xrayEnabled)}
        >
          <Layers size={14} className="mr-2" />
          {xrayEnabled ? "X-Ray ON" : "X-Ray"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 backdrop-blur shadow-sm h-9 text-xs"
          onClick={() => alert("Mock: Kalibrointi...")}
        >
          <RefreshCw size={14} className="mr-2" /> Kalibroi
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 backdrop-blur shadow-sm h-9 text-xs"
          onClick={handleResetView}
        >
          <RotateCcw size={14} className="mr-2" /> Palauta
        </Button>
      </div>

      <Canvas
        frameloop="demand"
        camera={{ position: [20, 15, 20], fov: 35 }}
        className="touch-none"
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <spotLight
            position={[50, 50, 50]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <hemisphereLight intensity={0.4} groundColor="#f8fafc" />

          <XrayEffect enabled={xrayEnabled} />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={10}
            maxDistance={60}
            makeDefault
            autoRotate={!selectedAptId && !hoveredTask} // Pause rotation when hovering a task to focus
            autoRotateSpeed={0.5}
          />

          <group position={[0, -2, 0]}>
            <InfrastructureMesh apartments={apartments} />

            {/* Apartments */}
            {apartments.map((apt) => {
              // Status Logic
              const hasTicket = tickets.some(
                (t) => t.apartmentId === apt.id && t.status !== "CLOSED",
              );
              const activeVote = initiatives.some((i) => i.status === "VOTING");

              const isSelected = selectedAptId === apt.id;
              const isAnySelected = selectedAptId !== null;
              const isParticipationMode = participatedApartmentIds.length > 0;

              // Filtering
              const isVisible =
                selectedFloor === null || selectedFloor === apt.floor;
              if (!isVisible) return null;

              // Color Logic
              let baseColor = "#e2e8f0"; // Nordic Concrete
              let opacity = 1;
              let transparent = false;

              // X-Ray Mode:
              if (isAnySelected || isParticipationMode) {
                if (
                  isSelected ||
                  (isParticipationMode &&
                    participatedApartmentIds.includes(apt.id))
                ) {
                  baseColor = isParticipationMode ? "#10b981" : "#002f6c"; // Emerald if voting, Navy if selected
                  opacity = 1;
                  transparent = false;
                } else {
                  opacity = 0.1;
                  transparent = true;
                }
              }

              let pulseColor = undefined;
              if (highlightId === apt.id) baseColor = "#fbbf24"; // Highlight

              if (hasTicket)
                pulseColor = "#ef4444"; // Red Pulse
              else if (activeVote) pulseColor = "#3b82f6"; // Blue Pulse

              // GOVERNANCE SYNC
              if (
                isParticipationMode &&
                participatedApartmentIds.includes(apt.id)
              ) {
                pulseColor = "#10b981"; // Emerald Pulse for participants
              }

              // TEMPORAL SYNC (Quarterly Phases)
              if (currentActiveQuarter) {
                if (currentActiveQuarter === "Q1" && apt.floor === 4) {
                  pulseColor = "#60a5fa"; // Winter: Roof Focus
                } else if (currentActiveQuarter === "Q2") {
                  pulseColor = "#4ade80"; // Spring: Facade (All)
                } else if (currentActiveQuarter === "Q3" && apt.floor === 1) {
                  pulseColor = "#facc15"; // Summer: Grounds
                } else if (currentActiveQuarter === "Q4") {
                  pulseColor = "#f87171"; // Autumn: Systems (All)
                }
              }

              // TASK SYNC (Hovered Task)
              // If a specific task is hovered in the Annual Clock, we want to highlight relevant components.
              if (hoveredTask) {
                // Simple heuristic mapping
                if (
                  hoveredTask.title.toLowerCase().includes("katto") &&
                  apt.floor === 4
                ) {
                  pulseColor = "#ef4444"; // Red alert for Roof
                }
                if (hoveredTask.title.toLowerCase().includes("julkisivu")) {
                  pulseColor = "#fbbf24"; // Orange for Facade
                }
                if (
                  hoveredTask.title.toLowerCase().includes("piha") &&
                  apt.floor === 1
                ) {
                  pulseColor = "#10b981"; // Green for Grounds
                }
              }

              return (
                <group key={apt.id}>
                  <ApartmentMesh
                    data={apt}
                    color={baseColor}
                    pulseColor={pulseColor}
                    isHovered={false}
                    onClick={() => handleAptClick(apt.id)}
                    opacity={opacity}
                    transparent={transparent}
                  />

                  {/* Floating HUD anchored to 3D position */}
                  {isSelected && (
                    <Html
                      position={[
                        apt.position[0],
                        apt.position[1] + 2,
                        apt.position[2],
                      ]}
                      center
                    >
                      <div className="w-[200px] pointer-events-none">
                        <HudCard title={apt.id}>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Pinta-ala</span>
                              <span className="font-mono">{apt.areaM2} m²</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Lämpötila</span>
                              <span className="font-mono flex items-center gap-1">
                                <Thermometer size={10} /> 21.5°C
                              </span>
                            </div>
                            {hasTicket && (
                              <Badge
                                variant="destructive"
                                className="mt-1 text-[10px]"
                              >
                                <Droplets size={10} className="mr-1" />{" "}
                                Vuotoepäily
                              </Badge>
                            )}
                          </div>
                        </HudCard>
                      </div>
                    </Html>
                  )}
                </group>
              );
            })}

            {/* POIs */}
            {pois.map((poi) => (
              <PoiMarker key={poi.id} data={poi} />
            ))}

            {/* Temporal HUD (Global for Milestone) */}
            <TemporalHUD hoveredTask={hoveredTask} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
