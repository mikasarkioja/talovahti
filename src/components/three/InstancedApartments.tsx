"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ApartmentLayout } from "@/lib/three/BuildingGenerator";
import { ExtruderEngine } from "@/lib/three/ExtruderEngine";

interface InstancedApartmentsProps {
  apartments: ApartmentLayout[];
  aptStatusMap: Record<
    string,
    {
      isOwnApartment: boolean | null;
      hasTicket: boolean;
      activeVote: boolean;
      isBoard: boolean;
    }
  >;
  selectedAptId: string | null;
  highlightId?: string;
  viewMode: "NORMAL" | "LIFESPAN" | "VALUE_HEATMAP";
  participatedApartmentIds: string[];
  onApartmentClick: (id: string) => void;
  selectedFloor: number | null;
}

export function InstancedApartments({
  apartments,
  aptStatusMap,
  selectedAptId,
  highlightId,
  viewMode,
  participatedApartmentIds,
  onApartmentClick,
  selectedFloor,
}: InstancedApartmentsProps) {
  // Grouping by shape
  const groups = useMemo(() => {
    const map = new Map<string, ApartmentLayout[]>();
    apartments.forEach((apt) => {
      const key = JSON.stringify(apt.polygonPoints);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    });
    return Array.from(map.values());
  }, [apartments]);

  // For this simplified version, we'll just handle ONE instanced mesh for the most common shape
  // or just render multiple instanced meshes.

  return (
    <>
      {groups.map((group, gIdx) => (
        <ShapeGroup
          key={gIdx}
          apartments={group}
          aptStatusMap={aptStatusMap}
          selectedAptId={selectedAptId}
          highlightId={highlightId}
          viewMode={viewMode}
          participatedApartmentIds={participatedApartmentIds}
          onApartmentClick={onApartmentClick}
          selectedFloor={selectedFloor}
        />
      ))}
    </>
  );
}

interface ShapeGroupProps {
  apartments: ApartmentLayout[];
  aptStatusMap: Record<
    string,
    {
      isOwnApartment: boolean | null;
      hasTicket: boolean;
      activeVote: boolean;
      isBoard: boolean;
    }
  >;
  selectedAptId: string | null;
  highlightId?: string;
  viewMode: "NORMAL" | "LIFESPAN" | "VALUE_HEATMAP";
  participatedApartmentIds: string[];
  onApartmentClick: (id: string) => void;
  selectedFloor: number | null;
}

function ShapeGroup({
  apartments,
  aptStatusMap,
  selectedAptId,
  highlightId,
  viewMode,
  participatedApartmentIds,
  onApartmentClick,
  selectedFloor,
}: ShapeGroupProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const sampleApt = apartments[0];
  const { shape, extrudeSettings } = useMemo(() => {
    const res = ExtruderEngine.extrudeApartment(
      sampleApt.polygonPoints,
      1, // relative
      sampleApt.dimensions[1],
    );
    return res || { shape: new THREE.Shape(), extrudeSettings: {} };
  }, [sampleApt.polygonPoints, sampleApt.dimensions]);

  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(shape, extrudeSettings),
    [shape, extrudeSettings],
  );

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    apartments.forEach((apt, i) => {
      const status = aptStatusMap[apt.id];
      if (!status) return;

      const isVisible = selectedFloor === null || selectedFloor === apt.floor;

      // Update Matrix
      if (isVisible) {
        tempObj.position.set(
          apt.position[0],
          apt.position[1] - apt.dimensions[1] / 2,
          apt.position[2],
        );
        tempObj.rotation.set(-Math.PI / 2, 0, apt.rotation || 0);
        tempObj.scale.set(1, 1, 1);
      } else {
        tempObj.scale.set(0, 0, 0); // Hide
      }

      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);

      // Update Color
      let baseColor = "#e2e8f0";
      const isSelected = selectedAptId === apt.id;
      const isAnySelected = selectedAptId !== null;
      const isParticipationMode = participatedApartmentIds.length > 0;

      // Simplification of color logic from BuildingModel.tsx
      if (viewMode === "VALUE_HEATMAP") {
        baseColor = "#eab308"; // yellow mock
      }

      if (isAnySelected || isParticipationMode) {
        if (
          isSelected ||
          (isParticipationMode && participatedApartmentIds.includes(apt.id))
        ) {
          baseColor = isParticipationMode ? "#10b981" : "#002f6c";
        } else {
          baseColor = "#cbd5e1";
        }
      }

      if (highlightId === apt.id) baseColor = "#fbbf24";

      // Pulsing logic
      const { hasTicket, activeVote } = status;
      let pulseColor = null;
      if (hasTicket) pulseColor = "#ef4444";
      else if (activeVote) pulseColor = "#3b82f6";

      if (pulseColor) {
        const t = state.clock.getElapsedTime();
        const lerpFactor = ((Math.sin(t * 5) + 1) / 2) * 0.6 + 0.2;
        tempColor.set(baseColor).lerp(new THREE.Color(pulseColor), lerpFactor);
      } else {
        tempColor.set(baseColor);
      }

      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, apartments.length]}
      onClick={(e: unknown) => {
        const ev = e as { stopPropagation: () => void; instanceId?: number };
        if (ev.stopPropagation) ev.stopPropagation();
        if (ev.instanceId !== undefined) {
          onApartmentClick(apartments[ev.instanceId].id);
        }
      }}
    >
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}
