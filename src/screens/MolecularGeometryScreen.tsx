import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { GLView } from 'expo-gl';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import * as ExpoThree from 'expo-three';
import * as THREE from 'three';

interface GeometryInfo {
  name: string;
  bondAngle: string;
  description: string;
  example: string;
}

const MolecularGeometryScreen = () => {
  const [bondingPairs, setBondingPairs] = useState('');
  const [lonePairs, setLonePairs] = useState('');
  const [geometryInfo, setGeometryInfo] = useState<GeometryInfo | null>(null);
  const [centralAtom, setCentralAtom] = useState('');
  const [neighborAtomsText, setNeighborAtomsText] = useState('');

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
    
    // Determine electron-pair geometry based on total pairs
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
          Explore molecular shapes based on VSEPR theory by specifying the number of bonding and lone pairs.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Central Atom (optional):</Text>
          <TextInput
            style={styles.input}
            value={centralAtom}
            onChangeText={setCentralAtom}
            placeholder="e.g., C, N, O"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Neighbor Atoms (comma-separated, optional):</Text>
          <TextInput
            style={styles.input}
            value={neighborAtomsText}
            onChangeText={setNeighborAtomsText}
            placeholder="e.g., H,H,H,H or F,F,F,F,F"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number of Bonding Pairs:</Text>
          <TextInput
            style={styles.input}
            value={bondingPairs}
            onChangeText={setBondingPairs}
            placeholder="1-6"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number of Lone Pairs:</Text>
          <TextInput
            style={styles.input}
            value={lonePairs}
            onChangeText={setLonePairs}
            placeholder="0-3"
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={determineGeometry}
          disabled={!bondingPairs}
        >
          <Text style={styles.buttonText}>Determine Geometry</Text>
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
            <Text style={styles.visualizationTitle}>3D Visualization</Text>
            <Geometry3DView 
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
        
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Total Pairs</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Lone Pairs</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Geometry</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>2</Text>
            <Text style={styles.tableCell}>0</Text>
            <Text style={styles.tableCell}>Linear</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>3</Text>
            <Text style={styles.tableCell}>0</Text>
            <Text style={styles.tableCell}>Trigonal Planar</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>3</Text>
            <Text style={styles.tableCell}>1</Text>
            <Text style={styles.tableCell}>Bent</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>4</Text>
            <Text style={styles.tableCell}>0</Text>
            <Text style={styles.tableCell}>Tetrahedral</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>4</Text>
            <Text style={styles.tableCell}>1</Text>
            <Text style={styles.tableCell}>Trigonal Pyramidal</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>4</Text>
            <Text style={styles.tableCell}>2</Text>
            <Text style={styles.tableCell}>Bent</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>5</Text>
            <Text style={styles.tableCell}>0</Text>
            <Text style={styles.tableCell}>Trigonal Bipyramidal</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>6</Text>
            <Text style={styles.tableCell}>0</Text>
            <Text style={styles.tableCell}>Octahedral</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Geometry3DView = ({ geometryName, centralAtom, neighborAtoms, elementColor }: { geometryName: string; centralAtom: string; neighborAtoms: string[]; elementColor: (el: string) => number }) => {
  const getPositionsForGeometry = (name: string): THREE.Vector3[] => {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
    const sqrt3 = Math.sqrt(3);
    switch (name) {
      case 'Linear':
        return [v(0, 0, 1), v(0, 0, -1)];
      case 'Trigonal Planar':
        return [v(1, 0, 0), v(-0.5, sqrt3 / 2, 0), v(-0.5, -sqrt3 / 2, 0)];
      case 'Tetrahedral':
        return [v(1, 1, 1), v(1, -1, -1), v(-1, 1, -1), v(-1, -1, 1)];
      case 'Trigonal Bipyramidal':
        return [v(1, 0, 0), v(-0.5, sqrt3 / 2, 0), v(-0.5, -sqrt3 / 2, 0), v(0, 0, 1), v(0, 0, -1)];
      case 'Octahedral':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0), v(0, 0, 1), v(0, 0, -1)];
      case 'Trigonal Pyramidal':
        return [v(1, 0, 0), v(-0.5, sqrt3 / 2, 0), v(-0.5, -sqrt3 / 2, 0)];
      case 'Bent / Angular':
      case 'Bent':
        return [v(Math.cos(0.6), 0, Math.sin(0.6)), v(-Math.cos(0.6), 0, Math.sin(0.6))];
      case 'Seesaw':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 0, 1), v(0, 0, -1)];
      case 'T-shaped':
        return [v(1, 0, 0), v(0, 0, 1), v(0, 0, -1)];
      case 'Square Pyramidal':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0), v(0, 0, 1)];
      case 'Square Planar':
        return [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0)];
      default:
        return [v(0, 0, 1), v(0, 0, -1)];
    }
  };

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const renderer = new ExpoThree.Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');
    const camera = new THREE.PerspectiveCamera(70, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
    camera.position.z = 4;

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
    const onTouchStart = (x: number, y: number) => { isDragging = true; lastX = x; lastY = y; };
    const onTouchMove = (x: number, y: number) => {
      if (!isDragging) return;
      const dx = x - lastX;
      const dy = y - lastY;
      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.01;
      lastX = x; lastY = y;
    };
    const onTouchEnd = () => { isDragging = false; };

    // @ts-ignore
    gl.canvas.addEventListener('mousedown', (e: any) => onTouchStart(e.clientX, e.clientY));
    // @ts-ignore
    gl.canvas.addEventListener('mousemove', (e: any) => onTouchMove(e.clientX, e.clientY));
    // @ts-ignore
    gl.canvas.addEventListener('mouseup', onTouchEnd);
    // @ts-ignore
    gl.canvas.addEventListener('touchstart', (e: any) => onTouchStart(e.touches[0].clientX, e.touches[0].clientY));
    // @ts-ignore
    gl.canvas.addEventListener('touchmove', (e: any) => onTouchMove(e.touches[0].clientX, e.touches[0].clientY));
    // @ts-ignore
    gl.canvas.addEventListener('touchend', onTouchEnd);

    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <GLView
      style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden' }}
      onContextCreate={onContextCreate}
    />
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
  button: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 8,
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
    borderRadius: 10,
  },
  resultRow: {
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 16,
    color: '#333',
  },
  resultDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
  visualizationPlaceholder: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  visualizationDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default MolecularGeometryScreen;