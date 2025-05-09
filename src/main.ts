/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
// import * as THREE from "three";
import * as FRAGS from "@thatopen/fragments";
// import { AppManager, InfoTable, InfoUI } from "./bim-components";

BUI.Manager.init();

const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);

const world = worlds.create<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBC.SimpleRenderer
>();
world.name = "Main";

world.scene = new OBC.SimpleScene(components);
world.scene.setup();
world.scene.three.background = null;

const container = document.getElementById("container")!;

world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);
world.camera.controls.setLookAt(183, 11, -102, 27, -52, -11);

components.init();

const grids = components.get(OBC.Grids);
grids.create(world);

const workerUrl = "/node_modules/@thatopen/fragments/dist/Worker/worker.mjs";
const fragments = new FRAGS.FragmentsModels(workerUrl);

world.camera.controls.addEventListener("update", () => fragments.update(true));
world.camera.controls.addEventListener("rest", () => fragments.update(true));

fragments.models.list.onItemSet.add(({ value: model }) => {
  model.useCamera(world.camera.three);
  world.scene.three.add(model.object);
  fragments.update(true);
});

const serializer = new FRAGS.IfcImporter();

serializer.wasm = {
  absolute: true,
  path: "https://unpkg.com/web-ifc@0.0.68/",
};

// const file = await fetch("./NAV-IPI-ET1_E07-ZZZ-M3D-EST_WITH_PHASES.ifc");
// const ifcBuffer = await file.arrayBuffer();
// const ifcBytes = new Uint8Array(ifcBuffer);
// const fragmentBytes = await serializer.process({ bytes: ifcBytes });
// const model = await fragments.load(fragmentBytes, { modelId: "example" });

// const fragFile = await fetch("./sample.frag");
// const fragFile = await fetch("./assets/models/350104001_KA_A_50_HAA_XX_32-01_ARGA.frag");
// const fragBuffer = await fragFile.arrayBuffer();

// const loadModel = async () => {
//   if (!fragBuffer) return;
//   const model = await fragments.load(fragBuffer, { modelId: "example" });
//   model.useCamera(world.camera.three);
//   world.scene.three.add(model.object);
//   await fragments.update(true);
// };

// const loadModelsFromFolder = async (folderPath: string = "./assets/models") => {
//   try {
//       // Read all files in the folder
//       const files = await fs.readdir(folderPath);

//       // Filter out .frag files
//       const fragFiles = files.filter(file => path.extname(file) === '.frag');

//       for (const file of fragFiles) {
//           const filePath = path.join(folderPath, file);

//           // Read the file and get the buffer
//           const fragBuffer = await fs.readFile(filePath);

//           // Load the model
//           const model = await fragments.load(fragBuffer, { modelId: path.basename(file, '.frag') });
//           model.useCamera(world.camera.three);
//           world.scene.three.add(model.object);
//       }

//       // Update fragments
//       await fragments.update(true);

//       console.log('All models loaded successfully!');
//   } catch (error) {
//       console.error('Error loading models:', error);
//   }
// };

// // This function loads all .frag files from a folder and adds them to the scene
// const loadAllModelsFromFolder = async (folderPath) => {
//   try {
//     // Read the list of files from the folder
//     const files = await fsp.readdir(folderPath);

//     // Filter out only .frag files
//     const fragFiles = files.filter(file => file.endsWith('.frag'));

//     // Loop through each .frag file and load it
//     for (const fragFileName of fragFiles) {
//       const fragFilePath = path.join(folderPath, fragFileName);
//       console.log(`Loading .frag file: ${fragFilePath}`);

//       // Fetch the frag file content
//       const fragFile = await fsp.readFile(fragFilePath);
//       const fragBuffer = fragFile.buffer;  // Make sure to get the raw buffer from the file

//       // Load the model from the fragBuffer
//       const model = await fragments.load(fragBuffer, { modelId: fragFileName });

//       // Set up the camera and add the model to the scene
//       model.useCamera(world.camera.three);
//       world.scene.three.add(model.object);

//       // Optionally, update the fragments or perform other operations
//       await fragments.update(true);
//     }
//   } catch (error) {
//     console.error('Error loading .frag files:', error);
//   }
// };


const loadModelsFromFiles = async (files: File[]) => {
  if (files.length === 0) {
    // eslint-disable-next-line no-alert
    alert("No files selected.");
    return;
  }

  for (const file of files) {
    if (file.name.endsWith('.frag')) {
      const fragBuffer = await file.arrayBuffer();
      const model = await fragments.load(fragBuffer, { modelId: file.name });

      // Assuming you have Three.js set up and `world` and `camera` exist
      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      await fragments.update(true);

      console.log(`Loaded model from ${file.name}`);
    }
  }
};

const selectModelFolder = async () => {
  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  if (fileInput) {
    fileInput.click();

    // Optional: Add a one-time 'change' event handler to process selected files
    fileInput.onchange = async () => {
      const files = Array.from(fileInput.files || []);
      console.log("Selected files:", files);
      // Call your processing function here

      await loadModelsFromFiles(files)
    };
  }
}

// const removeModel = async () => {
//   await fragments.disposeModel("example");
// };

const [panel, updatePanel] = BUI.Component.create<BUI.PanelSection, any>(
  (_) => {
    // const onDownload = () => {
    //   if (!fragBuffer) return;
    //   const file = new File([fragBuffer], "sample.frag");
    //   const a = document.createElement("a");
    //   a.href = URL.createObjectURL(file);
    //   a.download = file.name;
    //   a.click();
    //   URL.revokeObjectURL(a.href);
    // };

    const content = BUI.html`
      <bim-label style="white-space: normal;">💡Select and load .frag files</bim-label>
      <input type="file" id="file-input" multiple accept=".frag" style="display: none;" />
      <bim-button label="Load FRAG" @click=${selectModelFolder}></bim-button>
    `;
    // if (fragBuffer) {
    //   content = BUI.html`
    //     <bim-label style="white-space: normal;">🚀 The IFC has been converted to Fragments binary data. Add the model to the scene!</bim-label>
    //     <bim-button label="Add Model" @click=${loadModel}></bim-button>
    //     <bim-button label="Remove Model" @click=${removeModel}></bim-button>        
    //     <bim-button label="Download Fragments" @click=${onDownload}></bim-button>
    //   `;
    // }

    return BUI.html`
    <bim-panel id="controls-panel" active label="IFC Importer" class="options-menu">
      <bim-panel-section label="Controls">
        ${content}
      </bim-panel-section>
    </bim-panel>
  `;
  },
  {},
);

updatePanel();
fragments.models.list.onItemDeleted.add(() => updatePanel());

document.body.append(panel);
