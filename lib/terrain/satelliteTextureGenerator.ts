import * as THREE from "three";

/**
 * Procedural High-Resolution Satellite Orthophoto Generator
 * Recreates the exact satellite landscape of Sux / Fergana Valley:
 * - Left/West: Agricultural green grid plots, village clusters, braided gravel riverbed
 * - Center: Dramatic steep limestone/sandstone escarpment wall with erosion washes
 * - Right/East: Folded corrugated desert-mountain terrain with ochre, sienna, and umber gullies
 * - Border road along the ridge crest
 */
export function generateFerganaSatelliteTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as any);
  }

  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const prng = (x: number, y: number) => {
    const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return sin - Math.floor(sin);
  };

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let py = 0; py < size; py++) {
    const ny = py / size;
    // Ridge runs diagonally across the map matching the Sux escarpment
    const ridgeX = 220 + ny * 580 + Math.sin(ny * 12.0) * 22 + Math.cos(ny * 24.0) * 10;

    for (let px = 0; px < size; px++) {
      const idx = (py * size + px) * 4;
      const distToRidge = px - ridgeX;
      const n1 = prng(px * 0.08, py * 0.08);
      const n2 = prng(px * 0.35, py * 0.35);

      let r = 0, g = 0, b = 0;

      // 1. WESTERN FERGHANA RIVER VALLEY (distToRidge < -20)
      if (distToRidge < -20) {
        r = 195 + n1 * 20;
        g = 190 + n1 * 18;
        b = 175 + n1 * 15;

        // Braided Sux river bed
        const riverCenter = 100 + ny * 420 + Math.sin(ny * 8.0) * 40 + Math.cos(ny * 16.0) * 18;
        const distToRiver = Math.abs(px - riverCenter);

        if (distToRiver < 36 + Math.sin(ny * 10.0) * 14) {
          const riverNoise = prng(px * 0.2, py * 0.2);
          r = 210 + riverNoise * 30;
          g = 215 + riverNoise * 30;
          b = 222 + riverNoise * 25;

          if (Math.abs(distToRiver - Math.sin(py * 0.08) * 10) < 3.5) {
            r = 140;
            g = 170;
            b = 195;
          }
        } else {
          // Farm fields vs village houses
          const gridX = Math.floor(px / 20);
          const gridY = Math.floor(py / 20);
          const cellNoise = prng(gridX, gridY);

          if (cellNoise > 0.44) {
            const farmType = prng(gridX * 3.1, gridY * 7.7);
            if (farmType > 0.6) {
              r = 45 + n2 * 25;
              g = 95 + n2 * 40;
              b = 40 + n2 * 20;
            } else if (farmType > 0.3) {
              r = 75 + n2 * 30;
              g = 135 + n2 * 45;
              b = 60 + n2 * 25;
            } else {
              r = 110 + n2 * 30;
              g = 130 + n2 * 35;
              b = 80 + n2 * 25;
            }
          } else {
            const isRoad = px % 18 < 2 || py % 18 < 2;
            if (isRoad) {
              r = 210 + n2 * 25;
              g = 205 + n2 * 25;
              b = 195 + n2 * 25;
            } else {
              const roofColor = prng(px * 0.8, py * 0.8);
              if (roofColor > 0.6) {
                r = 220 + n2 * 25;
                g = 225 + n2 * 25;
                b = 230 + n2 * 25;
              } else if (roofColor > 0.3) {
                r = 175 + n2 * 30;
                g = 150 + n2 * 25;
                b = 130 + n2 * 20;
              } else {
                r = 40 + n2 * 25;
                g = 80 + n2 * 30;
                b = 35 + n2 * 20;
              }
            }
          }
        }
      }
      // 2. STEEP ESCARPMENT WALL (-20 <= distToRidge <= 30)
      else if (distToRidge <= 30) {
        const t = (distToRidge + 20) / 50;
        const cliffNoise = prng(px * 0.1, py * 0.02);
        const striation = Math.sin(py * 0.35 + px * 0.05) * 15;

        r = 225 - t * 35 + cliffNoise * 30 + striation;
        g = 205 - t * 45 + cliffNoise * 25 + striation;
        b = 175 - t * 55 + cliffNoise * 20 + striation * 0.8;

        if (Math.abs(distToRidge - 22) < 2.0) {
          r = 245;
          g = 240;
          b = 230;
        }
      }
      // 3. KYRGYZSTAN FOLDED ARID MOUNTAINS (distToRidge > 30)
      else {
        const gullyCoord = (px * 0.7 - py * 0.7) * 0.1;
        const gullyWave = Math.sin(gullyCoord) * 0.5 + Math.sin(gullyCoord * 2.3) * 0.25;
        const strata = Math.sin(px * 0.06 + py * 0.05 + gullyWave * 3.0);

        if (gullyWave > 0.1) {
          r = 195 + strata * 25 + n1 * 20;
          g = 165 + strata * 20 + n1 * 18;
          b = 135 + strata * 15 + n1 * 15;
        } else {
          r = 145 + strata * 20 + n1 * 18;
          g = 115 + strata * 16 + n1 * 15;
          b = 95 + strata * 14 + n1 * 12;
        }

        const plateauField = prng(Math.floor(px / 25), Math.floor(py / 25));
        if (plateauField > 0.82) {
          r = Math.min(255, r + 25);
          g = Math.min(255, g + 20);
          b = Math.min(255, b + 10);
        }
      }

      data[idx] = Math.min(255, Math.max(0, Math.round(r)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return texture;
}
