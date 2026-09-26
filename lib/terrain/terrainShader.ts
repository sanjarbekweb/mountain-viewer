import * as THREE from "three";

/**
 * Custom Alpine Mountain Terrain Material with Slope-Based Triplanar Splatting
 * - Low slope (<25°): Alpine meadow / soil
 * - Steep slope (>25°): Slate / granite cliff rock
 * - High elevation (>22m): Snow peaks with normal-dependent accumulation
 */
export const MountainShaderMaterial = {
  uniforms: {
    snowElevation: { value: 24.0 },
    rockSlopeThreshold: { value: 0.78 }, // cos(angle): 0.78 ~= 38 degrees
    wireframeColor: { value: new THREE.Color("#38bdf8") },
    isWireframe: { value: 0.0 },
    sunDirection: { value: new THREE.Vector3(0.6, 0.7, 0.4).normalize() },
    grassColor: { value: new THREE.Color("#4a5d3f") },
    dirtColor: { value: new THREE.Color("#3e352b") },
    rockColor: { value: new THREE.Color("#4a5056") },
    cliffColor: { value: new THREE.Color("#2f3338") },
    snowColor: { value: new THREE.Color("#f1f5f9") },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform float snowElevation;
    uniform float rockSlopeThreshold;
    uniform vec3 sunDirection;
    uniform vec3 grassColor;
    uniform vec3 dirtColor;
    uniform vec3 rockColor;
    uniform vec3 cliffColor;
    uniform vec3 snowColor;
    uniform float isWireframe;
    uniform vec3 wireframeColor;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Simple procedural noise for micro-variation
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      if (isWireframe > 0.5) {
        gl_FragColor = vec4(wireframeColor, 1.0);
        return;
      }

      vec3 norm = normalize(vNormal);
      float slope = norm.y; // 1.0 = completely flat horizontal, 0.0 = completely vertical cliff
      float elevation = vWorldPosition.y;

      // Micro variation
      float n = noise(vWorldPosition.xz * 0.15) * 0.2;
      float rockN = noise(vWorldPosition.xz * 0.4);

      // Low slope: Grass to dirt blend
      vec3 lowSlopeColor = mix(grassColor, dirtColor, n);

      // Steep slope: Rock to dark cliff blend
      vec3 highSlopeColor = mix(rockColor, cliffColor, rockN);

      // Slope transition (smooth blend around rockSlopeThreshold)
      float slopeFactor = smoothstep(rockSlopeThreshold - 0.12, rockSlopeThreshold + 0.05, slope);
      vec3 baseColor = mix(highSlopeColor, lowSlopeColor, slopeFactor);

      // Snow transition at high elevation with slope weighting (snow sticks to flats, falls off cliffs)
      float snowStart = snowElevation - 4.0;
      float snowBlend = smoothstep(snowStart, snowElevation + 3.0, elevation + n * 4.0);
      float snowHoldOnSlope = smoothstep(0.4, 0.85, slope); // snow only clings where slope is moderate to flat
      float totalSnow = clamp(snowBlend * snowHoldOnSlope * 1.3, 0.0, 1.0);

      vec3 finalDiffuse = mix(baseColor, snowColor, totalSnow);

      // Simple directional sunlight + soft ambient ambient skylight
      float diff = max(dot(norm, sunDirection), 0.0);
      vec3 lightColor = vec3(1.0, 0.96, 0.90) * 1.2;
      vec3 skyAmbient = vec3(0.35, 0.42, 0.55) * 0.7;
      vec3 groundAmbient = vec3(0.2, 0.22, 0.18) * 0.4;
      vec3 ambient = mix(groundAmbient, skyAmbient, norm.y * 0.5 + 0.5);

      vec3 litColor = finalDiffuse * (lightColor * diff + ambient);

      // Atmospheric distance haze
      gl_FragColor = vec4(litColor, 1.0);
    }
  `,
};
