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
let text;

const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("HAPPY NEW YEAR", {
    font: font,
    size: 0.8,
    depth: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });
  textGeometry.center();
  // const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  const textMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, // Base color
    transmission: 0, // Fully transparent (glass effect)
    transparent: true,
    opacity: 1.0, // Ensure object is visible
    roughness: 0.65, // Higher roughness for frosted look
    metalness: 0, // Non-metallic
    ior: 1.45, // Typical for glass
    thickness: 1.0, // Increase for stronger refraction
    clearcoat: 1.0, // Glossy outer surface
    clearcoatRoughness: 0.1, // Slightly smoother top layer
  });

  const text = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text behind Santa and Earth
  // text.position.set(-5, 0, -5); // Lower and push back along Z-axis
  text.position.set(-5, 0, -5);
  text.rotation.y = (45 * Math.PI) / 180;
  text.scale.set(1, 1, 1); // Enlarge while keeping proportions
  scene.add(text);

  // Animation to gently float the label
  const animateLabel = () => {
    text.position.y = 0.8 + Math.sin(Date.now() * 0.009) * 0.5;
    requestAnimationFrame(animateLabel);
  };
  animateLabel();
});

gltfLoader.load("/models/cat.glb", (gltf) => {
  santaModel = gltf.scene;
  scene.add(santaModel);

  santaModel.scale.set(3, 3, 3);
  //   // Rotate Santa around the Y-axis (adjust values as needed)
  //   santaModel.rotation.y = 140 * (Math.PI / 180);
  //   santaModel.position.y += 2;
});

/**
 * Textures
 */
// Floor
const mirrorARMTexture = textureLoader.load(
  "textures/mirrorball/pavement_04_1k/pavement_04_arm_1k.jpg"
);
const mirrorColorTexture = textureLoader.load(
  "textures/mirrorball/pavement_04_1k/pavement_04_diff_1k.jpg"
);

const mirrorNormalTexture = textureLoader.load(
  "textures/mirrorball/pavement_04_1k/pavement_04_nor_gl_1k.jpg"
);
const mirrorDisplacementTexture = textureLoader.load(
  "textures/mirrorball/pavement_04_1k/pavement_04_nor_gl_1k.jpg"
);

// Disco Ball Geometry
const discoBallGeometry = new THREE.SphereGeometry(1, 128, 128); // High segment count for smoothness

// Disco Ball Material
const discoBallMaterial = new THREE.MeshStandardMaterial({
  map: mirrorColorTexture,
  aoMap: mirrorARMTexture,
  normalMap: mirrorNormalTexture,
  displacementMap: mirrorDisplacementTexture,
  displacementScale: 0.03, // Slight surface bump for subtle tiles
  metalness: 0.9, // Maximum reflectivity for mirror effect
  roughness: 0.05, // Lower for a shinier look
  color: new THREE.Color(0xaaaaaa), // Light grey to enhance metallic tint
  envMapIntensity: 5, // Strong reflection from environment
  emissive: new THREE.Color(0x000000), // No self-glow, pure reflection
});

// Create Disco Ball Mesh
const discoBall = new THREE.Mesh(discoBallGeometry, discoBallMaterial);
discoBall.position.set(0, 3, 0); // Position above the scene
discoBall.scale.set(0.8, 0.8, 0.8); // Scale down to half size
scene.add(discoBall);

/**
 * Lights
//  */

// const ambientLight = new THREE.AmbientLight(0xffffff, 10);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 20, 100);
// directionalLight.castShadow = true;
// directionalLight.position.set(5, 5, 5);
// scene.add(directionalLight);
// Adjust Ambient Light (reduce to avoid flat look)
const ambientLight = new THREE.AmbientLight(0xffffff, 3); // Lowered for subtle ambient light
scene.add(ambientLight);

// Strong Directional Light for Shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 15);
directionalLight.castShadow = true;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Disco Spotlights (Simulate Disco Effect)
const discoLight1 = new THREE.PointLight(0xff99ff, 80, 100); // Pink light
discoLight1.position.set(5, 5, 0);
scene.add(discoLight1);

const discoLight2 = new THREE.PointLight(0x99ccff, 80, 100); // Blue light
discoLight2.position.set(-5, 5, 0);
scene.add(discoLight2);

const discoLight3 = new THREE.PointLight(0xffff99, 80, 100); // Yellow light
discoLight3.position.set(0, 5, 5);
scene.add(discoLight3);

// Animate Lights to Rotate Around the Disco Ball
const animateLights = () => {
  const elapsedTime = clock.getElapsedTime();

  discoLight1.position.x = Math.sin(elapsedTime * 2) * 10;
  discoLight1.position.z = Math.cos(elapsedTime * 2) * 10;

  discoLight2.position.x = Math.sin(elapsedTime * 2 + Math.PI / 2) * 10;
  discoLight2.position.z = Math.cos(elapsedTime * 2 + Math.PI / 2) * 10;

  discoLight3.position.x = Math.sin(elapsedTime * 2 + Math.PI) * 10;
  discoLight3.position.z = Math.cos(elapsedTime * 2 + Math.PI) * 10;
};

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

  discoBall.rotation.y += 0.05; // Keep the disco ball spinning

  animateLights(); // Move lights around the ball
  //Rotate cat model continuously if it exists
  if (santaModel) {
    santaModel.rotation.y += deltaTime * 50; // Adjust '1' to control rotation speed
  }

  // Disco flashing background effect
  const r = Math.sin(elapsedTime * 10) * 0.5 + 0.5;
  const g = Math.sin(elapsedTime * 12) * 0.5 + 0.5;
  const b = Math.sin(elapsedTime * 15) * 0.5 + 0.5;
  scene.background = new THREE.Color(r, g, b);
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
