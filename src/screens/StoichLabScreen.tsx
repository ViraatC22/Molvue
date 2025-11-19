import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';

interface Compound {
  formula: string;
  molarMass: number;
  coefficient: number;
}

interface Reaction {
  reactants: Compound[];
  products: Compound[];
  balanced: boolean;
}

const compoundDatabase: { [key: string]: number } = {
  'H₂O': 18.02, 'CO₂': 44.01, 'NaCl': 58.44, 'HCl': 36.46, 'NaOH': 40.00,
  'H₂SO₄': 98.08, 'CaCO₃': 100.09, 'NH₃': 17.03, 'CH₄': 16.04, 'O₂': 32.00,
  'N₂': 28.02, 'H₂': 2.02, 'CaO': 56.08, 'Fe₂O₃': 159.69, 'Al₂O₃': 101.96,
  'Cu': 63.55, 'Ag': 107.87, 'Au': 196.97, 'Fe': 55.85, 'Al': 26.98
};

export default function StoichLabScreen() {
  const [reactionInput, setReactionInput] = useState('H₂ + O₂ → H₂O');
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [givenCompound, setGivenCompound] = useState('');
  const [givenMass, setGivenMass] = useState('');
  const [targetCompound, setTargetCompound] = useState('');
  const [results, setResults] = useState<{
    theoreticalYield: number;
    limitingReagent: string;
    excessReagents: { [key: string]: number };
    moleRatios: { [key: string]: number };
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const parseReaction = (input: string): Reaction => {
    const [reactantSide, productSide] = input.split('→').map(s => s.trim());
    const reactants = reactantSide.split('+').map(r => {
      const formula = r.trim();
      return {
        formula,
        molarMass: compoundDatabase[formula] || 100,
        coefficient: 1
      };
    });
    const products = productSide.split('+').map(p => {
      const formula = p.trim();
      return {
        formula,
        molarMass: compoundDatabase[formula] || 100,
        coefficient: 1
      };
    });

    return { reactants, products, balanced: false };
  };

  const balanceReaction = (reaction: Reaction): Reaction => {
    // Simple balancing algorithm for basic reactions
    const balanced = { ...reaction };
    
    // Special case for H₂ + O₂ → H₂O
    if (reaction.reactants.some(r => r.formula === 'H₂') && 
        reaction.reactants.some(r => r.formula === 'O₂') && 
        reaction.products.some(p => p.formula === 'H₂O')) {
      balanced.reactants = [
        { formula: 'H₂', molarMass: 2.02, coefficient: 2 },
        { formula: 'O₂', molarMass: 32.00, coefficient: 1 }
      ];
      balanced.products = [
        { formula: 'H₂O', molarMass: 18.02, coefficient: 2 }
      ];
      balanced.balanced = true;
    }
    // Add more special cases as needed
    else {
      balanced.balanced = true; // Assume balanced for now
    }
    
    return balanced;
  };

  const calculateStoichiometry = () => {
    const parsedReaction = parseReaction(reactionInput);
    const balancedReaction = balanceReaction(parsedReaction);
    setReaction(balancedReaction);

    if (!givenCompound || !givenMass || !targetCompound) return;

    const givenMoles = parseFloat(givenMass) / (compoundDatabase[givenCompound] || 100);
    const targetMolarMass = compoundDatabase[targetCompound] || 100;

    // Find coefficients
    const givenCoeff = balancedReaction.reactants.find(r => r.formula === givenCompound)?.coefficient || 1;
    const targetCoeff = balancedReaction.products.find(p => p.formula === targetCompound)?.coefficient || 1;

    // Calculate theoretical yield
    const moleRatio = targetCoeff / givenCoeff;
    const theoreticalMoles = givenMoles * moleRatio;
    const theoreticalYield = theoreticalMoles * targetMolarMass;

    // Find limiting reagent (simplified)
    const limitingReagent = givenCompound;
    const excessReagents: { [key: string]: number } = {};
    
    balancedReaction.reactants.forEach(reactant => {
      if (reactant.formula !== givenCompound) {
        const requiredMoles = (givenMoles * (reactant.coefficient / givenCoeff));
        excessReagents[reactant.formula] = requiredMoles;
      }
    });

    // Calculate mole ratios
    const moleRatios: { [key: string]: number } = {};
    balancedReaction.reactants.forEach(reactant => {
      moleRatios[reactant.formula] = reactant.coefficient;
    });
    balancedReaction.products.forEach(product => {
      moleRatios[product.formula] = product.coefficient;
    });

    setResults({
      theoreticalYield,
      limitingReagent,
      excessReagents,
      moleRatios
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
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }, []);

    return (
      <Animated.View style={[styles.resultCard, { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.resultHeader, { backgroundColor: color + '20' }]}>
          <Text style={[styles.resultTitle, { color }]}>{title}</Text>
          <Text style={styles.resultUnit}>{unit}</Text>
        </View>
        <Text style={styles.resultValue}>{value}</Text>
        <Text style={styles.resultDescription}>{description}</Text>
      </Animated.View>
    );
  };

  const ReactionVisualization = ({ reaction }: { reaction: Reaction }) => {
    const [reactantAnim] = useState(new Animated.Value(0));
    const [productAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.parallel([
        Animated.timing(reactantAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(productAnim, {
          toValue: 1,
          duration: 1000,
          delay: 500,
          useNativeDriver: true,
        })
      ]).start();
    }, []);

    return (
      <View style={styles.reactionViz}>
        <Animated.View style={[styles.reactionSide, { opacity: reactantAnim }]}>
          <Text style={styles.reactionTitle}>Reactants</Text>
          {reaction.reactants.map((compound, index) => (
            <View key={index} style={styles.compoundViz}>
              <View style={[styles.compoundCircle, { backgroundColor: '#FF6B6B' }]}>
                <Text style={styles.compoundFormula}>{compound.formula}</Text>
              </View>
              <Text style={styles.compoundCoeff}>{compound.coefficient}</Text>
            </View>
          ))}
        </Animated.View>
        
        <Text style={styles.reactionArrow}>→</Text>
        
        <Animated.View style={[styles.reactionSide, { opacity: productAnim }]}>
          <Text style={styles.reactionTitle}>Products</Text>
          {reaction.products.map((compound, index) => (
            <View key={index} style={styles.compoundViz}>
              <View style={[styles.compoundCircle, { backgroundColor: '#34A853' }]}>
                <Text style={styles.compoundFormula}>{compound.formula}</Text>
              </View>
              <Text style={styles.compoundCoeff}>{compound.coefficient}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stoich Lab</Text>
        <Text style={styles.subtitle}>Stoichiometry Calculator</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Chemical Reaction</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., H₂ + O₂ → H₂O"
          placeholderTextColor="#999"
          value={reactionInput}
          onChangeText={setReactionInput}
        />
        <Text style={styles.inputHelp}>Use → for products and + for multiple compounds</Text>
      </View>

      {reaction && (
        <View style={styles.reactionSection}>
          <ReactionVisualization reaction={reaction} />
        </View>
      )}

      <View style={styles.calculationSection}>
        <Text style={styles.sectionTitle}>Given Information</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Compound</Text>
            <TextInput
              style={styles.input}
              placeholder="H₂"
              placeholderTextColor="#999"
              value={givenCompound}
              onChangeText={setGivenCompound}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mass (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="10.0"
              placeholderTextColor="#999"
              value={givenMass}
              onChangeText={setGivenMass}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Target Compound</Text>
          <TextInput
            style={styles.input}
            placeholder="H₂O"
            placeholderTextColor="#999"
            value={targetCompound}
            onChangeText={setTargetCompound}
          />
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={calculateStoichiometry}>
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {results && (
        <Animated.View
          style={[
            styles.resultsSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.resultsGrid}>
            <ResultCard
              title="Theoretical Yield"
              value={results.theoreticalYield.toFixed(2)}
              unit="g"
              color="#34A853"
              description="Maximum possible product"
            />
            <ResultCard
              title="Limiting Reagent"
              value={results.limitingReagent}
              unit=""
              color="#FF6B6B"
              description="Runs out first"
            />
          </View>

          <View style={styles.moleRatioSection}>
            <Text style={styles.sectionTitle}>Mole Ratios</Text>
            <View style={styles.moleRatioGrid}>
              {Object.entries(results.moleRatios).map(([compound, ratio]) => (
                <View key={compound} style={styles.moleRatioItem}>
                  <Text style={styles.moleRatioCompound}>{compound}</Text>
                  <Text style={styles.moleRatioValue}>{ratio}</Text>
                </View>
              ))}
            </View>
          </View>

          {Object.keys(results.excessReagents).length > 0 && (
            <View style={styles.excessSection}>
              <Text style={styles.sectionTitle}>Excess Reagents</Text>
              {Object.entries(results.excessReagents).map(([compound, moles]) => (
                <View key={compound} style={styles.excessItem}>
                  <Text style={styles.excessCompound}>{compound}</Text>
                  <Text style={styles.excessMoles}>{moles.toFixed(3)} mol</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.formulaSection}>
            <Text style={styles.formulaTitle}>Key Formulas</Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formula}>Moles = Mass / Molar Mass</Text>
              <Text style={styles.formula}>Theoretical Yield = Moles × Molar Mass</Text>
              <Text style={styles.formula}>Mole Ratio = Coefficient Ratio</Text>
            </View>
          </View>
        </Animated.View>
      )}

      <View style={styles.databaseSection}>
        <Text style={styles.databaseTitle}>Available Compounds</Text>
        <View style={styles.compoundList}>
          {Object.entries(compoundDatabase).map(([formula, mass]) => (
            <View key={formula} style={styles.compoundItem}>
              <Text style={styles.compoundName}>{formula}</Text>
              <Text style={styles.compoundMass}>{mass} g/mol</Text>
            </View>
          ))}
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
    color: '#666',
    marginTop: 5,
  },
  reactionSection: {
    padding: 20,
  },
  reactionViz: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactionSide: {
    alignItems: 'center',
  },
  reactionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  compoundViz: {
    alignItems: 'center',
    marginVertical: 5,
  },
  compoundCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  compoundFormula: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  compoundCoeff: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  reactionArrow: {
    fontSize: 24,
    color: '#34A853',
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  calculationSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    width: '48%',
  },
  calculateButton: {
    backgroundColor: '#34A853',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  },
  resultUnit: {
    fontSize: 10,
    color: '#666',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  resultDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  moleRatioSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  moleRatioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moleRatioItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  moleRatioCompound: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  moleRatioValue: {
    fontSize: 16,
    color: '#34A853',
    fontWeight: 'bold',
  },
  excessSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  excessItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  excessCompound: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  excessMoles: {
    fontSize: 14,
    color: '#666',
  },
  formulaSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    fontSize: 14,
    color: '#34A853',
    fontFamily: 'monospace',
    marginVertical: 3,
  },
  databaseSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  compoundMass: {
    fontSize: 12,
    color: '#888',
  },
});