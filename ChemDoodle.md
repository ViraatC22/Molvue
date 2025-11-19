Integrating Lewis structures into a React project typically involves using a specialized library or component designed for chemical structure visualization. One notable option is ChemDoodle Web Components with its React plugin.
Here's how you can approach this: Install the React ChemDoodle plugin.
This plugin allows you to easily embed ChemDoodle's powerful chemical drawing and visualization tools within your React components. You would typically install it via npm or yarn:
Code

    npm install react-chemdoodle
    # or
    yarn add react-chemdoodle
Import and use ChemDoodle components in your React application:
After installation, you can import specific ChemDoodle components into your React files and use them to render and interact with chemical structures, including Lewis structures. For example, you might use a component that takes a chemical structure in a format like SMILES or MolFile and renders its Lewis structure representation.
Code

    import React from 'react';
    import { ChemDoodle } from 'react-chemdoodle';

    const MyMoleculeViewer = () => {
      const smilesString = 'CCO'; // Ethanol
      return (
        <div>
          <h2>Lewis Structure of Ethanol</h2>
          <ChemDoodle
            structure={smilesString}
            settings={{
              // Customize display settings here, e.g., showing lone pairs, formal charges
              // Refer to ChemDoodle documentation for available settings
              displayLewisDots: true,
              displayFormalCharges: true
            }}
          />
        </div>
      );
    };

    export default MyMoleculeViewer;
Customize display and interactivity.
ChemDoodle Web Components offer extensive customization options for how Lewis structures are displayed, including showing lone pairs, formal charges, bond types, and more. You can also add interactive features, such as allowing users to draw or modify structures within your React application.
By using a dedicated library like ChemDoodle, you can effectively integrate and visualize Lewis structures within your React projects, making it suitable for educational tools, chemical databases, or other applications requiring chemical structure representation.

Tutorial > React Development
The integration of complex chemical structures into React applications is now more seamless than ever, thanks to the introduction of the React ChemDoodle Web Components ("react-chemdoodle") project. This React plugin facilitates the effortless utilization of ChemDoodle Web Components within React systems. In this article, we delve into the installation process, providing step-by-step instructions for integrating the ChemDoodle Web Components into your React projects using this plugin. Whether you are a seasoned cheminformatics professional or a React enthusiast looking to visualize molecular structures, this React plugin offers a powerful toolset, making chemical doodling in your applications an enjoyable experience.

A React plugin for the ChemDoodle Web Components
The React Chemdoodle Web Components ("react-chemdoodle") is a UI library add-on for the ChemDoodle Web Components (CWC) library, allowing for quick and easy use of the ChemDoodle Web Components library in React systems. CWC provides 18 unique component canvases from a simple 2D ViewerCanvas to 3D EditorCanvas3D to a PeriodicTableCanvas. At the moment, `react-chemdoodle` wraps just two canvases, the 2D ViewerCanvas and SketcherCanvas. The project may be found in the ChemDoodle Web Components downloaded installation folder or by visiting https://github.com/melaniebrgr/react-chemdoodleweb. Contributions are welcome, and you may wish to provide bindings for additional canvases.

While several React plugins may exist for CWC, the "react-chemdoodle" plugin is the official plugin and is sponsored by iChemLabs.

Installation
The following sections provide instructions for using the React plugin for the CWC in your React system. The "react-chemdoodle" plugin is distributed under the MIT open source license, while the core CWC library must be included under the GPLv3 license.

As it was originally written in 2007, CWC consists of a number of IIFE modules divided into two javascript files, one a "core" file and one optional file for advanced UIs, that are loaded by a client browser. The "react-chemdoodle" plugin on the other hand is a "require time" node module that can be compiled by JS bundlers more typical in modern web application development. The "react-chemdoodle" plugin can be directly downloaded from NPM, but core CWC scripts need to be additionally embedded into the HTML document. While this simple implementation ensures CWC is available everywhere for the lifetime of the React application, the tradeoff is that CWC is not bundled with the rest of the React application code and will make an additional network request. As well, it will be loaded even if the current page does not use it (The size of the minified CWC script is only 414 kB at the time of this writing).

1. Download CWC
The "react-chemdoodle" plugin depends on the ChemDoodle global object, so CWC first needs to be installed in your project. Download CWC from this page.

2. Embed CWC as a client-side script
Place CWC in the public folder of a React project created with Create React App or equivalent. The environment variable PUBLIC_URL can be used in the React application to reference assets in the public folder, e.g.

<script
  type="text/javascript"
  src="%PUBLIC_URL%/ChemDoodleWeb-9.5.0/install/ChemDoodleWeb.js"
></script>
In it's entirety, your React app's "index.html" file may look something like:

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link
      rel="stylesheet"
      href="%PUBLIC_URL%/ChemDoodleWeb-9.5.0/install/ChemDoodleWeb.css"
      type="text/css"
    />
    <link
      rel="stylesheet"
      href="%PUBLIC_URL%/ChemDoodleWeb-9.5.0/install/uis/jquery-ui-1.11.4.css"
      type="text/css"
    />
    <script
      type="text/javascript"
      src="%PUBLIC_URL%/ChemDoodleWeb-9.5.0/install/ChemDoodleWeb.js"
    ></script>
    <script
      type="text/javascript"
      src="%PUBLIC_URL%/ChemDoodleWeb-9.5.0/install/uis/ChemDoodleWeb-uis.js"
    ></script>
    <title>My React Application</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
Only embed the scripts and CSS that you need for you project, though. ChemDoodle can now be called on component mount. Verify that the ChemDoodle is available in the project:

useEffect(() => {
  console.log(ChemDoodle.getVersion())
}, [])
Congrats! The ChemDoodle Web Components are now installed in your project! Now we are ready to render a molecule to the page. (Did you see the version logged to console twice? That is React.StrictMode.)

3. Add CWC to package.json (optional)
The CWC package can be also optionally be listed as a peer dependency for visibility in your project. For example,

"peerDependencies": {
  "chemdoodle": "file:ChemDoodleWeb-9.4.0"
},
4. Install `react-chemdoodle`
npm install react-chemdoodle
5. Import the react CWC components
Import the components in your react application, pass it molecular data (MOL file format) as a prop, and style the canvas and molecular structure as desired:

import { ViewerCanvas } from 'react-chemdoodle'

function Caffeine() {
    const caffeine = // fetch molecular data

    return (
        <ViewerCanvas
            id="caffeine"
            data={{ mol: caffeine }}
            canvasStyle={{
                bonds_width_2D: 0.6,
                bonds_saturationWidthAbs_2D: 2.6,
                bonds_hashSpacing_2D: 2.5,
                atoms_font_size_2D: 10,
                atoms_font_families_2D: ['Helvetica', 'Arial', 'sans-serif']
            }}
            moleculeStyle={{
                scaleToAverageBondLength: 14.4
            }}
        />
    )
}
See the "react-example-app" (npm run start) in the "react-chemdoodle" monorepo for a full, working example.


Happy (chem) doodling

https://github.com/melaniebrgr/react-chemdoodleweb.git 