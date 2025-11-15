import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface Element {
  symbol: string;
  electronegativity: number;
}

const BondTypeScreen = () => {
  const [element1, setElement1] = useState('');
  const [element2, setElement2] = useState('');
  const [customEN1, setCustomEN1] = useState('');
  const [customEN2, setCustomEN2] = useState('');
  const [result, setResult] = useState<{
    electronegativityDifference: number;
    bondType: string;
    bondCharacter: string;
    percentIonic: number;
  } | null>(null);

  // Comprehensive electronegativity values (Pauling scale)
  const elements: { [key: string]: number } = {
    // Period 1
    'H': 2.20, 'He': 0.00,
    // Period 2
    'Li': 0.98, 'Be': 1.57, 'B': 2.04, 'C': 2.55, 'N': 3.04, 'O': 3.44, 'F': 3.98, 'Ne': 0.00,
    // Period 3
    'Na': 0.93, 'Mg': 1.31, 'Al': 1.61, 'Si': 1.90, 'P': 2.19, 'S': 2.58, 'Cl': 3.16, 'Ar': 0.00,
    // Period 4
    'K': 0.82, 'Ca': 1.00, 'Sc': 1.36, 'Ti': 1.54, 'V': 1.63, 'Cr': 1.66, 'Mn': 1.55, 'Fe': 1.83,
    'Co': 1.88, 'Ni': 1.91, 'Cu': 1.90, 'Zn': 1.65, 'Ga': 1.81, 'Ge': 2.01, 'As': 2.18, 'Se': 2.55,
    'Br': 2.96, 'Kr': 3.00,
    // Period 5
    'Rb': 0.82, 'Sr': 0.95, 'Y': 1.22, 'Zr': 1.33, 'Nb': 1.6, 'Mo': 2.16, 'Tc': 1.9, 'Ru': 2.2,
    'Rh': 2.28, 'Pd': 2.20, 'Ag': 1.93, 'Cd': 1.69, 'In': 1.78, 'Sn': 1.96, 'Sb': 2.05, 'Te': 2.1,
    'I': 2.66, 'Xe': 2.60,
    // Period 6
    'Cs': 0.79, 'Ba': 0.89, 'La': 1.10, 'Ce': 1.12, 'Pr': 1.13, 'Nd': 1.14, 'Pm': 1.13, 'Sm': 1.17,
    'Eu': 1.20, 'Gd': 1.20, 'Tb': 1.10, 'Dy': 1.22, 'Ho': 1.23, 'Er': 1.24, 'Tm': 1.25, 'Yb': 1.10,
    'Lu': 1.27, 'Hf': 1.3, 'Ta': 1.5, 'W': 2.36, 'Re': 1.9, 'Os': 2.2, 'Ir': 2.20, 'Pt': 2.28,
    'Au': 2.54, 'Hg': 2.00, 'Tl': 1.62, 'Pb': 2.33, 'Bi': 2.02, 'Po': 2.0, 'At': 2.2, 'Rn': 2.2
  };

  const getElectronegativity = (element: string, customValue: string) => {
    if (customValue && !isNaN(parseFloat(customValue))) {
      return parseFloat(customValue);
    }
    const upperElement = element.toUpperCase();
    const capitalizedElement = upperElement.charAt(0) + upperElement.slice(1).toLowerCase();
    return elements[capitalizedElement] || elements[upperElement] || null;
  };

  const calculateBondType = () => {
    const en1 = getElectronegativity(element1, customEN1);
    const en2 = getElectronegativity(element2, customEN2);

    if (en1 === null) {
      alert(`Electronegativity value for ${element1} not found. Please enter a custom value or check the spelling.`);
      return;
    }

    if (en2 === null) {
      alert(`Electronegativity value for ${element2} not found. Please enter a custom value or check the spelling.`);
      return;
    }

    // Calculate electronegativity difference
    const enDiff = Math.abs(en1 - en2);
    
    // Determine bond type
    let bondType = '';
    let bondCharacter = '';
    let percentIonic = 0;

    if (enDiff < 0.5) {
      bondType = 'Nonpolar Covalent';
      bondCharacter = 'Electrons are shared equally between atoms';
      percentIonic = Math.round(enDiff * enDiff * 25); // Approximate formula
    } else if (enDiff >= 0.5 && enDiff < 1.7) {
      bondType = 'Polar Covalent';
      bondCharacter = 'Electrons are shared unequally, creating partial charges';
      percentIonic = Math.round(enDiff * enDiff * 25); // Approximate formula
    } else {
      bondType = 'Ionic';
      bondCharacter = 'Electrons are transferred from one atom to another';
      percentIonic = Math.round(enDiff * enDiff * 25); // Approximate formula
      if (percentIonic > 100) percentIonic = 100;
    }

    setResult({
      electronegativityDifference: parseFloat(enDiff.toFixed(2)),
      bondType,
      bondCharacter,
      percentIonic
    });
  };

  // Precompute EN values for visualization shifts
  const en1Val = getElectronegativity(element1, customEN1) ?? 0;
  const en2Val = getElectronegativity(element2, customEN2) ?? 0;
  const enDiffVal = Math.abs(en1Val - en2Val);
  const pairShiftMag = Math.min(12, (enDiffVal / 3.5) * 12);
  const pairTranslateX = result?.bondType === 'Polar Covalent' ? (en2Val > en1Val ? pairShiftMag : -pairShiftMag) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bond Type Predictor</Text>
        <Text style={styles.description}>
          Predict bond types based on electronegativity differences between elements.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Element 1:</Text>
          <TextInput
            style={styles.input}
            value={element1}
            onChangeText={setElement1}
            placeholder="e.g., H, C, O, etc."
          />
          
          <Text style={styles.sublabel}>Custom Electronegativity (optional):</Text>
          <TextInput
            style={styles.input}
            value={customEN1}
            onChangeText={setCustomEN1}
            placeholder="e.g., 2.55"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Element 2:</Text>
          <TextInput
            style={styles.input}
            value={element2}
            onChangeText={setElement2}
            placeholder="e.g., H, C, O, etc."
          />
          
          <Text style={styles.sublabel}>Custom Electronegativity (optional):</Text>
          <TextInput
            style={styles.input}
            value={customEN2}
            onChangeText={setCustomEN2}
            placeholder="e.g., 3.44"
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={calculateBondType}
          disabled={(!element1 && !customEN1) || (!element2 && !customEN2)}
        >
          <Text style={styles.buttonText}>Calculate Bond Type</Text>
        </TouchableOpacity>
      </View>
      
      {result && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          
          <View style={styles.resultContainer}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Electronegativity Difference:</Text>
              <Text style={styles.resultValue}>{result.electronegativityDifference}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Bond Type:</Text>
              <Text style={[
                styles.resultValue, 
                result.bondType === 'Nonpolar Covalent' ? styles.nonpolarText :
                result.bondType === 'Polar Covalent' ? styles.polarText : 
                styles.ionicText
              ]}>
                {result.bondType}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Bond Character:</Text>
              <Text style={styles.resultValue}>{result.bondCharacter}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Percent Ionic Character:</Text>
              <Text style={styles.resultValue}>{result.percentIonic}%</Text>
            </View>
          </View>
          
          <View style={styles.bondVisualization}>
            <Text style={styles.visualizationTitle}>Bond Visualization & Electron Sharing</Text>
            
            <View style={styles.bondDiagram}>
              {/* Removed atom representations */}
              
              <View style={styles.bondRegion}>
                <View style={styles.bondLine} />
                
                {/* Electron sharing visualization */}
                {result.bondType === 'Nonpolar Covalent' && (
                  <View style={styles.electronSharingCentered}>
                    <View style={styles.electronPair}>
                      <Text style={styles.electronDot}>•</Text>
                      <Text style={styles.electronDot}>•</Text>
                    </View>
                    <Text style={styles.sharingLabel}>Equal sharing</Text>
                  </View>
                )}
                
                {result.bondType === 'Polar Covalent' && (
                  <View style={styles.electronSharingCentered}>
                    <View style={[styles.electronPair, { transform: [{ translateX: pairTranslateX }] }]}>
                      <Text style={styles.electronDot}>•</Text>
                      <Text style={styles.electronDot}>•</Text>
                    </View>
                    <Text style={styles.sharingLabel}>Unequal sharing (toward {en2Val >= en1Val ? (element2 || 'Y') : (element1 || 'X')})</Text>
                    <View style={styles.dipoleArrow}>
                      <Text style={styles.dipoleText}>δ{en2Val > en1Val ? '-' : '+'}</Text>
                      <Text style={styles.arrowText}>→</Text>
                      <Text style={styles.dipoleText}>δ{en2Val > en1Val ? '+' : '-'}</Text>
                    </View>
                  </View>
                )}
                
                {result.bondType === 'Ionic' && (
                  <View style={styles.electronSharingCentered}>
                    <View style={styles.electronTransfer}>
                      <Text style={styles.transferArrow}>e⁻ →</Text>
                    </View>
                    <Text style={styles.sharingLabel}>Electron transfer</Text>
                  </View>
                )}
              </View>
              
              <View style={[
                styles.atom, 
                result.bondType === 'Ionic' ? styles.ionicAtom2 :
                result.bondType === 'Polar Covalent' ? styles.polarAtom2 :
                styles.nonpolarAtom
              ]}>
                <Text style={styles.atomText}>{element2}</Text>
                {result.bondType === 'Ionic' && (
                  <Text style={styles.chargeText}>-</Text>
                )}
                {result.bondType === 'Polar Covalent' && (
                  <Text style={styles.partialChargeText}>δ-</Text>
                )}
              </View>
            </View>
            
            {/* Electron configuration explanation */}
            <View style={styles.electronExplanation}>
              <Text style={styles.explanationTitle}>Electron Behavior:</Text>
              {result.bondType === 'Nonpolar Covalent' && (
                <Text style={styles.explanationText}>
                  • Electrons are shared equally between atoms{'\n'}
                  • No partial charges develop{'\n'}
                  • Symmetric electron density
                </Text>
              )}
              {result.bondType === 'Polar Covalent' && (
                <Text style={styles.explanationText}>
                  • Electrons are shared unequally{'\n'}
                  • More electronegative atom attracts electrons{'\n'}
                  • Partial charges (δ+ and δ-) develop{'\n'}
                  • Creates a dipole moment
                </Text>
              )}
              {result.bondType === 'Ionic' && (
                <Text style={styles.explanationText}>
                  • Complete electron transfer occurs{'\n'}
                  • Metal loses electrons → cation (+){'\n'}
                  • Nonmetal gains electrons → anion (-){'\n'}
                  • Electrostatic attraction holds ions together
                </Text>
              )}
            </View>
            {/* Electron shells visualization */}
            <View style={{ marginTop: 16, width: '100%' }}>
              <Text style={styles.explanationTitle}>Electron Shells & Sharing:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                <ShellDiagram symbol={element1 || 'X'} bondType={result.bondType} side="left" en={en1Val} partnerEn={en2Val} />
                <View style={{ width: 100, height: 80, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                  {result.bondType !== 'Ionic' ? (
                    <View style={{ width: 60, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                      {/* shared electron pair(s) */}
                      <View style={{ flexDirection: 'row' }}>
                        <View style={styles.sharedElectronDot} />
                        <View style={styles.sharedElectronDot} />
                      </View>
                      {result.bondType === 'Polar Covalent' && (
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Shifted toward {element2 || 'Y'}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 13, color: '#666' }}>e⁻ transfer →</Text>
                  )}
                </View>
                <ShellDiagram symbol={element2 || 'Y'} bondType={result.bondType} side="right" en={en2Val} partnerEn={en1Val} />
              </View>
            </View>
          </View>

          {/* Combined: add Venn-style overlap visualization here */}
          <View style={styles.bondTypeContainer}>
            <View style={styles.bondTypeRow}>
              <View style={styles.bondTypeVisual}>
                <Text style={styles.bondTypeLabel}>Combined Visualization</Text>
                <View style={styles.vennContainer}>
                  {result.bondType === 'Nonpolar Covalent' && (
                    <>
                      <View style={[styles.vennCircle, styles.nonpolarCircle1]}>
                        <Text style={styles.vennText}>{element1}</Text>
                      </View>
                      <View style={[styles.vennCircle, styles.nonpolarCircle2, styles.vennOverlap]}>
                        <Text style={styles.vennText}>{element2}</Text>
                      </View>
                    </>
                  )}
                  {result.bondType === 'Polar Covalent' && (
                    <>
                      <View style={[styles.vennCircle, styles.polarCircle1]}>
                        <Text style={styles.vennText}>{element1}</Text>
                      </View>
                      <View style={[styles.vennCircle, styles.polarCircle2, styles.vennPartialOverlap]}>
                        <Text style={styles.vennText}>{element2}</Text>
                      </View>
                    </>
                  )}
                  {result.bondType === 'Ionic' && (
                    <>
                      <View style={[styles.vennCircle, styles.ionicCircle1]}>
                        <Text style={styles.vennText}>{element1}</Text>
                      </View>
                      <View style={[styles.vennCircle, styles.ionicCircle2, styles.vennNoOverlap]}>
                        <Text style={styles.vennText}>{element2}</Text>
                      </View>
                    </>
                  )}
                </View>
                <Text style={styles.bondTypeDesc}>For NaCl: ΔEN ≈ 2.23 → Ionic; electron transfer from Na to Cl.</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Electronegativity reference removed per requirements */}
    </ScrollView>
  );
};

// ShellDiagram component visualizes simple Bohr-style shells and valence electrons
const ShellDiagram = ({ symbol, bondType, side, en, partnerEn }: { symbol: string; bondType: string; side: 'left'|'right'; en: number; partnerEn: number }) => {
  // quick valence approximation for common main-group elements
  const valenceMap: {[k:string]: number} = {
    H:1, He:2,
    Li:1, Be:2, B:3, C:4, N:5, O:6, F:7, Ne:8,
    Na:1, Mg:2, Al:3, Si:4, P:5, S:6, Cl:7, Ar:8,
    K:1, Ca:2, Br:7, I:7
  };
  const sym = (symbol || 'X').replace(/\s/g,'').slice(0,2);
  const valence = valenceMap[sym] ?? 4;
  const coreElectrons = Math.min(2, valence); // purely visual; not strict electron count
  const outerElectrons = Math.max(0, valence - coreElectrons);
  const centerColor = side === 'left' ? '#FBBC05' : '#4285F4';
  return (
    <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* nucleus */}
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: centerColor, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color:'#fff', fontWeight:'bold' }}>{sym}</Text>
      </View>
      {/* shells */}
      <View style={{ position:'absolute', width: 70, height: 70, borderRadius: 35, borderColor:'#bbb', borderWidth:1 }} />
      <View style={{ position:'absolute', width: 90, height: 90, borderRadius: 45, borderColor:'#bbb', borderWidth:1 }} />
      {/* electrons (outer) */}
      {Array.from({ length: outerElectrons }).map((_, i) => {
        const theta = i * (2*Math.PI / Math.max(1, outerElectrons));
        const r = 52; // outer shell radius
        const ex = Math.cos(theta) * r;
        const ey = Math.sin(theta) * r;
        // shift magnitude proportional to EN difference for polar covalent
        const enDiff = Math.max(0, partnerEn - en);
        const maxShift = 10; // px
        const polShift = bondType === 'Polar Covalent' ? (side === 'right' ? maxShift * Math.min(1, enDiff / 3.5) : -maxShift * Math.min(1, enDiff / 3.5)) : 0;
        return <View key={`e-${i}`} style={{ position:'absolute', left: 60 + ex + polShift - 4, top: 60 + ey - 4, width: 8, height: 8, borderRadius: 4, backgroundColor:'#2c3e50' }} />
      })}
      {bondType === 'Ionic' && side === 'right' && (
        <View style={{ position: 'absolute', left: 60 + 44, top: 60 - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B' }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
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
  vennContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    marginBottom: 10,
  },
  vennCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  vennText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  nonpolarCircle1: {
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    left: 40,
  },
  nonpolarCircle2: {
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    left: 80,
  },
  polarCircle1: {
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    left: 40,
  },
  polarCircle2: {
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    left: 80,
  },
  ionicCircle1: {
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    left: 30,
  },
  ionicCircle2: {
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    left: 100,
  },
  vennOverlap: {
    zIndex: 1,
  },
  vennPartialOverlap: {
    zIndex: 1,
  },
  vennNoOverlap: {
    zIndex: 1,
  },
  bondTypeContainer: {
    marginTop: 15,
  },
  bondTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  bondTypeVisual: {
    width: 200,
    marginBottom: 20,
    alignItems: 'center',
  },
  bondTypeLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  bondTypeDesc: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
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
  sublabel: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#EA4335',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  resultContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    alignItems: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  nonpolarText: {
    color: '#34A853',
  },
  polarText: {
    color: '#FBBC05',
  },
  ionicText: {
    color: '#EA4335',
  },
  bondVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    alignItems: 'center',
  },
  sharedElectronDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginHorizontal: 2,
  },
  visualizationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  bondDiagram: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  atom: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nonpolarAtom: {
    backgroundColor: '#34A853',
  },
  polarAtom1: {
    backgroundColor: '#FBBC05',
  },
  polarAtom2: {
    backgroundColor: '#4285F4',
  },
  ionicAtom1: {
    backgroundColor: '#EA4335',
  },
  ionicAtom2: {
    backgroundColor: '#4285F4',
  },
  atomText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bondRegion: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bondLine: {
    height: 5,
    backgroundColor: '#333',
    width: 100,
  },
  electronSharing: {
    alignItems: 'center',
    // marginTop: 10, // Removed this line
  },
  electronSharingCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  electronPair: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  electronDot: {
    fontSize: 20,
    color: '#FF6B6B',
    marginHorizontal: 2,
  },
  electronShifted: {
    transform: [{ translateX: 10 }],
  },
  electronTransfer: {
    alignItems: 'center',
  },
  transferArrow: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  sharingLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  chargeText: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#333',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  partialChargeText: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dipoleArrow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  electronExplanation: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dipoleText: {
    fontSize: 16,
    color: '#333',
  },
  arrowText: {
    fontSize: 20,
    color: '#333',
    marginHorizontal: 5,
  },
  tableContainer: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});

export default BondTypeScreen;