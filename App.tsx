import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import FormalChargeScreen from './src/screens/FormalChargeScreen';
import BondTypeScreen from './src/screens/BondTypeScreen';
import { Platform } from 'react-native';
// Use platform-specific resolution to avoid expo-three on web
const MolecularGeometryScreen =
  Platform.OS === 'web'
    ? require('./src/screens/MolecularGeometryScreen.web').default
    : require('./src/screens/MolecularGeometryScreen').default;
import LatticeEnergyScreen from './src/screens/LatticeEnergyScreen';
import HybridizationScreen from './src/screens/HybridizationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Molvue - Chemistry Visualizer' }}
        />
        <Stack.Screen 
          name="FormalCharge" 
          component={FormalChargeScreen} 
          options={{ title: 'Formal Charge Calculator' }}
        />
        <Stack.Screen 
          name="BondType" 
          component={BondTypeScreen} 
          options={{ title: 'Bond Type Predictor' }}
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
          name="Hybridization" 
          component={HybridizationScreen} 
          options={{ title: 'Hybridization Identifier' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}