# Molvue — AP Chemistry Visualizer

## Introduction and Problem Statement
- Purpose: help AP Chemistry students move from memorization to understanding using interactive visuals, scaffolded calculations, and quick practice.
- Motivation: students struggled to connect structure ↔ properties ↔ math; Molvue makes those connections visible and actionable.
- Audience: AP Chemistry students and teachers; supports review, lab prep, and in-class demonstrations.
- Learning objectives:
  - Recognize and explain how molecular structure and IMFs drive macroscopic properties.
  - Interpret titration curves and thermodynamic outputs with confidence.
  - Set up multi-step problems with correct units and assumptions.
- Observed challenges:
  - Visualizing 3D shapes and IMFs; relating them to boiling point, solubility, and reactivity.
  - Bridging qualitative rules to quantitative work (ΔH, ΔS, ΔG, titration pH at key points, yields).
  - Fragmented resources increase cognitive load and time-on-task.
- Goal: one integrated place to explore, calculate, and practice with immediate feedback.

## Problem Statement and Relevance
- Core student challenges Molvue targets:
  - Distinguishing IMFs (dipole–dipole vs hydrogen bonding) and linking to boiling point/solubility.
  - Reading titration curves: buffer regions, half-equivalence, and indicator windows.
  - Interpreting ΔG results and temperature dependence of spontaneity.
  - Explaining lattice energy trends using charge and ionic radius.
  - Setting up stoichiometry with correct mole ratios and yield calculations.
- AP Chemistry alignment:
  - Direct support for units on IMFs, molecular geometry (VSEPR), acid–base, thermodynamics, ionic compounds, and stoichiometry.
  - Reinforces lab prep and post-lab analysis (indicator choice, curve reading, reasoning about energy and yields).
- Why Molvue’s approach works:
  - Visual-first exploration reduces cognitive load.
  - Step-by-step calculators minimize setup errors and surface intermediate reasoning.
  - Immediate interpretation statements bridge results to verbal explanations.

## Chemistry Concepts and Computational Approach
- Intermolecular Forces (IMF Explorer):
  - Identifies dominant IMFs and secondary contributors; ranks boiling points qualitatively.
  - Strength order reference: LDF < dipole–dipole < H-bonding < ionic.
- 3D Molecular Geometry (VSEPR):
  - Inputs electron domains and lone pairs; outputs geometry name, angle ranges (e.g., tetrahedral ≈109.5°), examples.
  - Notes distortions (lone-pair repulsion reduces bond angles: trigonal pyramidal < 109.5°).
  - Angle references: linear 180°, trigonal planar 120°, tetrahedral 109.5°, trigonal bipyramidal 90°/120°, octahedral 90°.
- Titrations (Simulator):
  - Strong acid/base: piecewise calculations around equivalence; sharp inflection.
  - Weak acid/base: Henderson–Hasselbalch `pH = pKa + log([A−]/[HA])` in buffer region; gentler slope.
  - Indicator guidance: recommends ranges aligned to steepest curve region.
  - Notes: Henderson–Hasselbalch valid in buffer region (not at equivalence); equivalence pH trends depend on acid/base strength.
- Thermodynamics (Calculator):
  - Computes `ΔG = ΔH − TΔS` with unit checks (kJ vs J); outputs spontaneity vs T.
  - Provides crossover temperature `T* = ΔH/ΔS` when `ΔS ≠ 0` and signs permit (interpreted only within physical T range).
- Lattice Energy (Estimator):
  - Qualitative model: proportional to `(q1 × q2)/r`; compares charge magnitude and ionic radii.
  - Connects to melting point/hardness trends.
- Stoichiometry (Practice helpers):
  - Limiting reagent via mole ratios; theoretical yield and percent yield `% = actual/theoretical × 100`.
- Practice Feature:
  - Short-answer prompts across modules (IMFs, VSEPR, titrations, thermo, lattice, stoich).
  - Contextual hints deep-link into the relevant tool to show the concept before solving.
  - Immediate feedback with concise explanations to reinforce the reasoning path.
  - Reflection prompts encourage “explain why” responses instead of only numeric answers.
- Educational design:
  - Visual-first, scaffolded steps, immediate feedback; consistent color coding by topic.
- Computational approach:
  - Deterministic formulas, validated intermediate states, and concise interpretations.

## Algorithm and Workflow
- Inputs: identities, concentrations, volumes, temperature, reaction data, electron domains/lone pairs.
- Validation: unit normalization (J↔kJ, mL↔L), domain checks, error prompts with corrective tips.
- Engine steps:
  - VSEPR: derive geometry and angle guidance from domains and lone pairs.
  - Titrations: piecewise calculation; buffer region via Henderson–Hasselbalch; equivalence pH via hydrolysis where applicable.
  - Thermodynamics: evaluate ΔG, spontaneity, and crossover temperature.
  - Lattice energy: qualitative comparison using charge and radius.
  - Stoichiometry: mole conversions, limiting reagent, yields.
- Visualization: three.js/RN visuals; ions float between module cards to reinforce context without occluding content.
- Outputs: numerical results, labeled graphs/curves, and short interpretation statements.
- Practice flow:
  - Select a topic and question; read the prompt and attempt an answer.
  - Use a hint to jump into the visualizer/calculator for the underlying concept.
  - Submit to check; receive feedback and a brief explanation.
  - Return to the prompt with improved intuition; retry or move to the next item.

## Results and Interpretation
- Titration insights:
  - Strong acid/base: sharp equivalence; indicator near neutral (≈ pH 7).
  - Weak acid/strong base: equivalence above 7; choose indicator in basic range.
  - Strong acid/weak base: equivalence below 7; choose indicator in acidic range.
  - Buffer plateau: indicator near `pKa` works within buffer region.
- Thermodynamics:
  - Spontaneity shifts with temperature; `T* = ΔH/ΔS` clarifies boundary.
  - Clear statements (e.g., “spontaneous above 312 K”).
- IMF & VSEPR:
  - Reliable patterns from structure to property; students can verbalize trends.
- Lattice energy:
  - Higher charges/smaller radii → stronger attractions; link to melting point/hardness.
- Student value (pilot):
  - Fewer “why” gaps, faster setup, stronger explanations on exit-ticket prompts.
- Practice feature outcomes:
  - Better transfer from visuals to calculations due to concept-first hints.
  - More accurate indicator choices and titration curve explanations after guided practice.
  - Increased confidence when verbalizing IMF/VSEPR relationships to properties.