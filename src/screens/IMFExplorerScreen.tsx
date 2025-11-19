import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';

interface Molecule {
  name: string;
  formula: string;
  imfTypes: string[];
  dominantImf: string;
  polarity: 'polar' | 'nonpolar';
  boilingPoint: number;
  molarMass?: number;
  dipoleMoment?: number;
  hBondDonors?: number;
  hBondAcceptors?: number;
  shape?: string;
  polarizability?: 'low' | 'medium' | 'high';
  description: string;
}

const commonMolecules: Molecule[] = [
  {
    name: 'Water',
    formula: 'H₂O',
    imfTypes: ['Hydrogen bonding', 'Dipole-dipole', 'London dispersion'],
    dominantImf: 'Hydrogen bonding',
    polarity: 'polar',
    boilingPoint: 100,
    molarMass: 18.015,
    dipoleMoment: 1.85,
    hBondDonors: 2,
    hBondAcceptors: 2,
    shape: 'Bent',
    polarizability: 'low',
    description: 'Strong hydrogen bonding due to O-H bonds'
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: -161.5,
    molarMass: 16.04,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Tetrahedral',
    polarizability: 'low',
    description: 'Only weak London dispersion forces'
  },
  {
    name: 'Ammonia',
    formula: 'NH₃',
    imfTypes: ['Hydrogen bonding', 'Dipole-dipole', 'London dispersion'],
    dominantImf: 'Hydrogen bonding',
    polarity: 'polar',
    boilingPoint: -33.3,
    molarMass: 17.031,
    dipoleMoment: 1.47,
    hBondDonors: 1,
    hBondAcceptors: 1,
    shape: 'Trigonal pyramidal',
    polarizability: 'low',
    description: 'Hydrogen bonding due to N-H bonds'
  },
  {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: -78.5,
    molarMass: 44.01,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Linear',
    polarizability: 'medium',
    description: 'Linear molecule, overall nonpolar'
  },
  {
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    imfTypes: ['Hydrogen bonding', 'Dipole-dipole', 'London dispersion'],
    dominantImf: 'Hydrogen bonding',
    polarity: 'polar',
    boilingPoint: 78.4,
    molarMass: 46.07,
    dipoleMoment: 1.69,
    hBondDonors: 1,
    hBondAcceptors: 1,
    shape: 'Approx. tetrahedral',
    polarizability: 'medium',
    description: 'Hydrogen bonding from O-H group'
  },
  {
    name: 'Benzene',
    formula: 'C₆H₆',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: 80.1,
    molarMass: 78.11,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Planar ring',
    polarizability: 'high',
    description: 'Delocalized π electrons create strong dispersion'
  },
  {
    name: 'Acetone',
    formula: 'C₃H₆O',
    imfTypes: ['Dipole-dipole', 'London dispersion'],
    dominantImf: 'Dipole-dipole',
    polarity: 'polar',
    boilingPoint: 56.1,
    molarMass: 58.08,
    dipoleMoment: 2.88,
    hBondDonors: 0,
    hBondAcceptors: 1,
    shape: 'Trigonal planar around C=O',
    polarizability: 'medium',
    description: 'Strong C=O dipole; good H-bond acceptor'
  },
  {
    name: 'Dimethyl Ether',
    formula: 'C₂H₆O',
    imfTypes: ['Dipole-dipole', 'London dispersion'],
    dominantImf: 'Dipole-dipole',
    polarity: 'polar',
    boilingPoint: -24,
    molarMass: 46.07,
    dipoleMoment: 1.30,
    hBondDonors: 0,
    hBondAcceptors: 1,
    shape: 'Bent around O',
    polarizability: 'medium',
    description: 'Polar ether; H-bond acceptor only'
  },
  {
    name: 'Formaldehyde',
    formula: 'CH₂O',
    imfTypes: ['Dipole-dipole', 'London dispersion'],
    dominantImf: 'Dipole-dipole',
    polarity: 'polar',
    boilingPoint: -19,
    molarMass: 30.03,
    dipoleMoment: 2.33,
    hBondDonors: 0,
    hBondAcceptors: 1,
    shape: 'Trigonal planar',
    polarizability: 'low',
    description: 'Strong carbonyl dipole'
  },
  {
    name: 'Chloromethane',
    formula: 'CH₃Cl',
    imfTypes: ['Dipole-dipole', 'London dispersion'],
    dominantImf: 'Dipole-dipole',
    polarity: 'polar',
    boilingPoint: -24.2,
    molarMass: 50.49,
    dipoleMoment: 1.90,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Tetrahedral',
    polarizability: 'medium',
    description: 'Polar C–Cl bond gives permanent dipole'
  },
  {
    name: 'Hydrogen Fluoride',
    formula: 'HF',
    imfTypes: ['Hydrogen bonding', 'Dipole-dipole', 'London dispersion'],
    dominantImf: 'Hydrogen bonding',
    polarity: 'polar',
    boilingPoint: 19.5,
    molarMass: 20.01,
    dipoleMoment: 1.82,
    hBondDonors: 1,
    hBondAcceptors: 1,
    shape: 'Linear',
    polarizability: 'low',
    description: 'Very strong hydrogen bonding'
  },
  {
    name: 'Hydrogen Iodide',
    formula: 'HI',
    imfTypes: ['Dipole-dipole', 'London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'polar',
    boilingPoint: -35.4,
    molarMass: 127.91,
    dipoleMoment: 0.44,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Linear',
    polarizability: 'high',
    description: 'Highly polarizable; dispersion dominates'
  },
  {
    name: 'Iodine',
    formula: 'I₂',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: 184.3,
    molarMass: 253.81,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Linear',
    polarizability: 'high',
    description: 'Very strong dispersion due to large electron cloud'
  },
  {
    name: 'Hydrogen Peroxide',
    formula: 'H₂O₂',
    imfTypes: ['Hydrogen bonding', 'Dipole-dipole', 'London dispersion'],
    dominantImf: 'Hydrogen bonding',
    polarity: 'polar',
    boilingPoint: 150.2,
    molarMass: 34.014,
    dipoleMoment: 2.10,
    hBondDonors: 2,
    hBondAcceptors: 2,
    shape: 'Skewed',
    polarizability: 'low',
    description: 'Multiple O–H groups enable strong hydrogen bonding'
  },
  {
    name: 'Ethyl Acetate',
    formula: 'C₄H₈O₂',
    imfTypes: ['Dipole-dipole', 'London dispersion'],
    dominantImf: 'Dipole-dipole',
    polarity: 'polar',
    boilingPoint: 77.1,
    molarMass: 88.11,
    dipoleMoment: 1.78,
    hBondDonors: 0,
    hBondAcceptors: 1,
    shape: 'Planar around ester',
    polarizability: 'medium',
    description: 'Ester carbonyl gives permanent dipole; acceptor only'
  },
  {
    name: 'Propane',
    formula: 'C₃H₈',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: -42.1,
    molarMass: 44.10,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Linear chain',
    polarizability: 'medium',
    description: 'Nonpolar alkane; dispersion increases with chain length'
  },
  {
    name: 'Butane',
    formula: 'C₄H₁₀',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: -0.5,
    molarMass: 58.12,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Linear chain',
    polarizability: 'medium',
    description: 'Longer chain increases dispersion, raises boiling point'
  },
  {
    name: 'Pentane',
    formula: 'C₅H₁₂',
    imfTypes: ['London dispersion'],
    dominantImf: 'London dispersion',
    polarity: 'nonpolar',
    boilingPoint: 36.1,
    molarMass: 72.15,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Linear chain',
    polarizability: 'medium',
    description: 'Dispersion increases with surface area'
  },
  {
    name: 'Acetic Acid',
    formula: 'CH₃COOH',
    imfTypes: ['Hydrogen bonding', 'Dipole-dipole', 'London dispersion'],
    dominantImf: 'Hydrogen bonding',
    polarity: 'polar',
    boilingPoint: 118.1,
    molarMass: 60.05,
    dipoleMoment: 1.74,
    hBondDonors: 1,
    hBondAcceptors: 1,
    shape: 'Planar around carboxyl',
    polarizability: 'medium',
    description: 'Carboxyl group enables strong hydrogen bonding and dimerization'
  },
  {
    name: 'Sodium Chloride (aq)',
    formula: 'NaCl(aq)',
    imfTypes: ['Ion-dipole'],
    dominantImf: 'Ion-dipole',
    polarity: 'polar',
    boilingPoint: 100,
    molarMass: 58.44,
    dipoleMoment: 0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    shape: 'Ions in hydration shell',
    polarizability: 'medium',
    description: 'Ion-dipole interactions between ions and water dipoles'
  }
];

const IMFTypes = {
  'Hydrogen bonding': { color: '#FF6B6B', strength: 'Strong (10-40 kJ/mol)' },
  'Dipole-dipole': { color: '#4ECDC4', strength: 'Medium (5-25 kJ/mol)' },
  'London dispersion': { color: '#45B7D1', strength: 'Weak (0.05-40 kJ/mol)' },
  'Ion-dipole': { color: '#96CEB4', strength: 'Very Strong (50-200 kJ/mol)' }
};

export default function IMFExplorerScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (selectedMolecule) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [selectedMolecule]);

  const filteredMolecules = commonMolecules.filter(mol =>
    mol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mol.formula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIMFColor = (imfType: string) => {
    return IMFTypes[imfType as keyof typeof IMFTypes]?.color || '#666';
  };

  const toTitle = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const MoleculeVisualization = ({ molecule }: { molecule: Molecule }) => {
    const rotation = useState(new Animated.Value(0))[0];

    useEffect(() => {
      const spin = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    }, []);

    const spin = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    return (
      <Animated.View style={[styles.moleculeViz, { transform: [{ rotateY: spin }] }]}>
        <View style={styles.moleculeCore}>
          <Text style={styles.moleculeFormula}>{molecule.formula}</Text>
        </View>
        {molecule.imfTypes.map((imf, index) => (
          <View
            key={imf}
            style={[
              styles.imfRing,
              {
                width: 80 + index * 30,
                height: 80 + index * 30,
                borderColor: getIMFColor(imf),
                opacity: 0.6,
              }
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>IMF Explorer</Text>
        <Text style={styles.subtitle}>Intermolecular Forces Analysis</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search molecules..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.imfLegend}>
        <Text style={styles.legendTitle}>IMF Types</Text>
        <View style={styles.legendItems}>
          {Object.entries(IMFTypes).map(([type, info]) => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: info.color }]} />
              <Text style={styles.legendText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.moleculeGrid}>
        {filteredMolecules.map((molecule) => (
          <TouchableOpacity
            key={molecule.name}
            style={styles.moleculeCard}
            onPress={() => setSelectedMolecule(molecule)}
          >
            <Text style={styles.moleculeName}>{molecule.name}</Text>
            <Text style={styles.moleculeFormulaCard}>{molecule.formula}</Text>
            <View style={styles.imfIndicators}>
              {molecule.imfTypes.map((imf) => (
                <View
                  key={imf}
                  style={[styles.imfIndicator, { backgroundColor: getIMFColor(imf) }]}
                />
              ))}
            </View>
            <View style={styles.cardTags}>
              <View style={[styles.imfTag, { backgroundColor: getIMFColor(molecule.dominantImf) }]}> 
                <Text style={styles.imfTagText}>{molecule.dominantImf}</Text>
              </View>
              <View style={styles.polarityTag}>
                <Text style={styles.polarityTagText}>{toTitle(molecule.polarity)}</Text>
              </View>
            </View>
            <View style={styles.cardStats}>
              <Text style={styles.cardStatText}>
                HBD {molecule.hBondDonors ?? 0} · HBA {molecule.hBondAcceptors ?? 0} · μ {molecule.dipoleMoment != null ? `${molecule.dipoleMoment} D` : '—'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMolecule && (
        <Animated.View
          style={[
            styles.detailModal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.detailContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedMolecule(null);
                fadeAnim.setValue(0);
                scaleAnim.setValue(0.8);
              }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.detailTitle}>{selectedMolecule.name}</Text>
            <Text style={styles.detailFormula}>{selectedMolecule.formula}</Text>

            <MoleculeVisualization molecule={selectedMolecule} />

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Polarity:</Text>
              <Text style={[
                styles.propertyValue,
                { color: selectedMolecule.polarity === 'polar' ? '#FF6B6B' : '#34A853' }
              ]}>
                {toTitle(selectedMolecule.polarity)}
              </Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Boiling Point:</Text>
              <Text style={styles.propertyValue}>{selectedMolecule.boilingPoint}°C</Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Dominant IMF:</Text>
              <Text style={[styles.propertyValue, { color: getIMFColor(selectedMolecule.dominantImf) }]}>{selectedMolecule.dominantImf}</Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Molar Mass:</Text>
              <Text style={styles.propertyValue}>{selectedMolecule.molarMass ?? '—'} g/mol</Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Dipole Moment:</Text>
              <Text style={styles.propertyValue}>{selectedMolecule.dipoleMoment != null ? `${selectedMolecule.dipoleMoment} D` : '—'}</Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>H-Bond Donors/Acceptors:</Text>
              <Text style={styles.propertyValue}>{(selectedMolecule.hBondDonors ?? 0)} / {(selectedMolecule.hBondAcceptors ?? 0)}</Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Shape:</Text>
              <Text style={styles.propertyValue}>{selectedMolecule.shape ?? '—'}</Text>
            </View>

            <View style={styles.propertySection}>
              <Text style={styles.propertyLabel}>Polarizability:</Text>
              <Text style={styles.propertyValue}>{selectedMolecule.polarizability ? toTitle(selectedMolecule.polarizability) : '—'}</Text>
            </View>

            <View style={styles.imfSection}>
              <Text style={styles.imfTitle}>Intermolecular Forces:</Text>
              {selectedMolecule.imfTypes.map((imf) => (
                <View key={imf} style={styles.imfDetail}>
                  <View style={[styles.imfDot, { backgroundColor: getIMFColor(imf) }]} />
                  <View style={styles.imfInfo}>
                    <Text style={styles.imfName}>{imf}</Text>
                    <Text style={styles.imfStrength}>
                      {IMFTypes[imf as keyof typeof IMFTypes]?.strength}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.description}>{selectedMolecule.description}</Text>
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
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#fafafa',
    borderRadius: 25,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imfLegend: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#6c757d',
    fontSize: 14,
  },
  moleculeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  moleculeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardTags: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  imfTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  imfTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  polarityTag: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  polarityTagText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardStats: {
    marginTop: 8,
  },
  cardStatText: {
    color: '#666',
    fontSize: 12,
  },
  moleculeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  moleculeFormulaCard: {
    fontSize: 18,
    color: '#34A853',
    marginBottom: 10,
  },
  imfIndicators: {
    flexDirection: 'row',
  },
  imfIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  detailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  detailContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailFormula: {
    fontSize: 20,
    color: '#34A853',
    marginBottom: 20,
  },
  moleculeViz: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  moleculeCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  moleculeFormula: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  imfRing: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 100,
    borderStyle: 'dashed',
  },
  propertySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  propertyLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  propertyValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imfSection: {
    width: '100%',
    marginVertical: 15,
  },
  imfTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  imfDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  imfDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  imfInfo: {
    flex: 1,
  },
  imfName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  imfStrength: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
  },
});