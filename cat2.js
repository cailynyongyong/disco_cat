import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import GUI from "lil-gui";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { Conversation } from "@11labs/client";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
let santaModel, conversation;
/**
 * Base
 */
// // Debug
// const gui = new GUI();

// Canvas
const canvas = document.querySelector("#c");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

gltfLoader.load("/models/cat.glb", (gltf) => {
  santaModel = gltf.scene;
  scene.add(santaModel);

  santaModel.scale.set(3, 3, 3);
  //   // Rotate Santa around the Y-axis (adjust values as needed)
  //   santaModel.rotation.y = 140 * (Math.PI / 180);
  //   santaModel.position.y += 2;
});

// /**
//  * Sun
//  */
// // Coordinates
// const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
// const sunDirection = new THREE.Vector3();

// // Debug
// const debugSun = new THREE.Mesh(
//   new THREE.IcosahedronGeometry(0.1, 2),
//   new THREE.MeshBasicMaterial()
// );
// scene.add(debugSun);

// // Update
// const updateSun = () => {
//   // Sun direction
//   sunDirection.setFromSpherical(sunSpherical);

//   // Debug
//   debugSun.position.copy(sunDirection).multiplyScalar(5);

//   // Uniforms
//   earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
//   atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
// };

// updateSun();

// // Tweaks
// gui.add(sunSpherical, "phi").min(0).max(Math.PI).onChange(updateSun);

// gui.add(sunSpherical, "theta").min(-Math.PI).max(Math.PI).onChange(updateSun);

// // Load HDR background
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load("snowy_forest_path_01_4k.hdr", (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping; // Important for reflections
//   scene.background = texture; // Set as background
//   scene.environment = texture; // Set as environment map
// });

/**
 * Lights
//  */
const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 20, 100);
directionalLight.castShadow = true;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 2, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.setClearColor("#000011");

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update();
  // Rotate cat model continuously if it exists
  if (santaModel) {
    santaModel.rotation.y += deltaTime * 7; // Adjust '1' to control rotation speed
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
