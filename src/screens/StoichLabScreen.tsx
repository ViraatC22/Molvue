import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';

interface Compound {
  formula: string;
  molarMass: number;
  coefficient: number;
}

interface Reaction {
  reactants: Compound[];
  products: Compound[];
  balanced: boolean;
}

const compoundDatabase: { [key: string]: number } = {
  'H₂O': 18.02, 'CO₂': 44.01, 'NaCl': 58.44, 'HCl': 36.46, 'NaOH': 40.00,
  'H₂SO₄': 98.08, 'CaCO₃': 100.09, 'NH₃': 17.03, 'CH₄': 16.04, 'O₂': 32.00,
  'N₂': 28.02, 'H₂': 2.02, 'CaO': 56.08, 'Fe₂O₃': 159.69, 'Al₂O₃': 101.96,
  'Cu': 63.55, 'Ag': 107.87, 'Au': 196.97, 'Fe': 55.85, 'Al': 26.98
};

const atomicMass: { [el: string]: number } = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.81, C: 12.01, N: 14.01, O: 16.00,
  F: 19.00, Ne: 20.18, Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.07,
  Cl: 35.45, Ar: 39.95, K: 39.10, Ca: 40.08, Sc: 44.96, Ti: 47.87, V: 50.94, Cr: 52.00,
  Mn: 54.94, Fe: 55.85, Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.38, Ga: 69.72, Ge: 72.63,
  As: 74.92, Se: 78.97, Br: 79.90, Kr: 83.80, Rb: 85.47, Sr: 87.62, Ag: 107.87, Au: 196.97
};

const subscriptMap: { [k: string]: string } = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

const normalizeFormula = (s: string) => s.replace(/[₀-₉]/g, ch => subscriptMap[ch] || ch).replace(/\s+/g, '');

const parseFormulaCounts = (formula: string): { [el: string]: number } => {
  const f = normalizeFormula(formula);
  const stack: Array<{ [el: string]: number }> = [{}];
  let i = 0;
  const pushCount = (el: string, count: number) => {
    const top = stack[stack.length - 1];
    top[el] = (top[el] || 0) + count;
  };
  while (i < f.length) {
    const ch = f[i];
    if (ch === '(') { stack.push({}); i++; continue; }
    if (ch === ')') {
      i++;
      let numStr = '';
      while (i < f.length && /[0-9]/.test(f[i])) { numStr += f[i++]; }
      const mult = numStr ? parseInt(numStr, 10) : 1;
      const group = stack.pop() || {};
      const top = stack[stack.length - 1];
      Object.keys(group).forEach(el => { top[el] = (top[el] || 0) + group[el] * mult; });
      continue;
    }
    if (/[A-Z]/.test(ch)) {
      let el = ch; i++;
      while (i < f.length && /[a-z]/.test(f[i])) { el += f[i++]; }
      let numStr = '';
      while (i < f.length && /[0-9]/.test(f[i])) { numStr += f[i++]; }
      const n = numStr ? parseInt(numStr, 10) : 1;
      pushCount(el, n);
      continue;
    }
    i++;
  }
  return stack[0];
};

const getMolarMass = (formula: string) => {
  if (compoundDatabase[formula] != null) return compoundDatabase[formula];
  const counts = parseFormulaCounts(formula);
  let mm = 0;
  Object.keys(counts).forEach(el => { const m = atomicMass[el]; mm += (m || 0) * counts[el]; });
  return mm > 0 ? mm : 100;
};

export default function StoichLabScreen() {
  const [reactionInput, setReactionInput] = useState('');
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [reactantsInput, setReactantsInput] = useState<{ compound: string; mass: string }[]>([
    { compound: '', mass: '' },
  ]);
  const [targetCompound, setTargetCompound] = useState('');
  const [results, setResults] = useState<{
    theoreticalYield: number;
    limitingReagent: string | null;
    excessReagents: { [key: string]: number };
    moleRatios: { [key: string]: number };
    balancedEquation: string;
    calcSteps: string[];
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const parseReaction = (input: string): Reaction => {
    const parts = input.split(/→|->|⟶|=>/);
    const [reactantSide, productSide] = parts.length >= 2 ? [parts[0].trim(), parts[1].trim()] : ['H₂ + O₂', 'H₂O'];
    const parseSide = (side: string) => side.split('+').map(token => {
      const t = token.trim();
      const m = t.match(/^([0-9]+)\s*(.+)$/);
      const coeff = m ? parseInt(m[1], 10) : 1;
      const formula = normalizeFormula(m ? m[2].trim() : t);
      return { formula, molarMass: getMolarMass(formula), coefficient: coeff };
    });
    const reactants = parseSide(reactantSide);
    const products = parseSide(productSide);
    return { reactants, products, balanced: false };
  };

  const balanceReaction = (reaction: Reaction): Reaction => {
    const species = [...reaction.reactants.map(r => ({ ...r })), ...reaction.products.map(p => ({ ...p }))];
    const elementsSet: Set<string> = new Set();
    species.forEach(s => { const c = parseFormulaCounts(s.formula); Object.keys(c).forEach(e => elementsSet.add(e)); });
    const elements = Array.from(elementsSet);
    const n = species.length;
    const m = elements.length;
    const A: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
    for (let i = 0; i < m; i++) {
      const el = elements[i];
      for (let j = 0; j < n; j++) {
        const counts = parseFormulaCounts(species[j].formula);
        const sign = j < reaction.reactants.length ? 1 : -1;
        A[i][j] = (counts[el] || 0) * sign;
      }
    }
    const solveWithFixed = (fixIndex: number) => {
      const vars = [] as number[];
      const idxMap: number[] = [];
      for (let j = 0; j < n; j++) if (j !== fixIndex) idxMap.push(j);
      const B = A.map(row => row.filter((_, j) => j !== fixIndex));
      const b = A.map(row => -row[fixIndex]);
      const x = gaussianSolve(B, b);
      if (!x) return null;
      const full: number[] = [];
      let xi = 0;
      for (let j = 0; j < n; j++) full[j] = j === fixIndex ? 1 : x[xi++];
      return full;
    };
    const trySolve = () => {
      for (let fix = n - 1; fix >= 0; fix--) {
        const v = solveWithFixed(fix);
        if (v) return v;
      }
      return null;
    };
    const sol = trySolve();
    if (!sol) return { ...reaction, balanced: false };
    const frac = sol.map(rationalApprox);
    const dens = lcmMany(frac.map(f => f.d));
    let coeffs = frac.map(f => Math.round(f.n * (dens / f.d)));
    const minSign = Math.min(...coeffs);
    if (minSign < 0) coeffs = coeffs.map(v => -v);
    const g = gcdMany(coeffs.map(v => Math.abs(v) || 1));
    coeffs = coeffs.map(v => Math.abs(v) / g);
    const reactCoeffs = coeffs.slice(0, reaction.reactants.length);
    const prodCoeffs = coeffs.slice(reaction.reactants.length);
    const balancedReactants = reaction.reactants.map((r, i) => ({ formula: r.formula, molarMass: getMolarMass(r.formula), coefficient: reactCoeffs[i] || 1 }));
    const balancedProducts = reaction.products.map((p, i) => ({ formula: p.formula, molarMass: getMolarMass(p.formula), coefficient: prodCoeffs[i] || 1 }));
    return { reactants: balancedReactants, products: balancedProducts, balanced: true };
  };

  const gaussianSolve = (M: number[][], b: number[]) => {
    const m = M.length; const n = M[0]?.length || 0;
    const A = M.map((row, i) => [...row, b[i]]);
    let r = 0;
    for (let c = 0; c < n && r < m; c++) {
      let piv = r; for (let i = r + 1; i < m; i++) if (Math.abs(A[i][c]) > Math.abs(A[piv][c])) piv = i;
      if (Math.abs(A[piv][c]) < 1e-12) continue;
      const tmp = A[r]; A[r] = A[piv]; A[piv] = tmp;
      const div = A[r][c]; for (let j = c; j <= n; j++) A[r][j] /= div;
      for (let i = 0; i < m; i++) if (i !== r) {
        const factor = A[i][c]; for (let j = c; j <= n; j++) A[i][j] -= factor * A[r][j];
      }
      r++;
    }
    const x = Array(n).fill(0);
    for (let i = 0; i < m; i++) {
      let lead = -1; for (let j = 0; j < n; j++) if (Math.abs(A[i][j]) > 1e-10) { lead = j; break; }
      if (lead >= 0) x[lead] = A[i][n];
    }
    if (x.some(v => !isFinite(v))) return null;
    return x;
  };

  const rationalApprox = (x: number) => {
    const sign = x < 0 ? -1 : 1; x = Math.abs(x);
    let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x, a = Math.floor(b);
    while (k1 <= 1000) {
      const t = h1; h1 = a * h1 + h0; h0 = t; const t2 = k1; k1 = a * k1 + k0; k0 = t2; const frac = h1 / k1; if (Math.abs(frac - x) < 1e-6) break; b = 1 / (b - a); if (!isFinite(b)) break; a = Math.floor(b);
    }
    return { n: sign * h1, d: k1 || 1 };
  };

  const gcdMany = (arr: number[]) => arr.reduce((a, b) => gcd(a, b));
  const gcd = (a: number, b: number) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const lcmMany = (arr: number[]) => arr.reduce((a, b) => lcm(a, b), 1);
  const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

  const calculateStoichiometry = () => {
    const rxnStr = (/→|->|⟶|=>/.test(reactionInput)) ? reactionInput : 'H₂ + O₂ → H₂O';
    const parsedReaction = parseReaction(rxnStr);
    const balancedReaction = balanceReaction(parsedReaction);
    setReaction(balancedReaction);

    const entries = reactantsInput
      .map(e => ({ compound: normalizeFormula(e.compound.trim()), mass: parseFloat(e.mass) }))
      .filter(e => e.compound && isFinite(e.mass) && e.mass > 0);

    if (entries.length === 0) return;

    const coeffReact: Record<string, number> = {};
    balancedReaction.reactants.forEach(r => { coeffReact[r.formula] = r.coefficient; });
    const target = (targetCompound && normalizeFormula(targetCompound.trim())) || balancedReaction.products[0]?.formula || '';
    const coeffTarget = balancedReaction.products.find(p => p.formula === target)?.coefficient || 1;

    const steps: string[] = [];
    const molesMap: Record<string, number> = {};
    entries.forEach(e => {
      const MM = getMolarMass(e.compound);
      const mol = e.mass / MM;
      molesMap[e.compound] = mol;
      steps.push(`${e.mass.toFixed(1)} g ${e.compound} ÷ ${MM.toFixed(2)} g/mol = ${mol.toFixed(3)} mol ${e.compound}`);
    });

    let limitingReagent: string | null = null;
    let xExtent = 0;
    let theoreticalMolesTarget = 0;
    const excessReagents: { [key: string]: number } = {};

    if (entries.length >= 2) {
      let minVal = Infinity;
      entries.forEach(e => {
        const nu = coeffReact[e.compound] || 1;
        const mol = molesMap[e.compound] || 0;
        const val = mol / nu;
        steps.push(`${e.compound}: ${mol.toFixed(3)} mol ÷ ${nu} (coeff) = ${val.toFixed(3)}`);
        if (val < minVal) { minVal = val; limitingReagent = e.compound; }
      });
      xExtent = isFinite(minVal) ? minVal : 0;
      if (limitingReagent) steps.push(`(${xExtent.toFixed(3)} is smallest, so ${limitingReagent} is limiting)`);
      theoreticalMolesTarget = xExtent * coeffTarget;
      entries.forEach(e => {
        const nu = coeffReact[e.compound] || 1;
        const mol = molesMap[e.compound] || 0;
        const used = xExtent * nu;
        const remaining = Math.max(0, mol - used);
        if (e.compound !== limitingReagent) {
          excessReagents[e.compound] = remaining;
        }
      });
    } else {
      const e = entries[0];
      const mol = molesMap[e.compound] || 0;
      const nuGiven = coeffReact[e.compound] || 1;
      theoreticalMolesTarget = mol * (coeffTarget / nuGiven);
      limitingReagent = null;
    }

    const targetMM = getMolarMass(target);
    const theoreticalYield = theoreticalMolesTarget * targetMM;

    const balancedEquation = `${balancedReaction.reactants.map(r => `${r.coefficient !== 1 ? r.coefficient : ''}${r.formula}`).join(' + ')} → ${balancedReaction.products.map(p => `${p.coefficient !== 1 ? p.coefficient : ''}${p.formula}`).join(' + ')}`;

    const moleRatios: { [key: string]: number } = {};
    balancedReaction.reactants.forEach(reactant => { moleRatios[reactant.formula] = reactant.coefficient; });
    balancedReaction.products.forEach(product => { moleRatios[product.formula] = product.coefficient; });

    setResults({
      theoreticalYield,
      limitingReagent,
      excessReagents,
      moleRatios,
      balancedEquation,
      calcSteps: steps,
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();
  };

  const ResultCard = ({ title, value, unit, color, description }: any) => {
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }, []);

    return (
      <Animated.View style={[styles.resultCard, { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.resultHeader, { backgroundColor: color + '20' }]}>
          <Text style={[styles.resultTitle, { color }]}>{title}</Text>
          <Text style={styles.resultUnit}>{unit}</Text>
        </View>
        <Text style={styles.resultValue}>{value}</Text>
        <Text style={styles.resultDescription}>{description}</Text>
      </Animated.View>
    );
  };

  const ReactionVisualization = ({ reaction }: { reaction: Reaction }) => {
    const [reactantAnim] = useState(new Animated.Value(0));
    const [productAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.parallel([
        Animated.timing(reactantAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(productAnim, {
          toValue: 1,
          duration: 1000,
          delay: 500,
          useNativeDriver: true,
        })
      ]).start();
    }, []);

    return (
      <View style={styles.reactionViz}>
        <Animated.View style={[styles.reactionSide, { opacity: reactantAnim }]}>
          <Text style={styles.reactionTitle}>Reactants</Text>
          {reaction.reactants.map((compound, index) => (
            <View key={index} style={styles.compoundViz}>
              <View style={[styles.compoundCircle, { backgroundColor: '#FF6B6B' }]}>
                <Text style={styles.compoundFormula}>{compound.formula}</Text>
              </View>
              <Text style={styles.compoundCoeff}>{compound.coefficient}</Text>
            </View>
          ))}
        </Animated.View>
        
        <Text style={styles.reactionArrow}>→</Text>
        
        <Animated.View style={[styles.reactionSide, { opacity: productAnim }]}>
          <Text style={styles.reactionTitle}>Products</Text>
          {reaction.products.map((compound, index) => (
            <View key={index} style={styles.compoundViz}>
              <View style={[styles.compoundCircle, { backgroundColor: '#34A853' }]}>
                <Text style={styles.compoundFormula}>{compound.formula}</Text>
              </View>
              <Text style={styles.compoundCoeff}>{compound.coefficient}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stoich Lab</Text>
        <Text style={styles.subtitle}>Stoichiometry Calculator</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Chemical Reaction</Text>
        <TextInput
          style={[styles.input, styles.inputNeat]}
          placeholder="e.g., H₂ + O₂ → H₂O"
          placeholderTextColor="#999"
          value={reactionInput}
          onChangeText={setReactionInput}
        />
        <Text style={styles.inputHelp}>Use → for products and + for multiple compounds</Text>
      </View>

      

      <View style={styles.calculationSection}>
        <Text style={styles.sectionTitle}>Reactant Amounts</Text>
        {reactantsInput.map((row, idx) => (
          <View key={idx} style={[styles.inputRow, { marginBottom: 12 }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Compound {idx + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder={idx === 0 ? 'H₂' : 'O₂'}
                placeholderTextColor="#999"
                value={row.compound}
                onChangeText={(t) => {
                  const next = [...reactantsInput];
                  next[idx] = { ...next[idx], compound: t };
                  setReactantsInput(next);
                }}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mass (g)</Text>
              <TextInput
                style={styles.input}
                placeholder={idx === 0 ? '10.0' : '80.0'}
                placeholderTextColor="#999"
                value={row.mass}
                onChangeText={(t) => {
                  const next = [...reactantsInput];
                  next[idx] = { ...next[idx], mass: t };
                  setReactantsInput(next);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: '#e9ecef' }]}
          onPress={() => setReactantsInput([...reactantsInput, { compound: '', mass: '' }])}
        >
          <Text style={[styles.calculateButtonText, { color: '#333' }]}>+ Add Reactant</Text>
        </TouchableOpacity>

        <View style={[styles.inputGroup, { marginTop: 16 }]}>
          <Text style={styles.inputLabel}>Target Compound</Text>
          <TextInput
            style={styles.input}
            placeholder="H₂O"
            placeholderTextColor="#999"
            value={targetCompound}
            onChangeText={setTargetCompound}
          />
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={calculateStoichiometry}>
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {results && (
        <Animated.View
          style={[
            styles.resultsSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {reaction && (
            <View style={styles.reactionSection}>
              <Text style={styles.sectionTitle}>Balanced Equation</Text>
              <ReactionVisualization reaction={reaction} />
            </View>
          )}
          <View style={styles.formulaSection}>
            <Text style={styles.formulaTitle}>Balanced Equation</Text>
            <Text style={styles.formula}>{results.balancedEquation}</Text>
          </View>

          <View style={[styles.resultsGrid, { marginTop: 16 }] }>
            <ResultCard
              title="Theoretical Yield"
              value={results.theoreticalYield.toFixed(2)}
              unit="g"
              color="#34A853"
              description="Maximum possible product"
            />
            {results.limitingReagent && (
              <ResultCard
                title="Limiting Reagent"
                value={results.limitingReagent}
                unit=""
                color="#FF6B6B"
                description="Runs out first"
              />
            )}
          </View>

          <View style={styles.moleRatioSection}>
            <Text style={styles.sectionTitle}>Mole Ratios</Text>
            <View style={styles.moleRatioGrid}>
              {Object.entries(results.moleRatios).map(([compound, ratio]) => (
                <View key={compound} style={styles.moleRatioItem}>
                  <Text style={styles.moleRatioCompound}>{compound}</Text>
                  <Text style={styles.moleRatioValue}>{ratio}</Text>
                </View>
              ))}
            </View>
          </View>

          {Object.keys(results.excessReagents).length > 0 && (
            <View style={styles.excessSection}>
              <Text style={styles.sectionTitle}>Excess Reagents</Text>
              {Object.entries(results.excessReagents).map(([compound, moles]) => (
                <View key={compound} style={styles.excessItem}>
                  <Text style={styles.excessCompound}>{compound}</Text>
                  <Text style={styles.excessMoles}>{moles.toFixed(3)} mol ({(moles * getMolarMass(compound)).toFixed(1)} g)</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.formulaSection, { marginTop: 16 }]}>
            <Text style={styles.formulaTitle}>Calculation Breakdown</Text>
            <View style={styles.formulaBox}>
              {results.calcSteps.map((line, i) => (
                <Text key={i} style={styles.formula}>{line}</Text>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputSection: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputNeat: {
    height: 44,
  },
  inputHelp: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  reactionSection: {
    padding: 20,
  },
  reactionViz: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactionSide: {
    alignItems: 'center',
  },
  reactionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  compoundViz: {
    alignItems: 'center',
    marginVertical: 5,
  },
  compoundCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  compoundFormula: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  compoundCoeff: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  reactionArrow: {
    fontSize: 24,
    color: '#34A853',
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  calculationSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    width: '48%',
  },
  calculateButton: {
    backgroundColor: '#34A853',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsSection: {
    margin: 20,
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultUnit: {
    fontSize: 10,
    color: '#666',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  resultDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  moleRatioSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  moleRatioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moleRatioItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  moleRatioCompound: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  moleRatioValue: {
    fontSize: 16,
    color: '#34A853',
    fontWeight: 'bold',
  },
  excessSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  excessItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  excessCompound: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  excessMoles: {
    fontSize: 14,
    color: '#666',
  },
  formulaSection: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  formulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  formulaBox: {
    paddingVertical: 4,
  },
  formula: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    marginVertical: 2,
  },
  databaseSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  databaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  compoundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compoundItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: '45%',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  compoundName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  compoundMass: {
    fontSize: 12,
    color: '#888',
  },
});