import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import * as THREE from 'three';

interface GeometryInfo {
  name: string;
  bondAngle: string;
  description: string;
  example: string;
}

interface MoleculeInfo {
  centralAtom: string;
  neighborAtoms: string[];
  bondingPairs: number;
  lonePairs: number;
}

// Common molecules and their structures
const COMMON_MOLECULES: Record<string, MoleculeInfo> = {
  'H2O': { centralAtom: 'O', neighborAtoms: ['H', 'H'], bondingPairs: 2, lonePairs: 2 },
  'NH3': { centralAtom: 'N', neighborAtoms: ['H', 'H', 'H'], bondingPairs: 3, lonePairs: 1 },
  'CH4': { centralAtom: 'C', neighborAtoms: ['H', 'H', 'H', 'H'], bondingPairs: 4, lonePairs: 0 },
  'CO2': { centralAtom: 'C', neighborAtoms: ['O', 'O'], bondingPairs: 2, lonePairs: 0 },
  'PCl5': { centralAtom: 'P', neighborAtoms: ['Cl', 'Cl', 'Cl', 'Cl', 'Cl'], bondingPairs: 5, lonePairs: 0 },
  'SF6': { centralAtom: 'S', neighborAtoms: ['F', 'F', 'F', 'F', 'F', 'F'], bondingPairs: 6, lonePairs: 0 },
  'BF3': { centralAtom: 'B', neighborAtoms: ['F', 'F', 'F'], bondingPairs: 3, lonePairs: 0 },
  'SF4': { centralAtom: 'S', neighborAtoms: ['F', 'F', 'F', 'F'], bondingPairs: 4, lonePairs: 1 },
  'ClF3': { centralAtom: 'Cl', neighborAtoms: ['F', 'F', 'F'], bondingPairs: 3, lonePairs: 2 },
  'XeF4': { centralAtom: 'Xe', neighborAtoms: ['F', 'F', 'F', 'F'], bondingPairs: 4, lonePairs: 2 },
};

const MolecularGeometryScreen = () => {
  const [molecule, setMolecule] = useState('');
  const [bondingPairs, setBondingPairs] = useState('');
  const [lonePairs, setLonePairs] = useState('');
  const [geometryInfo, setGeometryInfo] = useState<GeometryInfo | null>(null);
  const [centralAtom, setCentralAtom] = useState('');
  const [neighborAtomsText, setNeighborAtomsText] = useState('');

  // Parse molecule input and set all relevant fields
  const parseMolecule = (moleculeInput: string) => {
    const mol = moleculeInput.trim();
    if (!mol) return;
    
    // Check if it's a common molecule
    const info = COMMON_MOLECULES[mol];
    if (info) {
      setCentralAtom(info.centralAtom);
      setNeighborAtomsText(info.neighborAtoms.join(', '));
      setBondingPairs(info.bondingPairs.toString());
      setLonePairs(info.lonePairs.toString());
      return;
    }
    
    // Basic parsing for simple molecules
    try {
      // Very simple parser for basic molecules like H2O, NH3, etc.
      const regex = /([A-Z][a-z]?)(\d*)/g;
      let match;
      const atoms: string[] = [];
      
      while ((match = regex.exec(mol)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        
        for (let i = 0; i < count; i++) {
          atoms.push(element);
        }
      }
      
      if (atoms.length > 1) {
        // Guess the central atom (usually not H and usually appears once)
        const frequencies: Record<string, number> = {};
        atoms.forEach(atom => {
          frequencies[atom] = (frequencies[atom] || 0) + 1;
        });
        
        // Central atom is usually not hydrogen and appears fewer times
        let central = '';
        if (atoms.some(a => a !== 'H')) {
          central = Object.entries(frequencies)
            .filter(([atom]) => atom !== 'H')
            .sort(([, countA], [, countB]) => countA - countB)[0][0];
        } else {
          central = atoms[0]; // Default to first atom if all are hydrogen
        }
        
        // Neighbors are all other atoms
        const neighbors = atoms.filter(a => a !== central || frequencies[a] > 1);
        
        setCentralAtom(central);
        setNeighborAtomsText(neighbors.join(', '));
        setBondingPairs(neighbors.length.toString());
        setLonePairs('0'); // Default to 0, hard to determine automatically
      }
    } catch (e) {
      console.error('Failed to parse molecule:', e);
    }
  };

  useEffect(() => {
    if (molecule) {
      parseMolecule(molecule);
    }
  }, [molecule]);

  const parseNeighbors = (): string[] => {
    return neighborAtomsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const elementColor = (el: string): number => {
    const map: Record<string, number> = {
      H: 0xffffff,
      C: 0x808080,
      N: 0x3050f8,
      O: 0xff0d0d,
      F: 0x90e050,
      Cl: 0x1ff01f,
      Br: 0xa62929,
      I: 0x940094,
      S: 0xffd123,
      P: 0xff8000,
      Xe: 0x429eb0,
      B: 0xffb5b5,
    };
    return map[el] ?? 0xaaaaaa;
  };

  const determineGeometry = () => {
    const neighbors = parseNeighbors();
    const bp = neighbors.length > 0 ? neighbors.length : (parseInt(bondingPairs) || 0);
    const lp = parseInt(lonePairs) || 0;
    
    if (bp < 1 || bp > 6 || lp < 0 || lp > 3) {
      alert('Please enter valid values: Bonding pairs (1-6) and Lone pairs (0-3)');
      return;
    }
    
    const totalPairs = bp + lp;
    let geometry: GeometryInfo;
    
    switch (totalPairs) {
      case 2:
        geometry = {
          name: lp === 0 ? 'Linear' : 'Bent',
          bondAngle: lp === 0 ? '180°' : '< 180°',
          description: lp === 0 
            ? 'Two bonding pairs arrange themselves 180° apart to minimize repulsion.'
            : 'The lone pair pushes the bonding pairs closer together, resulting in a bent shape.',
          example: lp === 0 ? 'CO₂, BeF₂' : 'SO₂, O₃'
        };
        break;
      case 3:
        if (lp === 0) {
          geometry = {
            name: 'Trigonal Planar',
            bondAngle: '120°',
            description: 'Three bonding pairs arrange themselves in a flat triangle to minimize repulsion.',
            example: 'BF₃, CO₃²⁻'
          };
        } else if (lp === 1) {
          geometry = {
            name: 'Bent / Angular',
            bondAngle: '< 120°',
            description: 'The lone pair pushes the bonding pairs closer together, resulting in a bent shape.',
            example: 'SO₂, NO₂⁻'
          };
        } else {
          geometry = {
            name: 'Linear',
            bondAngle: '180°',
            description: 'The two lone pairs push the bonding pair to opposite sides.',
            example: 'I₃⁻, XeF₂'
          };
        }
        break;
      case 4:
        if (lp === 0) {
          geometry = {
            name: 'Tetrahedral',
            bondAngle: '109.5°',
            description: 'Four bonding pairs arrange themselves in a tetrahedron to minimize repulsion.',
            example: 'CH₄, CCl₄'
          };
        } else if (lp === 1) {
          geometry = {
            name: 'Trigonal Pyramidal',
            bondAngle: '< 109.5°',
            description: 'The lone pair pushes the bonding pairs closer together, resulting in a pyramid shape.',
            example: 'NH₃, PF₃'
          };
        } else if (lp === 2) {
          geometry = {
            name: 'Bent / Angular',
            bondAngle: '< 109.5°',
            description: 'The two lone pairs push the bonding pairs closer together, resulting in a bent shape.',
            example: 'H₂O, H₂S'
          };
        } else {
          geometry = {
            name: 'Linear',
            bondAngle: '180°',
            description: 'The three lone pairs push the bonding pair to opposite sides.',
            example: 'XeF₂'
          };
        }
        break;
      case 5:
        if (lp === 0) {
          geometry = {
            name: 'Trigonal Bipyramidal',
            bondAngle: '90°, 120°',
            description: 'Five bonding pairs arrange themselves with three in a plane and two at the poles.',
            example: 'PCl₅, PF₅'
          };
        } else if (lp === 1) {
          geometry = {
            name: 'Seesaw',
            bondAngle: 'varies',
            description: 'The lone pair occupies an equatorial position, pushing the bonding pairs into a seesaw shape.',
            example: 'SF₄, XeO₂F₂'
          };
        } else if (lp === 2) {
          geometry = {
            name: 'T-shaped',
            bondAngle: '90°',
            description: 'The two lone pairs occupy equatorial positions, pushing the bonding pairs into a T shape.',
            example: 'ClF₃, BrF₃'
          };
        } else {
          geometry = {
            name: 'Linear',
            bondAngle: '180°',
            description: 'The three lone pairs occupy equatorial positions, pushing the bonding pairs to the poles.',
            example: 'XeF₂, I₃⁻'
          };
        }
        break;
      case 6:
        if (lp === 0) {
          geometry = {
            name: 'Octahedral',
            bondAngle: '90°',
            description: 'Six bonding pairs arrange themselves at the corners of an octahedron.',
            example: 'SF₆, PF₆⁻'
          };
        } else if (lp === 1) {
          geometry = {
            name: 'Square Pyramidal',
            bondAngle: '90°',
            description: 'The lone pair pushes the bonding pairs into a square pyramid shape.',
            example: 'BrF₅, XeOF₄'
          };
        } else if (lp === 2) {
          geometry = {
            name: 'Square Planar',
            bondAngle: '90°',
            description: 'The two lone pairs push the bonding pairs into a square planar shape.',
            example: 'XeF₄, ICl₄⁻'
          };
        } else {
          geometry = {
            name: 'T-shaped',
            bondAngle: '90°',
            description: 'The three lone pairs push the bonding pairs into a T shape.',
            example: 'ClF₃, BrF₃'
          };
        }
        break;
      default:
        alert('Invalid combination of bonding and lone pairs');
        return;
    }
    setGeometryInfo(geometry);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3D Molecular Geometry Explorer</Text>
        <Text style={styles.description}>
          Enter a molecule formula to explore its 3D geometry based on VSEPR theory.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Molecule:</Text>
          <TextInput
            style={styles.input}
            value={molecule}
            onChangeText={setMolecule}
            placeholder="e.g., H2O, CH4, NH3, SF6"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Central Atom:</Text>
          <Text style={styles.infoValue}>{centralAtom}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Surrounding Atoms:</Text>
          <Text style={styles.infoValue}>{neighborAtomsText}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Bonding Pairs:</Text>
          <Text style={styles.infoValue}>{bondingPairs}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Lone Pairs:</Text>
          <Text style={styles.infoValue}>{lonePairs}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={determineGeometry}>
          <Text style={styles.buttonText}>Show Geometry</Text>
        </TouchableOpacity>
      </View>
      
      {geometryInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Molecular Geometry</Text>
          
          <View style={styles.resultContainer}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Geometry:</Text>
              <Text style={styles.resultValue}>{geometryInfo.name}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Bond Angle:</Text>
              <Text style={styles.resultValue}>{geometryInfo.bondAngle}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Description:</Text>
              <Text style={styles.resultDescription}>{geometryInfo.description}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Examples:</Text>
              <Text style={styles.resultValue}>{geometryInfo.example}</Text>
            </View>
          </View>
          
          <View style={styles.geometryVisualization}>
            <Text style={styles.visualizationTitle}>3D Web Visualization</Text>
            <ThreeJSWebView 
              geometryName={geometryInfo.name}
              centralAtom={centralAtom}
              neighborAtoms={parseNeighbors()}
              elementColor={elementColor}
            />
            <Text style={styles.visualizationDescription}>
              Drag to rotate. Bonds are lines; atoms are spheres. Layout approximates VSEPR.
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VSEPR Theory Reference</Text>
        <Text style={styles.description}>
          Valence Shell Electron Pair Repulsion (VSEPR) theory predicts molecular shapes based on the arrangement of electron pairs around a central atom.
        </Text>
      </View>
    </ScrollView>
  );
};

const ThreeJSWebView = ({ geometryName, centralAtom, neighborAtoms, elementColor }: { geometryName: string; centralAtom: string; neighborAtoms: string[]; elementColor: (el: string) => number }) => {
  const containerRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  const getPositionsForGeometry = (name: string): THREE.Vector3[] => {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
    const sqrt3 = Math.sqrt(3);
    switch (name) {
      case 'Linear':
        return [v(0, 0, 1), v(0, 0, -1)];
      case 'Trigonal Planar':
        return [v(1, 0, 0), v(-0.5, sqrt3 / 2, 0), v(-0.5, -sqrt3 / 2, 0)];
      case 'Tetrahedral':
        return [v(1, 1, 1), v(-1, -1, 1), v(-1, 1, -1), v(1, -1, -1)];
      case 'Trigonal Bipyramidal':
        return [v(0, 0, 1), v(0, 0, -1), v(1, 0, 0), v(-0.5, sqrt3 / 2, 0), v(-0.5, -sqrt3 / 2, 0)];
      case 'Octahedral':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0), v(0, 0, 1), v(0, 0, -1)];
      case 'Trigonal Pyramidal':
        // Adjusted to show proper pyramid with central atom above the base
        return [v(1, 0, -0.5), v(-0.5, sqrt3 / 2, -0.5), v(-0.5, -sqrt3 / 2, -0.5)];
      case 'Bent / Angular':
      case 'Bent':
        // Adjusted to show proper bent geometry (104.5° for water)
        return [v(Math.cos(Math.PI * 0.29), 0, Math.sin(Math.PI * 0.29)), v(-Math.cos(Math.PI * 0.29), 0, Math.sin(Math.PI * 0.29))];
      case 'Seesaw':
        // Improved seesaw geometry with correct angles
        return [v(0, 0, 1), v(0, 0, -1), v(1, 0, 0), v(-1, 0, 0)];
      case 'T-shaped':
        // Improved T-shaped geometry with 90° angles
        return [v(1, 0, 0), v(0, 1, 0), v(0, -1, 0)];
      case 'Square Pyramidal':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0), v(0, 0, 1)];
      case 'Square Planar':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0)];
      default:
        return [v(0, 0, 1), v(0, 0, -1)];
    }
  };

  useEffect(() => {
    const container: HTMLElement | null = containerRef.current as any;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    camera.position.z = 4;
    cameraRef.current = camera;

    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 32, 32),
      new THREE.MeshPhongMaterial({ color: elementColor(centralAtom || 'C') })
    );
    scene.add(nucleus);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const positions = getPositionsForGeometry(geometryName);
    const bondMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
    const defaultAtomMaterial = new THREE.MeshPhongMaterial({ color: 0xea4335 });

    positions.forEach((pos, idx) => {
      const points = [new THREE.Vector3(0, 0, 0), pos.clone().multiplyScalar(2)];
      const bondGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const bond = new THREE.Line(bondGeometry, bondMaterial);
      group.add(bond);

      const color = elementColor(neighborAtoms[idx] || 'H');
      const atomMaterial = new THREE.MeshPhongMaterial({ color });
      const atom = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), atomMaterial || defaultAtomMaterial);
      atom.position.copy(pos.clone().multiplyScalar(2));
      group.add(atom);
    });

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      groupRef.current.rotation.y += dx * 0.01;
      groupRef.current.rotation.x += dy * 0.01;
      lastX = e.clientX; lastY = e.clientY;
    };
    const onUp = () => { isDragging = false; };
    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    const onResize = () => {
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const render = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();

    return () => {
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [geometryName]);

  return <View ref={containerRef} style={styles.webCanvasContainer} />;
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
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  button: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultLabel: {
    fontWeight: 'bold',
    width: 120,
    color: '#333',
  },
  resultValue: {
    flex: 1,
    color: '#333',
  },
  resultDescription: {
    flex: 1,
    color: '#333',
  },
  geometryVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  visualizationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  visualizationDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  webCanvasContainer: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});

export default MolecularGeometryScreen;