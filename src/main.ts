import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Earth from './assets/planets/earthmap4k.jpg'
import Clouds from './assets/planets/fair_clouds_4k.png'
import Stars from './assets/planets/starry_background.jpg'


class SceneSetup extends THREE.Scene {

  constructor() {

    super()

  }

}


class CameraSetup extends THREE.PerspectiveCamera {

  constructor(fov: number, aspectRatio: number, nearDistance: number, farDistance: number) {

    super(fov, aspectRatio, nearDistance, farDistance)

    this.position.set(0, 0, 100)
    this.lookAt(0, 0, 0)
  }
}


class RendererSetup extends THREE.WebGLRenderer {

  constructor(configs: object, camera: CameraSetup) {

    super(configs)

    this.setSize(window.innerWidth, window.innerHeight)
    this.setPixelRatio(window.devicePixelRatio)
    this.outputColorSpace = THREE.SRGBColorSpace

    // Inject renderer to DOM
    const target = document.getElementById("app")
    target?.appendChild(this.domElement)

    // OrbitControls
    new OrbitControls(camera, this.domElement)
  }
}


class LightSetup extends THREE.DirectionalLight {

  constructor(scene: THREE.Scene, color: THREE.ColorRepresentation, intensity: number) {

    super(color, intensity)

    this.position.set(0, 0, 100)
    scene.add(this)
  }
}


const _Earth_VS = `
varying vec2 vertexUV
varying vec3 vertexNormal

void main() {
  vertexUV = uv
  vertexNormal = normalize(normalMatrix * normal)
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)
}
`

const _Earth_FS = `
uniform sampler2D globeTexture

varying vec2 vertexUV
varying vec3 vertexNormal

void main() {
  float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0))
  vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5)

  gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0)
}
`

const _Atmosphere_VS = `
varying vec3 vertexNormal

void main() {
  vertexNormal = normalize(normalMatrix * normal)
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)
}
`

const _Atmosphere_FS = `
varying vec3 vertexNormal

void main() {
  float intensity = pow(0.7 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0)
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity
}
`

function main() {

  //#region INIT
  // Create Scene
  const scene = new SceneSetup()

  // Create Camera
  // const camera = new CameraSetup(
  //   50, // FOV
  //   window.innerWidth / window.innerHeight, // Aspect ratio
  //   0.1, // Near: distance objects apear on camera
  //   1000, // Far: distance objects disapear from camera
  // )

  const camera = new THREE.OrthographicCamera(
    -window.innerWidth,
    window.innerWidth,
    window.innerHeight,
    -window.innerHeight,
    -1000, 1000
  )
  camera.position.z = 0;

  // Create Renderer
  // const renderer = new RendererSetup({ antialiasing: true }, camera)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Inject renderer to DOM
  const target = document.getElementById("app")
  target?.appendChild(renderer.domElement)

  // OrbitControls
  new OrbitControls(camera, renderer.domElement)

  // Create light source
  const light = new LightSetup(
    scene,
    0xffffff,
    1
  )
  light.name = 'directional'
  scene.add(light)
  //#endregion


  //#region workspace
  // Earth
  const earthGeo = new THREE.SphereGeometry(215, 30, 30)
  const earthMesh = new THREE.MeshPhongMaterial()

  earthMesh.map = new THREE.TextureLoader().load(Earth)

  const earth = new THREE.Mesh(earthGeo, earthMesh)

  earth.name = 'earth'
  earth.rotateZ(-0.1)
  scene.add(earth)

  // Clouds
  const cloudsGeo = new THREE.SphereGeometry(215, 30, 30)
  const cloudsMesh = new THREE.MeshPhongMaterial()

  cloudsMesh.map = new THREE.TextureLoader().load(Clouds)
  cloudsMesh.transparent = true

  const clouds = new THREE.Mesh(cloudsGeo, cloudsMesh)

  clouds.scale.setScalar(1.01)
  clouds.rotateZ(-0.1)
  scene.add(clouds)

  const ambient = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambient)

  const starsGeo = new THREE.PlaneGeometry(1, 1)
  const starsMat = new THREE.MeshBasicMaterial()
  starsMat.map = new THREE.TextureLoader().load(Stars)

  const stars = new THREE.Mesh(starsGeo, starsMat)
  stars.position.z = -100;
  stars.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
  scene.add(stars)


  // const clouds = new Mesh(
  //   new SphereGeometry(10, 50, 50),
  //   new ShaderMaterial({
  //     vertexShader: _Earth_VS,
  //     fragmentShader: _Earth_FS,
  //     blending: AdditiveBlending,
  //     transparent: true,
  //     uniforms: {
  //       globeTexture: {
  //         value: new TextureLoader().load(Clouds),
  //       }
  //     }
  //   })
  // )
  // clouds.scale.set(1.01, 1.01, 1.01)
  // scene.add(clouds)
  //
  // // Atmosphere
  // const atmosphere = new Mesh(
  //   new SphereGeometry(10, 50, 50),
  //   new ShaderMaterial({
  //     vertexShader: _Atmosphere_VS,
  //     fragmentShader: _Atmosphere_FS,
  //     blending: AdditiveBlending,
  //     side: BackSide,
  //   })
  // )
  // atmosphere.scale.set(1.1, 1.1, 1.1)
  // scene.add(atmosphere)
  //
  //
  // // Stars
  // const material = new PointsMaterial({
  //   size: 10,
  //   map: new TextureLoader().load(
  //     Star
  //   ),
  //   transparent: true,
  // })
  //
  // const geometry = new BufferGeometry()
  // const generatePoints = (num: number) => {
  //   const stars = []
  //   for (let i = 0 i < num * 3; ++i) {
  //     let x = (Math.random() - 0.5) * 2000
  //     let y = (Math.random() - 0.5) * 2000
  //     let z = -1 * Math.random() * 2000
  //
  //     stars.push(x, y, z)
  //   }
  //   return stars
  // }
  //
  // geometry.setAttribute(
  //   "position",
  //   new Float32BufferAttribute(generatePoints(1000), 3)
  // )
  //
  // const stars = new Points(geometry, material)
  // scene.add(stars)
  //
  //#endregion


  //#region Main loop and events
  // On window resize
  const resize = () => {
    // camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener("resize", resize, false)

  // Animation loop
  const animate = () => {

    earth.rotateY(0.01)
    clouds.rotateY(0.01)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()
  //#endregion
}
main()


