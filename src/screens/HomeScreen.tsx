import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const modules = [
    {
      id: 'formal-charge',
      title: 'Formal Charge Calculator',
      description: 'Calculate formal charges and analyze resonance structures',
      screen: 'FormalCharge',
      color: '#4285F4',
      icon: '⚛️',
      concept: 'Lewis Structures',
      info: 'Formal charge = V - N - B/2, where V = valence electrons, N = non-bonding electrons, B = bonding electrons'
    },
    {
      id: 'bond-type',
      title: 'Bond Type Predictor',
      description: 'Predict bond types based on electronegativity differences',
      screen: 'BondType',
      color: '#EA4335',
      icon: '🔗',
      concept: 'Chemical Bonding',
      info: 'Ionic (ΔEN > 1.7), Polar Covalent (0.4 < ΔEN < 1.7), Nonpolar Covalent (ΔEN < 0.4)'
    },
    {
      id: 'molecular-geometry',
      title: '3D Molecular Geometry',
      description: 'Explore 3D molecular shapes based on VSEPR theory',
      screen: 'MolecularGeometry',
      color: '#FBBC05',
      icon: '🧬',
      concept: 'VSEPR Theory',
      info: 'Valence Shell Electron Pair Repulsion theory predicts molecular shapes based on electron pair geometry'
    },
    {
      id: 'lattice-energy',
      title: 'Lattice Energy Estimator',
      description: 'Estimate lattice energy of ionic compounds',
      screen: 'LatticeEnergy',
      color: '#34A853',
      icon: '💎',
      concept: 'Ionic Compounds',
      info: 'Lattice energy is proportional to (q₁ × q₂)/r, where q = charges and r = distance between ions'
    },
    {
      id: 'hybridization',
      title: 'Hybridization Identifier',
      description: 'Identify hybridization types and bond angles',
      screen: 'Hybridization',
      color: '#9C27B0',
      icon: '🌐',
      concept: 'Orbital Theory',
      info: 'sp³ (109.5°), sp² (120°), sp (180°) - mixing of atomic orbitals to form hybrid orbitals'
    }
  ];

  const renderModuleCard = (module: any, index: number) => (
    <TouchableOpacity
      key={module.id}
      style={[
        styles.moduleCard,
        { 
          borderLeftColor: module.color,
          width: width > 600 ? (width - 60) / 2 : width - 40,
          marginRight: width > 600 && index % 2 === 0 ? 20 : 0
        }
      ]}
      onPress={() => navigation.navigate(module.screen)}
    >
      <View style={styles.moduleContent}>
        <View style={styles.moduleHeader}>
          <Text style={styles.moduleIcon}>{module.icon}</Text>
          <View style={styles.moduleHeaderText}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.conceptBadge}>{module.concept}</Text>
          </View>
        </View>
        <Text style={styles.moduleDescription}>{module.description}</Text>
        <Text style={styles.moduleInfo}>{module.info}</Text>
        <View style={styles.moduleActions}>
          <Text style={[styles.pill, { backgroundColor: module.color + '20', color: module.color }]}>
            Explore →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Chemistry Background Elements */}
      <View style={styles.backgroundElements}>
        <Text style={[styles.bgElement, { top: 50, left: 20 }]}>🧪</Text>
        <Text style={[styles.bgElement, { top: 100, right: 30 }]}>⚗️</Text>
        <Text style={[styles.bgElement, { top: 200, left: 50 }]}>🔬</Text>
        <Text style={[styles.bgElement, { bottom: 150, right: 20 }]}>🧬</Text>
        <Text style={[styles.bgElement, { bottom: 100, left: 30 }]}>⚛️</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>🧪 Molvue</Text>
        <Text style={styles.subtitle}>Interactive Chemistry Learning Platform</Text>
        <Text style={styles.tagline}>Master molecular structures, bonding, and chemical concepts through hands-on exploration</Text>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.ctaButton}
          onPress={() => navigation.navigate('MolecularGeometry')}
        >
          <Text style={styles.ctaText}>🧬 Start with 3D Geometry Explorer</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.educationalSection}>
          <Text style={styles.sectionTitle}>📚 Chemistry Concepts</Text>
          <Text style={styles.educationalText}>
            Explore fundamental chemistry concepts through interactive tools. Each module combines theoretical knowledge with practical visualization to enhance your understanding of molecular behavior and chemical bonding.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>🔬 Interactive Learning Modules</Text>
        
        <View style={styles.modulesContainer}>
          {modules.map((module, index) => renderModuleCard(module, index))}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>🎓 AP Chemistry Project</Text>
          <Text style={styles.footerText}>
            Created by: Viraat, Aarnav, Donna, Neeraja
          </Text>
          <Text style={styles.footerSubtext}>
            Fall 2024 • Problem-Based Learning Initiative
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bgElement: {
    position: 'absolute',
    fontSize: 40,
    opacity: 0.1,
    zIndex: 0,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#34495e',
    marginTop: 5,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 15,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  ctaButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  educationalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  educationalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  modulesContainer: {
    flexDirection: width > 600 ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 6,
  },
  moduleContent: {
    padding: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  conceptBadge: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  moduleInfo: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 15,
    lineHeight: 18,
  },
  moduleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pill: {
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontWeight: '600',
    overflow: 'hidden',
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 25,
    borderRadius: 15,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#34495e',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default HomeScreen;