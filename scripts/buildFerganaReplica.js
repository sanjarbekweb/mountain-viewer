const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || '';
const Z = 14;
const tileCoords = [
  { x: 11430, y: 6204, col: 0, row: 0 },
  { x: 11431, y: 6204, col: 1, row: 0 },
  { x: 11430, y: 6205, col: 0, row: 1 },
  { x: 11431, y: 6205, col: 1, row: 1 },
];

function tile2lat(y, z) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}
function tile2lon(x, z) {
  return (x / Math.pow(2, z) * 360 - 180);
}

async function run() {
  console.log('Downloading 4 Mapbox satellite tiles at @2x (512x512 each)...');
  const satBuffers = await Promise.all(tileCoords.map(async t => {
    const url = `https://api.mapbox.com/v4/mapbox.satellite/${Z}/${t.x}/${t.y}@2x.jpg90?access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Satellite fetch failed: ${res.status} for ${t.x},${t.y}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { ...t, buf };
  }));

  console.log('Stitching 1024x1024 satellite orthophoto mosaic...');
  const composites = satBuffers.map(t => ({
    input: t.buf,
    left: t.col * 512,
    top: t.row * 512
  }));

  const outSatPath = path.join('public', 'terrain', 'fergana_satellite_replica.jpg');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: { r: 180, g: 170, b: 150 }
    }
  })
  .composite(composites)
  .jpeg({ quality: 95 })
  .toFile(outSatPath);

  console.log('Saved satellite replica to:', outSatPath);

  console.log('Downloading 4 Mapbox terrain-rgb DEM tiles...');
  const demBuffers = await Promise.all(tileCoords.map(async t => {
    const url = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${Z}/${t.x}/${t.y}.pngraw?access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`DEM fetch failed: ${res.status} for ${t.x},${t.y}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    return { ...t, data, info };
  }));

  const W = 512;
  const H = 512;
  const elevations = new Float32Array(W * H);
  let minMeters = Infinity;
  let maxMeters = -Infinity;

  for (const dem of demBuffers) {
    const xOffset = dem.col * 256;
    const yOffset = dem.row * 256;
    const channels = dem.info.channels;

    for (let py = 0; py < 256; py++) {
      for (let px = 0; px < 256; px++) {
        const srcIdx = (py * 256 + px) * channels;
        const r = dem.data[srcIdx];
        const g = dem.data[srcIdx + 1];
        const b = dem.data[srcIdx + 2];

        // Mapbox Terrain-RGB formula: height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
        const meters = -10000 + (r * 65536 + g * 256 + b) * 0.1;
        if (meters < minMeters) minMeters = meters;
        if (meters > maxMeters) maxMeters = meters;

        const dstX = xOffset + px;
        const dstY = yOffset + py;
        elevations[dstY * W + dstX] = meters;
      }
    }
  }

  console.log(`Elevation range: ${minMeters.toFixed(2)}m to ${maxMeters.toFixed(2)}m (Delta: ${(maxMeters - minMeters).toFixed(2)}m)`);

  const outBinPath = path.join('public', 'terrain', 'fergana_dem_512.bin');
  fs.writeFileSync(outBinPath, Buffer.from(elevations.buffer));
  console.log('Saved 512x512 elevation binary grid to:', outBinPath);

  // Compute normalized heights for fast rendering
  // Also save a JSON summary
  const west = tile2lon(11430, Z);
  const east = tile2lon(11432, Z);
  const north = tile2lat(6204, Z);
  const south = tile2lat(6206, Z);

  const metadata = {
    locationId: 'fergana_alay',
    name: "Fergana Valley / Alay Range (Sux-Kyrgyzstan Border)",
    zoom: Z,
    tiles: tileCoords.map(t => `${t.x},${t.y}`),
    bounds: { west, east, north, south },
    center: { lat: (north + south) / 2, lng: (west + east) / 2 },
    gridSize: W,
    minElevationMeters: minMeters,
    maxElevationMeters: maxMeters,
    elevationDeltaMeters: maxMeters - minMeters,
    groundResolutionMeters: 7.33,
    createdAt: new Date().toISOString()
  };

  const outMetaPath = path.join('public', 'terrain', 'fergana_replica_meta.json');
  fs.writeFileSync(outMetaPath, JSON.stringify(metadata, null, 2));
  console.log('Saved metadata to:', outMetaPath);

  // Also generate a high-contrast normal map / elevation hillshade preview image so we can inspect it visually
  console.log('Generating elevation heightmap preview PNG...');
  const heightmapImg = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const norm = (elevations[i] - minMeters) / (maxMeters - minMeters);
    heightmapImg[i] = Math.round(Math.min(Math.max(norm * 255, 0), 255));
  }
  await sharp(heightmapImg, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toFile(path.join('public', 'terrain', 'fergana_heightmap_preview.png'));
  console.log('Saved fergana_heightmap_preview.png!');
}

run().catch(console.error);
