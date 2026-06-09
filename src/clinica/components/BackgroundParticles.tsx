import React, { useMemo } from "react";


// --- Importaciones de tsParticles ---
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";

// Fuera del componente LoginPage o en otro archivo
export const BackgroundParticles = React.memo(({ init }: { init: boolean }) => {
  const options: ISourceOptions = useMemo(() => ({
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repel" },
      },
      modes: {
        push: { quantity: 4 },
        repel: { distance: 150, duration: 0.6 },
      },
    },
    particles: {
      color: { value: "#3b82f6" },
      links: {
        color: "#93c5fd",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.5,
        outModes: { default: "bounce" },
      },
      number: {
        density: { enable: true, width: 800, height: 800 },
        value: 80,
      },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="absolute inset-0 z-0"
    />
  );
});