import * as THREE from "three";

/**
 * High-Performance Mountain & Mapbox Simulator Terrain Shader
 * Supports:
 * - Mapbox Light: Clean cartographic minimalist topo map with crisp contour lines
 * - Mapbox Outdoors: Vibrant daylight hiking map with contour isolines and meadow valleys
 * - Mapbox Satellite: Aerial terrain simulation
 * - Alpine Topo DEM: Natural alpine daylight relief with grass, rock cliffs, and snow
 * - Anti-aliased topographic contour lines (isolines) with major index lines
 * - Bright, luminous daylight lighting (non-dark surfaces)
 */
export const MountainShaderMaterial = {
  uniforms: {
    snowElevation: { value: 24.0 },
    rockSlopeThreshold: { value: 0.78 }, // cos(angle): 0.78 ~= 38 degrees
    wireframeColor: { value: new THREE.Color("#38bdf8") },
    isWireframe: { value: 0.0 },
    sunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.35).normalize() },

    // Engine & Mapbox Simulator Uniforms
    // 0 = Alpine DEM, 1 = Mapbox Light, 2 = Mapbox Outdoors, 3 = Mapbox Satellite
    mapMode: { value: 1.0 }, // Default to Mapbox Light
    showContourLines: { value: 1.0 },
    contourInterval: { value: 15.0 },

    // Bright, daylight color palette (eliminates dark murky tones)
    grassColor: { value: new THREE.Color("#88ba6d") },
    dirtColor: { value: new THREE.Color("#e2dac9") },
    rockColor: { value: new THREE.Color("#cbd3dc") },
    cliffColor: { value: new THREE.Color("#9da6b3") },
    snowColor: { value: new THREE.Color("#ffffff") },

    // Mapbox Light palette
    mapboxLightBase: { value: new THREE.Color("#f6f7f9") },
    mapboxLightShade: { value: new THREE.Color("#dbe0e8") },
    mapboxLightContour: { value: new THREE.Color("#5f6d80") },
    mapboxWaterColor: { value: new THREE.Color("#93c5fd") },

    // Mapbox Outdoors palette
    mapboxOutdoorsGrass: { value: new THREE.Color("#9ed48b") },
    mapboxOutdoorsRock: { value: new THREE.Color("#d1d7dc") },
    mapboxOutdoorsContour: { value: new THREE.Color("#43613d") },
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
    uniform float isWireframe;
    uniform vec3 wireframeColor;

    uniform float mapMode;
    uniform float showContourLines;
    uniform float contourInterval;

    // Alpine colors
    uniform vec3 grassColor;
    uniform vec3 dirtColor;
    uniform vec3 rockColor;
    uniform vec3 cliffColor;
    uniform vec3 snowColor;

    // Mapbox Light colors
    uniform vec3 mapboxLightBase;
    uniform vec3 mapboxLightShade;
    uniform vec3 mapboxLightContour;
    uniform vec3 mapboxWaterColor;

    // Mapbox Outdoors colors
    uniform vec3 mapboxOutdoorsGrass;
    uniform vec3 mapboxOutdoorsRock;
    uniform vec3 mapboxOutdoorsContour;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Procedural noise for natural terrain variation
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

    // Anti-aliased topographic contour lines with major index bands
    float getContourFactor(float elevation, float interval) {
      float safeInterval = max(interval, 2.0);
      float val = mod(elevation, safeInterval);
      float f = fwidth(val);
      float line = 1.0 - smoothstep(0.0, max(f * 1.8, 0.65), min(val, safeInterval - val));

      // Major index contour lines every 5 intervals
      float indexVal = mod(elevation, safeInterval * 5.0);
      float indexF = fwidth(indexVal);
      float indexLine = 1.0 - smoothstep(0.0, max(indexF * 2.2, 0.95), min(indexVal, safeInterval * 5.0 - indexVal));

      return clamp(line * 0.45 + indexLine * 0.55, 0.0, 1.0);
    }

    void main() {
      if (isWireframe > 0.5) {
        gl_FragColor = vec4(wireframeColor, 1.0);
        return;
      }

      vec3 norm = normalize(vNormal);
      float slope = norm.y; // 1.0 = flat horizontal, 0.0 = sheer vertical
      float elevation = vWorldPosition.y;

      // Noise micro-textures
      float n = noise(vWorldPosition.xz * 0.12) * 0.18;
      float rockN = noise(vWorldPosition.xz * 0.35);

      // Light calculation: bright daylight with luminous ambient fill
      float diff = max(dot(norm, sunDirection), 0.0);
      vec3 sunLight = vec3(1.0, 0.99, 0.97) * 1.6;
      vec3 skyFill = vec3(0.85, 0.90, 0.98) * 1.15;
      vec3 groundBounce = vec3(0.78, 0.80, 0.76) * 0.95;
      vec3 totalAmbient = mix(groundBounce, skyFill, norm.y * 0.5 + 0.5);

      vec3 finalColor = vec3(1.0);

      // MODE 1: MAPBOX LIGHT (Clean Minimalist Topographic Architecture)
      if (mapMode > 0.5 && mapMode < 1.5) {
        // High-clarity light cartographic hillshading (minimum 0.70 brightness)
        float hillshade = diff * 0.30 + 0.70;
        vec3 surface = mix(mapboxLightShade, mapboxLightBase, clamp(hillshade, 0.0, 1.0));

        // Subtle snow caps at the very highest peaks
        if (elevation > snowElevation + 4.0) {
          float snowCap = smoothstep(snowElevation + 4.0, snowElevation + 12.0, elevation);
          surface = mix(surface, vec3(1.0), snowCap * 0.9);
        }

        // Topographic contour lines
        if (showContourLines > 0.5) {
          float contour = getContourFactor(elevation, contourInterval);
          surface = mix(surface, mapboxLightContour, contour * 0.65);
        }

        finalColor = surface * (totalAmbient * 0.35 + vec3(0.88));
      }
      // MODE 2: MAPBOX OUTDOORS (Daylight GIS Hiking Topo)
      else if (mapMode >= 1.5 && mapMode < 2.5) {
        // Flat valleys = light green, steep ridges = limestone grey
        float slopeFactor = smoothstep(rockSlopeThreshold - 0.1, rockSlopeThreshold + 0.08, slope);
        vec3 surface = mix(mapboxOutdoorsRock, mapboxOutdoorsGrass, slopeFactor);

        // Snow peaks
        float snowStart = snowElevation - 2.0;
        float snowBlend = smoothstep(snowStart, snowElevation + 5.0, elevation);
        surface = mix(surface, snowColor, snowBlend * clamp(slope * 1.4, 0.0, 1.0));

        // Topographic contour lines
        if (showContourLines > 0.5) {
          float contour = getContourFactor(elevation, contourInterval);
          surface = mix(surface, mapboxOutdoorsContour, contour * 0.6);
        }

        vec3 lit = surface * (sunLight * diff * 0.85 + totalAmbient * 1.15);
        finalColor = mix(surface, lit, 0.65);
      }
      // MODE 3: MAPBOX SATELLITE (High-Albedo Aerial Photography Drape)
      else if (mapMode >= 2.5) {
        vec3 satValley = vec3(0.58, 0.70, 0.48);
        vec3 satRock = vec3(0.80, 0.78, 0.74);
        float slopeFactor = smoothstep(rockSlopeThreshold - 0.12, rockSlopeThreshold + 0.05, slope);
        vec3 surface = mix(satRock, satValley, slopeFactor);

        float snowStart = snowElevation - 3.0;
        float snowBlend = smoothstep(snowStart, snowElevation + 4.0, elevation);
        surface = mix(surface, snowColor, snowBlend * clamp(slope * 1.3, 0.0, 1.0));

        finalColor = surface * (sunLight * diff * 0.75 + totalAmbient * 1.1);
      }
      // MODE 0: ALPINE TOPO DEM (Bright Daylight Natural Alpine)
      else {
        vec3 lowSlopeColor = mix(grassColor, dirtColor, n);
        vec3 highSlopeColor = mix(rockColor, cliffColor, rockN);

        float slopeFactor = smoothstep(rockSlopeThreshold - 0.12, rockSlopeThreshold + 0.05, slope);
        vec3 baseColor = mix(highSlopeColor, lowSlopeColor, slopeFactor);

        float snowStart = snowElevation - 4.0;
        float snowBlend = smoothstep(snowStart, snowElevation + 3.0, elevation + n * 3.0);
        float snowHoldOnSlope = smoothstep(0.35, 0.85, slope);
        float totalSnow = clamp(snowBlend * snowHoldOnSlope * 1.3, 0.0, 1.0);

        vec3 finalDiffuse = mix(baseColor, snowColor, totalSnow);

        if (showContourLines > 0.5) {
          float contour = getContourFactor(elevation, contourInterval);
          finalDiffuse = mix(finalDiffuse, vec3(0.35, 0.40, 0.45), contour * 0.4);
        }

        finalColor = finalDiffuse * (sunLight * diff * 0.85 + totalAmbient * 1.2);
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};
