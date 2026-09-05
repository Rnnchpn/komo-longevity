import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// V0.11.2-only visual hook. It captures the already-existing Three.js scene
// without changing the V0.8.1 simulation, controls, scoring or clinical data.
if (!window.__KOMO_WORLD_SCENE_HOOK__) {
  const objects = new Set();
  const originalAdd = THREE.Object3D.prototype.add;
  let restored = false;

  THREE.Object3D.prototype.add = function (...children) {
    objects.add(this);
    children.forEach((child) => child && objects.add(child));
    return originalAdd.apply(this, children);
  };

  window.__KOMO_WORLD_SCENE_HOOK__ = {
    THREE,
    objects,
    scene() {
      return [...objects].find((object) => object?.isScene) || null;
    },
    groupAt(x, z, tolerance = 0.08) {
      const scene = this.scene();
      if (!scene) return null;
      let match = null;
      scene.traverse((object) => {
        if (match || !object?.isGroup) return;
        if (Math.abs(object.position.x - x) <= tolerance && Math.abs(object.position.z - z) <= tolerance) match = object;
      });
      return match;
    },
    restore() {
      if (restored) return;
      THREE.Object3D.prototype.add = originalAdd;
      restored = true;
    }
  };
}
