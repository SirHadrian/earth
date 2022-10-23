import {
    TextureLoader,
    Points,
    Float32BufferAttribute,
    BufferGeometry,
    PerspectiveCamera,
    PointsMaterial,
    Scene,
    WebGLRenderer,
    sRGBEncoding,
    ColorRepresentation,
    SphereGeometry,
    Mesh,
    ShaderMaterial,
    AdditiveBlending,
    AmbientLight,
    BackSide,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


class SceneSetup extends Scene {

    constructor() {

        super();

    }

}


class CameraSetup extends PerspectiveCamera {

    constructor( fov: number, aspectRatio: number, nearDistance: number, farDistance: number ) {

        super( fov, aspectRatio, nearDistance, farDistance );

        this.position.set( 0, 0, 100 );
        this.lookAt( 0, 0, 0 );
    }
}


class RendererSetup extends WebGLRenderer {

    constructor( configs: object, camera: CameraSetup ) {

        super( configs );

        this.setSize( window.innerWidth, window.innerHeight );
        this.setPixelRatio( window.devicePixelRatio );
        this.outputEncoding = sRGBEncoding;

        // Inject renderer to DOM
        const target = document.getElementById( "app" );
        target?.appendChild( this.domElement );

        // OrbitControls
        new OrbitControls( camera, this.domElement );
    }
}


class LightSetup extends AmbientLight {

    constructor( scene: Scene, color: ColorRepresentation, intensity: number ) {

        super( color, intensity );

        this.position.set( 0, 0, 100 );
        scene.add( this );
    }
}


const _Earth_VS = `
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const _Earth_FS = `
uniform sampler2D globeTexture;

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
}
`;

const _Atmosphere_VS = `
varying vec3 vertexNormal;

void main() {
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const _Atmosphere_FS = `
varying vec3 vertexNormal;

void main() {
    float intensity = pow(0.7 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
}
`;

function main () {

    //#region INIT
    // Create Scene
    const scene = new SceneSetup();

    // Create Camera
    const camera = new CameraSetup(
        50, // FOV
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near: distance objects apear on camera
        1000, // Far: distance objects disapear from camera
    );

    // Create Renderer
    const renderer = new RendererSetup( { antialiasing: true }, camera );

    // Create light source
    const light = new LightSetup(
        scene,
        0xffffff,
        1
    );
    scene.add( light );
    //#endregion


    //#region workspace

    // Earth
    const earth = new Mesh(
        new SphereGeometry( 10, 50, 50 ),
        new ShaderMaterial( {
            vertexShader: _Earth_VS,
            fragmentShader: _Earth_FS,
            uniforms: {
                globeTexture: {
                    value: new TextureLoader().load( './assets/earth.jpg' ),
                }
            }
        } )
    );
    earth.rotateZ( -0.1 );
    scene.add( earth );

    // Atmosphere
    const atmosphere = new Mesh(
        new SphereGeometry( 10, 50, 50 ),
        new ShaderMaterial( {
            vertexShader: _Atmosphere_VS,
            fragmentShader: _Atmosphere_FS,
            blending: AdditiveBlending,
            side: BackSide,
        } )
    );
    atmosphere.scale.set( 1.1, 1.1, 1.1 );
    scene.add( atmosphere );


    // Stars
    const material = new PointsMaterial( {
        size: 10,
        map: new TextureLoader().load(
            "./assets/star.png"
        ),
        transparent: true,
    } );

    const geometry = new BufferGeometry();
    const generatePoints = ( num: number ) => {
        const stars = [];
        for ( let i = 0; i < num * 3; ++i ) {
            let x = ( Math.random() - 0.5 ) * 2000;
            let y = ( Math.random() - 0.5 ) * 2000;
            let z = -1 * Math.random() * 2000;

            stars.push( x, y, z );
        }
        return stars;
    }

    geometry.setAttribute(
        "position",
        new Float32BufferAttribute( generatePoints( 1000 ), 3 )
    );

    const stars = new Points( geometry, material );
    scene.add( stars )

    //#endregion


    //#region Main loop and events
    // On window resize
    const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( "resize", resize, false );

    // Animation loop
    const animate = () => {

        earth.rotateY( 0.01 );

        renderer.render( scene, camera );
        requestAnimationFrame( animate );
    }
    animate();
    //#endregion
}
main();


