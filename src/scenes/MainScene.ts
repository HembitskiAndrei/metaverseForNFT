import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Helpers/sceneHelpers";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { createEnvironment } from "../utils/createEnvironment";
import { CharacterController } from "../components/CharacterController";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";

export class MainScene extends Scene {
  engine: Engine;
  canvas: HTMLCanvasElement;
  assetsManager: AssetsManager;
  camera: ArcRotateCamera;


  constructor(engine: Engine, canvas: HTMLCanvasElement, options?: SceneOptions) {
    super(engine, options);
    this.engine = engine;
    this.canvas = canvas;

    this.assetsManager = new AssetsManager(this);

    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this);
    ground.freezeWorldMatrix();
    ground.checkCollisions = true;
    ground.isPickable = true;

    const groundMaterial = new PBRMaterial("groundMaterial", this);
    groundMaterial.metallic = 0;
    groundMaterial.roughness = 1;
    ground.material = groundMaterial;

    const gridTextureTask = this.assetsManager.addTextureTask("gridTextureTask", "./assets/textures/grid.png");
    gridTextureTask.onSuccess = task => {
      task.texture.uScale = 10;
      task.texture.vScale = 10;
      groundMaterial.albedoTexture = task.texture;
    }

    this.camera = new ArcRotateCamera("Camera", 0, Math.PI/2.5, 5, new Vector3(0, 5, 5), this);

    createEnvironment(this);

    this.loadPlayer(this, engine, this.camera, canvas);

    this.assetsManager.onFinish = () => {};

    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    this.engine.runRenderLoop(() => {
      this.render();
    });

    this.assetsManager.load();
  }

  loadPlayer(scene: Scene, engine: Engine, camera: ArcRotateCamera, canvas: HTMLCanvasElement) {
    const playerMeshTask = this.assetsManager.addMeshTask("playerMeshTask", "", "./assets/player/", "player.glb");
    playerMeshTask.onSuccess = task => {
        let player = task.loadedMeshes[0];
        player.rotationQuaternion = null;

        player.position = new Vector3(0,0,0);
        player.checkCollisions = true;
        player.ellipsoid = new Vector3(0.3,1,0.3);
        player.ellipsoidOffset = new Vector3(0,1,0);

        camera.minZ = 0.0;
        camera.wheelPrecision = 15;
        camera.checkCollisions = false;
        camera.keysLeft = [];
        camera.keysRight = [];
        camera.keysUp = [];
        camera.keysDown = [];
        camera.lowerRadiusLimit = 0.5;
        camera.upperRadiusLimit = 4;
        camera.attachControl(canvas,false);

        const animationGroups = {};
        task.loadedAnimationGroups.forEach(group => {
          animationGroups[group.name] = group;
        });
        animationGroups["jump"].loop = false;
        const agMap = {
          walk: animationGroups["walk"],
          walkBack: animationGroups["walkingBack"],
          idle: animationGroups["idle"],
          idleJump: animationGroups["jump"],
          walkBackFast: animationGroups["joggingBack"],
          run: animationGroups["jogging"],
          runJump: animationGroups["jump"],
          fall: null,
          turnRight: animationGroups["turnRight"],
          turnRightFast: animationGroups["turnRight"],
          turnLeft: animationGroups["turnLeft"],
          turnLeftFast: animationGroups["turnLeft"],
          strafeLeft: animationGroups["walkLeftStrafe"],
          strafeLeftFast: animationGroups["jogLeftStrafe"],
          strafeRight: animationGroups["walkRightStrafe"],
          strafeRightFast: animationGroups["jogRightStrafe"],
          diagonalLeftForward: animationGroups["walkLeftForward"],
          diagonalLeftForwardFast: animationGroups["joggingLeftForward"],
          diagonalRightForward: animationGroups["walkRightForward"],
          diagonalRightForwardFast: animationGroups["joggingRightForward"],
          diagonalLeftBack: animationGroups["walkingLeftBack"],
          diagonalLeftBackFast: animationGroups["joggingLeftBack"],
          diagonalRightBack: animationGroups["walkingRightBack"],
          diagonalRightBackFast: animationGroups["joggingRightBack"],
          slideDown: null,
        }

        let cc = new CharacterController(<Mesh>player, camera, scene, agMap, true);
        cc.setCameraTarget(new Vector3(0,1.7,0));
        cc.setNoFirstPerson(false);
        cc.setStepOffset(0.4);

        cc.setSlopeLimit(30,60);
        cc.enableBlending(0.075);

        cc.setStrafeLeftAnim(animationGroups["walkLeftStrafe"], 1.6, true);
        cc.setStrafeRightAnim(animationGroups["walkRightStrafe"], 1.6, true);
        cc.setLeftSpeed(1);
        cc.setRightSpeed(1);
        cc.setRightFastSpeed(2.4);
        cc.setLeftFastSpeed(2.4);

        cc.setWalkAnim(animationGroups["walk"], 1, true);
        cc.setWalkSpeed(1.65);
        cc.setIdleJumpAnim(animationGroups["jump"], 1, false);
        cc.setJumpSpeed(3.8);
        cc.setRunAnim(animationGroups["jogging"], 1, true);
        cc.setRunSpeed(2.6);
        cc.setWalkBackAnim(animationGroups["walkingBack"], 1, true);
        cc.setBackSpeed(1.3);
        cc.setWalkBackFastAnim(animationGroups["joggingBack"], 1.1, true);
        cc.setBackFastSpeed(2.4);

        cc.setDiagonalRightForwardAnim(animationGroups["walkRightForward"], 1, true);
        cc.setDiagonalLeftForwardAnim(animationGroups["walkLeftForward"], 1, true);
        cc.setDiagonalLeftForwardSpeed(1.3);
        cc.setDiagonalRightForwardSpeed(1.3);
        cc.setStrafeFactorWithForward(0.9);

        cc.setDiagonalRightForwardFastAnim(animationGroups["joggingRightForward"], 1, true);
        cc.setDiagonalLeftForwardFastAnim(animationGroups["joggingLeftForward"], 1, true);
        cc.setDiagonalLeftForwardFastSpeed(2);
        cc.setDiagonalRightForwardFastSpeed(2);
        cc.setStrafeFactorWithForwardFast(1.7);

        cc.setDiagonalRightBackAnim(animationGroups["walkRightBack"], 1.1, true);
        cc.setDiagonalLeftBackAnim(animationGroups["walkLeftBack"], 1.1, true);
        cc.setDiagonalLeftBackSpeed(1.1);
        cc.setDiagonalRightBackSpeed(1.1);
        cc.setStrafeFactorWithBackward(0.8);

        cc.setDiagonalRightBackFastAnim(animationGroups["joggingRightBack"], 1, true);
        cc.setDiagonalLeftBackFastAnim(animationGroups["joggingLeftBack"], 1, true);
        cc.setDiagonalLeftBackFastSpeed(1.5);
        cc.setDiagonalRightBackFastSpeed(1.5);
        cc.setStrafeFactorWithBackwardFast(2.7);

        cc.start();
    };
  }
}
