import "@babylonjs/core/Loading/loadingScreen";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GLTFFileLoader, GLTFLoaderAnimationStartMode } from "@babylonjs/loaders";
import { CreateCanvas } from "./utils/createCanvas";
import { MainScene } from "./scenes/MainScene";

window.addEventListener("DOMContentLoaded", function () {
  if (Engine.isSupported()) {
    const canvas = CreateCanvas();
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }, true);

    SceneLoader.OnPluginActivatedObservable.add(function (plugin) {
      if (plugin.name === "gltf" && plugin instanceof GLTFFileLoader) {
        plugin.animationStartMode = GLTFLoaderAnimationStartMode.NONE;
        plugin.compileMaterials = true;
        plugin.compileShadowGenerators = false;
      }
    });
    new MainScene(engine, canvas);
  } else {
    window.alert("Browser not supported");
  }
});
