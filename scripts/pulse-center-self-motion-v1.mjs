// Final Pulse consultation owner.
// Kept under the historical build entry so the production pipeline stays stable.
await import('./pulse-consultation-workflow-v2.mjs');
// Stabilize the existing Centre owner after the consultation rewrite: no parallel
// surface, only removal of the DOM feedback loop and duplicate dashboard loads.
await import('./pulse-center-crash-hotfix-v1.mjs');
