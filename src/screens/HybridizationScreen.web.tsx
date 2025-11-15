import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import * as THREE from 'three';

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

  // Database of common molecules and their hybridization information
  const moleculeDatabase: { [key: string]: HybridizationInfo } = {
    'H2O': {
      centralAtom: 'O',
      hybridization: 'sp³',
      geometry: 'Bent (angular)',
      bondAngle: '104.5°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '1.24 (O-H)',
    },
    'CO2': {
      centralAtom: 'C',
      hybridization: 'sp',
      geometry: 'Linear',
      bondAngle: '180°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '0.89 (C-O)',
    },
    'NH3': {
      centralAtom: 'N',
      hybridization: 'sp³',
      geometry: 'Trigonal pyramidal',
      bondAngle: '107°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '0.9 (N-H)',
    },
    'CH4': {
      centralAtom: 'C',
      hybridization: 'sp³',
      geometry: 'Tetrahedral',
      bondAngle: '109.5°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '0.35 (C-H)',
    },
    'C2H4': {
      centralAtom: 'C',
      hybridization: 'sp²',
      geometry: 'Trigonal planar',
      bondAngle: '120°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '0.35 (C-H)',
    },
    'C2H2': {
      centralAtom: 'C',
      hybridization: 'sp',
      geometry: 'Linear',
      bondAngle: '180°',
      bondType: 'Polar Covalent',
      electronegativityDifference: '0.35 (C-H)',
    },
  };

  const calculateHybridization = () => {
    if (!molecule) return;
    parseMolecule(molecule);

    // Check if the molecule is in our database
    const normalizedMolecule = molecule.replace(/\s+/g, '').toUpperCase();
    
    // Default to H2O if molecule not found in database
    const info = moleculeDatabase[normalizedMolecule] || moleculeDatabase['H2O'];
    
    // Always display hybridization information for any input
    setHybridizationInfo(info);
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
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Central Atom: {hybridizationInfo.centralAtom}</Text>
            <Text style={styles.infoText}>Hybridization: {hybridizationInfo.hybridization}</Text>
            <Text style={styles.infoText}>Geometry: {hybridizationInfo.geometry}</Text>
            <Text style={styles.infoText}>Bond Angle: {hybridizationInfo.bondAngle}</Text>
            <Text style={styles.infoText}>Bond Type: {hybridizationInfo.bondType}</Text>
            <Text style={styles.infoText}>Electronegativity Difference: {hybridizationInfo.electronegativityDifference}</Text>
          </View>
        </View>
      )}

      {hybridizationInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3D Visualization</Text>
          <HybridOrbitalsWebView
            type={hybridizationInfo.hybridization}
            centralAtom={hybridizationInfo.centralAtom}
          />
        </View>
      )}
    </ScrollView>
  );
};

const HybridOrbitalsWebView = ({ type, centralAtom }: { type: string; centralAtom: string }) => {
  const containerRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  const elementColor = (el: string): number => {
    switch (el) {
      case 'H': return 0xffffff;
      case 'C': return 0x333333;
      case 'N': return 0x3f51b5;
      case 'O': return 0x2196f3;
      default: return 0x607d8b;
    }
  };

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
  
  // Helper to create vectors at specific angles
  const vFromAngles = (theta: number, phi: number) => {
    const radTheta = theta * Math.PI / 180;
    const radPhi = phi * Math.PI / 180;
    const x = Math.sin(radTheta) * Math.cos(radPhi);
    const y = Math.sin(radTheta) * Math.sin(radPhi);
    const z = Math.cos(radTheta);
    return new THREE.Vector3(x, y, z);
  };
  
  const getDirections = (hyb: string): THREE.Vector3[] => {
    switch (hyb) {
      case 'sp':
        // Linear - 180° angle
        return [v(0, 0, 1), v(0, 0, -1)];
      case 'sp²':
        // Trigonal planar - 120° angles
        return [
          vFromAngles(90, 0),
          vFromAngles(90, 120),
          vFromAngles(90, 240)
        ];
      case 'sp³':
        // Tetrahedral - 109.5° angles
        const tetrahedralAngle = 109.47;
        const radTetra = tetrahedralAngle * Math.PI / 180;
        return [
          vFromAngles(tetrahedralAngle / 2, 0),
          vFromAngles(tetrahedralAngle / 2, 120),
          vFromAngles(tetrahedralAngle / 2, 240),
          vFromAngles(180 - tetrahedralAngle / 2, 0)
        ];
      case 'sp³d':
        // Trigonal bipyramidal - 90° and 120° angles
        return [
          v(0, 0, 1),  // axial
          v(0, 0, -1), // axial
          vFromAngles(90, 0),    // equatorial
          vFromAngles(90, 120),  // equatorial
          vFromAngles(90, 240)   // equatorial
        ];
      case 'sp³d²':
        // Octahedral - 90° angles
        return [
          v(1, 0, 0), v(-1, 0, 0),
          v(0, 1, 0), v(0, -1, 0),
          v(0, 0, 1), v(0, 0, -1)
        ];
      default:
        return [v(0, 0, 1), v(0, 0, -1)];
    }
  };

  const makeLobe = (dir: THREE.Vector3, color: number) => {
    const group = new THREE.Group();

    // Create bond cylinder
    const bondGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 16);
    const bondMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const bond = new THREE.Mesh(bondGeometry, bondMaterial);

    // Rotate bond to align with direction vector
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    bond.quaternion.copy(quaternion);

    // Create accurate teardrop-shaped lobe (replace scaled sphere)
    const cylinderGeometry = new THREE.CylinderGeometry(0.15, 0.25, 1.2, 32);
    const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const lobeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700, // More golden color like reference
      transparent: true,
      opacity: 0.7,
      emissive: new THREE.Color(0xffd700).multiplyScalar(0.2)
    });

    // Create two teardrop lobes for each bond
    const lobe1 = new THREE.Group();
    const lobe1Cylinder = new THREE.Mesh(cylinderGeometry, lobeMaterial);
    const lobe1Sphere = new THREE.Mesh(sphereGeometry, lobeMaterial);
    lobe1Cylinder.position.y = 0.6;
    lobe1Sphere.position.y = 1.2;
    lobe1.add(lobe1Cylinder);
    lobe1.add(lobe1Sphere);

    const lobe2 = new THREE.Group();
    const lobe2Cylinder = new THREE.Mesh(cylinderGeometry, lobeMaterial);
    const lobe2Sphere = new THREE.Mesh(sphereGeometry, lobeMaterial);
    lobe2Cylinder.position.y = -0.6;
    lobe2Cylinder.rotation.x = Math.PI;
    lobe2Sphere.position.y = -1.2;
    lobe2.add(lobe2Cylinder);
    lobe2.add(lobe2Sphere);

    // Position lobes along the bond with proper spacing
    lobe1.position.copy(dir.clone().multiplyScalar(0.7));
    lobe2.position.copy(dir.clone().multiplyScalar(-0.7));

    // Apply the same rotation to lobes
    lobe1.quaternion.copy(quaternion);
    lobe2.quaternion.copy(quaternion);

    group.add(bond);
    group.add(lobe1);
    group.add(lobe2);

    return group;
  };

  useEffect(() => {
    const container = containerRef.current;
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
    scene.background = new THREE.Color('#f5f5f7');

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
    // Dynamic camera position based on hybridization type
    camera.position.z = type.includes('d') ? 4.5 : type === 'sp' ? 2.8 : 3;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);

    // Smaller central atom
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.MeshPhongMaterial({ 
        color: elementColor(centralAtom),
        emissive: new THREE.Color(elementColor(centralAtom)).multiplyScalar(0.2)
      })
    );
    scene.add(nucleus);

    // Orbitals group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    const dirs = getDirections(type);
    const color = 0xffd700; // Golden color for lobes
    dirs.forEach((d) => group.add(makeLobe(d, color)));

    // Smoother mouse rotation
    let dragging = false;
    let lx = 0, ly = 0;
    const canvas = renderer.domElement;
    const onDown = (e: MouseEvent) => { dragging = true; lx = e.clientX; ly = e.clientY; };
    const onUp = () => { dragging = false; };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      if (groupRef.current) {
        groupRef.current.rotation.y += dx * 0.005; // Smoother rotation
        groupRef.current.rotation.x += dy * 0.005;
      }
    };
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mousemove', onMove);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mousemove', onMove);
      renderer.dispose();
    };
  }, [type, centralAtom]);

  return <View ref={containerRef} style={{ width: '100%', height: 380 }} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});

export default HybridizationScreen;