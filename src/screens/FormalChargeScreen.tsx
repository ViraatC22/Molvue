import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView } from 'react-native';

interface Atom {
  id: string;
  element: string;
  valenceElectrons: number;
  nonbondingElectrons: number;
  bondingElectrons: number;
  position?: { x: number; y: number };
}

type BondOrder = 'single' | 'double' | 'triple';

interface MoleculeData {
  atoms: Atom[];
  bonds: { from: string; to: string; type: BondOrder }[];
  lewisStructure: string;
}

interface ResonanceForm {
  bonds: { from: string; to: string; type: BondOrder }[];
  charges?: { [id: string]: number };
}

const FormalChargeScreen = () => {
  const [formula, setFormula] = useState('');
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [results, setResults] = useState<{element: string, formalCharge: number, id: string}[]>([]);
  const [resonanceStructures, setResonanceStructures] = useState<string[]>([]);
  const [resonanceForms, setResonanceForms] = useState<ResonanceForm[]>([]);
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);

  // Valence electrons for common elements
  const valenceElectrons: {[key: string]: number} = {
    'H': 1, 'He': 2, 'Li': 1, 'Be': 2, 'B': 3, 'C': 4, 'N': 5, 'O': 6, 'F': 7, 'Ne': 8,
    'Na': 1, 'Mg': 2, 'Al': 3, 'Si': 4, 'P': 5, 'S': 6, 'Cl': 7, 'Ar': 8,
    'K': 1, 'Ca': 2, 'Br': 7, 'I': 7
  };

  // Quick presets (used only for parsing examples; UI now single-input)
  const moleculePresets = {
    'H2O': 'H2O',
    'CO3^2-': 'CO3^2-',
    'NO3^-': 'NO3^-',
    'SO4^2-': 'SO4^2-'
  } as const;

  // Parse formula into atoms and approximate bonds/electron counts
  const parseFormulaToAtoms = (f: string) => {
    if (!f) {
      setAtoms([]);
      setResults([]);
      setResonanceStructures([]);
      setMoleculeData(null);
      return;
    }
    const tokenMatches = Array.from(f.matchAll(/([A-Z][a-z]?)(\d*)/g));
    const tokens = tokenMatches.map(m => ({ el: m[1], count: m[2] ? parseInt(m[2]) : 1 }));
    if (tokens.length === 0) return;

    const firstNonHIdx = tokens.findIndex(t => t.el !== 'H');
    const central = firstNonHIdx !== -1 ? tokens[firstNonHIdx].el : tokens[0].el;

    const newAtoms: Atom[] = [];
    // create central atom first
    const centralId = `c-${Date.now()}`;
    const centralValence = valenceElectrons[central] ?? 4;
    let neighborCount = 0;
    tokens.forEach((t, idx) => {
      if (t.el === central && idx === (firstNonHIdx !== -1 ? firstNonHIdx : 0)) return;
      neighborCount += t.count;
    });
    newAtoms.push({
      id: centralId,
      element: central,
      valenceElectrons: centralValence,
      nonbondingElectrons: Math.max(0, (centralValence - neighborCount) * 1 > 0 ? (centralValence - neighborCount) : 0) * 1, // placeholder; refined below
      bondingElectrons: Math.max(0, neighborCount * 2),
    });

    // neighbors single-bond by default
    tokens.forEach((t, idx) => {
      const isCentralToken = t.el === central && idx === (firstNonHIdx !== -1 ? firstNonHIdx : 0);
      for (let i = 0; i < t.count; i++) {
        if (isCentralToken) continue;
        const el = t.el;
        const ve = valenceElectrons[el] ?? 4;
        const bonding = el === 'H' ? 2 : 2; // single bond
        const nonbonding = el === 'H' ? 0 : Math.max(0, ve - 2);
        newAtoms.push({
          id: `${el}-${idx}-${i}-${Date.now()}`,
          element: el,
          valenceElectrons: ve,
          nonbondingElectrons: nonbonding,
          bondingElectrons: bonding,
        });
      }
    });

    // simple special-case: carbonate/nitrate/sulfate distribute double bonds
    const oxygenIndices = newAtoms.map((a, i) => (a.element === 'O' ? i : -1)).filter(i => i !== -1);
    if ((/CO3/i.test(f) && oxygenIndices.length === 3) || (/NO3/i.test(f) && oxygenIndices.length === 3) || (/SO4/i.test(f) && oxygenIndices.length === 4)) {
      const doubles = (/SO4/i.test(f)) ? 2 : 1; // common depiction
      for (let d = 0; d < doubles && d < oxygenIndices.length; d++) {
        const oi = oxygenIndices[d];
        newAtoms[oi].bondingElectrons = 4; // double bond
        newAtoms[oi].nonbondingElectrons = Math.max(0, (valenceElectrons['O'] ?? 6) - 4);
      }
      // adjust central lone pairs approximation
      const ci = 0;
      const totalBondingFromNeighbors = newAtoms.slice(1).reduce((sum, a) => sum + a.bondingElectrons, 0);
      newAtoms[ci].bondingElectrons = totalBondingFromNeighbors; // central accounts for all bonds
      newAtoms[ci].nonbondingElectrons = Math.max(0, centralValence - (newAtoms[ci].bondingElectrons / 2));
    }

    setAtoms(newAtoms);
  };

  // Auto-calculate when formula changes
  React.useEffect(() => {
    parseFormulaToAtoms(formula);
    if (formula) {
      calculateFormalCharges();
    } else {
      setResults([]);
      setResonanceStructures([]);
      setMoleculeData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formula]);

  const removeAtom = (id: string) => {
    setAtoms(atoms.filter(atom => atom.id !== id));
  };

  const updateAtom = (id: string, field: keyof Atom, value: string) => {
    const updatedAtoms = atoms.map(atom => {
      if (atom.id === id) {
        if (field === 'element' && value.toUpperCase() in valenceElectrons) {
          const element = value.toUpperCase();
          return {
            ...atom,
            element,
            valenceElectrons: valenceElectrons[element]
          };
        } else if (field === 'element') {
          return { ...atom, [field]: value.toUpperCase() };
        } else {
          return { ...atom, [field]: parseInt(value) || 0 };
        }
      }
      return atom;
    });
    
    setAtoms(updatedAtoms);
  };

  const toBondOrder = (pairs: number): BondOrder => (pairs >= 3 ? 'triple' : pairs === 2 ? 'double' : 'single');

  const buildLewisData = (atomsIn: Atom[]): MoleculeData => {
    if (atomsIn.length === 0) {
      return { atoms: [], bonds: [], lewisStructure: '' };
    }
    const centralAtom = atomsIn.find(a => ['C','N','S','P'].includes(a.element)) || atomsIn[0];
    const others = atomsIn.filter(a => a.id !== centralAtom.id);
    // text
    let text = centralAtom.element;
    if (others.length > 0) {
      const bonded = others.map(o => {
        const b = o.bondingElectrons / 2;
        const sym = b === 3 ? '≡' : b === 2 ? '=' : '-';
        return sym + o.element;
      }).join('');
      text = `${text}(${bonded})`;
    }
    const lpCenter = centralAtom.nonbondingElectrons / 2;
    if (lpCenter > 0) text += ` [${lpCenter} lone pairs]`;

    // bonds
    const bonds: { from: string; to: string; type: BondOrder }[] = [];
    others.forEach(o => {
      const b = Math.round(o.bondingElectrons / 2);
      if (b > 0) {
        bonds.push({ from: centralAtom.id, to: o.id, type: toBondOrder(b) });
      }
    });

    // positions (simple radial layout)
    const radius = 90;
    atomsIn.forEach(a => {
      if (a.id === centralAtom.id) {
        a.position = { x: 0, y: 0 };
      } else {
        const idx = others.findIndex(x => x.id === a.id);
        const angle = idx >= 0 ? (idx * (2 * Math.PI / others.length)) : 0;
        a.position = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
      }
    });

    // Special case for CH4 to approximate tetrahedral geometry
    if (centralAtom.element === 'C' && others.length === 4 && others.every(o => o.element === 'H')) {
      const tetrahedralPositions = [
        { x: 0, y: radius }, // Top
        { x: radius * Math.cos(Math.PI * 7 / 6), y: radius * Math.sin(Math.PI * 7 / 6) }, // Bottom-left
        { x: radius * Math.cos(Math.PI * 11 / 6), y: radius * Math.sin(Math.PI * 11 / 6) }, // Bottom-right
        { x: 0, y: -radius } // Back (adjust as needed for 2D projection)
      ];
      others.forEach((otherAtom, index) => {
        otherAtom.position = tetrahedralPositions[index];
      });
    }

    return { atoms: atomsIn, bonds, lewisStructure: text };
  };

  const calculateFormalCharges = () => {
    if (atoms.length === 0) {
      return;
    }

    const charges = atoms.map(atom => {
      // Formal Charge = Valence Electrons - (Nonbonding Electrons + Bonding Electrons/2)
      const formalCharge = atom.valenceElectrons - (atom.nonbondingElectrons + atom.bondingElectrons / 2);
      return { element: atom.element, formalCharge, id: atom.id };
    });
    
    setResults(charges);
    
    // Generate Lewis data
    const md = buildLewisData([...atoms.map(a => ({...a}))]);
    setMoleculeData(md);
    
    // Generate resonance structures
    if (atoms.length > 1) {
      generateResonanceStructures();
    }
  };

  const generateResonanceStructures = () => {
    const structures: string[] = [];
    const forms: ResonanceForm[] = [];
    
    // Enhanced resonance structure generation based on molecular formula and atoms
    const centralAtoms = atoms.filter(a => ['C', 'N', 'S', 'P'].includes(a.element));
    const oxygenAtoms = atoms.filter(a => a.element === 'O');
    
    if (formula.includes('CO3') || (centralAtoms.some(a => a.element === 'C') && oxygenAtoms.length === 3)) {
      structures.push(
        'Structure 1: O=C(O⁻)O⁻ (C has formal charge 0)',
        'Structure 2: O⁻-C(=O)O⁻ (C has formal charge 0)', 
        'Structure 3: O⁻-C(O⁻)=O (C has formal charge 0)',
        'All structures are equivalent due to resonance'
      );
      if (moleculeData) {
        const centerId = moleculeData.atoms.find(a => a.element === 'C')?.id || moleculeData.atoms[0].id;
        const oxyIds = moleculeData.atoms.filter(a => a.element === 'O').map(a => a.id);
        oxyIds.forEach((doubleId, i) => {
          const bonds = oxyIds.map(oid => ({ from: centerId, to: oid, type: (oid === doubleId ? 'double' : 'single') as BondOrder }));
          forms.push({ bonds });
        });
      }
    } else if (formula.includes('NO3') || (centralAtoms.some(a => a.element === 'N') && oxygenAtoms.length === 3)) {
      structures.push(
        'Structure 1: O=N(O⁻)O⁻ (N has formal charge +1)',
        'Structure 2: O⁻-N(=O)O⁻ (N has formal charge +1)',
        'Structure 3: O⁻-N(O⁻)=O (N has formal charge +1)',
        'Resonance stabilizes the negative charges on oxygen atoms'
      );
      if (moleculeData) {
        const centerId = moleculeData.atoms.find(a => a.element === 'N')?.id || moleculeData.atoms[0].id;
        const oxyIds = moleculeData.atoms.filter(a => a.element === 'O').map(a => a.id);
        oxyIds.forEach(doubleId => {
          const charges: {[id:string]: number} = {};
          charges[centerId] = +1;
          oxyIds.forEach(oid => { charges[oid] = oid === doubleId ? 0 : -1; });
          const bonds = oxyIds.map(oid => ({ from: centerId, to: oid, type: (oid === doubleId ? 'double' : 'single') as BondOrder }));
          forms.push({ bonds, charges });
        });
      }
    } else if (formula.includes('SO4') || (centralAtoms.some(a => a.element === 'S') && oxygenAtoms.length === 4)) {
      structures.push(
        'Structure 1: O=S(=O)(O⁻)O⁻ (S has formal charge 0)',
        'Structure 2: O⁻-S(=O)(=O)O⁻ (S has formal charge 0)',
        'Multiple resonance forms with different double bond positions',
        'Sulfur can expand its octet using d-orbitals'
      );
      if (moleculeData) {
        const centerId = moleculeData.atoms.find(a => a.element === 'S')?.id || moleculeData.atoms[0].id;
        const oxy = moleculeData.atoms.filter(a => a.element === 'O').map(a => a.id);
        // choose pairs of doubles
        for (let i = 0; i < oxy.length; i++) {
          for (let j = i + 1; j < oxy.length; j++) {
            const bonds = oxy.map(oid => ({ from: centerId, to: oid, type: ((oid === oxy[i] || oid === oxy[j]) ? 'double' : 'single') as BondOrder }));
            forms.push({ bonds });
          }
        }
      }
    } else if (atoms.some(a => a.element === 'C') && atoms.some(a => a.element === 'O')) {
      const carbonAtoms = atoms.filter(a => a.element === 'C');
      const oxygenCount = oxygenAtoms.length;
      
      if (oxygenCount === 1) {
        structures.push(
          'C=O (Carbonyl group - aldehydes/ketones)',
          'C⁺-O⁻ (Ionic resonance form)',
          'The C=O form is more stable due to electronegativity'
        );
      } else if (oxygenCount === 2) {
        structures.push(
          'O=C=O (Carbon dioxide - linear)',
          'O⁺≡C-O⁻ (Less favorable resonance form)',
          'Symmetric structure with equal C=O bonds'
        );
      }
    } else if (atoms.some(a => a.element === 'N') && atoms.some(a => a.element === 'O')) {
      structures.push(
        'N=O (Nitric oxide)',
        'N⁺-O⁻ (Ionic character)',
        'Radical species with unpaired electron'
      );
    } else {
      // General case for other molecules
      const hasMultipleBonds = atoms.some(a => a.bondingElectrons > 2);
      if (hasMultipleBonds) {
        structures.push(
          'Multiple bonding patterns possible',
          'Consider moving electron pairs between atoms',
          'Formal charges should sum to molecular charge'
        );
      } else {
        structures.push('Single Lewis structure - no significant resonance forms');
      }
    }
    
    setResonanceStructures(structures.length > 0 ? structures : ['No resonance structures identified']);
    setResonanceForms(forms);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Formal Charge Calculator</Text>
        <Text style={styles.description}>
          Enter a molecule formula; we auto-derive atoms, Lewis structure, formal charges, and resonance forms as you type.
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Molecule:</Text>
          <TextInput
            style={styles.input}
            value={formula}
            onChangeText={setFormula}
            placeholder="e.g., H2O, CO3^2-, NO3^-, NaCl"
          />
        </View>
      </View>
      

      
      {results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results & Analysis</Text>
          
          {/* Lewis Structure */}
          {moleculeData && (
            <View style={styles.lewisContainer}>
              <Text style={styles.resultsHeader}>Lewis Structure:</Text>
              <View style={styles.lewisStructureVisual}>
                 {!moleculeData && <Text style={{ color: 'red' }}>No molecule data to display.</Text>}
                 {/* atoms */}
                 {moleculeData && moleculeData.atoms.map((atom) => {
                  const fc = results.find(r => r.id === atom.id)?.formalCharge || 0;
                  const chargeDisplay = fc === 0 ? '' : fc > 0 ? `+${fc}` : `${fc}`;
                  const cx = 120 + (atom.position?.x || 0);
                  const cy = 100 + (atom.position?.y || 0);
                  return (
                    <View key={atom.id} style={{ position: 'absolute', left: cx - 20, top: cy - 20 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{atom.element}{chargeDisplay}</Text>
                      </View>
                      {/* lone pairs */}
                      {Array.from({ length: Math.floor(atom.nonbondingElectrons / 2) }).map((_, i) => {
                        // Position lone pairs more accurately based on bond directions or a fixed offset
                        // For simplicity, let's place them to the top-right of the atom for now
                        // A more sophisticated approach would consider available space and bond angles
                        const lpOffset = 20; // Offset from the center of the atom
                        const lpSize = 6; // Size of each lone pair dot
                        return (
                          <View key={`lp-${atom.id}-${i}`} style={{
                            position: 'absolute',
                            left: 20 + lpOffset + (i * (lpSize + 2)), // Adjust position for multiple lone pairs
                            top: 20 - lpOffset,
                            width: lpSize,
                            height: lpSize,
                            borderRadius: lpSize / 2,
                            backgroundColor: '#2ecc71'
                          }} />
                        );
                      })}
                    </View>
                  );
                })}
                {/* bonds */}
                {moleculeData.bonds.map((b, i) => {
                  const from = moleculeData.atoms.find(a => a.id === b.from)!;
                  const to = moleculeData.atoms.find(a => a.id === b.to)!;
                  const x1 = 120 + (from.position?.x || 0);
                  const y1 = 100 + (from.position?.y || 0);
                  const x2 = 120 + (to.position?.x || 0);
                  const y2 = 100 + (to.position?.y || 0);
                  const dx = x2 - x1; const dy = y2 - y1;
                  const len = Math.sqrt(dx*dx + dy*dy);
                  const angle = Math.atan2(dy, dx);
                  const bondThickness = 2; // Thickness of each bond line
                  const bondSpacing = 4; // Spacing between multiple bond lines
                  
                  let bondLines: number[] = [];
                  if (b.type === 'single') {
                    bondLines = [0];
                  } else if (b.type === 'double') {
                    bondLines = [-bondSpacing / 2, bondSpacing / 2];
                  } else if (b.type === 'triple') {
                    bondLines = [-bondSpacing, 0, bondSpacing];
                  }
                  
                  return (
                    <View key={`bond-line-${i}`} style={{ position: 'absolute', left: x1, top: y1 }}>
                      {bondLines.map((offset, j) => (
                        <View
                          key={`seg-${i}-${j}`}
                          style={{
                            position: 'absolute',
                            width: len,
                            height: bondThickness,
                            backgroundColor: '#333',
                            transform: [
                              { translateX: 0 },
                              { translateY: offset },
                              { rotate: `${angle}rad` },
                            ],
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          
          {/* Formal Charges */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Formal Charges:</Text>
            <View style={styles.chargeGrid}>
              {results.map((result) => (
                <View key={result.id} style={styles.chargeItem}>
                  <Text style={styles.elementSymbol}>{result.element}</Text>
                  <Text style={[
                    styles.chargeValue,
                    result.formalCharge > 0 ? styles.positiveCharge :
                    result.formalCharge < 0 ? styles.negativeCharge :
                    styles.neutralCharge
                  ]}>
                    {result.formalCharge > 0 ? '+' : ''}{result.formalCharge}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Charge Analysis */}
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Charge Analysis:</Text>
              <Text style={styles.analysisText}>
                • Total formal charge: {results.reduce((sum, r) => sum + r.formalCharge, 0)}{'\n'}
                • Best structures minimize formal charges{'\n'}
                • Negative charges should be on most electronegative atoms{'\n'}
                • Sum of formal charges = molecular charge
              </Text>
            </View>
          </View>
          
          {/* Resonance Structures */}
          {resonanceStructures.length > 0 && (
            <View style={styles.resonanceContainer}>
              <Text style={styles.resultsHeader}>Resonance Analysis:</Text>
              {resonanceStructures.map((structure, index) => (
                <View key={index} style={styles.resonanceItem}>
                  <Text style={styles.resonanceText}>{structure}</Text>
                </View>
              ))}
              {/* visual forms */}
              {resonanceForms.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  {resonanceForms.map((form, idx) => (
                    <View key={`rf-${idx}`} style={{ width: 220, height: 180, marginRight: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }}>
                      {/* atoms reuse positions */}
                      {moleculeData!.atoms.map(atom => {
                        const cx = 100 + (atom.position?.x || 0) * 0.8;
                        const cy = 80 + (atom.position?.y || 0) * 0.8;
                        const ch = form.charges?.[atom.id] ?? 0;
                        const chargeDisplay = ch === 0 ? '' : ch > 0 ? `+${ch}` : `${ch}`;
                        return (
                          <View key={`rfa-${idx}-${atom.id}`} style={{ position: 'absolute', left: cx - 16, top: cy - 16 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#8e44ad', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{atom.element}{chargeDisplay}</Text>
                            </View>
                          </View>
                        );
                      })}
                      {form.bonds.map((b, bi) => {
                        const from = moleculeData!.atoms.find(a => a.id === b.from)!;
                        const to = moleculeData!.atoms.find(a => a.id === b.to)!;
                        const x1 = 100 + (from.position?.x || 0) * 0.8;
                        const y1 = 80 + (from.position?.y || 0) * 0.8;
                        const x2 = 100 + (to.position?.x || 0) * 0.8;
                        const y2 = 80 + (to.position?.y || 0) * 0.8;
                        const dx = x2 - x1; const dy = y2 - y1;
                        const len = Math.sqrt(dx*dx + dy*dy);
                        const angle = Math.atan2(dy, dx);
                        const lines = b.type === 'single' ? [0] : b.type === 'double' ? [-2, 2] : [-3, 0, 3];
                        return (
                          <View key={`rfb-${idx}-${bi}`} style={{ position: 'absolute', left: x1, top: y1 }}>
                            {lines.map((off, j) => (
                              <View key={`rfseg-${idx}-${bi}-${j}`} style={{ position: 'absolute', width: len, height: 2, backgroundColor: '#333', transform: [{ translateY: off }, { rotate: `${angle}rad` }], borderRadius: 2 }} />
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </ScrollView>
              )}
              
              <View style={styles.resonanceNote}>
                <Text style={styles.noteTitle}>Understanding Resonance:</Text>
                <Text style={styles.noteText}>
                  • Resonance structures show different electron arrangements{'\n'}
                  • The actual molecule is a hybrid of all forms{'\n'}
                  • More stable forms contribute more to the hybrid{'\n'}
                  • Resonance stabilizes the molecule
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lewisStructureVisual: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    height: 300, // Added fixed height
    width: '100%', // Ensure it takes full width
    borderWidth: 1, // Added border for debugging
    borderColor: 'red', // Added border for debugging
  },
  atomContainer: {
    margin: 10,
    position: 'relative',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  modeContainer: {
    marginBottom: 20,
  },
  modeButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#4285F4',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeModeButtonText: {
    color: '#fff',
  },
  presetContainer: {
    marginBottom: 20,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  presetButton: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPreset: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4285F4',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  manualContainer: {
    marginBottom: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  atomContainerBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  atomVisual: {
    margin: 5,
    position: 'relative',
    alignItems: 'center',
  },
  atomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  atomLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  atomInputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  elementInput: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  numberInput: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  primaryButtonText: {
    color: '#fff',
  },
  lewisContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  lewisStructure: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  lewisText: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#333',
    textAlign: 'center',
  },
  lewisNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  chargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  chargeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  elementSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chargeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positiveCharge: {
    color: '#ff4444',
  },
  negativeCharge: {
    color: '#4285F4',
  },
  neutralCharge: {
    color: '#34A853',
  },
  analysisContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  analysisText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  resonanceContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34A853',
  },
  resonanceItem: {
    padding: 8,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#4285F4',
  },
  resonanceText: {
    fontSize: 16,
    color: '#333',
  },
  resonanceNote: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#34A853',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default FormalChargeScreen;