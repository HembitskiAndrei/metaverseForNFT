import type { MainScene } from "../scenes/MainScene";

export const createEnvironment = (scene: MainScene) => {
  const environmentTask = scene.assetsManager.addCubeTextureTask("environmentTask", "./assets/sky/environment.env");
  environmentTask.onSuccess = task => {
    scene.environmentTexture = task.texture;
    scene.environmentIntensity = 0.25;
    scene.createDefaultLight();
    // scene.createDefaultSkybox(task.texture, true, 100, 0.15);
  };
};
