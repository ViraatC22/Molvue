# Hybridization Identifier Project Report

## 1. Algorithm Outline

### 1.1 Input Processing
- **Receive Chemical Formula:** The application accepts a chemical formula string (e.g., "CH4", "H2O", "CO2") from the user.
- **Parse Molecule:** The input string is parsed to identify the central atom and any surrounding atoms. This involves extracting element symbols and their counts.
- **Retrieve Atomic Data:** For each identified atom, relevant atomic data (e.g., atomic number, electron configuration, valence electrons) is retrieved from a predefined dataset.

### 1.2 Hybridization Determination (Simplified)
- **Database Lookup:** The parsed molecule is checked against a local `moleculeDatabase` that stores common molecules and their pre-calculated hybridization information (central atom, hybridization type, geometry, bond angle, bond type, electronegativity difference).
- **Information Retrieval:** If the molecule is found in the database, its associated hybridization details are retrieved.
- **Default/Fallback:** If the molecule is not found, a default hybridization (e.g., for H2O) is used to ensure some information is always displayed.

### 1.3 3D Visualization Generation
- **Determine Orbital Directions:** Based on the retrieved hybridization type (e.g., sp, sp², sp³, sp³d, sp³d²), a set of 3D vectors representing the directions of the hybridized orbitals is generated using the `getDirections` function. These vectors define the spatial arrangement according to VSEPR theory and hybridization.
- **Render Central Atom:** A sphere representing the central atom's nucleus is rendered in the center of the 3D scene, colored according to the element.
- **Construct Orbital Lobes:** For each orbital direction, a teardrop-shaped lobe (composed of a cylinder and a sphere) is created using the `makeLobe` function. These lobes are positioned and rotated to align with the calculated directions.
- **Scene Setup:** A Three.js scene is initialized with ambient and directional lighting, and a background color.
- **Dynamic Camera Positioning:** The 3D camera's position (specifically its `z` coordinate) is dynamically adjusted based on the hybridization type to provide an optimal view of the molecular geometry.
- **Interactive Rotation:** The rendered 3D model is made interactive, allowing the user to rotate it using mouse drag events.

## 2. Needed Chemistry Data or Formulas

### 2.1 Atomic Data
- **Element Symbol:** (e.g., H, C, N, O)
- **Atomic Number:** Unique identifier for each element.
- **Electron Configuration:** Describes the distribution of electrons in atomic orbitals (e.g., 1s¹, [He] 2s² 2p⁴).
- **Valence Electrons:** Number of electrons in the outermost shell, crucial for bonding.

### 2.2 Hybridization and Geometry Rules (Simplified)
- **sp Hybridization:**
    - **Geometry:** Linear
    - **Bond Angle:** 180°
    - **Example:** CO₂
- **sp² Hybridization:**
    - **Geometry:** Trigonal Planar
    - **Bond Angle:** 120°
    - **Example:** C₂H₄
- **sp³ Hybridization:**
    - **Geometry:** Tetrahedral
    - **Bond Angle:** 109.5°
    - **Example:** CH₄, H₂O, NH₃
- **sp³d Hybridization:**
    - **Geometry:** Trigonal Bipyramidal
    - **Bond Angle:** 90° (axial-equatorial), 120° (equatorial-equatorial)
- **sp³d² Hybridization:**
    - **Geometry:** Octahedral
    - **Bond Angle:** 90°

### 2.3 Electronegativity Data (for Bond Type, if integrated)
- **Pauling Electronegativity Scale:** Values for various elements to calculate the difference and determine bond polarity (e.g., nonpolar covalent, polar covalent, ionic).

## 3. User Interface and Workflow

### 3.1 User Interface (UI) Components
- **Input Field:** A `TextInput` component for users to type in chemical formulas.
- **Analyze Button:** A `TouchableOpacity` button to trigger the hybridization calculation and update the display.
- **Electron Configuration Display:** A section to show the electron configuration and valence electrons for each atom in the entered molecule.
- **Hybridization & Bonding Information Display:** A dedicated section to present the calculated hybridization type, molecular geometry, bond angle, central atom, bond type, and electronegativity difference.
- **3D Visualization Canvas:** A `View` component that acts as a container for the Three.js rendered 3D model of the hybridized orbitals. This area allows for interactive rotation of the model.

### 3.2 Workflow
1. **User Input:** The user enters a chemical formula into the input field.
2. **Initiate Analysis:** The user taps the "Analyze" button.
3. **Backend Processing:** The application parses the input, looks up hybridization data, and calculates the necessary parameters for 3D rendering.
4. **Information Display:** The electron configuration and hybridization details are displayed in their respective sections.
5. **3D Model Rendering:** The 3D visualization canvas updates to show the interactive model of the hybridized orbitals, with appropriate camera zoom and orbital shapes.
6. **User Interaction:** The user can interact with the 3D model by dragging the mouse to rotate it, allowing for examination from different angles.