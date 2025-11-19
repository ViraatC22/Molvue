import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const LatticeEnergyScreen = ({ navigation, route }: any) => {
  const [cation, setCation] = useState('');
  const [anion, setAnion] = useState('');
  const [cationCharge, setCationCharge] = useState('');
  const [anionCharge, setAnionCharge] = useState('');
  const [cationChargeEdited, setCationChargeEdited] = useState(false);
  const [anionChargeEdited, setAnionChargeEdited] = useState(false);
  const [cationRadius, setCationRadius] = useState('');
  const [anionRadius, setAnionRadius] = useState('');
  const [latticeEnergy, setLatticeEnergy] = useState<number | null>(null);
  const [compoundFormula, setCompoundFormula] = useState('');
  const [calcSteps, setCalcSteps] = useState<{label: string; value: string}[]>([]);

  // Common ion radii in picometers
  const ionRadii: {[key: string]: number} = {
    // Group 1 (Alkali metals)
    'Li+': 76, 'Na+': 102, 'K+': 138, 'Rb+': 152, 'Cs+': 167,
    // Group 2 (Alkaline earth metals)
    'Be2+': 45, 'Mg2+': 72, 'Ca2+': 100, 'Sr2+': 118, 'Ba2+': 135,
    // Transition metals
    'Sc3+': 74.5, 'Ti2+': 86, 'Ti3+': 67, 'Ti4+': 42,
    'V2+': 79, 'V3+': 64, 'V4+': 58, 'V5+': 54,
    'Cr2+': 80, 'Cr3+': 61.5, 'Mn2+': 67, 'Mn3+': 58, 'Mn4+': 53,
    'Fe2+': 78, 'Fe3+': 64.5, 'Co2+': 74.5, 'Co3+': 61,
    'Ni2+': 69, 'Cu+': 77, 'Cu2+': 73, 'Zn2+': 74,
    'Y3+': 90, 'Zr4+': 72, 'Nb5+': 64, 'Mo6+': 59,
    'Ru3+': 68, 'Rh3+': 66.5, 'Pd2+': 86, 'Ag+': 115,
    'Cd2+': 95, 'La3+': 103.2, 'Hf4+': 71,
    // Main group metals
    'Al3+': 53.5, 'Ga3+': 62, 'In3+': 80, 'Tl3+': 88.5,
    'Sn2+': 118, 'Sn4+': 69, 'Pb2+': 119, 'Pb4+': 77.5,
    'Bi3+': 103, 'Bi5+': 76,
    // Non-metals (anions)
    'F-': 133, 'Cl-': 181, 'Br-': 196, 'I-': 220,
    'O2-': 140, 'S2-': 184, 'Se2-': 198, 'Te2-': 221,
    'N3-': 171, 'P3-': 212, 'As3-': 222, 'Sb3-': 245,
    'H-': 154, 'C4-': 260, 'Si4-': 271,
    // Oxyanions
    'OH-': 137, 'NO2-': 192, 'NO3-': 179,
    'CO32-': 178, 'SO42-': 230, 'PO43-': 238,
    'ClO4-': 240, 'MnO4-': 240
  };
  
  // Common element charges for auto-determination
  const commonCationCharges: {[key: string]: number[]} = {
    'Li': [1], 'Na': [1], 'K': [1], 'Rb': [1], 'Cs': [1], 'Fr': [1],
    'Be': [2], 'Mg': [2], 'Ca': [2], 'Sr': [2], 'Ba': [2], 'Ra': [2],
    'Al': [3], 'Ga': [3], 'In': [3], 'Sc': [3], 'Y': [3], 'La': [3],
    'Ti': [2, 3, 4], 'V': [2, 3, 4, 5], 'Cr': [2, 3, 6], 'Mn': [2, 3, 4, 7],
    'Fe': [2, 3], 'Co': [2, 3], 'Ni': [2], 'Cu': [1, 2], 'Zn': [2],
    'Ag': [1], 'Cd': [2], 'Hg': [1, 2], 'Pb': [2, 4], 'Sn': [2, 4]
  };
  
  const commonAnionCharges: {[key: string]: number[]} = {
    'F': [-1], 'Cl': [-1], 'Br': [-1], 'I': [-1], 'At': [-1],
    'O': [-2], 'S': [-2], 'Se': [-2], 'Te': [-2],
    'N': [-3], 'P': [-3], 'As': [-3],
    'C': [-4], 'Si': [-4]
  };
  
  // Helper to build ion keys like "Na+", "Ca2+", "Cl-", "O2-"
  const ionKeyFor = (element: string, chargeText: string, defaultCharges?: number[]): string | null => {
    const z = parseFloat(chargeText);
    const charge = !isNaN(z) ? z : (defaultCharges && defaultCharges.length ? defaultCharges[0] : NaN);
    if (isNaN(charge)) return null;
    const sign = charge > 0 ? '+' : '-';
    const mag = Math.abs(charge);
    // Format like Ca2+ or O2- (magnitude before sign)
    return `${element}${mag > 1 ? mag : ''}${sign}`;
  };

  // Auto-determine charges whenever element changes (prevents stale charge persistence)
  useEffect(() => {
    if (!cation) {
      setCationCharge('');
      setCationChargeEdited(false);
      return;
    }
    const charges = commonCationCharges[cation];
    if (charges && charges.length > 0) {
      setCationCharge(charges[0].toString());
      setCationChargeEdited(false);
    }
  }, [cation]);
  
  useEffect(() => {
    if (!anion) {
      setAnionCharge('');
      setAnionChargeEdited(false);
      return;
    }
    const charges = commonAnionCharges[anion];
    if (charges && charges.length > 0) {
      setAnionCharge(charges[0].toString());
      setAnionChargeEdited(false);
    }
  }, [anion]);

  // Auto-calculate ionic radii based on element and charge
  useEffect(() => {
    if (!cation) {
      setCationRadius('');
      return;
    }
    const key = ionKeyFor(cation, cationCharge, commonCationCharges[cation]);
    if (key && ionRadii[key]) {
      setCationRadius(ionRadii[key].toString());
    }
  }, [cation, cationCharge]);

  useEffect(() => {
    if (!anion) {
      setAnionRadius('');
      return;
    }
    const key = ionKeyFor(anion, anionCharge, commonAnionCharges[anion]);
    if (key && ionRadii[key]) {
      setAnionRadius(ionRadii[key].toString());
    }
  }, [anion, anionCharge]);

  const calculateLatticeEnergy = () => {
    // Get charges
    const z1 = parseFloat(cationCharge) || 1;
    const z2 = parseFloat(anionCharge) || 1;
    
    // Get radii in meters (convert from picometers)
    let r1 = parseFloat(cationRadius) || 0;
    let r2 = parseFloat(anionRadius) || 0;
    
    // If radius not provided, try to get from common ions
    if (r1 === 0 && cation) {
      const ionKey = `${cation}${Math.abs(z1) > 1 ? Math.abs(z1) : ''}${z1 > 0 ? '+' : '-'}`;
      r1 = ionRadii[ionKey] || 0;
    }
    
    if (r2 === 0 && anion) {
      const ionKey = `${anion}${Math.abs(z2) > 1 ? Math.abs(z2) : ''}${z2 < 0 ? '-' : '+'}`;
      r2 = ionRadii[ionKey] || 0;
    }
    
    if (r1 === 0 || r2 === 0) {
      alert('Please enter valid ionic radii or select common ions');
      return;
    }
    
    // Convert to meters
    const r1m = r1 * 1e-12;
    const r2m = r2 * 1e-12;
    
    // Constants
    const e = 1.602176634e-19; // elementary charge in coulombs
    const epsilon0 = 8.8541878128e-12; // vacuum permittivity in F/m
    const NA = 6.02214076e23; // Avogadro's number
    const k = 9e9; // Coulomb constant in N·m²/C²
    
    // Calculate distance between ions (sum of radii)
    const r = r1m + r2m;
    
    // Calculate Madelung constant (simplified approximation)
    const madelung = 1.7476; // NaCl structure approximation
    
    // Calculate lattice energy using Born-Landé equation (simplified)
    // U = -M * (z1 * z2 * e²) / (4 * π * ε₀ * r) * (1 - 1/n)
    // where n is the Born exponent (typically 5-12)
    const n = 9; // typical value for ionic compounds
    
    // Simplified calculation
    const energy = -madelung * k * Math.abs(z1 * z2) * (e * e) / r * (1 - 1/n);
    
    // Convert to kJ/mol
    const latticeEnergyKJMol = energy * NA / 1000;
    
    // Round to nearest whole number
    const roundedEnergy = Math.round(Math.abs(latticeEnergyKJMol));
    
    setLatticeEnergy(roundedEnergy);
    
    // Capture calculation steps for display
    setCalcSteps([
      { label: 'Cation charge (z1)', value: z1.toString() },
      { label: 'Anion charge (z2)', value: z2.toString() },
      { label: 'Cation radius (pm)', value: r1.toString() },
      { label: 'Anion radius (pm)', value: r2.toString() },
      { label: 'Separation r (m)', value: r.toExponential(3) },
      { label: 'Madelung constant (M)', value: madelung.toString() },
      { label: 'Born exponent (n)', value: n.toString() },
      { label: 'Energy per ion pair (J)', value: Math.abs(energy).toExponential(3) },
      { label: 'Lattice energy (kJ/mol)', value: roundedEnergy.toString() },
    ]);
    
    // Generate chemical formula
    generateFormula(z1, z2);
  };

  const generateFormula = (cationCharge: number, anionCharge: number) => {
    if (!cation || !anion) return;
    
    // Find the lowest common multiple to get the simplest formula
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
    
    const cationMultiplier = Math.abs(anionCharge);
    const anionMultiplier = Math.abs(cationCharge);
    
    // Simplify the formula if possible
    const divisor = gcd(cationMultiplier, anionMultiplier);
    const simpleCationMultiplier = cationMultiplier / divisor;
    const simpleAnionMultiplier = anionMultiplier / divisor;
    
    let formula = '';
    
    // Add cation with multiplier if needed
    formula += cation;
    if (simpleCationMultiplier > 1) {
      formula += simpleCationMultiplier;
    }
    
    // Add anion with multiplier if needed
    formula += anion;
    if (simpleAnionMultiplier > 1) {
      formula += simpleAnionMultiplier;
    }
    
    setCompoundFormula(formula);
  };

  useEffect(() => {
    const p = route?.params?.prefill || route?.params;
    if (p) {
      if (p.cation != null) setCation(String(p.cation));
      if (p.anion != null) setAnion(String(p.anion));
      if (p.cationCharge != null) { setCationCharge(String(p.cationCharge)); setCationChargeEdited(true); }
      if (p.anionCharge != null) { setAnionCharge(String(p.anionCharge)); setAnionChargeEdited(true); }
      if (p.cationRadius != null) setCationRadius(String(p.cationRadius));
      if (p.anionRadius != null) setAnionRadius(String(p.anionRadius));
    }
    if (route?.params?.autoRun) {
      calculateLatticeEnergy();
    }
  }, [route?.params]);

  

  return (
    <ScrollView style={styles.container}>
      {route?.params?.fromPractice && (
        <View style={styles.backRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back to Question</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lattice Energy Estimator</Text>
        <Text style={styles.description}>
          Estimate the lattice energy of ionic compounds using Coulomb's Law and ionic radii.
        </Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cation:</Text>
            <TextInput
              style={styles.input}
              value={cation}
              onChangeText={setCation}
              placeholder="e.g., Na, Ca"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Charge:</Text>
            <TextInput
              style={styles.input}
              value={cationCharge}
              onChangeText={(t) => { setCationCharge(t); setCationChargeEdited(true); }}
              placeholder="Auto-determined"
              keyboardType="numeric"
            />
            {cation && commonCationCharges[cation] && commonCationCharges[cation].length > 1 && (
              <Text style={styles.autoChargeNote}>
                {cation} can have charges: {commonCationCharges[cation].join(', ')}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Anion:</Text>
            <TextInput
              style={styles.input}
              value={anion}
              onChangeText={setAnion}
              placeholder="e.g., Cl, O"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Charge:</Text>
            <TextInput
              style={styles.input}
              value={anionCharge}
              onChangeText={(t) => { setAnionCharge(t); setAnionChargeEdited(true); }}
              placeholder="Auto-determined"
              keyboardType="numeric"
            />
            {anion && commonAnionCharges[anion] && commonAnionCharges[anion].length > 1 && (
              <Text style={styles.autoChargeNote}>
                {anion} can have charges: {commonAnionCharges[anion].join(', ')}
              </Text>
            )}
          </View>
        </View>
        
        <Text style={styles.sectionSubtitle}>Ionic Radii (picometers)</Text>
        <Text style={styles.note}>Auto-calculated from element + charge</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cation Radius:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#eee' }]}
              value={cationRadius}
              editable={false}
              placeholder="Auto-calculated"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Anion Radius:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#eee' }]}
              value={anionRadius}
              editable={false}
              placeholder="Auto-calculated"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={calculateLatticeEnergy}
          disabled={!cation || !anion}
        >
          <Text style={styles.buttonText}>Calculate Lattice Energy</Text>
        </TouchableOpacity>
      </View>
      
      {latticeEnergy !== null && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Compound:</Text>
                <Text style={styles.resultValue}>{compoundFormula}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Lattice Energy:</Text>
                <Text style={styles.resultValue}>{latticeEnergy} kJ/mol</Text>
              </View>
              <Text style={styles.resultNote}>
                Note: This is an approximation based on the Born-Landé equation. Actual values may vary based on crystal structure and other factors.
              </Text>
              </View>


            
            <View style={styles.energyVisualization}>
              <Text style={styles.visualizationTitle}>Energy Interpretation</Text>
              
              <View style={styles.energyScale}>
                <View style={[styles.energyBar, { width: `${Math.min(100, latticeEnergy / 40)}%` }]} />
              </View>
              
              <View style={styles.energyLabels}>
                <Text style={styles.energyLabel}>Weak</Text>
                <Text style={styles.energyLabel}>Moderate</Text>
                <Text style={styles.energyLabel}>Strong</Text>
              </View>
              
              <Text style={styles.energyDescription}>
                {latticeEnergy < 700 ? 
                  'Relatively weak lattice energy. Compound may be more soluble in water.' : 
                  latticeEnergy < 2500 ? 
                  'Moderate lattice energy. Typical for many common ionic compounds.' :
                  'Very strong lattice energy. Compound likely has low solubility and high melting point.'}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thermodynamic Relationships</Text>
            <Text style={styles.subSectionTitle}>Solubility Prediction for {compoundFormula}</Text>

            {/* Unique Solubility Visualization (Segmented Index) */}
            <View style={styles.solubilityVisualizationUnique}>
              <Text style={styles.visualizationTitle}>Solubility Index</Text>

              {(() => {
                const index = latticeEnergy < 1000 ? 5 : latticeEnergy < 2000 ? 4 : latticeEnergy < 2500 ? 3 : latticeEnergy < 3200 ? 2 : 1;
                const color = index >= 4 ? '#2e7d32' : index >= 3 ? '#f9a825' : '#c62828';
                return (
                  <View style={styles.segmentRow}>
                    {new Array(5).fill(0).map((_, i) => (
                      <View key={i} style={[styles.segmentBox, { backgroundColor: i < index ? color : '#e0e0e0' }]} />
                    ))}
                  </View>
                );
              })()}

              <View style={styles.solubilityBadgeRow}>
                <Text style={styles.predictionTitle}>Predicted Solubility:</Text>
                <View style={[styles.solubilityBadge, {
                  backgroundColor: latticeEnergy < 1000 ? '#4CAF50' : latticeEnergy < 2500 ? '#FFC107' : '#F44336'
                }]}
                >
                  <Text style={styles.solubilityBadgeText}>
                    {latticeEnergy < 1000 ? 'HIGH' : latticeEnergy < 2500 ? 'MODERATE' : 'LOW'}
                  </Text>
                </View>
              </View>

              <Text style={styles.dynamicExplanation}>
                Based on the computed lattice energy, {compoundFormula} trends toward {latticeEnergy < 1000 ? 'high' : latticeEnergy < 2500 ? 'moderate' : 'low'} solubility. Hydration energetics and temperature will further modulate this behavior.
              </Text>

              <View style={styles.methodsBlock}>
                <Text style={styles.methodsTitle}>How this was determined</Text>
                <Text style={styles.methodsText}>
                  • Uses Born–Landé approximation with ionic charges (z₁, z₂), radii (r₁, r₂){'\n'}
                  • Larger |U| implies stronger ionic binding → lower water solubility{'\n'}
                  • Compare |U| to hydration tendencies to estimate the solubility index
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ion Transport Properties</Text>
            <Text style={styles.subSectionTitle}>Conductivity Analysis for {compoundFormula}</Text>

            {/* Unique Ion Transport Visualization (Channel Grid + Badges) */}
            <View style={styles.transportVisualizationUnique}>
              <Text style={styles.visualizationTitle}>Ion Pathways & Mobility</Text>

              {(() => {
                const mobilityLevel = latticeEnergy > 3000 ? 'Very Low' : latticeEnergy > 1500 ? 'Moderate' : 'High';
                const channels = 24;
                const active = latticeEnergy > 3000 ? 6 : latticeEnergy > 1500 ? 12 : 18;
                const color = latticeEnergy > 3000 ? '#f44336' : latticeEnergy > 1500 ? '#ff9800' : '#4caf50';
                return (
                  <View style={styles.channelGrid}>
                    {new Array(channels).fill(0).map((_, i) => (
                      <View key={i} style={[styles.channelCell, { backgroundColor: i < active ? color : '#e0e0e0' }]} />
                    ))}
                  </View>
                );
              })()}

              <View style={styles.badgeRow}>
                <Text style={styles.mobilityBadgeLabel}>Ion Mobility:</Text>
                <View style={[styles.mobilityBadge, {
                  backgroundColor: latticeEnergy > 3000 ? '#F44336' : latticeEnergy > 1500 ? '#FF9800' : '#4CAF50'
                }]}>
                  <Text style={styles.mobilityBadgeText}>
                    {latticeEnergy > 3000 ? 'Very Low' : latticeEnergy > 1500 ? 'Moderate' : 'High'}
                  </Text>
                </View>
              </View>

              <View style={styles.conductivityPrediction}>                
                <Text style={styles.conductivityTitle}>Estimated Ionic Conductivity:</Text>
                <Text style={styles.conductivityValue}>
                  ~10^{latticeEnergy > 3000 ? '-8' : latticeEnergy > 1500 ? '-5' : '-3'} S/cm
                </Text>
              </View>

              <View style={styles.applicationSuggestions}>
                <Text style={styles.applicationsTitle}>Potential Applications:</Text>
                <View style={styles.applicationsList}>
                  {latticeEnergy < 1500 ? (
                    <>
                      <Text style={styles.applicationItem}>• Solid electrolytes for batteries</Text>
                      <Text style={styles.applicationItem}>• Ion-conducting membranes</Text>
                      <Text style={styles.applicationItem}>• Electrochemical sensors</Text>
                    </>
                  ) : latticeEnergy < 3000 ? (
                    <>
                      <Text style={styles.applicationItem}>• Ceramic materials</Text>
                      <Text style={styles.applicationItem}>• Refractory applications</Text>
                      <Text style={styles.applicationItem}>• Structural components</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.applicationItem}>• Ultra-stable ceramics</Text>
                      <Text style={styles.applicationItem}>• High-temperature applications</Text>
                      <Text style={styles.applicationItem}>• Protective coatings</Text>
                    </>
                  )}
                </View>
              </View>

              <Text style={styles.dynamicExplanation}>
                Ion transport reflects a balance between structural stability and pathway availability; higher lattice energy typically constrains mobility and lowers conductivity.
              </Text>

              <View style={styles.methodsBlock}>
                <Text style={styles.methodsTitle}>How this was determined</Text>
                <Text style={styles.methodsText}>
                  • Pathway activity scales inversely with |U| (tighter lattice → fewer channels){'\n'}
                  • Mobility badge reflects qualitative trend from the computed |U|{'\n'}
                  • Conductivity estimate shown as order-of-magnitude for solid electrolytes
                </Text>
              </View>
            </View>
          </View>

          {/* Common Ionic Radii section removed — values are inferred automatically from the selected ions */}
        </>
      )}
      
      {/* Common Ionic Radii reference removed; radii auto-calculated from element + charge */}
    </ScrollView>
  );
  };

  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  backRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#34A853',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  backText: {
    color: '#34A853',
    fontWeight: '700',
    fontSize: 12,
  },
  autoChargeNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  equationContainer: {
    backgroundColor: '#f0f0f5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  equationText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    marginBottom: 4,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    padding: 8,
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f5',
    fontWeight: 'bold',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
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
  button: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
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
  },
  resultValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  resultNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
  },
  energyVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  visualizationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  energyScale: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  energyBar: {
    height: '100%',
    backgroundColor: '#34A853',
    borderRadius: 10,
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  energyLabel: {
    fontSize: 12,
    color: '#666',
  },
  energyDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  // Lewis diagram styles
  lewisContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  lewisDiagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  ionWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  lewisArrow: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
  },
  electronLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 80,
    height: 80,
  },
  electronDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2ecc71',
  },
  lewisNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  // New styles for dynamic visualizations
  solubilityVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  // Unique solubility visualization styles
  solubilityVisualizationUnique: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  segmentBox: {
    flex: 1,
    height: 16,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  solubilityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  solubilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  solubilityBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  energyComparisonContainer: {
    marginVertical: 15,
  },
  energyBarContainer: {
    marginBottom: 15,
  },
  energyBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#495057',
  },
  energyBarBackground: {
    height: 25,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 5,
  },
  latticeEnergyBar: {
    height: '100%',
    backgroundColor: '#dc3545',
    borderRadius: 12,
  },
  hydrationEnergyBar: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 12,
  },
  energyValue: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  solubilityPrediction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#333',
  },
  solubilityIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  solubilityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dynamicExplanation: {
    fontSize: 14,
    lineHeight: 20,
    color: '#495057',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  transportVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  // Unique transport visualization styles
  transportVisualizationUnique: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  channelCell: {
    width: 14,
    height: 14,
    margin: 3,
    borderRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  mobilityBadgeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
  },
  mobilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mobilityBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mobilityContainer: {
    marginVertical: 15,
  },
  mobilityIndicator: {
    marginBottom: 15,
  },
  mobilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#495057',
  },
  mobilityScale: {
    height: 25,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 5,
  },
  mobilityBar: {
    height: '100%',
    borderRadius: 12,
  },
  mobilityValue: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  conductivityPrediction: {
    alignItems: 'center',
    marginVertical: 10,
  },
  conductivityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 5,
  },
  conductivityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  applicationSuggestions: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  applicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  applicationsList: {
    marginLeft: 5,
  },
  applicationItem: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6c757d',
    marginBottom: 3,
  },
  methodsBlock: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  methodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#495057',
  },
  methodsText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  radiiTableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  radiiTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
  },
  radiiTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radiiTableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: '#333',
  },
});

export default LatticeEnergyScreen;