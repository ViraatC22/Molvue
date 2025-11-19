import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated, ImageBackground } from 'react-native';

interface ThermoData {
  compound: string;
  deltaHf: number; // kJ/mol - Standard Enthalpy of Formation
  S: number; // J/mol·K - Standard Molar Entropy
  state: string; // Physical state
}

const thermodynamicDatabase: ThermoData[] = [
  // Elements in standard state
  { compound: 'O₂(g)', deltaHf: 0, S: 205.03, state: 'gas' },
  { compound: 'N₂(g)', deltaHf: 0, S: 191.50, state: 'gas' },
  { compound: 'H₂(g)', deltaHf: 0, S: 130.68, state: 'gas' },
  { compound: 'C(s, graphite)', deltaHf: 0, S: 5.74, state: 'solid' },
  { compound: 'Fe(s)', deltaHf: 0, S: 27.28, state: 'solid' },
  { compound: 'Cu(s)', deltaHf: 0, S: 33.15, state: 'solid' },
  
  // Common compounds
  { compound: 'H₂O(l)', deltaHf: -285.83, S: 69.91, state: 'liquid' },
  { compound: 'H₂O(g)', deltaHf: -241.82, S: 188.83, state: 'gas' },
  { compound: 'CO₂(g)', deltaHf: -393.51, S: 213.68, state: 'gas' },
  { compound: 'CO(g)', deltaHf: -110.53, S: 197.66, state: 'gas' },
  { compound: 'CH₄(g)', deltaHf: -74.87, S: 186.15, state: 'gas' },
  { compound: 'NH₃(g)', deltaHf: -46.11, S: 192.34, state: 'gas' },
  { compound: 'HCl(g)', deltaHf: -92.31, S: 186.77, state: 'gas' },
  { compound: 'SO₂(g)', deltaHf: -296.84, S: 248.11, state: 'gas' },
  { compound: 'SO₃(g)', deltaHf: -395.72, S: 256.76, state: 'gas' },
  { compound: 'NO(g)', deltaHf: 90.25, S: 210.76, state: 'gas' },
  { compound: 'NO₂(g)', deltaHf: 33.18, S: 240.06, state: 'gas' },
  { compound: 'H₂SO₄(l)', deltaHf: -814.0, S: 156.90, state: 'liquid' },
  { compound: 'HNO₃(l)', deltaHf: -174.10, S: 155.60, state: 'liquid' },
  
  // Solids
  { compound: 'NaCl(s)', deltaHf: -411.15, S: 72.13, state: 'solid' },
  { compound: 'CaCO₃(s)', deltaHf: -1206.9, S: 92.9, state: 'solid' },
  { compound: 'CaO(s)', deltaHf: -635.1, S: 38.1, state: 'solid' },
  { compound: 'NaOH(s)', deltaHf: -426.7, S: 64.4, state: 'solid' },
  { compound: 'KCl(s)', deltaHf: -436.7, S: 82.6, state: 'solid' },
  { compound: 'AgCl(s)', deltaHf: -127.0, S: 96.2, state: 'solid' },
  
  // Ions in aqueous solution
  { compound: 'H⁺(aq)', deltaHf: 0, S: 0, state: 'aqueous' },
  { compound: 'OH⁻(aq)', deltaHf: -229.99, S: -10.75, state: 'aqueous' },
  { compound: 'Na⁺(aq)', deltaHf: -240.12, S: 59.0, state: 'aqueous' },
  { compound: 'Cl⁻(aq)', deltaHf: -167.16, S: 56.5, state: 'aqueous' },
  { compound: 'K⁺(aq)', deltaHf: -252.38, S: 102.5, state: 'aqueous' },
  { compound: 'Ca²⁺(aq)', deltaHf: -542.83, S: -53.1, state: 'aqueous' },
];

export default function ThermoCalculatorScreen() {
  const [reaction, setReaction] = useState('');
  const [temperature, setTemperature] = useState('298');
  const [results, setResults] = useState<{
    deltaH: number;
    deltaS: number;
    deltaG: number;
    K: number;
    spontaneous: boolean;
    equilibriumTemp: number | null;
    temperatureDependence: string;
    missingCompounds: string[];
    reactionType: string;
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  interface ParsedCompound {
    coefficient: number;
    compound: string;
    thermoData: ThermoData | null;
  }

  const toSubscript = (s: string) => s
    .replace(/0/g, '₀')
    .replace(/1/g, '₁')
    .replace(/2/g, '₂')
    .replace(/3/g, '₃')
    .replace(/4/g, '₄')
    .replace(/5/g, '₅')
    .replace(/6/g, '₆')
    .replace(/7/g, '₇')
    .replace(/8/g, '₈')
    .replace(/9/g, '₉');

  const stripState = (s: string) => s.replace(/\s*\((?:s|l|g|aq|aqueous)\)\s*/i, '').trim();

  const resolveThermoData = (compound: string, tempK: number): ThermoData | null => {
    const userBase = toSubscript(stripState(compound)).toLowerCase();
    const candidates = thermodynamicDatabase.filter(d =>
      toSubscript(stripState(d.compound)).toLowerCase() === userBase
    );
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    let preferred = 'gas';
    if (userBase.includes('h₂o')) preferred = tempK >= 373 ? 'gas' : 'liquid';
    if (/nacl|kcl|caco₃|cao|naoh|agcl/.test(userBase)) preferred = 'solid';
    return candidates.find(c => c.state === preferred) || candidates[0];
  };

  const parseReaction = (reactionText: string, tempK: number): {
    reactants: ParsedCompound[];
    products: ParsedCompound[];
    missingCompounds: string[];
  } => {
    const reactionParts = reactionText.split(/\s*(?:->|→|=>|⟶)\s*/);
    if (reactionParts.length !== 2) {
      return { reactants: [], products: [], missingCompounds: [] };
    }

    const parseSide = (side: string): ParsedCompound[] => {
      return side.split(/\s*\+\s*/).filter(c => c.trim()).map(compoundStr => {
        // Extract coefficient and compound
        const match = compoundStr.match(/^(\d*\.?\d*)\s*([^\d].*)$/);
        const coefficient = match && match[1] ? parseFloat(match[1]) : 1;
        const compound = match ? match[2].trim() : compoundStr.trim();
        
        // Find thermodynamic data
        const thermoData = resolveThermoData(compound, tempK);

        return { coefficient, compound, thermoData };
      });
    };

    const reactants = parseSide(reactionParts[0]);
    const products = parseSide(reactionParts[1]);

    // Find missing compounds
    const allCompounds = [...reactants, ...products];
    const missingCompounds = allCompounds
      .filter(item => !item.thermoData)
      .map(item => item.compound);

    return { reactants, products, missingCompounds };
  };

  const calculateThermodynamics = () => {
    const temp = parseFloat(temperature) || 298;
    const { reactants, products, missingCompounds } = parseReaction(reaction, temp);
    
    if (missingCompounds.length > 0) {
      setResults({
        deltaH: 0,
        deltaS: 0,
        deltaG: 0,
        K: 0,
        spontaneous: false,
        equilibriumTemp: null,
        temperatureDependence: '',
        missingCompounds,
        reactionType: 'error'
      });
      return;
    }

    // temp is already parsed above

    // Calculate ΔH° = Σ(n * ΔHf°)products - Σ(n * ΔHf°)reactants
    const deltaH_products = products.reduce((sum, item) => 
      sum + (item.coefficient * (item.thermoData?.deltaHf || 0)), 0);
    const deltaH_reactants = reactants.reduce((sum, item) => 
      sum + (item.coefficient * (item.thermoData?.deltaHf || 0)), 0);
    const deltaH = deltaH_products - deltaH_reactants;

    // Calculate ΔS° = Σ(n * S°)products - Σ(n * S°)reactants
    const deltaS_products = products.reduce((sum, item) => 
      sum + (item.coefficient * (item.thermoData?.S || 0)), 0);
    const deltaS_reactants = reactants.reduce((sum, item) => 
      sum + (item.coefficient * (item.thermoData?.S || 0)), 0);
    const deltaS = deltaS_products - deltaS_reactants;

    // Calculate ΔG = ΔH - TΔS (convert ΔS from J to kJ)
    const deltaG = deltaH - (temp * deltaS / 1000);

    // Calculate equilibrium constant K
    const K = Math.exp(-deltaG * 1000 / (8.314 * temp));

    // Calculate crossover temperature
    const equilibriumTemp = deltaS !== 0 ? (deltaH * 1000) / deltaS : null;

    // Determine spontaneity
    const spontaneous = deltaG < 0;

    // Determine temperature dependence
    let temperatureDependence = '';
    let reactionType = '';
    
    if (deltaH < 0 && deltaS > 0) {
      temperatureDependence = 'Always spontaneous at all temperatures';
      reactionType = 'exothermic-increasing';
    } else if (deltaH > 0 && deltaS < 0) {
      temperatureDependence = 'Never spontaneous at any temperature';
      reactionType = 'endothermic-decreasing';
    } else if (deltaH < 0 && deltaS < 0) {
      temperatureDependence = `Spontaneous only at low temperatures (below ${equilibriumTemp?.toFixed(1)} K)`;
      reactionType = 'exothermic-decreasing';
    } else if (deltaH > 0 && deltaS > 0) {
      temperatureDependence = `Spontaneous only at high temperatures (above ${equilibriumTemp?.toFixed(1)} K)`;
      reactionType = 'endothermic-increasing';
    }

    setResults({
      deltaH,
      deltaS,
      deltaG,
      K,
      spontaneous,
      equilibriumTemp,
      temperatureDependence,
      missingCompounds: [],
      reactionType
    });

    // Animate results
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };

  const ResultCard = ({ title, value, unit, color, description }: any) => {
    return (
      <View style={styles.resultCard}>
        <View style={[styles.resultHeader, { backgroundColor: color + '20' }]}> 
          <Text style={[styles.resultTitle, { color }]}>{title}</Text>
          <Text style={styles.resultUnit}>{unit}</Text>
        </View>
        <Text style={styles.resultValue}>{value}</Text>
        <Text style={styles.resultDescription}>{description}</Text>
      </View>
    );
  };

  const SpontaneityIndicator = ({ spontaneous, deltaG }: { spontaneous: boolean, deltaG: number }) => {
    const backgroundColor = spontaneous ? '#4CAF50' : '#F44336';
    const text = spontaneous ? 'Spontaneous' : 'Non-spontaneous';
    const emoji = spontaneous ? '✅' : '❌';

    return (
      <View
        style={[
          styles.spontaneityIndicator,
          {
            backgroundColor,
            shadowColor: backgroundColor,
            shadowOpacity: 0.3
          }
        ]}
      >
        <Text style={styles.spontaneityEmoji}>{emoji}</Text>
        <Text style={styles.spontaneityText}>{text}</Text>
        <Text style={styles.spontaneityDeltaG}>ΔG = {deltaG.toFixed(2)} kJ/mol</Text>
      </View>
    );
  };

  const EnthalpyVisualization = ({ deltaH }: { deltaH: number }) => {
    const isExothermic = deltaH < 0;
    const energyLevel = Math.min(100, Math.abs(deltaH) / 100);
    const heatColor = isExothermic ? '#FF6B6B' : '#45B7D1';
    const explanation = isExothermic ? 'Exothermic: Releases heat to surroundings' : 'Endothermic: Absorbs heat from surroundings';
    return (
      <View style={styles.enthalpyVisualization}>
        <Text style={styles.visualizationTitle}>Enthalpy Interpretation</Text>
        <View style={styles.energyContainer}>
          <View style={styles.energyScale}>
            <View style={[styles.enthalpyBar, { width: `${energyLevel}%`, backgroundColor: heatColor }]} />
            <View style={[styles.indicatorPoint, { left: `${energyLevel}%`, backgroundColor: heatColor }]} />
          </View>
          <View style={styles.energyLabels}>
            <Text style={styles.energyLabel}>Low Energy</Text>
            <Text style={styles.energyLabel}>High Energy</Text>
          </View>
        </View>
        <Text style={styles.energyDescription}>{explanation}</Text>
      </View>
    );
  };

  const EntropyVisualization = ({ deltaS }: { deltaS: number }) => {
    const isIncreasing = deltaS > 0;
    const entropyLevel = Math.min(100, Math.abs(deltaS) / 5);
    const particleColor = isIncreasing ? '#34A853' : '#FF6B6B';
    const explanation = isIncreasing ? 'Entropy increases: More disorder, more possible arrangements' : 'Entropy decreases: More order, fewer possible arrangements';
    return (
      <View style={styles.entropyVisualization}>
        <Text style={styles.visualizationTitle}>Entropy Interpretation</Text>
        <View style={styles.particleContainer}>
          {[...Array(12)].map((_, i) => (
            <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: particleColor, margin: isIncreasing ? 6 : 2 }} />
          ))}
        </View>
        <View style={styles.entropyScale}>
          <View style={[styles.entropyBar, { width: `${entropyLevel}%` }]} />
        </View>
        <View style={styles.entropyLabels}>
          <Text style={styles.entropyLabel}>Order</Text>
          <Text style={styles.entropyLabel}>Disorder</Text>
        </View>
        <Text style={styles.entropyDescription}>{explanation}</Text>
      </View>
    );
  };

  const BipolarGauge = ({
    title,
    value,
    unit,
    centerLabel,
    leftLabel,
    rightLabel,
    negativeColor,
    positiveColor,
    maxAbs,
    explanations,
  }: {
    title: string;
    value: number;
    unit: string;
    centerLabel: string;
    leftLabel: string;
    rightLabel: string;
    negativeColor: string;
    positiveColor: string;
    maxAbs: number;
    explanations: string[];
  }) => {
    const absVal = Math.abs(value);
    const clamped = Math.min(1, absVal / Math.max(1, maxAbs));
    const fillPct = clamped * 50; // from center to edge
    const isNegative = value < 0;

    return (
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeHeader}>
          <Text style={styles.gaugeTitle}>{title}</Text>
          <Text style={styles.gaugeUnit}>{unit}</Text>
        </View>
        <View style={styles.gaugeTrack}>
          <View style={[styles.gaugeCenterLine]} />
          {isNegative ? (
            <View style={[styles.gaugeFill, { left: `${50 - fillPct}%`, width: `${fillPct}%`, backgroundColor: negativeColor }]} />
          ) : (
            <View style={[styles.gaugeFill, { left: '50%', width: `${fillPct}%`, backgroundColor: positiveColor }]} />
          )}
        </View>
        <View style={styles.gaugeLabelsRow}>
          <Text style={styles.gaugeLabel}>{leftLabel}</Text>
          <Text style={styles.gaugeLabel}>{centerLabel}</Text>
          <Text style={styles.gaugeLabel}>{rightLabel}</Text>
        </View>
        <Text style={styles.gaugeValueText}>{value.toFixed(2)} {unit}</Text>
        <View style={styles.methodsBlock}>
          <Text style={styles.methodsTitle}>How this was determined</Text>
          <Text style={styles.methodsText}>{explanations.join('\n')}</Text>
        </View>
      </View>
    );
  };

  const EnthalpyInterpretationCard = ({ deltaH }: { deltaH: number }) => {
    const isExo = deltaH < 0;
    const mag = Math.abs(deltaH);
    const level = mag < 100 ? 'Low' : mag < 500 ? 'Moderate' : 'High';
    const fill = Math.min(50, (mag / 1000) * 50);
    return (
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeHeader}>
          <Text style={styles.gaugeTitle}>Enthalpy Interpretation</Text>
          <Text style={styles.gaugeUnit}>kJ/mol</Text>
        </View>
        <View style={styles.gaugeTrack}>
          <View style={styles.gaugeCenterLine} />
          {isExo ? (
            <View style={[styles.gaugeFill, { left: `${50 - fill}%`, width: `${fill}%`, backgroundColor: '#FF6B6B' }]} />
          ) : (
            <View style={[styles.gaugeFill, { left: '50%', width: `${fill}%`, backgroundColor: '#45B7D1' }]} />
          )}
        </View>
        <View style={styles.gaugeLabelsRow}>
          <Text style={styles.gaugeLabel}>Exothermic 🔥</Text>
          <Text style={styles.gaugeLabel}>Endothermic ❄️</Text>
        </View>
        <Text style={styles.gaugeValueText}>{deltaH.toFixed(2)} kJ/mol • {level} magnitude</Text>
        <View style={styles.methodsBlock}>
          <Text style={styles.methodsTitle}>Interpretation</Text>
          <Text style={styles.methodsText}>
            {isExo ? 'Heat released to surroundings' : 'Heat absorbed from surroundings'}
          </Text>
          <Text style={styles.methodsTitle}>How this was determined</Text>
          <Text style={styles.methodsText}>
            ΔH° = Σ(nΔHf°)products − Σ(nΔHf°)reactants
          </Text>
        </View>
      </View>
    );
  };

  const EntropyInterpretationCard = ({ deltaS }: { deltaS: number }) => {
    const disorder = deltaS > 0;
    const mag = Math.abs(deltaS);
    const posPct = Math.max(0, Math.min(100, 50 + (Math.min(300, mag) / 300) * (disorder ? 50 : -50)));
    return (
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeHeader}>
          <Text style={styles.gaugeTitle}>Entropy Interpretation</Text>
          <Text style={styles.gaugeUnit}>J/mol·K</Text>
        </View>
        <View style={styles.entropyTrack}>
          <View style={[styles.entropyHalf, { left: 0, backgroundColor: '#FF6B6B22' }]} />
          <View style={[styles.entropyHalf, { left: '50%', backgroundColor: '#34A85322' }]} />
          <View style={[styles.entropyMarker, { left: `${posPct}%`, backgroundColor: disorder ? '#34A853' : '#FF6B6B' }]} />
        </View>
        <View style={styles.gaugeLabelsRow}>
          <Text style={styles.gaugeLabel}>Order</Text>
          <Text style={styles.gaugeLabel}>Disorder</Text>
        </View>
        <Text style={styles.gaugeValueText}>{deltaS.toFixed(2)} J/mol·K • {disorder ? 'More microstates' : 'Fewer microstates'}</Text>
        <View style={styles.methodsBlock}>
          <Text style={styles.methodsTitle}>Interpretation</Text>
          <Text style={styles.methodsText}>
            {disorder ? 'System becomes more dispersed' : 'System becomes more ordered'}
          </Text>
          <Text style={styles.methodsTitle}>How this was determined</Text>
          <Text style={styles.methodsText}>ΔS° = Σ(nS°)products − Σ(nS°)reactants</Text>
        </View>
      </View>
    );
  };

  const GibbsInterpretationCard = ({ deltaG, K, equilibriumTemp }: { deltaG: number; K: number; equilibriumTemp: number | null }) => {
    const spontaneous = deltaG < 0;
    const absG = Math.abs(deltaG);
    const normalized = Math.min(1, absG / 1000);
    const nearEq = absG < 1;
    const colors = {
      spontTint: 'rgba(52, 168, 83, 0.14)',
      spontAccent: '#34A853',
      eqTint: 'rgba(66, 133, 244, 0.14)',
      eqAccent: '#4285F4',
      nonTint: 'rgba(255, 109, 0, 0.14)',
      nonAccent: '#FF6D00',
    };
    const activeColor = nearEq ? colors.eqAccent : spontaneous ? colors.spontAccent : colors.nonAccent;
    const activeIndex = nearEq ? 1 : spontaneous ? 0 : 2;
    const dotLeft = activeIndex === 0 ? '16.666%' : activeIndex === 1 ? '50%' : '83.333%';
    return (
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeHeader}>
          <Text style={styles.gaugeTitle}>Gibbs Free Energy Interpretation</Text>
          <Text style={styles.gaugeUnit}>kJ/mol</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusChip, { backgroundColor: colors.spontTint }, (!nearEq && spontaneous) ? [styles.statusChipActive, { borderColor: colors.spontAccent }] : null]}>
            <Text style={[styles.statusChipText, (!nearEq && spontaneous) ? styles.statusChipTextActive : null]}>Spontaneous</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: colors.eqTint }, nearEq ? [styles.statusChipActive, { borderColor: colors.eqAccent }] : null]}>
            <Text style={[styles.statusChipText, nearEq ? styles.statusChipTextActive : null]}>Equilibrium</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: colors.nonTint }, (!nearEq && !spontaneous) ? [styles.statusChipActive, { borderColor: colors.nonAccent }] : null]}>
            <Text style={[styles.statusChipText, (!nearEq && !spontaneous) ? styles.statusChipTextActive : null]}>Non-spontaneous</Text>
          </View>
        </View>

        <View style={styles.thirdsTrack}>
          <View style={[styles.thirdsSegment, { left: '0%', backgroundColor: colors.spontTint }, (!nearEq && spontaneous) ? [styles.thirdsActive, { borderColor: colors.spontAccent }] : null]} />
          <View style={[styles.thirdsSegment, { left: '33.333%', backgroundColor: colors.eqTint }, (nearEq) ? [styles.thirdsActive, { borderColor: colors.eqAccent }] : null]} />
          <View style={[styles.thirdsSegment, { left: '66.666%', backgroundColor: colors.nonTint }, (!nearEq && !spontaneous) ? [styles.thirdsActive, { borderColor: colors.nonAccent }] : null]} />
        </View>
        <View style={styles.thirdsLabelsRow}>
          <Text style={[styles.thirdsLabel, (!nearEq && spontaneous) ? styles.thirdsLabelActive : null]}>Spontaneous</Text>
          <Text style={[styles.thirdsLabel, nearEq ? styles.thirdsLabelActive : null]}>Equilibrium</Text>
          <Text style={[styles.thirdsLabel, (!nearEq && !spontaneous) ? styles.thirdsLabelActive : null]}>Non-spontaneous</Text>
        </View>

        <Text style={styles.gaugeValueText}>ΔG = {deltaG.toFixed(2)} kJ/mol • K = {K.toExponential(2)} {equilibriumTemp ? `• T₀ ≈ ${equilibriumTemp.toFixed(1)} K` : ''}</Text>
        <View style={styles.methodsBlock}>
          <Text style={styles.methodsTitle}>Interpretation</Text>
          <Text style={styles.methodsText}>{nearEq ? 'Near equilibrium (ΔG ≈ 0)' : spontaneous ? 'Favorable at this temperature' : 'Unfavorable at this temperature'}</Text>
          <Text style={styles.methodsTitle}>How this was determined</Text>
          <Text style={styles.methodsText}>ΔG = ΔH − TΔS; K from ΔG via K = e^(−ΔG/RT)</Text>
        </View>
      </View>
    );
  };

  const PotentialEnergyDiagram = ({ deltaG }: { deltaG: number }) => {
    const favorable = deltaG < 0;
    const drop = Math.min(25, Math.abs(deltaG) / 1000 * 25);
    const base = 60;
    const reactTop = favorable ? base - drop : base + drop;
    const prodTop = favorable ? base + drop : base - drop;
    return (
      <View style={styles.energyDiagram}>
        <Text style={styles.visualizationTitle}>Potential Energy (G)</Text>
        <View style={styles.energyPlotArea}>
          <View style={styles.axisY} />
          <View style={styles.axisX} />
          <Text style={styles.axisLabelY}>Energy (G)</Text>
          <Text style={styles.axisLabelX}>Reaction Progress</Text>
          <View style={[styles.platform, { top: reactTop, backgroundColor: '#4285F4' }]} />
          <View style={[styles.platform, { top: prodTop, backgroundColor: '#34A853' }]} />
        </View>
        <View style={styles.diagramLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: '#4285F4' }]} />
            <Text style={styles.legendText}>Reactants</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: '#34A853' }]} />
            <Text style={styles.legendText}>Products</Text>
          </View>
        </View>
        <Text style={styles.energyNote}>{favorable ? 'Downhill to products (ΔG < 0)' : 'Downhill to reactants (ΔG > 0)'}</Text>
      </View>
    );
  };

  const HeatingCurveVisualization = ({ tempK }: { tempK: number }) => {
    const fus = 6;
    const vap = 41;
    const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
    const totalPlateauRatio = 0.6;
    const pfRatio = (totalPlateauRatio * fus) / (fus + vap);
    const pvRatio = (totalPlateauRatio * vap) / (fus + vap);
    const solidRatio = 0.18;
    const liquidRatio = 0.12;
    const gasRatio = 0.10;
    const axisLeft = 20;
    const domainLeftPad = 10;
    const domainRightPad = 12;
    const domainLeft = axisLeft + domainLeftPad;
    const domainW = dim ? dim.w - domainLeft - domainRightPad : 0;
    const pfW = domainW * pfRatio;
    const pvW = domainW * pvRatio;
    const solidW = domainW * solidRatio;
    const liquidW = domainW * liquidRatio;
    const gasW = domainW * gasRatio;
    const x0 = domainLeft;
    const x1 = x0 + solidW;
    const x2 = x1 + pfW;
    const x3 = x2 + liquidW;
    const x4 = x3 + pvW;
    const ySolid = dim ? dim.h * 0.92 : 0;
    const yMelting = dim ? dim.h * (2 / 3) : 0;
    const yBoiling = dim ? dim.h * (1 / 3) : 0;
    const yGas = dim ? dim.h * 0.15 : 0;
    const toDeg = (rad: number) => `${(rad * 180) / Math.PI}deg`;
    const solidTheta = solidW ? Math.atan2(ySolid - yMelting, solidW) : 0;
    const liquidTheta = liquidW ? Math.atan2(yMelting - yBoiling, liquidW) : 0;
    const gasTheta = gasW ? Math.atan2(yBoiling - yGas, gasW) : 0;
    const solidL = solidW && dim ? Math.sqrt(solidW * solidW + (ySolid - yMelting) * (ySolid - yMelting)) : 0;
    const liquidL = liquidW && dim ? Math.sqrt(liquidW * liquidW + (yMelting - yBoiling) * (yMelting - yBoiling)) : 0;
    const gasL = gasW && dim ? Math.sqrt(gasW * gasW + (yBoiling - yGas) * (yBoiling - yGas)) : 0;
    const solidLeft = (x0 + x1) / 2 - solidL / 2;
    const liquidLeft = (x2 + x3) / 2 - liquidL / 2;
    const gasLeft = (x4 + (x4 + gasW)) / 2 - gasL / 2;
    const heatColor = '#495057';
    const meltColor = '#45B7D1';
    const boilColor = '#FF6B6B';
    const nearMelting = typeof tempK === 'number' && Math.abs(tempK - 273) <= 5;
    const nearBoiling = typeof tempK === 'number' && Math.abs(tempK - 373) <= 5;
    return (
      <View style={styles.phaseVisualization}>
        <Text style={styles.visualizationTitle}>Heating Curve</Text>
        <View style={[styles.energyPlotArea, styles.heatingPlotArea]} onLayout={e => setDim({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          <View style={styles.axisY} />
          <View style={styles.axisX} />
          <Text style={styles.axisLabelY}>Temperature (K)</Text>
          <Text style={styles.axisLabelX}>Heat Added</Text>
          {dim && (
            <>
              <View style={[styles.curveLineSeg, { left: solidLeft, top: (ySolid + yMelting) / 2 - 1, width: solidL, backgroundColor: heatColor, transform: [{ rotate: toDeg(-solidTheta) }] }]} />
              <View style={[styles.plateauLine, { left: x1, top: yMelting, width: pfW, backgroundColor: meltColor, height: nearMelting ? 3 : 2 }]} />
              <View style={[styles.curveLineSeg, { left: liquidLeft, top: (yMelting + yBoiling) / 2 - 1, width: liquidL, backgroundColor: heatColor, transform: [{ rotate: toDeg(-liquidTheta) }] }]} />
              <View style={[styles.plateauLine, { left: x3, top: yBoiling, width: pvW, backgroundColor: boilColor, height: nearBoiling ? 3 : 2 }]} />
              <View style={[styles.curveLineSeg, { left: gasLeft, top: (yBoiling + yGas) / 2 - 1, width: gasL, backgroundColor: heatColor, transform: [{ rotate: toDeg(-gasTheta) }] }]} />
              <View style={[styles.tickY, { top: yMelting }]} />
              <Text style={[styles.tickLabelY, { top: yMelting - 16 }]}>273 K</Text>
              <View style={[styles.tickY, { top: yBoiling }]} />
              <Text style={[styles.tickLabelY, { top: yBoiling - 16 }]}>373 K</Text>
            </>
          )}
        </View>
        <View style={styles.diagramLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: heatColor }]} />
            <Text style={styles.legendText}>Heating segments</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: meltColor }]} />
            <Text style={styles.legendText}>Melting plateau</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: boilColor }]} />
            <Text style={styles.legendText}>Boiling plateau</Text>
          </View>
        </View>
        <Text style={styles.phaseInfoText}>Plateau lengths ∝ ΔH_fus and ΔH_vap</Text>
      </View>
    );
  };

  


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thermo Calculator</Text>
        <Text style={styles.subtitle}>Calculate ΔH, ΔS, ΔG & Spontaneity</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Chemical Reaction</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., H₂O + CO₂ → H₂CO₃"
          placeholderTextColor="#999"
          value={reaction}
          onChangeText={setReaction}
          multiline
        />
        <Text style={styles.inputHelp}>Enter compounds separated by + or →</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Temperature (K)</Text>
        <TextInput
          style={styles.input}
          placeholder="298"
          placeholderTextColor="#999"
          value={temperature}
          onChangeText={setTemperature}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={calculateThermodynamics}>
        <Text style={styles.calculateButtonText}>Calculate Thermodynamics</Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsSection}>
              {results.missingCompounds.length > 0 ? (
                <View style={styles.errorSection}>
                  <Text style={styles.errorTitle}>Missing Data</Text>
                  <Text style={styles.errorText}>
                    The following compounds were not found in the database:
                  </Text>
                  {results.missingCompounds.map((compound, index) => (
                    <Text key={index} style={styles.missingCompound}>
                      • {compound}
                    </Text>
                  ))}
                  <Text style={styles.errorHelp}>
                    Check spelling and include state symbols, e.g. H₂O(l), CO₂(g).
                  </Text>
                </View>
              ) : (
            <>
              <View style={styles.resultsGrid}>
                <ResultCard
                  title="ΔH° (Enthalpy)"
                  value={results.deltaH.toFixed(2)}
                  unit="kJ/mol"
                  color="#FF6B6B"
                  description={results.deltaH > 0 ? 'Endothermic' : 'Exothermic'}
                />
                <ResultCard
                  title="ΔS° (Entropy)"
                  value={results.deltaS.toFixed(2)}
                  unit="J/mol·K"
                  color="#34A853"
                  description={results.deltaS > 0 ? 'Increased disorder' : 'Decreased disorder'}
                />
                <ResultCard
                  title="ΔG (Gibbs)"
                  value={results.deltaG.toFixed(2)}
                  unit="kJ/mol"
                  color="#34A853"
                  description={results.deltaG > 0 ? 'Not favorable' : 'Favorable'}
                />
                <ResultCard
                  title="K (Equilibrium)"
                  value={results.K.toExponential(2)}
                  unit=""
                  color="#9C27B0"
                  description={results.K > 1 ? 'Products favored' : 'Reactants favored'}
                />
              </View>

              <EnthalpyInterpretationCard deltaH={results.deltaH} />
              <EntropyInterpretationCard deltaS={results.deltaS} />
              <GibbsInterpretationCard deltaG={results.deltaG} K={results.K} equilibriumTemp={results.equilibriumTemp} />
              <PotentialEnergyDiagram deltaG={results.deltaG} />
              <HeatingCurveVisualization tempK={parseFloat(temperature) || 298} />


              

              

            </>
          )}
        </View>
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
    color: '#888',
  },
  inputSection: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputHelp: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  calculateButton: {
    backgroundColor: '#34A853',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsSection: {
    margin: 20,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  resultUnit: {
    fontSize: 10,
    color: '#888',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  resultDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  spontaneityIndicator: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  spontaneityEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  spontaneityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  spontaneityDeltaG: {
    fontSize: 16,
    color: '#333',
    opacity: 0.9,
  },
  equilibriumSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  equilibriumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  equilibriumTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  equilibriumDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
  formulaSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  formulaBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  formula: {
    fontSize: 16,
    color: '#34A853',
    fontFamily: 'monospace',
    marginVertical: 5,
  },
  databaseSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
  },
  databaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  compoundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compoundItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: '45%',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  compoundName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  compoundValues: {
    fontSize: 12,
    color: '#888',
  },
  
  // New styles for enhanced UI
  errorSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  missingCompound: {
    fontSize: 14,
    color: '#FFD700',
    marginVertical: 2,
  },
  errorHelp: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    fontStyle: 'italic',
  },
  analysisSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  analysisValue: {
    fontSize: 14,
    color: '#34A853',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  
  // Visualization styles
  visualizationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  phaseVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  heatingCurveContainer: {
    marginBottom: 10,
  },
  curveTrack: {
    position: 'relative',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  curveSegment: {
    position: 'absolute',
    top: 0,
    height: '100%',
  },
  curveDot: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  curveTick: {
    position: 'absolute',
    top: -6,
    width: 2,
    height: 20,
    backgroundColor: '#999',
    borderRadius: 1,
  },
  curveLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  curveLabel: {
    fontSize: 12,
    color: '#666',
  },
  curveTickLabelsRow: {
    position: 'relative',
    height: 0,
  },
  curveTickLabel: {
    position: 'absolute',
    top: -24,
    fontSize: 12,
    color: '#666',
  },
  phaseInfoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  phaseEnergyContainer: {
    marginTop: 5,
  },
  phaseEnergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseEnergyLabel: {
    width: 70,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  phaseEnergyBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#45B7D1',
    marginHorizontal: 10,
    flexGrow: 1,
    position: 'relative',
  },
  phaseEnergyValue: {
    fontSize: 12,
    color: '#333',
  },
  phaseEnergyValueInside: {
    position: 'absolute',
    right: 6,
    top: -2,
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Enthalpy visualization styles
  enthalpyVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  energyContainer: {
    marginBottom: 15,
  },
  energyScale: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  indicatorPoint: {
    position: 'absolute',
    top: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  enthalpyBar: {
    height: '100%',
    borderRadius: 10,
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  energyLabel: {
    fontSize: 12,
    color: '#666',
  },
  energyDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  heatWaves: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  heatWave: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  
  // Entropy visualization styles
  entropyVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  particleContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  entropyScale: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 5,
  },
  entropyBar: {
    height: '100%',
    backgroundColor: '#34A853',
    borderRadius: 8,
  },
  entropyTrack: {
    position: 'relative',
    height: 16,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  entropyHalf: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
  },
  entropyMarker: {
    position: 'absolute',
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  entropyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  entropyLabel: {
    fontSize: 12,
    color: '#666',
  },
  entropyDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  
  // Gibbs free energy visualization styles
  gibbsVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  equilibriumContainer: {
    marginBottom: 15,
  },
  equilibriumScale: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 5,
  },
  equilibriumBar: {
    height: '100%',
    backgroundColor: '#ddd',
    position: 'relative',
  },
  equilibriumIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 1.5,
  },
  equilibriumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  equilibriumLabel: {
    fontSize: 11,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  gibbsDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#e9ecef',
    borderWidth: 0,
  },
  statusChipActive: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
  },
  statusChipText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  magnitudeTrack: {
    position: 'relative',
    height: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  magnitudeFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 6,
    width: '100%',
    transform: [{ scaleX: 1 }],
    },
  magnitudeTick: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 14,
    backgroundColor: '#dee2e6',
    borderRadius: 1,
  },
  thirdsTrack: {
    position: 'relative',
    height: 12,
    backgroundColor: '#f1f3f5',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  thirdsSegment: {
    position: 'absolute',
    top: 0,
    width: '33.333%',
    height: '100%',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#ffffff',
  },
  thirdsActive: {
    borderWidth: 2,
  },
  thirdsIndicatorDot: {
    position: 'absolute',
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  thirdsLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  thirdsLabel: {
    fontSize: 12,
    color: '#495057',
  },
  thirdsLabelActive: {
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Equilibrium constant visualization styles
  equilibriumVisualization: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceScale: {
    width: 200,
    height: 100,
  },
  balanceBeam: {
    width: 200,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    position: 'absolute',
    top: 30,
    transformOrigin: 'center',
  },
  balancePans: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 40,
    width: '100%',
  },
  balancePan: {
    width: 60,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  equilibriumDescriptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  gaugeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  gaugeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  gaugeUnit: {
    fontSize: 12,
    color: '#6c757d',
  },
  gaugeTrack: {
    position: 'relative',
    height: 16,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gaugeCenterLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#dee2e6',
  },
  gaugeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  gaugeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gaugeLabel: {
    fontSize: 12,
    color: '#666',
  },
  gaugeValueText: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
  },
  methodsBlock: {
    marginTop: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 10,
  },
  methodsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 6,
  },
  methodsText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },
  energyDiagram: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  energyPlotArea: {
    position: 'relative',
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
    overflow: 'hidden',
  },
  heatingPlotArea: {
    height: 320,
  },
  axisY: {
    position: 'absolute',
    left: 20,
    top: 10,
    bottom: 20,
    width: 2,
    backgroundColor: '#dee2e6',
    borderRadius: 1,
  },
  axisX: {
    position: 'absolute',
    left: 20,
    right: 10,
    bottom: 20,
    height: 2,
    backgroundColor: '#dee2e6',
    borderRadius: 1,
  },
  axisLabelY: {
    position: 'absolute',
    left: 6,
    top: 8,
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  axisLabelX: {
    position: 'absolute',
    right: 6,
    bottom: 2,
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  platform: {
    position: 'absolute',
    left: 40,
    right: 40,
    height: 4,
    borderRadius: 2,
  },
  platformLabel: {
    position: 'absolute',
    right: 44,
    fontSize: 12,
    fontWeight: '600',
  },
  energyNote: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  diagramLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  curveLineSeg: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#495057',
    borderRadius: 1,
  },
  plateauLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#495057',
    borderRadius: 1,
  },
  tickY: {
    position: 'absolute',
    left: 16,
    width: 8,
    height: 2,
    backgroundColor: '#dee2e6',
    borderRadius: 1,
  },
  tickLabelY: {
    position: 'absolute',
    left: 28,
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});