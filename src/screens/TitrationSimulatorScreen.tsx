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

interface Species {
  name: string;
  formula: string;
  role: 'acid' | 'base';
  strength: 'strong' | 'weak';
  Ka?: number;
  Kb?: number;
  n: number;
}

interface Indicator {
  name: string;
  pHRange: [number, number];
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

const indicators: Indicator[] = [
  { name: 'Phenolphthalein', pHRange: [8.2, 10.0], color: '#FF1493' },
  { name: 'Methyl Orange', pHRange: [3.1, 4.4], color: '#FF4500' },
  { name: 'Bromothymol Blue', pHRange: [6.0, 7.6], color: '#4169E1' },
  { name: 'Methyl Red', pHRange: [4.4, 6.2], color: '#DC143C' }
];

const analyteOptions: Species[] = [
  { name: 'HCl', formula: 'HCl', role: 'acid', strength: 'strong', Ka: 1000, n: 1 },
  { name: 'H₂SO₄', formula: 'H₂SO₄', role: 'acid', strength: 'strong', Ka: 1000, n: 2 },
  { name: 'CH₃COOH', formula: 'CH₃COOH', role: 'acid', strength: 'weak', Ka: 1.8e-5, n: 1 },
];

const titrantOptions: Species[] = [
  { name: 'NaOH', formula: 'NaOH', role: 'base', strength: 'strong', Kb: 1000, n: 1 },
  { name: 'NH₃', formula: 'NH₃', role: 'base', strength: 'weak', Kb: 1.8e-5, n: 1 },
];

export default function TitrationSimulatorScreen({ navigation, route }: any) {
  const [selectedPair, setSelectedPair] = useState<AcidBasePair>(acidBasePairs[0]);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator>(indicators[0]);
  const [selectedAnalyte, setSelectedAnalyte] = useState<Species>({ name: 'HCl', formula: 'HCl', role: 'acid', strength: 'strong', Ka: 1000, n: 1 });
  const [selectedTitrant, setSelectedTitrant] = useState<Species>({ name: 'NaOH', formula: 'NaOH', role: 'base', strength: 'strong', Kb: 1000, n: 1 });
  const [titrationData, setTitrationData] = useState<TitrationData[]>([]);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isTitrating, setIsTitrating] = useState(false);
  const [equivalencePoint, setEquivalencePoint] = useState<number | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const titrationInterval = useRef<NodeJS.Timeout | null>(null);
  const [flaskColor, setFlaskColor] = useState('#cccccc');
  const [indicatorTriggered, setIndicatorTriggered] = useState(false);
  const [analyteVolumeInput, setAnalyteVolumeInput] = useState('25.0');
  const [titrantConcInput, setTitrantConcInput] = useState('0.100');
  const [totalAddVolumeInput, setTotalAddVolumeInput] = useState('50.0');
  const [endpointVolume, setEndpointVolume] = useState<number | null>(null);
  const [recommendedIndicator, setRecommendedIndicator] = useState<Indicator>(indicators[2]);
  const num = (s: string, fb: number) => {
    const v = parseFloat((s || '').replace(/[^0-9.+\-eE]/g, ''));
    return isFinite(v) && v > 0 ? v : fb;
  };

  const normalizeFormula = (f: string) => {
    const map: Record<string, string> = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
    return f.split('').map(c => map[c] ?? c).join('').replace(/\s+/g, '').toUpperCase();
  };

  const strongAcids = new Set(['HCL','HBR','HI','HNO3','H2SO4','HCLO4']);
  const strongBasesMono = new Set(['LIOH','NAOH','KOH']);
  const strongBasesDi = new Set(['CA(OH)2','SR(OH)2','BA(OH)2']);
  const weakAcids = new Set(['CH3COOH','HCOOH','HF','HNO2','HCLO','H2CO3','H3PO4','HCN','C6H5COOH','C6H8O7','H2C2O4','H2SO3','C3H6O3','H3BO3','C6H8O6']);
  const weakBases = new Set(['NH3','CH3NH2','C2H5NH2','C5H5N','C6H5NH2','N2H4','NH2OH','(CH3)3N','C8H10N4O2','C18H21NO3','CH3COO-','F-','CO3-2','HCO3-','PO4-3']);

  useEffect(() => {
    const aName = normalizeFormula(selectedAnalyte.name || '');
    const bName = normalizeFormula(selectedTitrant.name || '');
    const aStrong = strongAcids.has(aName) || weakAcids.has(aName) ? strongAcids.has(aName) : false;
    const bStrong = strongBasesMono.has(bName) || strongBasesDi.has(bName) ? true : weakBases.has(bName) ? false : false;
    const aKa = aStrong ? 1000 : (weakAcids.has(aName) ? 1.8e-5 : 1.8e-5);
    const bKb = bStrong ? 1000 : (weakBases.has(bName) ? 1.8e-5 : 1.8e-5);
    const bN = strongBasesDi.has(bName) ? 2 : 1;
    const updatedAnalyte: Species = { name: selectedAnalyte.name, formula: selectedAnalyte.name, role: 'acid', strength: aStrong ? 'strong' : 'weak', Ka: aKa, n: 1 };
    const updatedTitrant: Species = { name: selectedTitrant.name, formula: selectedTitrant.name, role: 'base', strength: bStrong ? 'strong' : 'weak', Kb: bKb, n: bN };
    const changed = JSON.stringify(updatedAnalyte) !== JSON.stringify(selectedAnalyte) || JSON.stringify(updatedTitrant) !== JSON.stringify(selectedTitrant);
    if (changed) {
      setSelectedAnalyte(updatedAnalyte);
      setSelectedTitrant(updatedTitrant);
    }
  }, [selectedAnalyte.name, selectedTitrant.name]);

  useEffect(() => {
    const acid = selectedAnalyte;
    const base = selectedTitrant;
    const name = `${acid.strength === 'strong' ? 'Strong' : 'Weak'} Acid - ${base.strength === 'strong' ? 'Strong' : 'Weak'} Base`;
    const color = acid.strength === 'strong' && base.strength === 'strong' ? '#FF6B6B' : '#34A853';
    setSelectedPair({
      name,
      acid: { formula: acid.formula, Ka: acid.Ka || 1e-5, concentration: 0.1 },
      base: { formula: base.formula, Kb: base.Kb || 1e-5, concentration: 0.1 },
      color,
    });
    setFlaskColor('#cccccc');
    setIndicatorTriggered(false);
  }, [selectedAnalyte, selectedTitrant]);

  useEffect(() => {
    const p = route?.params?.prefill || route?.params;
    if (p) {
      if (p.analyteVolumeInput != null) setAnalyteVolumeInput(String(p.analyteVolumeInput));
      if (p.titrantConcInput != null) setTitrantConcInput(String(p.titrantConcInput));
      if (p.totalAddVolumeInput != null) setTotalAddVolumeInput(String(p.totalAddVolumeInput));
      if (p.analyte) setSelectedAnalyte({ ...selectedAnalyte, name: p.analyte, formula: p.analyte });
      if (p.titrant) setSelectedTitrant({ ...selectedTitrant, name: p.titrant, formula: p.titrant });
    }
    if (route?.params?.autoRun) {
      startTitration();
    }
  }, [route?.params]);

  const calculateTitrationCurve = (pair: AcidBasePair, initialVolume: number, maxVolume: number, titrantConc: number, nA: number, nB: number): TitrationData[] => {
    const data: TitrationData[] = [];
    const steps = Math.max(200, Math.floor(maxVolume * 4));

    for (let i = 0; i <= steps; i++) {
      const volume = (maxVolume * i) / steps;
      const pH = calculatepH(pair, volume, initialVolume, titrantConc, nA, nB);
      data.push({ volume, pH });
    }

    return data;
  };

  const calculatepH = (pair: AcidBasePair, volume: number, initialVolume: number, titrantConc: number, nA: number, nB: number): number => {
    const { acid, base } = pair;
    const molesAcid = acid.concentration * initialVolume / 1000;
    const molesBase = titrantConc * volume / 1000;
    const acidEq = nA * molesAcid;
    const baseEq = nB * molesBase;

    if (acid.Ka === 1000 && base.Kb === 1000) {
      // Strong acid - Strong base
      if (baseEq < acidEq) {
        const excessAcid = acidEq - baseEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const H3O = excessAcid / totalVolume;
        return -Math.log10(H3O);
      } else if (baseEq > acidEq) {
        const excessBase = baseEq - acidEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const OH = excessBase / totalVolume;
        const pOH = -Math.log10(OH);
        return 14 - pOH;
      } else {
        return 7; // Equivalence point
      }
    } else if (acid.Ka !== 1000 && base.Kb === 1000) {
      // Weak acid - Strong base
      if (baseEq < acidEq) {
        const remainingAcid = acidEq - baseEq;
        const conjugateBase = baseEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const ratio = conjugateBase / remainingAcid;
        return pair.acid.Ka ? -Math.log10(acid.Ka) + Math.log10(ratio) : 7;
      } else if (baseEq === acidEq) {
        // Equivalence point - conjugate base
        const conjugateBase = baseEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const Kb = 1e-14 / acid.Ka;
        const OH = Math.sqrt(Kb * conjugateBase / totalVolume);
        const pOH = -Math.log10(OH);
        return 14 - pOH;
      } else {
        const excessBase = baseEq - acidEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const OH = excessBase / totalVolume;
        const pOH = -Math.log10(OH);
        return 14 - pOH;
      }
    } else if (acid.Ka === 1000 && base.Kb !== 1000) {
      // Strong acid - Weak base
      if (baseEq < acidEq) {
        const excessAcid = acidEq - baseEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const H3O = excessAcid / totalVolume;
        return -Math.log10(H3O);
      } else if (baseEq === acidEq) {
        const totalVolume = (initialVolume + volume) / 1000;
        const Ka = 1e-14 / base.Kb;
        const C = baseEq / totalVolume;
        const H = Math.sqrt(Ka * C);
        return -Math.log10(H);
      } else {
        const excessBase = baseEq - acidEq;
        const totalVolume = (initialVolume + volume) / 1000;
        const Kb = base.Kb;
        const OH = Math.sqrt(Kb * (excessBase / totalVolume));
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

  const findEndpointVolume = (data: TitrationData[], range: [number, number]): number | null => {
    let prevIn = false;
    for (let i = 0; i < data.length; i++) {
      const inRange = data[i].pH >= range[0] && data[i].pH <= range[1];
      if (!prevIn && inRange) return data[i].volume;
      prevIn = inRange;
    }
    return null;
  };

  const startTitration = () => {
    setIsTitrating(true);
    setCurrentVolume(0);
    setFlaskColor('#cccccc');
    setIndicatorTriggered(false);
    const initialVolume = num(analyteVolumeInput, 25);
    const maxVolume = num(totalAddVolumeInput, 50);
    const titrantConc = num(titrantConcInput, selectedPair.base.concentration || 0.1);
    const data = calculateTitrationCurve(selectedPair, initialVolume, maxVolume, titrantConc, selectedAnalyte.n, selectedTitrant.n);
    setTitrationData(data);
    const eqPoint = findEquivalencePoint(data);
    const endPoint = findEndpointVolume(data, selectedIndicator.pHRange);
    const stopAt = endPoint != null ? endPoint : (eqPoint != null ? eqPoint : maxVolume);
    setEquivalencePoint(eqPoint);
    setEndpointVolume(stopAt != null ? stopAt : eqPoint);

    let index = 0;
    const maxStop = maxVolume;
    titrationInterval.current = setInterval(() => {
      if (index < data.length) {
        const next = data[index];
        if (next.volume >= stopAt) {
          setCurrentVolume(stopAt);
          setEndpointVolume(stopAt);
          setFlaskColor(selectedIndicator.color);
          setIndicatorTriggered(true);
          setIsTitrating(false);
          if (titrationInterval.current) {
            clearInterval(titrationInterval.current);
          }
          return;
        }
        if (next.volume >= maxStop) {
          setIsTitrating(false);
          if (titrationInterval.current) {
            clearInterval(titrationInterval.current);
          }
          return;
        }
        setCurrentVolume(next.volume);
        index += 1;
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

  useEffect(() => {
    if (equivalencePoint != null && currentVolume >= equivalencePoint && !indicatorTriggered) {
      setFlaskColor(selectedIndicator.color);
      setIndicatorTriggered(true);
    }
  }, [currentVolume, equivalencePoint, selectedIndicator]);

  useEffect(() => {
    if (titrationData.length > 0) {
    const endPt = findEndpointVolume(titrationData, selectedIndicator.pHRange);
      if (endPt != null) {
        setEndpointVolume(endPt);
      } else if (equivalencePoint != null) {
        setEndpointVolume(equivalencePoint);
      }
    }
  }, [titrationData, selectedIndicator, equivalencePoint]);

  useEffect(() => {
    const initialVolume = parseFloat(analyteVolumeInput) || 25;
    const titrantConc = parseFloat(titrantConcInput) || selectedPair.base.concentration;
    const eqVol = titrantConc > 0 ? ((selectedAnalyte.n * selectedPair.acid.concentration * initialVolume) / (selectedTitrant.n * titrantConc)) : 0;
    const eqPH = calculatepH(selectedPair, eqVol, initialVolume, titrantConc, selectedAnalyte.n, selectedTitrant.n);
    let best = indicators[0];
    let bestScore = Infinity;
    for (const ind of indicators) {
      const [low, high] = ind.pHRange;
      const score = eqPH >= low && eqPH <= high ? 0 : Math.min(Math.abs(eqPH - low), Math.abs(eqPH - high));
      if (score < bestScore) { bestScore = score; best = ind; }
    }
    setRecommendedIndicator(best);
  }, [selectedPair, analyteVolumeInput, titrantConcInput, selectedAnalyte.n, selectedTitrant.n]);

  useEffect(() => {
    if (isTitrating) return;
    const initialVolume = num(analyteVolumeInput, 25);
    const maxVolume = num(totalAddVolumeInput, 50);
    const titrantConc = num(titrantConcInput, selectedPair.base.concentration || 0.1);
    const data = calculateTitrationCurve(selectedPair, initialVolume, maxVolume, titrantConc, selectedAnalyte.n, selectedTitrant.n);
    setTitrationData(data);
    const eqPoint = findEquivalencePoint(data);
    setEquivalencePoint(eqPoint);
    fadeAnim.setValue(1);
  }, [analyteVolumeInput, titrantConcInput, totalAddVolumeInput, selectedPair, selectedAnalyte.n, selectedTitrant.n, selectedIndicator, isTitrating]);

  return (
    <ScrollView style={styles.container}>
      {route?.params?.fromPractice && (
        <View style={styles.backRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back to Question</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Titration Simulator</Text>
        <Text style={styles.subtitle}>Interactive Acid-Base Titrations</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Chemical Identities</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Analyte (acid) — {selectedAnalyte.name || '—'}</Text>
            <TextInput
              style={styles.inputField}
              value={selectedAnalyte.name}
              onChangeText={(t) => { setSelectedAnalyte({ ...selectedAnalyte, name: t, formula: t }); setFlaskColor('#cccccc'); setIndicatorTriggered(false); }}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Titrant (base) — {selectedTitrant.name || '—'}</Text>
            <TextInput
              style={styles.inputField}
              value={selectedTitrant.name}
              onChangeText={(t) => { setSelectedTitrant({ ...selectedTitrant, name: t, formula: t }); setFlaskColor('#cccccc'); setIndicatorTriggered(false); }}
            />
          </View>
        </View>

        

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Analyte ({selectedAnalyte.name || 'Unknown'})</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Starting Volume (mL) — {isFinite(parseFloat(analyteVolumeInput)) ? (parseFloat(analyteVolumeInput).toFixed(1)) : '—'}</Text>
            <TextInput
              style={styles.inputField}
              keyboardType="decimal-pad"
              value={analyteVolumeInput}
              onChangeText={setAnalyteVolumeInput}
            />
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Titrant ({selectedTitrant.name || 'Known'})</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Concentration (M) — {isFinite(parseFloat(titrantConcInput)) ? (parseFloat(titrantConcInput).toFixed(3)) : '—'}</Text>
            <TextInput
              style={styles.inputField}
              keyboardType="decimal-pad"
              value={titrantConcInput}
              onChangeText={setTitrantConcInput}
            />
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Simulation Run</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Total Volume to Add (mL) — {isFinite(parseFloat(totalAddVolumeInput)) ? (parseFloat(totalAddVolumeInput).toFixed(1)) : '—'}</Text>
            <TextInput
              style={styles.inputField}
              keyboardType="decimal-pad"
              value={totalAddVolumeInput}
              onChangeText={setTotalAddVolumeInput}
            />
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Indicator</Text>
          <View style={styles.recommendRow}>
            <View style={styles.recommendBadge}>
              <View style={[styles.indicatorDot, { backgroundColor: recommendedIndicator.color }]} />
              <Text style={styles.indicatorText}>Recommended: {recommendedIndicator.name} ({recommendedIndicator.pHRange[0]}–{recommendedIndicator.pHRange[1]})</Text>
            </View>
            <TouchableOpacity style={[styles.recommendSetButton, (selectedAnalyte.strength === 'weak' && selectedTitrant.strength === 'weak') && { backgroundColor: '#adb5bd' }]} disabled={selectedAnalyte.strength === 'weak' && selectedTitrant.strength === 'weak'} onPress={() => { setSelectedIndicator(recommendedIndicator); setFlaskColor('#cccccc'); setIndicatorTriggered(false); }}>
              <Text style={styles.recommendSetButtonText}>Use</Text>
            </TouchableOpacity>
          </View>
          {(selectedAnalyte.strength === 'weak' && selectedTitrant.strength === 'weak') && (
            <Text style={styles.indicatorRange}>Indicator not suitable for weak acid–weak base</Text>
          )}
          <View style={styles.indicatorSelector}>
            {indicators.map((indicator) => (
              <TouchableOpacity
                key={indicator.name}
                style={[
                  styles.indicatorButton,
                  selectedIndicator.name === indicator.name && styles.selectedIndicatorButton
                ]}
                onPress={() => { setSelectedIndicator(indicator); setFlaskColor('#cccccc'); setIndicatorTriggered(false); }}
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
            <View style={[styles.solution, { backgroundColor: flaskColor, opacity: 0.7 }]} />
            <View style={styles.beakerRim} />
          </View>
          <View style={styles.buret}>
            <View style={[styles.buretLiquid, { height: `${Math.max(0, 100 - (currentVolume / num(totalAddVolumeInput, 50)) * 100)}%` }]} />
            <View style={styles.buretTip} />
            <View style={styles.buretValve} />
            <View style={styles.buretHandle} />
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
            {(() => {
              const totalVol = num(totalAddVolumeInput, 50);
              const chartH = 280;
              const chartW = width - 80;
              const padL = 28;
              const padR = 8;
              const padT = 8;
              const padB = 24;
              const plotW = Math.max(10, chartW - padL - padR);
              const plotH = Math.max(10, chartH - padT - padB);
              const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
              const yForPH = (p: number) => {
                const norm = p / 14; // 0..1 from 0 to 14
                const y = padT + (1 - norm) * (plotH - 6);
                return clamp(y, padT + 2, padT + plotH - 8);
              };
              const xForVol = (v: number) => {
                const x = padL + (v / totalVol) * plotW;
                return clamp(x, padL + 3, padL + plotW);
              };
              const ticksY = [0,2,4,6,8,10,12,14];
              const ticksX = [0, totalVol * 0.25, totalVol * 0.5, totalVol * 0.75, totalVol];
              return (
                <>
                  <View style={[styles.axisY, { left: padL, top: padT, bottom: padB }]} />
                  <View style={[styles.axisX, { left: padL, right: padR, bottom: padB }]} />
                  {ticksY.map((p) => (
                    <View key={`yt-${p}`} style={[styles.axisTickY, { left: padL - 3, top: yForPH(p) }]} />
                  ))}
                  {ticksY.map((p) => (
                    <Text key={`yl-${p}`} style={[styles.axisLabelY, { top: yForPH(p) - 6, left: padL - 26 }]}>{`pH ${p}`}</Text>
                  ))}
                  {ticksX.map((v, i) => (
                    <View key={`xt-${i}`} style={[styles.axisTickX, { left: xForVol(v), bottom: padB }]} />
                  ))}
                  {ticksX.map((v, i) => (
                    <Text key={`xl-${i}`} style={[styles.axisLabelX, { left: xForVol(v) - 12 }]}>{v.toFixed(0)} mL</Text>
                  ))}
                  {titrationData.map((point, index) => {
                    if (index % 5 !== 0) return null;
                    const x = xForVol(point.volume);
                    const y = yForPH(point.pH);
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
                          left: xForVol(equivalencePoint || 0),
                          top: padT,
                          bottom: padB,
                          backgroundColor: '#FFD700'
                        }
                      ]}
                    />
                  )}
                  <Text style={[styles.axisTitleY, { left: padL + 8, top: padT - 2 }]}>pH</Text>
                  <Text style={[styles.axisTitleX, { right: padR, bottom: padB + 8 }]}>Volume (mL)</Text>
                </>
              );
            })()}
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
            <Text style={styles.infoCardTitle}>Titration Type</Text>
            <Text style={styles.infoCardValue}>
              {selectedPair.name}
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
            <View style={[styles.colorPreview, { backgroundColor: flaskColor }]} />
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Equivalence Volume</Text>
            <Text style={styles.infoCardValue}>
              {equivalencePoint ? `${equivalencePoint.toFixed(2)} mL` : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Endpoint Volume</Text>
            <Text style={styles.infoCardValue}>
              {endpointVolume != null ? `${endpointVolume.toFixed(2)} mL` : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>ΔV (Endpoint − Eq.)</Text>
            <Text style={styles.infoCardValue}>
              {equivalencePoint != null && endpointVolume != null 
                ? `${(endpointVolume - equivalencePoint).toFixed(2)} mL` 
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Calculated Unknown Concentration</Text>
        {equivalencePoint ? (
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Analyte Concentration</Text>
              <Text style={styles.infoCardValue}>
                {(
                  ((selectedTitrant.n * (parseFloat(titrantConcInput) || 0)) *
                  ((equivalencePoint || 0))) /
                  ((selectedAnalyte.n * (parseFloat(analyteVolumeInput) || 1)))
                ).toFixed(4)} M
              </Text>
            </View>
            <View style={styles.calcBlock}
            >
              <Text style={styles.calcTitle}>Calculation</Text>
              <Text style={styles.calcText}>{selectedAnalyte.n} M_A × V_A = {selectedTitrant.n} M_B × V_B</Text>
              <Text style={styles.calcText}>M_B = {(parseFloat(titrantConcInput) || 0).toFixed(3)} M</Text>
              <Text style={styles.calcText}>V_A = {(parseFloat(analyteVolumeInput) || 0).toFixed(1)} mL</Text>
              <Text style={styles.calcText}>V_B = {(equivalencePoint || 0).toFixed(2)} mL</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.infoCardTitle}>Run the simulation to compute the concentration</Text>
        )}
      </View>
    </ScrollView>
  );
}

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
    borderColor: '#8b5cf6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  backText: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: 12,
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
    backgroundColor: '#f1f3f5',
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
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recommendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recommendSetButton: {
    backgroundColor: '#34A853',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recommendSetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  inputLabel: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  inputField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '45%',
    color: '#333',
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
    borderWidth: 2,
    borderColor: '#adb5bd',
    overflow: 'hidden',
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
  buretValve: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 8,
    backgroundColor: '#adb5bd',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#868e96',
  },
  buretHandle: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    transform: [{ translateX: 8 }, { rotate: '20deg' }],
    width: 10,
    height: 3,
    backgroundColor: '#868e96',
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
    height: 280,
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
  axisY: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 20,
    width: 1,
    backgroundColor: '#dee2e6',
  },
  axisX: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#dee2e6',
  },
  axisTickY: {
    position: 'absolute',
    left: 0,
    width: 6,
    height: 1,
    backgroundColor: '#ced4da',
  },
  axisTickX: {
    position: 'absolute',
    bottom: 0,
    width: 1,
    height: 6,
    backgroundColor: '#ced4da',
  },
  axisLabelY: {
    position: 'absolute',
    left: 8,
    fontSize: 10,
    color: '#6c757d',
  },
  axisLabelX: {
    position: 'absolute',
    bottom: -18,
    fontSize: 10,
    color: '#6c757d',
  },
  axisTitleY: {
    position: 'absolute',
    left: -4,
    top: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
  },
  axisTitleX: {
    position: 'absolute',
    right: 0,
    bottom: -34,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
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
  calcBlock: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 10,
    width: '47%',
    margin: 5,
  },
  calcTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 6,
  },
  calcText: {
    fontSize: 12,
    color: '#6c757d',
  },
});