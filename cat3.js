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
const saturationShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.5 }, // 1 = normal, > 1 = more saturated
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float saturation;
    varying vec2 vUv;
    
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      float average = (texColor.r + texColor.g + texColor.b) / 3.0;
      vec3 saturatedColor = mix(vec3(average), texColor.rgb, saturation);
      gl_FragColor = vec4(saturatedColor, texColor.a);
    }
  `,
};

// Load PNG Texture
const imageTexture = textureLoader.load("/models/cookie.png");

// Create Geometry for Display (Plane or Box)
const imageGeometry = new THREE.PlaneGeometry(2, 2); // Width and Height of Plane
const imageMaterial = new THREE.ShaderMaterial({
  uniforms: saturationShader.uniforms,
  vertexShader: saturationShader.vertexShader,
  fragmentShader: saturationShader.fragmentShader,
  transparent: true,
});

// Set the cookie texture
saturationShader.uniforms.tDiffuse.value = imageTexture;

// Create Mesh and Add to Scene
const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
imageMesh.position.set(0, 0, 0); // Position it in front of the camera
imageMesh.rotation.y = -Math.PI * 0.3;
scene.add(imageMesh);

// Reduced Ambient Light (Soft Glow)
const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Lower intensity
scene.add(ambientLight);

// Warmer Directional Light (Slight Yellow Tint)
const directionalLight = new THREE.DirectionalLight(0xfff5e6, 5); // Warm white
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
camera.position.set(-4, 2, 4);
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

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
