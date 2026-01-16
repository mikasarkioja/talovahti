import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useBuildingXray(enabled: boolean) {
  const { scene } = useThree();
  // Store original materials mapped by Object UUID
  const originalMaterials = useRef<
    Map<string, THREE.Material | THREE.Material[]>
  >(new Map());

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

        // Determine Responsibility Type (Mock Logic for MVP)
        // In production, this would look up obj.userData.id from the BuildingComponent table
        // For now, we use simple heuristics based on object names or types

        let type: "COMPANY" | "SHAREHOLDER" = "SHAREHOLDER";

        // If it's Infrastructure or Roof/Structure -> COMPANY
        // Note: Check how meshes are named in BuildingGenerator/InfrastructureMesh
        // Assuming specific names or defaulting
        if (
          obj.name.includes("Infra") ||
          obj.name.includes("Roof") ||
          obj.name.includes("Foundation")
        ) {
          type = "COMPANY";
        }

        if (type === "COMPANY") {
          // Blue Transparent for Company (Structure)
          obj.material = new THREE.MeshStandardMaterial({
            color: "#3b82f6", // Brand Blue
            transparent: true,
            opacity: 0.6,
            roughness: 0.2,
            metalness: 0.8,
            side: THREE.DoubleSide,
          });
        } else {
          // Green Wireframe for Shareholder (Unit/Surface)
          obj.material = new THREE.MeshBasicMaterial({
            color: "#22c55e", // Brand Emerald
            wireframe: true,
            transparent: true,
            opacity: 0.4,
          });
        }
      }
    });
  }, [enabled, scene]);
}
