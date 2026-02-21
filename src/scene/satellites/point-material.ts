import * as THREE from 'three'

const vertexShader = `
  attribute float size;
  attribute vec3 instanceColor;
  varying vec3 vColor;

  void main() {
    vColor = instanceColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(vColor, 1.0);
  }
`

export const createPointMaterial = (): THREE.ShaderMaterial =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
