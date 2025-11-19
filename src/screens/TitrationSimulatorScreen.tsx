import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface TitrationData {
  volume: number;
  pH: number;
}

interface AcidBasePair {
  name: string;
  acid: { formula: string; Ka: number; concentration: number };
  base: { formula: string; Kb: number; concentration: number };
  color: string;
}

const acidBasePairs: AcidBasePair[] = [
  {
    name: 'Strong Acid - Strong Base',
    acid: { formula: 'HCl', Ka: 1000, concentration: 0.1 },
    base: { formula: 'NaOH', Kb: 1000, concentration: 0.1 },
    color: '#FF6B6B'
  },
  {
    name: 'Weak Acid - Strong Base',
    acid: { formula: 'CH₃COOH', Ka: 1.8e-5, concentration: 0.1 },
    base: { formula: 'NaOH', Kb: 1000, concentration: 0.1 },
    color: '#34A853'
  },
  {
    name: 'Strong Acid - Weak Base',
    acid: { formula: 'HCl', Ka: 1000, concentration: 0.1 },
    base: { formula: 'NH₃', Kb: 1.8e-5, concentration: 0.1 },
    color: '#34A853'
  },
  {
    name: 'Weak Acid - Weak Base',
    acid: { formula: 'CH₃COOH', Ka: 1.8e-5, concentration: 0.1 },
    base: { formula: 'NH₃', Kb: 1.8e-5, concentration: 0.1 },
    color: '#34A853'
  }
];

const indicators = [
  { name: 'Phenolphthalein', pHRange: [8.2, 10.0], color: '#FF1493' },
  { name: 'Methyl Orange', pHRange: [3.1, 4.4], color: '#FF4500' },
  { name: 'Bromothymol Blue', pHRange: [6.0, 7.6], color: '#4169E1' },
  { name: 'Methyl Red', pHRange: [4.4, 6.2], color: '#DC143C' }
];

export default function TitrationSimulatorScreen() {
  const [selectedPair, setSelectedPair] = useState<AcidBasePair>(acidBasePairs[0]);
  const [selectedIndicator, setSelectedIndicator] = useState(indicators[0]);
  const [titrationData, setTitrationData] = useState<TitrationData[]>([]);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isTitrating, setIsTitrating] = useState(false);
  const [equivalencePoint, setEquivalencePoint] = useState<number | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const titrationInterval = useRef<NodeJS.Timeout | null>(null);

  const calculateTitrationCurve = (pair: AcidBasePair): TitrationData[] => {
    const data: TitrationData[] = [];
    const initialVolume = 25; // mL of acid solution
    const maxVolume = 50; // mL of base added
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const volume = (maxVolume * i) / steps;
      const pH = calculatepH(pair, volume, initialVolume);
      data.push({ volume, pH });
    }

    return data;
  };

  const calculatepH = (pair: AcidBasePair, volume: number, initialVolume: number): number => {
    const { acid, base } = pair;
    const molesAcid = acid.concentration * initialVolume / 1000;
    const molesBase = base.concentration * volume / 1000;

    if (acid.Ka === 1000 && base.Kb === 1000) {
      // Strong acid - Strong base
      if (molesBase < molesAcid) {
        const excessAcid = molesAcid - molesBase;
        const totalVolume = (initialVolume + volume) / 1000;
        const H3O = excessAcid / totalVolume;
        return -Math.log10(H3O);
      } else if (molesBase > molesAcid) {
        const excessBase = molesBase - molesAcid;
        const totalVolume = (initialVolume + volume) / 1000;
        const OH = excessBase / totalVolume;
        const pOH = -Math.log10(OH);
        return 14 - pOH;
      } else {
        return 7; // Equivalence point
      }
    } else if (acid.Ka !== 1000 && base.Kb === 1000) {
      // Weak acid - Strong base
      if (molesBase < molesAcid) {
        const remainingAcid = molesAcid - molesBase;
        const conjugateBase = molesBase;
        const totalVolume = (initialVolume + volume) / 1000;
        const ratio = conjugateBase / remainingAcid;
        return pair.acid.Ka ? -Math.log10(acid.Ka) + Math.log10(ratio) : 7;
      } else if (molesBase === molesAcid) {
        // Equivalence point - conjugate base
        const conjugateBase = molesBase;
        const totalVolume = (initialVolume + volume) / 1000;
        const Kb = 1e-14 / acid.Ka;
        const OH = Math.sqrt(Kb * conjugateBase / totalVolume);
        const pOH = -Math.log10(OH);
        return 14 - pOH;
      } else {
        const excessBase = molesBase - molesAcid;
        const totalVolume = (initialVolume + volume) / 1000;
        const OH = excessBase / totalVolume;
        const pOH = -Math.log10(OH);
        return 14 - pOH;
      }
    }

    return 7; // Default for other cases
  };

  const findEquivalencePoint = (data: TitrationData[]): number | null => {
    let maxSlope = 0;
    let eqPoint = null;

    for (let i = 1; i < data.length - 1; i++) {
      const slope = Math.abs(data[i + 1].pH - data[i - 1].pH) / (data[i + 1].volume - data[i - 1].volume);
      if (slope > maxSlope) {
        maxSlope = slope;
        eqPoint = data[i].volume;
      }
    }

    return eqPoint;
  };

  const startTitration = () => {
    setIsTitrating(true);
    setCurrentVolume(0);
    const data = calculateTitrationCurve(selectedPair);
    setTitrationData(data);
    const eqPoint = findEquivalencePoint(data);
    setEquivalencePoint(eqPoint);

    let index = 0;
    titrationInterval.current = setInterval(() => {
      if (index < data.length) {
        setCurrentVolume(data[index].volume);
        index += 2;
      } else {
        setIsTitrating(false);
        if (titrationInterval.current) {
          clearInterval(titrationInterval.current);
        }
      }
    }, 100);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const stopTitration = () => {
    setIsTitrating(false);
    if (titrationInterval.current) {
      clearInterval(titrationInterval.current);
    }
  };

  useEffect(() => {
    return () => {
      if (titrationInterval.current) {
        clearInterval(titrationInterval.current);
      }
    };
  }, []);

  const currentpH = titrationData.find(d => d.volume >= currentVolume)?.pH || 7;
  const indicatorColor = currentpH >= selectedIndicator.pHRange[0] && currentpH <= selectedIndicator.pHRange[1]
    ? selectedIndicator.color
    : '#cccccc';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Titration Simulator</Text>
        <Text style={styles.subtitle}>Interactive Acid-Base Titrations</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Acid-Base Pair</Text>
          <View style={styles.pairSelector}>
            {acidBasePairs.map((pair) => (
              <TouchableOpacity
                key={pair.name}
                style={[
                  styles.pairButton,
                  selectedPair.name === pair.name && styles.selectedPairButton,
                  { borderColor: pair.color }
                ]}
                onPress={() => setSelectedPair(pair)}
              >
                <Text style={[
                  styles.pairButtonText,
                  selectedPair.name === pair.name && styles.selectedPairButtonText
                ]}>
                  {pair.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Indicator</Text>
          <View style={styles.indicatorSelector}>
            {indicators.map((indicator) => (
              <TouchableOpacity
                key={indicator.name}
                style={[
                  styles.indicatorButton,
                  selectedIndicator.name === indicator.name && styles.selectedIndicatorButton
                ]}
                onPress={() => setSelectedIndicator(indicator)}
              >
                <View style={[styles.indicatorDot, { backgroundColor: indicator.color }]} />
                <Text style={styles.indicatorText}>{indicator.name}</Text>
                <Text style={styles.indicatorRange}>{indicator.pHRange[0]}-{indicator.pHRange[1]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.titrationControls}>
          <TouchableOpacity
            style={[styles.startButton, isTitrating && styles.stopButton]}
            onPress={isTitrating ? stopTitration : startTitration}
          >
            <Text style={styles.startButtonText}>
              {isTitrating ? 'Stop Titration' : 'Start Titration'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.simulationArea}>
        <View style={styles.beakerContainer}>
          <View style={styles.beaker}>
            <View style={[styles.solution, { backgroundColor: indicatorColor, opacity: 0.7 }]} />
            <View style={styles.beakerRim} />
          </View>
          <View style={styles.buret}>
            <View style={[styles.buretLiquid, { height: `${100 - (currentVolume / 50) * 100}%` }]} />
            <View style={styles.buretTip} />
          </View>
        </View>

        <View style={styles.readouts}>
          <View style={styles.readout}>
            <Text style={styles.readoutLabel}>Volume Added</Text>
            <Text style={styles.readoutValue}>{currentVolume.toFixed(1)} mL</Text>
          </View>
          <View style={styles.readout}>
            <Text style={styles.readoutLabel}>pH</Text>
            <Text style={styles.readoutValue}>{currentpH.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {titrationData.length > 0 && (
        <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
          <Text style={styles.chartTitle}>Titration Curve</Text>
          <View style={styles.simpleChart}>
            {titrationData.map((point, index) => {
              if (index % 5 !== 0) return null;
              const x = (point.volume / 50) * (width - 80);
              const y = 200 - ((point.pH - 2) / 12) * 180;
              return (
                <View
                  key={index}
                  style={[
                    styles.chartPoint,
                    {
                      left: x,
                      top: y,
                      backgroundColor: selectedPair.color,
                      transform: [
                        { scale: currentVolume >= point.volume ? 1.2 : 0.8 }
                      ]
                    }
                  ]}
                />
              );
            })}
            {equivalencePoint && (
              <View
                style={[
                  styles.equivalenceLine,
                  {
                    left: (equivalencePoint / 50) * (width - 80),
                    backgroundColor: '#FFD700'
                  }
                ]}
              />
            )}
          </View>
          
          {equivalencePoint && (
            <View style={styles.equivalenceInfo}>
              <Text style={styles.equivalenceText}>
                Equivalence Point: {equivalencePoint.toFixed(1)} mL
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Titration Info</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Initial pH</Text>
            <Text style={styles.infoCardValue}>
              {titrationData[0]?.pH.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Equivalence pH</Text>
            <Text style={styles.infoCardValue}>
              {equivalencePoint ? 
                titrationData.find(d => Math.abs(d.volume - equivalencePoint) < 0.5)?.pH.toFixed(2) || 'N/A'
                : 'N/A'
              }
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Indicator Range</Text>
            <Text style={styles.infoCardValue}>
              {selectedIndicator.pHRange[0]}-{selectedIndicator.pHRange[1]}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Color Change</Text>
            <View style={[styles.colorPreview, { backgroundColor: indicatorColor }]} />
          </View>
        </View>
      </View>
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
  controls: {
    padding: 20,
  },
  controlSection: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pairSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pairButton: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    width: '47%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedPairButton: {
    backgroundColor: '#fff',
    borderColor: '#34A853',
  },
  pairButtonText: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectedPairButtonText: {
    color: '#333',
  },
  indicatorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicatorButton: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedIndicatorButton: {
    backgroundColor: '#fff',
    borderColor: '#34A853',
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  indicatorText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  indicatorRange: {
    color: '#666',
    fontSize: 10,
  },
  titrationControls: {
    alignItems: 'center',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#34A853',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 5,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  simulationArea: {
    padding: 20,
    alignItems: 'center',
  },
  beakerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  beaker: {
    width: 100,
    height: 120,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#34A853',
    borderRadius: 0,
    borderBottomWidth: 5,
    position: 'relative',
    marginRight: 20,
  },
  solution: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderRadius: 0,
  },
  beakerRim: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    height: 6,
    backgroundColor: '#34A853',
    borderRadius: 3,
  },
  buret: {
    width: 15,
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 0,
    position: 'relative',
    marginBottom: 20,
  },
  buretLiquid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#34A853',
    borderRadius: 0,
  },
  buretTip: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: [{ translateX: -2 }],
    width: 4,
    height: 10,
    backgroundColor: '#34A853',
    borderRadius: 2,
  },
  readouts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  readout: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '40%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  readoutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  readoutValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  simpleChart: {
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    position: 'relative',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chartPoint: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  equivalenceLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  equivalenceInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  equivalenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  infoSection: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    width: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoCardTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginTop: 5,
  },
});