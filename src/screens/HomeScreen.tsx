import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Animated } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [pressed, setPressed] = useState<string | null>(null);
  const contentWidth = width - 32;
  
  // Animated values for background elements
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const modulesAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate background elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Animate hero section
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Animate modules section
    Animated.timing(modulesAnim, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  const modules = [
    // Left column top 3 (new modules)
    {
      id: 'imf-explorer',
      title: 'IMF Explorer',
      description: 'Predict IMF types and rank boiling points from structure',
      screen: 'IMFExplorer',
      color: '#10b981',
      icon: '🧲',
      concept: 'Intermolecular Forces',
      info: 'Dipole-dipole, LDF, H-bond, ion-dipole visualized'
    },
    // Right column row 1
    
    // Left column row 2 (new module)
    {
      id: 'thermo-calculator',
      title: 'Thermo Calculator',
      description: 'Compute ΔH, ΔS, ΔG and spontaneity for reactions',
      screen: 'ThermoCalculator',
      color: '#f59e0b',
      icon: '🔥',
      concept: 'Thermodynamics',
      info: 'Auto-look-up data and equilibrium temperature'
    },
    // Right column row 2
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
    // Left column row 3 (new module)
    {
      id: 'titration-simulator',
      title: 'Titration Simulator',
      description: 'Generate curves, find equivalence points, choose indicators',
      screen: 'TitrationSimulator',
      color: '#8b5cf6',
      icon: '🧪',
      concept: 'Acid–Base Equilibria',
      info: 'Strong/weak acid & base titrations'
    },
    // Right column row 3 (new module under lattice energy)
    {
      id: 'stoich-lab',
      title: 'Stoich Lab',
      description: 'Balance equations, find limiting reagents and yields',
      screen: 'StoichLab',
      color: '#ef4444',
      icon: '⚖️',
      concept: 'Stoichiometry',
      info: 'Theoretical & percent yield calculator'
    },
    // Left column continues with existing modules
    
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
    
  ];

  const renderModuleCard = (module: any, index: number, forcedWidth?: number) => {
    const columns = width > 620 ? 3 : 1;
    const cardWidth = forcedWidth ?? (columns === 1 ? width - 40 : contentWidth / columns);
    const isPressed = pressed === module.id;
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);
    
    return (
      <TouchableOpacity
        key={module.id}
        activeOpacity={0.92}
        onPressIn={() => setPressed(module.id)}
        onPressOut={() => setPressed(null)}
        style={[
          styles.moduleCard,
          {
            width: cardWidth,
            transform: [
              { scale: isPressed ? 0.98 : 1 },
              { 
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              },
              { 
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })
              }
            ],
            shadowOpacity: isPressed ? 0.18 : 0.12,
            borderColor: module.color + '30',
            opacity: cardAnim
          }
        ]}
        onPress={() => module.screen ? navigation.navigate(module.screen) : null}
      >
        <View style={styles.moduleContent}>
          <View style={styles.moduleHeader}>
            <View style={[styles.iconWrap, { backgroundColor: module.color + '22' }]}> 
              <Text style={[styles.moduleIcon, { color: module.color }]}>{module.icon}</Text>
            </View>
            <View style={styles.moduleHeaderText}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={[styles.conceptBadge, { color: module.color }]}>{module.concept}</Text>
            </View>
          </View>
          <Text style={styles.moduleDescription} numberOfLines={2}>{module.description}</Text>
          <Text style={styles.moduleInfo} numberOfLines={2}>{module.info}</Text>
          <View style={styles.moduleActions}>
            <View style={[styles.ctaPill, { backgroundColor: module.color }]}> 
              <Text style={styles.ctaPillText}>Explore</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Background Elements */}
      <View style={styles.backgroundContainer}>
        <Animated.View 
          style={[
            styles.floatingElement, 
            {
              transform: [
                { translateX: backgroundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, width - 50]
                })},
                { translateY: backgroundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 200]
                })},
                { rotate: backgroundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })}
              ],
              opacity: backgroundAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.1, 0.3, 0.1]
              })
            }
          ]}
        >
          <Text style={styles.floatingText}>H₂O</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.floatingElement, 
            {
              transform: [
                { translateX: backgroundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width - 50, -50]
                })},
                { translateY: backgroundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 150]
                })},
                { rotate: backgroundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg']
                })}
              ],
              opacity: backgroundAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.1, 0.3, 0.1]
              })
            }
          ]}
        >
          <Text style={styles.floatingText}>CO₂</Text>
        </Animated.View>
      </View>
      
      <Animated.View 
        style={[
          styles.heroContainer,
          {
            opacity: heroAnim,
            transform: [{
              translateY: heroAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <View style={[styles.hero, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={styles.heroParticles}>
            <Animated.View 
              style={[
                styles.particle,
                {
                  transform: [{
                    scale: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.particleText}>⚛️</Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.particle,
                styles.particle2,
                {
                  transform: [{
                    scale: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.particleText}>🧬</Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.particle,
                styles.particle3,
                {
                  transform: [{
                    scale: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.particleText}>🔬</Text>
            </Animated.View>
          </View>
          <Text style={styles.brand}>Molvue</Text>
          <Text style={styles.heroTitle}>Explore Chemistry Visually</Text>
          <Text style={styles.heroSubtitle}>From molecules to reactions - master chemistry concepts with interactive tools</Text>
          <View style={styles.heroActions}>
          <TouchableOpacity style={[styles.heroButton, { backgroundColor: '#3498db' }]} onPress={() => navigation.navigate('MolecularGeometry')}>
            <Text style={styles.heroButtonText}>3D Geometry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.heroButton, { backgroundColor: '#8b5cf6' }]} onPress={() => navigation.navigate('TitrationSimulator')}>
            <Text style={styles.heroButtonText}>Titrations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.heroButton, { backgroundColor: '#f59e0b' }]} onPress={() => navigation.navigate('ThermoCalculator')}>
            <Text style={styles.heroButtonText}>Thermodynamics</Text>
          </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.sectionBlock, 
            { width: contentWidth, alignSelf: 'center' },
            {
              opacity: modulesAnim,
              transform: [{
                translateY: modulesAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Modules</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>6 Interactive Tools</Text>
            </View>
          </View>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search modules"
              placeholderTextColor="#9aa0a6"
            />
          </View>
          <View style={[styles.modulesContainer, { width: contentWidth, alignSelf: 'center' }]}>
            {(() => {
              const isThree = width > 620 && !query;
              if (!isThree) {
                const list = query ? modules.filter(m => (
                  m.title.toLowerCase().includes(query.toLowerCase()) ||
                  m.description.toLowerCase().includes(query.toLowerCase()) ||
                  m.concept.toLowerCase().includes(query.toLowerCase())
                )) : modules;
                return list.map((module, index) => renderModuleCard(module, index));
              }
              const colWidth = contentWidth / 3;
              const findById = (id: string) => modules.find(m => m.id === id)!;
              const left = [
                findById('imf-explorer'),
                findById('molecular-geometry'),
              ];
              const middle = [
                findById('thermo-calculator'),
                findById('lattice-energy'),
              ];
              const right = [
                findById('titration-simulator'),
                findById('stoich-lab'),
              ];
              return (
                <>
                  <View style={{ width: colWidth }}>
                    {left.map((m, i) => renderModuleCard(m, i, colWidth))}
                  </View>
                  <View style={{ width: colWidth }}>
                    {middle.map((m, i) => renderModuleCard(m, i, colWidth))}
                  </View>
                  <View style={{ width: colWidth }}>
                    {right.map((m, i) => renderModuleCard(m, i, colWidth))}
                  </View>
                </>
              );
            })()}
          </View>
        </Animated.View>
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>AP Chemistry Fall PBL 2025</Text>
          <Text style={styles.footerText}>Viraat • Aarnav • Donna • Neeraja</Text>
          <Text style={styles.footerSubtext}>Fall 2025 • PBL Initiative</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElement: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(108, 99, 255, 0.4)',
  },
  heroContainer: {
    marginBottom: 16,
  },
  heroParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 20,
    left: 20,
  },
  particle2: {
    top: 40,
    right: 30,
    left: undefined,
  },
  particle3: {
    bottom: 20,
    left: '50%',
    top: undefined,
    marginLeft: -20,
  },
  particleText: {
    fontSize: 20,
  },
  hero: {
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderBottomColor: '#edf0f5',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c63ff',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  heroButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    zIndex: 1,
  },
  sectionBlock: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  sectionBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6c63ff',
  },
  searchRow: {
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  modulesContainer: {
    flexDirection: width > 620 ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 4,
    borderWidth: 1,
    minHeight: 120,
  },
  moduleContent: {
    padding: 10,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  moduleIcon: {
    fontSize: 13,
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 0,
  },
  conceptBadge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  moduleDescription: {
    fontSize: 9.5,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 15,
  },
  moduleInfo: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 13,
  },
  moduleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  ctaPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginRight: 6,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default HomeScreen;