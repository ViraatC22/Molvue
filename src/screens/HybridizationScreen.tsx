import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface AtomInfo {
  symbol: string;
  atomicNumber: number;
  electronConfig: string;
  valenceElectrons: number;
}

interface HybridizationInfo {
  centralAtom: string;
  hybridization: string;
  geometry: string;
  bondAngle: string;
  bondType: string;
  electronegativityDifference: string;
}

const HybridizationScreen = () => {
  const [molecule, setMolecule] = useState('');
  const [atoms, setAtoms] = useState<AtomInfo[]>([]);
  const [hybridizationInfo, setHybridizationInfo] = useState<HybridizationInfo | null>(null);

  const atomicData: { [key: string]: AtomInfo } = {
    H: { symbol: 'H', atomicNumber: 1, electronConfig: '1s¹', valenceElectrons: 1 },
    O: { symbol: 'O', atomicNumber: 8, electronConfig: '[He] 2s² 2p⁴', valenceElectrons: 6 },
    C: { symbol: 'C', atomicNumber: 6, electronConfig: '[He] 2s² 2p²', valenceElectrons: 4 },
    N: { symbol: 'N', atomicNumber: 7, electronConfig: '[He] 2s² 2p³', valenceElectrons: 5 },
  };

  const parseMolecule = (formula: string) => {
    const atomMatches = formula.match(/([A-Z][a-z]*)(\\d*)/g);
    if (!atomMatches) return;

    const parsedAtoms: AtomInfo[] = [];
    atomMatches.forEach((match) => {
      const [, symbol, count] = match.match(/([A-Z][a-z]*)(\\d*)/) || [];
      const atom = atomicData[symbol];
      if (atom) {
        const atomCount = parseInt(count || '1', 10);
        for (let i = 0; i < atomCount; i++) {
          parsedAtoms.push(atom);
        }
      }
    });
    setAtoms(parsedAtoms);
  };

  const calculateHybridization = () => {
    if (!molecule) return;
    parseMolecule(molecule);

    // Example calculation for H2O
    setHybridizationInfo({
      centralAtom: 'O',
      hybridization: 'sp³',
      geometry: 'Bent (angular)',
      bondAngle: '104.5°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '1.24 (O-H)',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Molecule:</Text>
        <TextInput
          style={styles.input}
          value={molecule}
          onChangeText={setMolecule}
          placeholder="e.g., H2O, CH4"
        />
        <TouchableOpacity style={styles.button} onPress={calculateHybridization}>
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      </View>

      {atoms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Electron Configuration (All Atoms)</Text>
          {atoms.map((atom, index) => (
            <Text key={index}>
              {atom.symbol} (Atomic #: {atom.atomicNumber}) - {atom.electronConfig} - Valence Electrons: {atom.valenceElectrons}
            </Text>
          ))}
        </View>
      )}

      {hybridizationInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hybridization & Bonding Information</Text>
          <Text>Central Atom: {hybridizationInfo.centralAtom}</Text>
          <Text>Hybridization: {hybridizationInfo.hybridization}</Text>
          <Text>Geometry: {hybridizationInfo.geometry}</Text>
          <Text>Bond Angle: {hybridizationInfo.bondAngle}</Text>
          <Text>Bond Type: {hybridizationInfo.bondType}</Text>
          <Text>Electronegativity Difference: {hybridizationInfo.electronegativityDifference}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default HybridizationScreen;