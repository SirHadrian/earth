import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Earth from './assets/planets/earthmap4k.jpg'
import EarthNormalMap from './assets/planets/earth_normalmap_flat4k.jpg'
import EarthSpecularMap from './assets/planets/earthspec4k.jpg'
import Clouds from './assets/planets/fair_clouds_4k.png'
import Stars from './assets/planets/starry_background.jpg'

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

  // Create Scene
  const scene = new THREE.Scene()

  // Create Camera
  const camera = new THREE.PerspectiveCamera(
    50, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near: distance objects apear on camera
    1000, // Far: distance objects disapear from camera
  )
  camera.position.set(0, 0, 50)
  camera.lookAt(0, 0, 0)

  // Create Renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 1.0);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace
  // Inject renderer to DOM
  const target = document.getElementById("app")
  target?.appendChild(renderer.domElement)
  // OrbitControls
  const cameraControl = new OrbitControls(camera, renderer.domElement)

  // Create light source
  const light = new THREE.AmbientLight(
    0xcccccc,
    1
  )
  light.position.set(0, 0, 100)
  light.name = 'directional'
  scene.add(light)

  // Earth
  const earthGeo = new THREE.SphereGeometry(15, 30, 30)
  const earthMat = new THREE.MeshPhongMaterial()

  earthMat.map = new THREE.TextureLoader().load(Earth)
  earthMat.normalMap = new THREE.TextureLoader().load(EarthNormalMap)
  earthMat.specularMap = new THREE.TextureLoader().load(EarthSpecularMap)
  earthMat.specular = new THREE.Color(0x262626)

  const earth = new THREE.Mesh(earthGeo, earthMat)

  earth.name = 'earth'
  earth.rotateZ(-0.1)
  scene.add(earth)

  // Clouds
  const cloudsGeo = new THREE.SphereGeometry(15, 30, 30)
  const cloudsMesh = new THREE.MeshPhongMaterial()

  cloudsMesh.map = new THREE.TextureLoader().load(Clouds)
  cloudsMesh.transparent = true

  const clouds = new THREE.Mesh(cloudsGeo, cloudsMesh)

  clouds.scale.setScalar(1.01)
  clouds.rotateZ(-0.1)
  scene.add(clouds)

  // Background
  const starsGeo = new THREE.PlaneGeometry(1, 1)
  const starsMat = new THREE.MeshBasicMaterial({side: THREE.DoubleSide})
  starsMat.map = new THREE.TextureLoader().load(Stars)

  const stars = new THREE.Mesh(starsGeo, starsMat)
  stars.position.z = -900;
  stars.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
  // scene.add(stars)


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

  // On window resize
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener("resize", resize, false)

  // Animation loop
  const animate = () => {

    cameraControl.update() 

    earth.rotateY(0.001)
    clouds.rotateY(0.001)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()
}
main()


