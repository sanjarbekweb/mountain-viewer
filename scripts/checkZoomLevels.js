const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || '';

async function checkZoom(z, xStart, yStart) {
  const coords = [
    { x: xStart, y: yStart },
    { x: xStart + 1, y: yStart },
    { x: xStart, y: yStart + 1 },
    { x: xStart + 1, y: yStart + 1 },
  ];
  let min = Infinity, max = -Infinity;
  for (const c of coords) {
    const url = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${c.x}/${c.y}.pngraw?access_token=${token}`;
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * info.channels];
      const g = data[i * info.channels + 1];
      const b = data[i * info.channels + 2];
      const m = -10000 + (r * 65536 + g * 256 + b) * 0.1;
      if (m < min) min = m;
      if (m > max) max = m;
    }
  }
  console.log(`Zoom ${z} (top-left ${xStart},${yStart}): min=${min.toFixed(1)}m, max=${max.toFixed(1)}m, delta=${(max-min).toFixed(1)}m`);
}

async function main() {
  await checkZoom(13, 5715, 3102);
  await checkZoom(14, 11430, 6204);
}
main().catch(console.error);
