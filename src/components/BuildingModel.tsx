"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Billboard, Html } from "@react-three/drei";
import { useStore, MockBuildingComponent } from "@/lib/store";
import { useTemporalStore } from "@/lib/useTemporalStore";
import { useGovernanceStore } from "@/lib/useGovernanceStore";
import { useMemo, Suspense, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Thermometer,
  Droplets,
  Calendar,
  Layers,
  Activity,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuildingXray } from "@/hooks/useBuildingXray";
import {
  BuildingGenerator,
  POI,
  ApartmentLayout,
} from "@/lib/three/BuildingGenerator";
import { HudCard } from "@/components/ui/hud-card";
import { InstancedApartments } from "./three/InstancedApartments";
import { InfrastructureMesh } from "./three/InfrastructureMesh";
import Link from "next/link";

function Roof({
  dimensions,
  status,
  color,
}: {
  dimensions: [number, number, number];
  status?: string;
  color?: string;
}) {
  let finalColor = "#cbd5e1"; // Default gray
  if (color) {
    finalColor = color; // Value Heatmap mode
  } else if (status) {
    finalColor =
      status === "CRITICAL"
        ? "#ef4444"
        : status === "WARNING"
          ? "#eab308"
          : status === "EXCELLENT"
            ? "#10b981"
            : "#cbd5e1";
  }
  return (
    <mesh name="Roof_01" position={[0, dimensions[1] / 2 + 0.2, 0]}>
      <boxGeometry args={[dimensions[0] + 0.5, 0.4, dimensions[2] + 0.5]} />
      <meshStandardMaterial
        color={finalColor}
        emissive={color ? finalColor : undefined}
        emissiveIntensity={color ? 0.3 : 0}
      />
    </mesh>
  );
}

function XrayEffect({
  enabled,
  components,
}: {
  enabled: boolean;
  components?: MockBuildingComponent[];
}) {
  useBuildingXray(enabled, components);
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
            <span>{hoveredTask.quarter} - Virstanpylväs</span>
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

function Infrastructure({
  apartments,
  hidden,
}: {
  apartments: ApartmentLayout[];
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <group name="Infra_Group">
      <InfrastructureMesh apartments={apartments} />
      {/* Main Vertical Pipes - Company Responsibility */}
      <mesh name="Pipes_01" position={[0, 6, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 15, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

export function BuildingModel({
  onApartmentClick,
  highlightId,
  buildingComponents,
}: {
  onApartmentClick?: (id: string) => void;
  highlightId?: string;
  buildingComponents?: MockBuildingComponent[];
}) {
  const tickets = useStore((state) => state.tickets);
  const initiatives = useStore((state) => state.initiatives);
  const currentUser = useStore((state) => state.currentUser);
  const housingCompany = useStore((state) => state.housingCompany);

  const { currentActiveQuarter, hoveredTask } = useTemporalStore();
  const { participatedApartmentIds } = useGovernanceStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [xrayEnabled, setXrayEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<
    "NORMAL" | "LIFESPAN" | "VALUE_HEATMAP"
  >("NORMAL");

  // Generate Layout
  const { apartments, pois, buildingDimensions } = useMemo(
    () =>
      BuildingGenerator.generateLayout(
        housingCompany?.buildingConfig || undefined,
      ),
    [housingCompany?.buildingConfig],
  );

  // Pre-calculate apartment statuses to avoid expensive lookups in the loop
  const aptStatusMap = useMemo(() => {
    const isBoard =
      currentUser?.role === "BOARD_MEMBER" || currentUser?.role === "ADMIN";

    return apartments.reduce(
      (acc, apt) => {
        const isOwnApartment =
          !!currentUser &&
          (currentUser.apartmentId === apt.id ||
            currentUser.apartmentNumber === apt.id ||
            (!!currentUser.apartmentId &&
              apt.id.includes(currentUser.apartmentId)));

        const hasTicket = tickets.some(
          (t) =>
            t.apartmentId === apt.id &&
            t.status !== "CLOSED" &&
            (isBoard || isOwnApartment),
        );

        const activeVote = initiatives.some(
          (i) => i.status === "VOTING" && (isBoard || isOwnApartment),
        );

        acc[apt.id] = {
          isOwnApartment: isOwnApartment ? true : false,
          hasTicket,
          activeVote,
          isBoard,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          isOwnApartment: boolean | null;
          hasTicket: boolean;
          activeVote: boolean;
          isBoard: boolean;
        }
      >,
    );
  }, [apartments, tickets, initiatives, currentUser]);

  // Get component statuses (Mocked as valuation was removed)
  const roofStatus: string = "EXCELLENT";

  // Value Heatmap: Get component ages for PKI-based coloring
  const roofAge = 15;

  // Value Heatmap color logic: >40 years = Orange/Red, <10 years = Bright Green
  const getHeatmapColor = (age: number | null) => {
    if (age === null) return "#cbd5e1"; // Default gray
    if (age > 40) return "#ef4444"; // Red for very old
    if (age > 30) return "#f97316"; // Orange for old
    if (age < 10) return "#10b981"; // Bright Green for newly renovated
    return "#eab308"; // Yellow for medium age
  };

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
        {viewMode === "LIFESPAN" && (
          <HudCard className="w-auto min-w-[150px]">
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="font-bold mb-1">Tekninen Käyttöikä</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />{" "}
                <span>Kriittinen (&lt;5v)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />{" "}
                <span>Huomioitava (5-15v)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                <span>Hyvä (&gt;15v)</span>
              </div>
            </div>
          </HudCard>
        )}
        {viewMode === "VALUE_HEATMAP" && (
          <HudCard className="w-auto min-w-[150px]">
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="font-bold mb-1">Arvolämpökartta (PKI)</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                <span>Uusi (&lt;10v)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />{" "}
                <span>Keskikerta (10-30v)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />{" "}
                <span>Vanha (30-40v)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />{" "}
                <span>Erittäin vanha (&gt;40v)</span>
              </div>
            </div>
          </HudCard>
        )}
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
            KAIKKI
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
          variant={viewMode === "LIFESPAN" ? "default" : "secondary"}
          className={`backdrop-blur shadow-sm h-9 text-xs transition-all ${viewMode === "LIFESPAN" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white/90 text-slate-700"}`}
          onClick={() => {
            if (viewMode === "NORMAL") setViewMode("LIFESPAN");
            else if (viewMode === "LIFESPAN") setViewMode("VALUE_HEATMAP");
            else setViewMode("NORMAL");
          }}
        >
          <Activity size={14} className="mr-2" />
          {viewMode === "LIFESPAN"
            ? "Arvolämpökartta"
            : viewMode === "VALUE_HEATMAP"
              ? "Normaali"
              : "Elinkaari"}
        </Button>
        <Button
          size="sm"
          variant={xrayEnabled ? "default" : "secondary"}
          className={`backdrop-blur shadow-sm h-9 text-xs transition-all ${xrayEnabled ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/50" : "bg-white/90 text-slate-700"}`}
          onClick={() => setXrayEnabled(!xrayEnabled)}
        >
          <Layers size={14} className="mr-2" />
          {xrayEnabled ? "Vastuunjako PÄÄLLÄ" : "Vastuunjako"}
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

          <XrayEffect enabled={xrayEnabled} components={buildingComponents} />
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
            <Infrastructure
              apartments={apartments}
              hidden={xrayEnabled && !!selectedAptId}
            />

            {(viewMode === "LIFESPAN" || viewMode === "VALUE_HEATMAP") &&
              (!xrayEnabled || !selectedAptId) && (
                <Roof
                  dimensions={buildingDimensions}
                  status={viewMode === "LIFESPAN" ? roofStatus : undefined}
                  color={
                    viewMode === "VALUE_HEATMAP"
                      ? getHeatmapColor(roofAge)
                      : undefined
                  }
                />
              )}

            {/* Instanced Apartments for better performance */}
            <InstancedApartments
              apartments={apartments}
              aptStatusMap={aptStatusMap}
              selectedAptId={selectedAptId}
              highlightId={highlightId}
              viewMode={viewMode}
              participatedApartmentIds={participatedApartmentIds}
              onApartmentClick={handleAptClick}
              selectedFloor={selectedFloor}
              xrayEnabled={xrayEnabled}
            />

            {/* Labels and floating HUD (Kept as individual for interactivity) */}
            {apartments.map((apt) => {
              const status = aptStatusMap[apt.id];
              if (!status) return null;

              const { isOwnApartment, hasTicket, isBoard } = status;
              const isSelected = selectedAptId === apt.id;
              const isVisible =
                selectedFloor === null || selectedFloor === apt.floor;

              if (!isVisible) return null;

              return (
                <group key={apt.id}>
                  {/* Label */}
                  <Text
                    position={[
                      apt.position[0],
                      apt.position[1],
                      apt.position[2] + apt.dimensions[2] / 2 + 0.2,
                    ]}
                    fontSize={0.4}
                    color="#1e293b"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {apt.id}
                  </Text>

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
                      <div className="w-[220px] pointer-events-auto">
                        <HudCard title={apt.id}>
                          <div className="flex flex-col gap-2">
                            {isOwnApartment && (
                              <Badge className="bg-brand-emerald text-white text-[9px] w-fit mb-1">
                                OMA ASUNTO
                              </Badge>
                            )}
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-bold uppercase text-[9px]">
                                Pinta-ala
                              </span>
                              <span className="font-mono">{apt.areaM2} m²</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-bold uppercase text-[9px]">
                                Lämpötila
                              </span>
                              <span className="font-mono flex items-center gap-1">
                                <Thermometer size={10} /> 21.5°C
                              </span>
                            </div>

                            {(isBoard || isOwnApartment) && hasTicket && (
                              <Badge
                                variant="destructive"
                                className="mt-1 text-[9px] animate-pulse"
                              >
                                <Droplets size={10} className="mr-1" />{" "}
                                Vuotoepäily
                              </Badge>
                            )}

                            {isOwnApartment && (
                              <div className="pt-2 mt-2 border-t border-slate-200/50 flex flex-col gap-2">
                                <Link
                                  href={`/resident/tickets/new?aptId=${apt.id}`}
                                >
                                  <Button
                                    size="sm"
                                    className="w-full h-8 text-[10px] font-black bg-brand-navy hover:bg-slate-800 text-white rounded-lg gap-1.5"
                                  >
                                    <AlertCircle size={12} />
                                    ILMOITA HAVAINTO
                                  </Button>
                                </Link>
                                <Link
                                  href={`/resident/renovations/new?aptId=${apt.id}`}
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-8 text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg gap-1.5"
                                  >
                                    <PlusCircle size={12} />
                                    UUSI MUUTOSTYÖ
                                  </Button>
                                </Link>
                              </div>
                            )}

                            {!isOwnApartment && !isBoard && (
                              <div className="pt-2 mt-2 border-t border-slate-200/50">
                                <p className="text-[9px] text-slate-400 italic">
                                  Yksityisyyden suojan vuoksi vain yleistiedot
                                  näkyvissä.
                                </p>
                              </div>
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
