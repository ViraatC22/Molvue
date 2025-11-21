# Molvue

Visual chemistry toolkit built with Expo React Native (+ web) and a small Node server. Six interactive modules help explain key AP Chemistry concepts with animated visuals and clear calculations.

## Quick Start

### Expo app (mobile + web)
- Install dependencies:
  - `npm install`
- Start the Expo dev server (web):
  - `npm run web`
- Start for native devices:
  - `npm start` and press `i` (iOS) or `a` (Android)

### Optional Next.js site (apps/web)
- `cd apps/web && npm install && npm run dev`

### Optional Node server (apps/server)
- `cd apps/server && npm install && SUPABASE_URL=http://localhost SUPABASE_SERVICE_ROLE_KEY=dummy npm run start`
- Health check: `GET /api/health` responds `{ ok: true }` (apps/server/server.js:17)

## Modules

1. **IMF Explorer**
   - Identifies dominant and secondary intermolecular forces from common molecules and shows color‑coded rings. Includes polarity, boiling point, and force legend.
   - Core: `src/screens/IMFExplorerScreen.tsx:323` (IMF type map), filtering at `src/screens/IMFExplorerScreen.tsx:361`.

2. **3D Molecular Geometry (VSEPR)**
   - Inputs bonding pairs/lone pairs; outputs shape, angles, examples; interactive 3D layout.
   - Core: `src/screens/MolecularGeometryScreen.web.tsx:146` (shape decision), Three.js render at `src/screens/MolecularGeometryScreen.web.tsx:395`.

3. **Thermo Calculator**
   - Computes `ΔH°`, `ΔS°`, `ΔG`, spontaneity, equilibrium constant `K`, and crossover temperature where `ΔG ≈ 0`.
   - Core: reaction parse `src/screens/ThermoCalculatorScreen.tsx:114`, calculations `src/screens/ThermoCalculatorScreen.tsx:171`.

4. **Lattice Energy Estimator**
   - Qualitative energy model proportional to charge product over ion distance; compares charge magnitude and ionic radii.
   - Core: charge/radii tables and energy estimator in `src/screens/LatticeEnergyScreen.tsx:48`, `src/screens/LatticeEnergyScreen.tsx:125`.

5. **Titration Simulator**
   - Generates titration curves; finds equivalence/endpoint; recommends indicators; shows real‑time pH and burette level.
   - Core: curve/pH `src/screens/TitrationSimulatorScreen.tsx:159`, equivalence/endpoint `src/screens/TitrationSimulatorScreen.tsx:244`.

6. **Stoich Lab**
   - Balances reactions; finds limiting reagent; computes theoretical yield and leftovers; shows a calculation log.
   - Core: balancing `src/screens/StoichLabScreen.tsx:111`, stoichiometry `src/screens/StoichLabScreen.tsx:200`.

## Project Structure

- Root Expo app
  - `App.tsx`: stack navigator, platform‑specific geometry screen.
  - `src/screens/`: all module screens (Home, IMF, VSEPR, Thermo, Lattice, Titration, Stoich, Practice).
  - `assets/`: icons and images.
- `apps/web/`: Next.js site (auth + simple pages).
- `apps/server/`: Express server with Supabase client and example API.
- Deployment helper files: `.vercel/`, `vercel.json`.

## Development Notes

- TypeScript: `npx tsc --noEmit` for type checking.
- Web preview: Expo hosts at `http://localhost:8081/` when running `npm run web`.
- The Thermo module uses a built‑in database of common compounds and elements; include states `(s/l/g/aq)` for best matches.

## Educational Outcomes

- IMF & VSEPR: Links structure to polarity, shape, and dominant forces.
- Thermodynamics: Shows how spontaneity changes with temperature via `ΔG = ΔH − TΔS` and crossover `T* = ΔH/ΔS`.
- Lattice Energy: Higher charges and smaller radii → stronger attraction; relates to melting point and hardness.
- Stoichiometry: Balanced ratios determine limiting reagent and theoretical yield; reports leftover amounts for excess reactants.

## License

Internal educational project.