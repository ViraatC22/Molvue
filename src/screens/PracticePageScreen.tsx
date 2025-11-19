import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

type HintPayload = {
  screen: string;
  prefill: any;
  autoRun?: boolean;
};

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
  hintText?: string;
  hint?: HintPayload;
};

type ModuleSpec = {
  id: string;
  title: string;
  screen: string;
  color: string;
  questions: Question[];
};

const modulesSpec: ModuleSpec[] = [
  {
    id: 'imf',
    title: 'Intermolecular Forces',
    screen: 'IMFExplorer',
    color: '#10b981',
    questions: [
      {
        prompt: 'Which substance has the highest boiling point at 1 atm?',
        options: ['Water', 'Methane', 'Carbon Dioxide', 'Iodine'],
        correctIndex: 3,
        hintText: 'Stronger dispersion in larger, heavier molecules generally raises boiling point.'
      },
      {
        prompt: 'What is the dominant intermolecular force in acetone (C₃H₆O)?',
        options: ['London dispersion', 'Dipole–dipole', 'Hydrogen bonding', 'Ion–dipole'],
        correctIndex: 1,
        hintText: 'Acetone is polar with a carbonyl; no O–H or N–H bonds.'
      },
      {
        prompt: 'Is carbon dioxide (CO₂) overall polar or nonpolar?',
        options: ['Polar', 'Nonpolar', 'Ionic', 'Metallic'],
        correctIndex: 1,
        hintText: 'Linear geometry with equal, opposite bond dipoles gives cancellation.'
      },
      {
        prompt: 'Which compound can form hydrogen bonds between its molecules?',
        options: ['Ethanol', 'Benzene', 'Chloromethane', 'Dimethyl ether'],
        correctIndex: 0,
        hintText: 'Look for O–H, N–H, or F–H bonds for hydrogen bonding.'
      },
      {
        prompt: 'Which sample is most polarizable?',
        options: ['Benzene', 'Hydrogen peroxide', 'Methane', 'Formaldehyde'],
        correctIndex: 0,
        hintText: 'Larger electron clouds and delocalization increase dispersion forces.'
      },
    ],
  },
  {
    id: 'thermo',
    title: 'Thermodynamics',
    screen: 'ThermoCalculator',
    color: '#f59e0b',
    questions: [
      {
        prompt: 'At 298 K, combustion of methane (CH₄ + 2 O₂ → CO₂ + 2 H₂O) is best described as:',
        options: ['Spontaneous (ΔG < 0)', 'Non-spontaneous (ΔG > 0)', 'At equilibrium (ΔG ≈ 0)', 'Cannot be determined'],
        correctIndex: 0,
        hintText: 'Exothermic reactions with substantial product formation are typically spontaneous at room temperature.'
      },
      {
        prompt: 'Use the Thermo Calculator to evaluate CaCO₃(s) → CaO(s) + CO₂(g) at 298 K. Which statement is correct?',
        options: ['Spontaneous at 298 K', 'Non-spontaneous at 298 K', 'At equilibrium', 'Only spontaneous at very high pressure'],
        correctIndex: 1,
        hint: { screen: 'ThermoCalculator', prefill: { reaction: 'CaCO₃(s) → CaO(s) + CO₂(g)', temperature: '298' }, autoRun: true }
      },
      {
        prompt: 'Neutralization H⁺(aq) + OH⁻(aq) → H₂O(l) at 298 K is typically:',
        options: ['Spontaneous', 'Non-spontaneous', 'At equilibrium', 'Cannot be determined'],
        correctIndex: 0,
        hintText: 'Strong acid–base neutralizations are strongly exergonic at 298 K.'
      },
      {
        prompt: 'Vaporization H₂O(l) → H₂O(g) at 298 K is typically:',
        options: ['Spontaneous', 'Non-spontaneous', 'At equilibrium', 'Depends only on volume'],
        correctIndex: 1,
        hintText: 'Endothermic process; at 298 K the required energy makes ΔG positive.'
      },
      {
        prompt: 'Use the Thermo Calculator for H₂(g) + Cl₂(g) → 2 HCl(g) at 298 K. Which statement is correct?',
        options: ['Spontaneous at 298 K', 'Non-spontaneous at 298 K', 'At equilibrium', 'Cannot be determined'],
        correctIndex: 0,
        hint: { screen: 'ThermoCalculator', prefill: { reaction: 'H₂(g) + Cl₂(g) → 2 HCl(g)', temperature: '298' }, autoRun: true }
      },
    ],
  },
  {
    id: 'lattice',
    title: 'Lattice Energy',
    screen: 'LatticeEnergy',
    color: '#34A853',
    questions: [
      {
        prompt: 'Which compound has the largest lattice energy?',
        options: ['NaCl', 'KCl', 'AgCl', 'MgO'],
        correctIndex: 3,
        hintText: 'Higher ionic charges and smaller radii increase lattice energy.'
      },
      {
        prompt: 'Which compound has the smallest lattice energy?',
        options: ['NaCl', 'KCl', 'AgCl', 'MgO'],
        correctIndex: 1,
        hintText: 'Larger ions and lower charges reduce electrostatic attraction.'
      },
      {
        prompt: 'Increasing the magnitude of cation charge generally:',
        options: ['Decreases lattice energy', 'Increases lattice energy', 'Has no effect', 'Random effect'],
        correctIndex: 1,
        hintText: 'Electrostatic attraction scales with |z₁·z₂|.'
      },
      {
        prompt: 'Increasing ionic radius (at fixed charge) generally:',
        options: ['Increases lattice energy', 'Decreases lattice energy', 'Has no effect', 'Only affects cations'],
        correctIndex: 1,
        hintText: 'Greater separation reduces Coulombic attraction.'
      },
      {
        prompt: 'Which is more likely to be more soluble in water?',
        options: ['High lattice energy compound', 'Low lattice energy compound', 'All equal', 'Depends only on temperature'],
        correctIndex: 1,
        hintText: 'Lower lattice energy reduces the energy cost of separating ions.'
      },
    ],
  },
  {
    id: 'titration',
    title: 'Acid–Base Equilibria (Titrations)',
    screen: 'TitrationSimulator',
    color: '#8b5cf6',
    questions: [
      {
        prompt: 'For a strong acid–strong base titration, the equivalence point pH is closest to:',
        options: ['3', '7', '10', '14'],
        correctIndex: 1,
        hintText: 'Strong acid with strong base gives a neutral salt; pH ≈ 7.'
      },
      {
        prompt: 'Half of 50.0 mL titrant added equals ____ mL.',
        options: ['10.0', '25.0', '30.0', '50.0'],
        correctIndex: 1,
        hint: { screen: 'TitrationSimulator', prefill: { analyteVolumeInput: '25.0', titrantConcInput: '0.100', totalAddVolumeInput: '50.0' }, autoRun: true },
      },
      {
        prompt: 'Phenolphthalein changes color around which pH range?',
        options: ['3–4', '6–7', '8–10', '12–14'],
        correctIndex: 2,
        hintText: 'Phenolphthalein endpoint range is roughly pH 8.3–10.'
      },
      {
        prompt: 'Which indicator is appropriate near the equivalence point for strong acid–strong base?',
        options: ['Methyl orange', 'Methyl red', 'Bromothymol blue', 'None'],
        correctIndex: 2,
        hintText: 'Equivalence near pH 7; choose an indicator with transition around neutral.'
      },
      {
        prompt: 'In a strong acid–strong base titration, endpoint volume is typically equal to the equivalence volume:',
        options: ['True', 'False', 'Only for weak acids', 'Only for polyprotic acids'],
        correctIndex: 0,
        hintText: 'With an appropriate indicator, endpoint closely matches the equivalence point.'
      },
    ],
  },
  {
    id: 'stoich',
    title: 'Stoichiometry',
    screen: 'StoichLab',
    color: '#ef4444',
    questions: [
      {
        prompt: 'For H₂ + Cl₂ → 2 HCl, starting with 2.0 g H₂, how many moles of HCl can be formed (assuming excess Cl₂)?',
        options: ['1.0 mol', '2.0 mol', '0.5 mol', '4.0 mol'],
        correctIndex: 1,
        hint: { screen: 'StoichLab', prefill: { reactionInput: 'H₂ + Cl₂ → 2 HCl', reactantsInput: [{ compound: 'H₂', mass: '2.0' }], targetCompound: 'HCl' }, autoRun: true },
      },
      {
        prompt: 'For 2 H₂ + O₂ → 2 H₂O, if the theoretical yield is 18 g H₂O and the actual yield is 15 g, what is the percent yield?',
        options: ['83%', '90%', '100%', '75%'],
        correctIndex: 3,
        hintText: 'Percent yield = (actual ÷ theoretical) × 100%.'
      },
      {
        prompt: 'For N₂ + 3 H₂ → 2 NH₃, with 10 g N₂ and 10 g H₂, which is the limiting reactant?',
        options: ['N₂', 'H₂', 'Both are limiting', 'Neither is limiting'],
        correctIndex: 1,
        hintText: 'Convert masses to moles and compare stoichiometric ratios to find the limiting reactant.'
      },
      {
        prompt: 'For C + O₂ → CO₂, starting with 12 g carbon and excess O₂, how many grams of CO₂ can form?',
        options: ['22 g', '44 g', '12 g', '32 g'],
        correctIndex: 1,
        hint: { screen: 'StoichLab', prefill: { reactionInput: 'C + O₂ → CO₂', reactantsInput: [{ compound: 'C', mass: '12.0' }], targetCompound: 'CO₂' }, autoRun: true },
      },
      {
        prompt: 'For 2 Ag + Cl₂ → 2 AgCl, starting with 10 g Ag and excess Cl₂, how many grams of AgCl can form?',
        options: ['20 g', '35 g', '27 g', '54 g'],
        correctIndex: 2,
        hint: { screen: 'StoichLab', prefill: { reactionInput: '2 Ag + Cl₂ → 2 AgCl', reactantsInput: [{ compound: 'Ag', mass: '10.0' }], targetCompound: 'AgCl' }, autoRun: true },
      },
    ],
  },
  {
    id: 'geometry',
    title: 'Molecular Geometry (VSEPR)',
    screen: 'MolecularGeometry',
    color: '#FBBC05',
    questions: [
      {
        prompt: 'For an AX₃E molecule (e.g., NH₃), which molecular geometry is expected?',
        options: ['Tetrahedral', 'Trigonal pyramidal', 'Bent', 'Linear'],
        correctIndex: 1,
        hintText: 'One lone pair on a tetrahedral electron geometry yields trigonal pyramidal.'
      },
      {
        prompt: 'For AX₂E₂ (e.g., H₂O), which molecular geometry is expected?',
        options: ['Bent', 'Linear', 'Trigonal planar', 'Tetrahedral'],
        correctIndex: 0,
        hintText: 'Two bonding pairs and two lone pairs around the central atom give a bent shape.'
      },
      {
        prompt: 'For AX₂ with no lone pairs on the central atom (e.g., CO₂), which geometry is expected?',
        options: ['Trigonal planar', 'Linear', 'Bent', 'Octahedral'],
        correctIndex: 1,
        hintText: 'AX₂ without lone pairs is linear by VSEPR.'
      },
      {
        prompt: 'For AX₆ with no lone pairs (e.g., SF₆), which molecular geometry is expected?',
        options: ['Trigonal bipyramidal', 'Octahedral', 'Tetrahedral', 'Square planar'],
        correctIndex: 1,
        hintText: 'Six bonding pairs around the central atom give octahedral geometry.'
      },
      {
        prompt: 'For AX₅ with no lone pairs (e.g., PF₅), which molecular geometry is expected?',
        options: ['Trigonal bipyramidal', 'Octahedral', 'Seesaw', 'Square pyramidal'],
        correctIndex: 0,
        hintText: 'Five bonding pairs yield trigonal bipyramidal geometry.'
      },
    ],
  },
];

export default function PracticePageScreen({ navigation }: any) {
  const [activeModuleId, setActiveModuleId] = useState(modulesSpec[0].id);
  const [answers, setAnswers] = useState<Record<string, Record<number, number | null>>>(() => {
    const init: Record<string, Record<number, number | null>> = {};
    modulesSpec.forEach(m => {
      init[m.id] = {};
      m.questions.forEach((_, idx) => { init[m.id][idx] = null; });
    });
    return init;
  });
  const [checked, setChecked] = useState<Record<string, Record<number, boolean>>>(() => {
    const init: Record<string, Record<number, boolean>> = {};
    modulesSpec.forEach(m => {
      init[m.id] = {};
      m.questions.forEach((_, idx) => { init[m.id][idx] = false; });
    });
    return init;
  });
  const [shownHints, setShownHints] = useState<Record<string, Record<number, string | null>>>(() => {
    const init: Record<string, Record<number, string | null>> = {};
    modulesSpec.forEach(m => {
      init[m.id] = {};
      m.questions.forEach((_, idx) => { init[m.id][idx] = null; });
    });
    return init;
  });

  const activeModule = useMemo(() => modulesSpec.find(m => m.id === activeModuleId)!, [activeModuleId]);

  const selectOption = (qid: number, optIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [activeModule.id]: { ...prev[activeModule.id], [qid]: optIdx }
    }));
    setChecked(prev => ({
      ...prev,
      [activeModule.id]: { ...prev[activeModule.id], [qid]: false }
    }));
  };

  const checkAnswer = (qid: number) => {
    setChecked(prev => ({
      ...prev,
      [activeModule.id]: { ...prev[activeModule.id], [qid]: true }
    }));
  };

  const openHint = (q: Question, qid: number) => {
    if (q.hintText) {
      setShownHints(prev => ({
        ...prev,
        [activeModule.id]: { ...prev[activeModule.id], [qid]: String(q.hintText) }
      }));
      return;
    }
    if (q.hint) {
      navigation.navigate(q.hint.screen, { prefill: q.hint.prefill, autoRun: !!q.hint.autoRun, fromPractice: true });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Practice</Text>
        <View style={styles.moduleTabs}>
          {modulesSpec.map(m => (
            <TouchableOpacity key={m.id} style={[styles.tab, activeModuleId === m.id && { backgroundColor: m.color + '22', borderColor: m.color }]} onPress={() => setActiveModuleId(m.id)}>
              <Text style={[styles.tabText, activeModuleId === m.id && { color: m.color }]}>{m.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionsBlock}>
        {activeModule.questions.map((q, idx) => {
          const selected = answers[activeModule.id][idx];
          const isChecked = checked[activeModule.id][idx];
          const isCorrect = selected === q.correctIndex;
          return (
            <View key={idx} style={styles.questionCard}>
              <Text style={styles.prompt}>{idx + 1}. {q.prompt}</Text>
              <View style={styles.optionsRow}>
                {q.options.map((opt, optIdx) => (
                  <TouchableOpacity key={optIdx} style={[styles.option, selected === optIdx && { borderColor: activeModule.color }]} onPress={() => selectOption(idx, optIdx)}>
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.hintBtn, { borderColor: activeModule.color }]} onPress={() => openHint(q, idx)}>
                  <Text style={[styles.hintText, { color: activeModule.color }]}>Hint ↗</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.checkBtn, { backgroundColor: activeModule.color }]} onPress={() => checkAnswer(idx)}>
                  <Text style={styles.checkText}>Check Answer</Text>
                </TouchableOpacity>
              </View>
              {shownHints[activeModule.id][idx] && (
                <View style={styles.hintBox}>
                  <Text style={styles.hintBoxText}>{shownHints[activeModule.id][idx]}</Text>
                </View>
              )}
              {isChecked && (
                <View style={[styles.feedback, { borderColor: isCorrect ? '#34A853' : '#ef4444', backgroundColor: (isCorrect ? '#34A853' : '#ef4444') + '12' }]}>
                  <Text style={[styles.feedbackText, { color: isCorrect ? '#34A853' : '#ef4444' }]}>{isCorrect ? 'Correct' : 'Try again'}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f7fa' },
  headerRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  moduleTabs: { flexDirection: 'row', flexWrap: 'wrap' },
  tab: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', marginRight: 8, marginBottom: 8, backgroundColor: '#fff' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  questionsBlock: { padding: 16 },
  questionCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9ecef', borderRadius: 10, padding: 12, marginBottom: 12 },
  prompt: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', marginRight: 8, marginBottom: 8, backgroundColor: '#fff' },
  optionText: { fontSize: 12, color: '#111827', fontWeight: '500' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  hintBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, backgroundColor: '#fff' },
  hintText: { fontSize: 12, fontWeight: '700' },
  checkBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  checkText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  hintBox: { marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e9ecef' },
  hintBoxText: { fontSize: 12, color: '#374151' },
  feedback: { marginTop: 8, padding: 8, borderRadius: 8, borderWidth: 1 },
  feedbackText: { fontSize: 12, fontWeight: '700' },
});