import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next escribe un AGENTS.md y un CLAUDE.md dentro de apps/web en cada `dev`.
  // Apagado: el repo no lleva archivos de herramientas de terceros, y las notas
  // de trabajo viven fuera del repo.
  agentRules: false,

  // `@madryn/core` es un paquete del workspace: se compila antes por Turborepo.
  transpilePackages: ['@madryn/core'],
};

export default nextConfig;
