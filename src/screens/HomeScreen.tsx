import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Animated, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [pressed, setPressed] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  
  const contentWidth = width - 32;
  
  // Animated values for background elements
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const modulesAnim = useRef(new Animated.Value(0)).current;
  const modulesFloatA = useRef(new Animated.Value(0)).current;
  const modulesFloatB = useRef(new Animated.Value(0)).current;
  const modulesFloatC = useRef(new Animated.Value(0)).current;
  
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

    // Desynchronized floaters for modules area
    modulesFloatB.setValue(0.35);
    modulesFloatC.setValue(0.7);
    Animated.loop(
      Animated.sequence([
        Animated.timing(modulesFloatA, { toValue: 1, duration: 14000, useNativeDriver: true }),
        Animated.timing(modulesFloatA, { toValue: 0, duration: 14000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(modulesFloatB, { toValue: 1, duration: 18000, useNativeDriver: true }),
        Animated.timing(modulesFloatB, { toValue: 0, duration: 18000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(modulesFloatC, { toValue: 1, duration: 22000, useNativeDriver: true }),
        Animated.timing(modulesFloatC, { toValue: 0, duration: 22000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const HeroMoleculeWeb = ({ height = 380, radius = 1.8 }: { height?: number; radius?: number }) => {
    if (Platform.OS !== 'web') return null as any;
    const containerRef = useRef<any>(null);
    useEffect(() => {
      const THREE = require('three');
      const container = containerRef.current as HTMLElement;
      if (!container) return;
      const w = container.clientWidth || width;
      const h = height;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio((window as any).devicePixelRatio || 1);
      renderer.setSize(w, h);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 6);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dl = new THREE.DirectionalLight(0xffffff, 0.9);
      dl.position.set(4, 5, 8);
      scene.add(dl);
      const group = new THREE.Group();
      scene.add(group);
      const baseGeo = new THREE.IcosahedronGeometry(radius, 3);
      const wire = new THREE.WireframeGeometry(baseGeo);
      const lines = new THREE.LineSegments(wire, new (require('three').LineBasicMaterial)({ color: 0x6c63ff }));
      group.add(lines);
      const atomGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const atomA = new THREE.MeshPhongMaterial({ color: 0x34A853 });
      const atomB = new THREE.MeshPhongMaterial({ color: 0xFF6D00 });
      const pos = baseGeo.getAttribute('position');
      for (let i = 0; i < pos.count; i += 3) {
        const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize().multiplyScalar(radius);
        const m = new THREE.Mesh(atomGeo, i % 2 === 0 ? atomA : atomB);
        m.position.copy(v);
        group.add(m);
      }
      let dragging = false;
      let lx = 0;
      let ly = 0;
      const onDown = (e: any) => { dragging = true; lx = e.clientX; ly = e.clientY; };
      const onMove = (e: any) => {
        if (!dragging) return;
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        group.rotation.y += dx * 0.01;
        group.rotation.x += dy * 0.01;
        lx = e.clientX; ly = e.clientY;
      };
      const onUp = () => { dragging = false; };
      container.addEventListener('mousedown', onDown);
      (window as any).addEventListener('mousemove', onMove);
      (window as any).addEventListener('mouseup', onUp);
      const onResize = () => {
        const nw = container.clientWidth || w;
        const nh = h;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      };
      (window as any).addEventListener('resize', onResize);
      const render = () => {
        lines.rotation.z += 0.0015;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      };
      render();
      return () => {
        try { container.removeChild(renderer.domElement); } catch {}
        (window as any).removeEventListener('mousemove', onMove);
        (window as any).removeEventListener('mouseup', onUp);
        (window as any).removeEventListener('resize', onResize);
        renderer.dispose();
      };
    }, []);
    return <View ref={containerRef} style={{ width: '100%', height }} />;
  };
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
    const columns = width > 620 ? 2 : 1;
    const cardWidth = forcedWidth ?? (columns === 1 ? width - 40 : contentWidth / columns);
    const isPressed = pressed === module.id || hovered === module.id;
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);
    
    const hoverProps: any = Platform.OS === 'web' ? {
      onMouseEnter: () => setHovered(module.id),
      onMouseLeave: () => setHovered(null),
    } : {};
    return (
      <TouchableOpacity
        key={module.id}
        activeOpacity={0.92}
        onPressIn={() => setPressed(module.id)}
        onPressOut={() => setPressed(null)}
        {...hoverProps}
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
            shadowOpacity: isPressed ? 0.22 : 0.12,
            borderColor: module.color + '30',
            opacity: cardAnim
          }
        ]}
        onPress={() => module.screen ? navigation.navigate(module.screen) : null}
      >
        <View style={styles.moduleCover}>
          <View style={[styles.coverArt, { backgroundColor: module.color + '15' }]}> 
            <View style={[styles.coverAccent, { backgroundColor: module.color + '30' }]} />
            <Text style={[styles.coverEmoji, { color: module.color }]}>{module.icon}</Text>
          </View>
        </View>
        <View style={styles.moduleContent}>
          <View style={styles.moduleHeader}>
            <View style={[styles.iconWrap, { backgroundColor: module.color + '22' }]}> 
              <Text style={[styles.moduleIcon, { color: module.color }]}>{module.icon}</Text>
            </View>
            <View style={styles.moduleHeaderText}>
              <Text style={styles.moduleTitle}>{module.concept}</Text>
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
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navLogo}>MOLVUE</Text>
          </TouchableOpacity>
        </View>
        
      </View>
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
                outputRange: [0.18, 0.36, 0.18]
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
                outputRange: [0.18, 0.36, 0.18]
              })
            }
          ]}
        >
          <Text style={styles.floatingText}>CO₂</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.floatingElementLarge,
            {
              transform: [
                { translateX: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [60, width - 120] })},
                { translateY: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [220, 80] })},
                { rotate: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })},
              ],
              opacity: backgroundAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.4, 0.2] })
            }
          ]}
        >
          <Text style={styles.floatingTextBold}>Na⁺</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.floatingElementLarge,
            {
              transform: [
                { translateX: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [width - 120, 60] })},
                { translateY: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 260] })},
                { rotate: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] })},
              ],
              opacity: backgroundAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.4, 0.2] })
            }
          ]}
        >
          <Text style={styles.floatingTextBold}>Cl⁻</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.floatingElement,
            {
              transform: [
                { translateX: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [20, width - 80] })},
                { translateY: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 340] })},
              ],
              opacity: backgroundAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.22, 0.4, 0.22] })
            }
          ]}
        >
          <Text style={styles.floatingText}>OH⁻</Text>
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
        <View style={[styles.hero, { width: width, alignSelf: 'center' }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.brand}>MOLVUE</Text>
                <Text style={styles.heroTitleLarge}>Chemistry Visualizer</Text>
                <Text style={styles.heroSubtitle}>Explore Chemistry Visually</Text>
              </View>
              <View style={styles.heroActionsLeft}>
                <TouchableOpacity style={[styles.heroButton, { backgroundColor: '#3498db' }, styles.heroButtonLeft]} onPress={() => navigation.navigate('MolecularGeometry')}>
                  <Text style={styles.heroButtonText}>3D Geometry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.heroButton, { backgroundColor: '#8b5cf6' }]} onPress={() => navigation.navigate('TitrationSimulator')}>
                  <Text style={styles.heroButtonText}>Titrations</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.heroButton, styles.heroButtonCompact, { backgroundColor: '#f59e0b' }]} onPress={() => navigation.navigate('ThermoCalculator')}>
                  <Text style={styles.heroButtonText}>Thermodynamics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.heroButton, styles.heroButtonCompact, { backgroundColor: '#10b981' }]} onPress={() => navigation.navigate('PracticePage')}>
                  <Text style={styles.heroButtonText}>Practice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.sectionBlock, 
            { width: width, alignSelf: 'center' },
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
          <View style={styles.modulesFloatLayer}>
            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  transform: [
                    { translateX: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [-120, width - 240] }) },
                    { translateY: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [60, 180] }) }
                  ],
                  opacity: modulesFloatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.18, 0.35, 0.18] })
                }
              ]}
            >
              <Text style={styles.floatingText}>Na⁺</Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  transform: [
                    { translateX: modulesFloatB.interpolate({ inputRange: [0, 1], outputRange: [40, width - 200] }) },
                    { translateY: modulesFloatB.interpolate({ inputRange: [0, 1], outputRange: [240, 120] }) }
                  ],
                  opacity: modulesFloatB.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.32, 0.16] })
                }
              ]}
            >
              <Text style={styles.floatingText}>Cl⁻</Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  transform: [
                    { translateX: modulesFloatC.interpolate({ inputRange: [0, 1], outputRange: [200, width - 160] }) },
                    { translateY: modulesFloatC.interpolate({ inputRange: [0, 1], outputRange: [150, 320] }) }
                  ],
                  opacity: modulesFloatC.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.38, 0.2] })
                }
              ]}
            >
              <Text style={styles.floatingTextBold}>OH⁻</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  transform: [
                    { translateX: modulesFloatB.interpolate({ inputRange: [0, 1], outputRange: [-240, width - 120] }) },
                    { translateY: modulesFloatB.interpolate({ inputRange: [0, 1], outputRange: [90, 260] }) }
                  ],
                  opacity: modulesFloatB.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.14, 0.28, 0.14] })
                }
              ]}
            >
              <Text style={styles.floatingText}>K⁺</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  transform: [
                    { translateX: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [120, width - 220] }) },
                    { translateY: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [260, 340] }) }
                  ],
                  opacity: modulesFloatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.30, 0.16] })
                }
              ]}
            >
              <Text style={styles.floatingText}>NO₃⁻</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  transform: [
                    { translateX: modulesFloatC.interpolate({ inputRange: [0, 1], outputRange: [240, width - 180] }) },
                    { translateY: modulesFloatC.interpolate({ inputRange: [0, 1], outputRange: [120, 300] }) }
                  ],
                  opacity: modulesFloatC.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.28, 0.15] })
                }
              ]}
            >
              <Text style={styles.floatingText}>H₃O⁺</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  transform: [
                    { translateX: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [160, width - 200] }) },
                    { translateY: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [300, 180] }) }
                  ],
                  opacity: modulesFloatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.18, 0.32, 0.18] })
                }
              ]}
            >
              <Text style={styles.floatingText}>SO₄²⁻</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  transform: [
                    { translateX: modulesFloatC.interpolate({ inputRange: [0, 1], outputRange: [-80, width - 160] }) },
                    { translateY: modulesFloatC.interpolate({ inputRange: [0, 1], outputRange: [180, 260] }) }
                  ],
                  opacity: modulesFloatC.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.29, 0.16] })
                }
              ]}
            >
              <Text style={styles.floatingText}>Ca²⁺</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  transform: [
                    { translateX: modulesFloatB.interpolate({ inputRange: [0, 1], outputRange: [80, width - 140] }) },
                    { translateY: modulesFloatB.interpolate({ inputRange: [0, 1], outputRange: [260, 140] }) }
                  ],
                  opacity: modulesFloatB.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.14, 0.27, 0.14] })
                }
              ]}
            >
              <Text style={styles.floatingText}>Mg²⁺</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  transform: [
                    { translateX: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [0, width - 160] }) },
                    { translateY: modulesFloatA.interpolate({ inputRange: [0, 1], outputRange: [100, 220] }) }
                  ],
                  opacity: modulesFloatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.12, 0.25, 0.12] })
                }
              ]}
            >
              <Text style={styles.floatingText}>H⁺</Text>
            </Animated.View>
          </View>
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
          <View style={[styles.modulesContainer, { width: width, alignSelf: 'center' }]}>
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
              const colWidth = width / 2 - 24;
              const findById = (id: string) => modules.find(m => m.id === id)!;
              const left = [
                findById('imf-explorer'),
                findById('thermo-calculator'),
                findById('titration-simulator'),
              ];
              const right = [
                findById('molecular-geometry'),
                findById('lattice-energy'),
                findById('stoich-lab'),
              ];
              return (
                <>
                  <View style={{ width: colWidth }}>
                    {left.map((m, i) => renderModuleCard(m, i, colWidth))}
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
    backgroundColor: 'rgba(246, 247, 251, 0.85)',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogo: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#6c63ff',
  },
  navRight: {
    flexDirection: 'row',
  },
  navLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
    backgroundColor: '#f9fafb',
  },
  navLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(108, 99, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingElementLarge: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(108, 99, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(108, 99, 255, 0.66)',
  },
  floatingTextBold: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(108, 99, 255, 0.7)',
  },
  heroContainer: {
    marginBottom: 0,
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
    backgroundColor: '#ffffff',
    borderBottomColor: '#edf0f5',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  heroLeft: {
    width: '100%',
    alignItems: 'flex-start',
  },
  heroRight: {
    width: '48%',
    alignItems: 'flex-start',
    position: 'relative',
  },
  spinnerBox: {
    width: '50%',
    height: 160,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: -12,
    left: -8,
  },
  heroVisual: {
    width: '100%',
    height: 380,
  },
  heroCanvas: {
    width: '100%',
    height: 380,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  heroPlaceholder: {
    width: '100%',
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f7fb',
  },
  heroPlaceholderSmall: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f7fb',
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c63ff',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heroTextBlock: {
    width: '100%',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  heroTitleLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 0,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
  heroActionsLeft: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'flex-start',
  },
  heroActionsRight: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'flex-start',
  },
  heroButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  heroButtonLeft: {
    marginLeft: 0,
  },
  heroButtonCompact: {
    marginHorizontal: 3,
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  sectionBlock: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
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
    zIndex: 1,
  },
  modulesFloatLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 4,
    borderWidth: 1,
    minHeight: 160,
  },
  moduleCover: {
    height: 100,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
  },
  coverArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverAccent: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 120,
    transform: [{ rotate: '25deg' }],
    right: -20,
    top: -10,
  },
  coverEmoji: {
    fontSize: 28,
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
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#e5e7eb',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default HomeScreen;