import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { ResponsibilityType } from "@prisma/client";

export function useBuildingXray(
  enabled: boolean,
  components?: {
    meshId: string;
    responsibility: ResponsibilityType | string;
  }[],
) {
  const { scene } = useThree();
  // Store original materials mapped by Object UUID
  const originalMaterials = useRef<
    Map<string, THREE.Material | THREE.Material[]>
  >(new Map());

  // Pre-define materials to avoid re-creating them during traversal
  const companyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#002f6c", // Dark Blue
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.8,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const shareholderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#10b981", // Emerald
        transparent: true,
        opacity: 0.5,
        roughness: 0.5,
        metalness: 0.1,
      }),
    [],
  );

  const hybridMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f59e0b", // Amber
        transparent: true,
        opacity: 0.6,
        roughness: 0.3,
        metalness: 0.5,
      }),
    [],
  );

  useEffect(() => {
    // 1. RESTORE ORIGINAL STATE
    if (!enabled) {
      if (originalMaterials.current.size > 0) {
        scene.traverse((obj) => {
          if (
            obj instanceof THREE.Mesh &&
            originalMaterials.current.has(obj.uuid)
          ) {
            obj.material = originalMaterials.current.get(obj.uuid)!;
          }
        });
        originalMaterials.current.clear();
      }
      return;
    }

    // 2. APPLY X-RAY MODE
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        // Cache original material if not already cached
        if (!originalMaterials.current.has(obj.uuid)) {
          originalMaterials.current.set(obj.uuid, obj.material);
        }

        // Determine Responsibility Type
        let type: string = "COMPANY"; // Default

        // Check if mesh name matches any known component
        const comp = components?.find((c) => c.meshId === obj.name);
        if (comp) {
          type = comp.responsibility;
        } else {
          // Fallback logic
          if (
            obj.name.includes("Infra") ||
            obj.name.includes("Roof") ||
            obj.name.includes("Pipes") ||
            obj.name.includes("Facade") ||
            obj.name.includes("Window")
          ) {
            type = "COMPANY";
          } else if (
            obj.name.includes("Interior") ||
            obj.name.includes("Floor") ||
            obj.name.includes("Surface")
          ) {
            type = "SHAREHOLDER";
          }
        }

        if (type === "COMPANY") {
          obj.material = companyMaterial;
        } else if (type === "SHAREHOLDER") {
          obj.material = shareholderMaterial;
        } else {
          obj.material = hybridMaterial;
        }
      }
    });
  }, [
    enabled,
    scene,
    companyMaterial,
    shareholderMaterial,
    hybridMaterial,
    components,
  ]);
}
