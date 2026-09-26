import fs from "fs";
import path from "path";
import zlib from "zlib";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// Polyfill FileReader for Node.js
globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      setTimeout(() => {
        if (this.onloadend) this.onloadend({ target: this });
        if (this.onload) this.onload({ target: this });
      }, 0);
    });
  }
};

const modelsDir = path.join(process.cwd(), "public", "models");
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const exporter = new GLTFExporter();

// 1. Build Alpine Timber Cabin
function buildAlpineCabin() {
  const cabin = new THREE.Group();
  cabin.name = "AlpineCabin";

  // Main Log Body (4x3x5)
  const bodyGeo = new THREE.BoxGeometry(4, 3, 5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.5;
  cabin.add(body);

  // Gable Alpine Roof
  const roofGeo = new THREE.ConeGeometry(3.6, 2.2, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.5 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 3.8;
  roof.rotation.y = Math.PI / 4;
  cabin.add(roof);

  // Stone Chimney
  const chimneyGeo = new THREE.BoxGeometry(0.8, 4, 0.8);
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.9 });
  const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
  chimney.position.set(1.5, 2.5, -1.2);
  cabin.add(chimney);

  // Wooden Porch
  const porchGeo = new THREE.BoxGeometry(3.5, 0.3, 1.8);
  const porchMat = new THREE.MeshStandardMaterial({ color: 0xb7791f, roughness: 0.7 });
  const porch = new THREE.Mesh(porchGeo, porchMat);
  porch.position.set(0, 0.15, 3.2);
  cabin.add(porch);

  return cabin;
}

// 2. Build Observation Lookout Tower
function buildLookoutTower() {
  const tower = new THREE.Group();
  tower.name = "LookoutTower";

  // Concrete Pylons/Shaft
  const shaftGeo = new THREE.CylinderGeometry(1.6, 2.2, 10, 8);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = 5;
  tower.add(shaft);

  // Observation Platform Deck
  const deckGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.6, 12);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 10.3;
  tower.add(deck);

  // Glass Observatory Ring
  const glassGeo = new THREE.CylinderGeometry(3.2, 3.2, 1.2, 12);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.7 });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.y = 11.2;
  tower.add(glass);

  // Roof & Comms Spire
  const spireGeo = new THREE.ConeGeometry(0.2, 3, 6);
  const spireMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = 13.5;
  tower.add(spire);

  return tower;
}

// 3. Generate Valid 16-bit/8-bit Grayscale PNG Heightmap
function generateHeightmapPNG(filepath, width = 256, height = 256) {
  // Simple fractal alpine elevation generator for the PNG
  const rawData = Buffer.alloc(height * (width + 1)); // 1 filter byte per scanline
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const d = Math.sqrt(nx * nx + ny * ny);

      // Radial mountain mass falloff
      const r = Math.max(0, 1 - Math.pow(d, 1.6));
      // Sinusoidal ridges
      const ridges = Math.sin(nx * 6 + Math.cos(ny * 6)) * 0.3 + Math.cos(ny * 8 - nx * 4) * 0.2;
      const elevation = Math.min(255, Math.max(0, Math.floor((r + ridges * r) * 220)));

      rawData[offset++] = elevation;
    }
  }

  // Create minimal valid PNG with zlib deflate
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 0; // Color type: 0 (Grayscale)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk("IHDR", ihdr);

  // IDAT Chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressed);

  // IEND Chunk
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filepath, pngBuffer);
  console.log("Generated heightmap PNG:", filepath, "Size:", pngBuffer.length);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

// Fast CRC32 for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

async function main() {
  console.log("Generating sample 3D models and heightmap...");

  // Generate Cabin GLB
  const cabinScene = buildAlpineCabin();
  const cabinGLB = await exporter.parseAsync(cabinScene, { binary: true });
  fs.writeFileSync(path.join(modelsDir, "sample_cabin.glb"), Buffer.from(cabinGLB));
  console.log("Created sample_cabin.glb:", cabinGLB.byteLength, "bytes");

  // Generate Tower GLB
  const towerScene = buildLookoutTower();
  const towerGLB = await exporter.parseAsync(towerScene, { binary: true });
  fs.writeFileSync(path.join(modelsDir, "sample_tower.glb"), Buffer.from(towerGLB));
  console.log("Created sample_tower.glb:", towerGLB.byteLength, "bytes");

  // Generate Heightmap PNG
  generateHeightmapPNG(path.join(process.cwd(), "public", "heightmap.png"), 256, 256);

  console.log("All sample assets generated successfully!");
}

main().catch(console.error);
