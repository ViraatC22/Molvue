import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import { Platform } from 'react-native';
// Use platform-specific resolution to avoid expo-three on web
const MolecularGeometryScreen =
  Platform.OS === 'web'
    ? require('./src/screens/MolecularGeometryScreen.web').default
    : require('./src/screens/MolecularGeometryScreen').default;
import LatticeEnergyScreen from './src/screens/LatticeEnergyScreen';
import IMFExplorerScreen from './src/screens/IMFExplorerScreen';
import ThermoCalculatorScreen from './src/screens/ThermoCalculatorScreen';
import TitrationSimulatorScreen from './src/screens/TitrationSimulatorScreen';
import StoichLabScreen from './src/screens/StoichLabScreen';
import PracticePageScreen from './src/screens/PracticePageScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PracticePage" 
          component={PracticePageScreen} 
          options={{ title: 'Practice' }}
        />
        <Stack.Screen 
          name="MolecularGeometry" 
          component={MolecularGeometryScreen} 
          options={{ title: '3D Molecular Geometry' }}
        />
        <Stack.Screen 
          name="LatticeEnergy" 
          component={LatticeEnergyScreen} 
          options={{ title: 'Lattice Energy Estimator' }}
        />
        <Stack.Screen 
          name="IMFExplorer" 
          component={IMFExplorerScreen} 
          options={{ title: 'IMF Explorer' }}
        />
        <Stack.Screen 
          name="ThermoCalculator" 
          component={ThermoCalculatorScreen} 
          options={{ title: 'Thermo Calculator' }}
        />
        <Stack.Screen 
          name="TitrationSimulator" 
          component={TitrationSimulatorScreen} 
          options={{ title: 'Titration Simulator' }}
        />
        <Stack.Screen 
          name="StoichLab" 
          component={StoichLabScreen} 
          options={{ title: 'Stoichiometry Lab' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}