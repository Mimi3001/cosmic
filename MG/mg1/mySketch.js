/*You can adjust the height of the terrain by adjusting the multiplier on line 157. I have it set to create
a subtle effect, but you can crank it up by changing from 0.05 to a higher value.

I haved aded the lights on top of the earth image. To see the earth with just lights use lines 61-68 and 
comment out 70-76, 152, 185, 193 and set useLights = true
*/
// --- GET PLANET NAME PASSED THROUGH THE IFRAME URL ---
const params = new URLSearchParams(window.location.search);
const chosenPlanet = params.get('planet'); // e.g., “Uranus”

console.log('Planet passed from parent:', chosenPlanet);

let renderer, scene, camera, texture, orbitControls;
let useLights = false;
let colorMap, lightsMap, elevMap, canvas;
const detail = 180; //130
let uniforms;
let elevMult; // parameter that controls height of terrain
let exploding = false;
let cloudMesh;

window.addEventListener("message", (event) => {
  if (event.data?.type === "set_prompt") {
    const el = document.getElementById("mg-prompt");
    if (el) el.textContent = event.data.text || "";
  }

});

//---------------------------------------------
const planetTextures = {
  Hamarik: {
    color: "./textures/Hamarikcolor.jpg",
    elevation: "./textures/Hamarikelev.jpg",
    water: "./textures/Hamarikelev.jpg",
    clouds: "./textures/Hamarikclouds.png"
  },
  Tahay: {
    color: "./textures/Tahaycolor.jpg",
    elevation: "./textures/Tahayelev.jpg",
    water: "./textures/Tahayelev.jpg",
    clouds: "./textures/Tahayclouds.png"
  },
  Chura: {
    color: "./textures/Churacolor.jpg",
    elevation: "./textures/Churaelev.jpg",
    water: "./textures/Churaelev.jpg",
    clouds: "./textures/Churaclouds.png"
  },
  Santamasa: {
    color: "./textures/Santamasacolor.jpg",
    elevation: "./textures/Santamasaelev.jpg",
    water: "./textures/Santamasaelev.jpg",
    clouds: "./textures/Santamasaclouds.png"
  },
  Ahra: {
    color: "./textures/Ahracolor.jpg",
    elevation: "./textures/Ahraelev.jpg",
    water: "./textures/Ahraelev.jpg",
    clouds: "./textures/Ahraclouds.png"
  },
  Lete: {
    color: "./textures/Letecolor.jpg",
    elevation: "./textures/Leteelev.jpg",
    water: "./textures/Leteelev.jpg",
    clouds: "./textures/Leteclouds.png"
  },
  Veles: {
    color: "./textures/Velescolor.jpg",
    elevation: "./textures/Veleselev.jpg",
    water: "./textures/Veleselev.jpg",
    clouds: "./textures/Velesclouds.png"
  }
};
//--------------------------------------------------



function setup() {
  canvas = document.getElementById("threeCanvas");
  //threeCanvas = createCanvas(windowWidth, windowHeight, WEBGL); // don't want to do this!

  const heightSlider = document.getElementById("heightSlider");
  heightSlider.addEventListener("input", (e) => {
    if (uniforms) uniforms.elevMult.value = parseFloat(e.target.value);//auto elegxetai apo to slider
  });
  /*
   document.getElementById("cloudSlider").addEventListener("input", (e) => {
     cloudUniforms.cloudLevel.value = parseFloat(e.target.value);
   });*/
  document.getElementById("waterSlider").addEventListener("input", e => {//auto en to slider 
    uniforms.waterLevel.value = parseFloat(e.target.value);//auto elegxei to nero
  });

  // Set up Three.js renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x141414);

  // Set up Three.js scene
  scene = new THREE.Scene();

  // Set up camera
  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.minDistance = 2;   // can’t get closer===================================
  orbitControls.maxDistance = 4;   // can’t zoom out more================================
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.1;

  const textures = planetTextures[chosenPlanet] || planetTextures["Hamarik"];
  const textureLoader = new THREE.TextureLoader()

  // if (useLights) {
  // colorMap = textureLoader.load(
  // "earth_lights_lrg.jpg");
  // } else {colorMap = textureLoader.load(
  // "world.200412.3x5400x2700.jpg");}
  // const elevMap = textureLoader.load(
  //   "srtm_ramp2.worldx294x196.jpg"
  // );
  colorMap = textureLoader.load(textures.color);
  elevMap = textureLoader.load(textures.elevation);
  const waterElevMap = textureLoader.load(textures.water);
  const cloudTexture = textureLoader.load(textures.clouds);

  /*  colorMap = textureLoader.load(
      "./world.200412.3x5400x2700.jpg");
    //lightsMap = textureLoader.load(
    //  "./earth_lights_lrg.jpg"); // 4 afairo
    elevMap = textureLoader.load(
      "./srtm_ramp2.world.1350x675.jpg"
    );
  
    const waterElevMap = textureLoader.load("./inverted-elevation-world-map.jpg");
  */
  // Add Earth geometry
  const earthGroup = new THREE.Group();
  // earthGroup.rotation.z = -23.4 * Math.PI / 180;
  scene.add(earthGroup)

  const geometry = new THREE.IcosahedronGeometry(1, 15)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x202020,
    wireframe: false
  })

  const earthMesh = new THREE.Mesh(geometry, mat);
  earthGroup.add(earthMesh)

  const pointsGeo = new THREE.IcosahedronGeometry(1, detail);//auto ruthmizei to terrain
  const pointsMat = getPointsMat(elevMap, waterElevMap)
  const points = new THREE.Points(pointsGeo, pointsMat);
  earthGroup.add(points)

  // Add clouds layer - feugei

  /* const cloudTexture = new THREE.TextureLoader().load("cloud_combined_2048-2.png");*/
  const cloudGeo = new THREE.SphereGeometry(1.04, 64, 64);//auta einai ta sunnefa poso apexoun kai ti diametro exoun
  const cloudMat = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.9, //fainontai ligo ta sunnefakia
    //alphaTest: 0.05

  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  earthGroup.add(cloudMesh);

  //oxi edw
  const cloudSlider = document.getElementById("cloudSlider");

  cloudSlider.addEventListener("input", () => {
    cloudMat.opacity = parseFloat(cloudSlider.value);
  });


  // Add glow to earth
  const fresnelMaterial = getFresnelMat();

  // Slightly bigger sphere for atmosphere
  const glowMesh = new THREE.Mesh(
    geometry,
    fresnelMaterial
  );
  glowMesh.scale.setScalar(1.047),
    earthGroup.add(glowMesh);

  // Add lighting
  // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 3);
  // scene.add(hemiLight)
  const sunLight = new THREE.DirectionalLight(0xffffff);
  sunLight.position.set(-2, 0.5, 1.5);
  scene.add(sunLight);



  // --- STARFIELD (FAST POINTS) ----------------------------------
  const starCount = 1000;
  const starGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // large sphere radius for stars
    const radius = 70;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    sizeAttenuation: false,
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);


  function animate(t = 0) {
    requestAnimationFrame(animate);

    earthGroup.rotation.y += 0.0005; // animation gets a little pixalated with rotation

    //cloudUniforms.time.value += 0.01;  // drifting clouds
    cloudMesh.rotation.y += 0.0004; // gentle cloud rotation

    renderer.render(scene, camera);
    orbitControls.update();
  }
  animate();
}

function getPointsMat(elevMap, waterElevMap) {
  uniforms = {
    size: { type: "f", value: 4.0 },
    elevMult: { type: "f", value: 0 },
    colorTexture: { type: "t", value: colorMap },
    //lightsTexture: { type: "t", value: lightsMap }, //mpoulo
    elevTexture: { type: "t", value: elevMap }, //=========================terrain einai 

    waterElevTexture: { type: "t", value: waterElevMap },//kai auto gia nero
    waterLevel: { type: "f", value: 0 },   //evala auto  gia nero
  };
  const vs = `//edw tono
	uniform float size;
	uniform float elevMult; //multiplier for terrain displacement.controlled by the terrain height slider
  uniform sampler2D elevTexture;

//  uniform float cloudLevel;
 // uniform float waterLevel;
  
  varying vec2 vUv;
 // varying float vVisible;
  varying float vElevation;

  void main() {
		vUv = uv;
/*MPOULO
		// elevation map
    vec3 e = texture2D(elevTexture, vUv).rgb;
    float elv =
        -1.0 * e.r +      // red = deep ocean
        0.5 * e.g +      // green = medium
        1.2 * e.b;       // blue = mountain

    elv = (elv + 1.0) * 0.5;   // normalize 0–1
*/
    //vec3 elevColor = texture2D(elevTexture, vUv).rgb;
    //float elv = dot(elevColor, vec3(0.299, 0.587, 0.114));//auta ta gkri kratane to 0 for land, only mountain pixels have strong peaks. 
    float elv = texture2D(elevTexture, vUv).r;
          
		vElevation = elv; // pass to fragment shader


		vec3 displaced = position + normal * (elevMult * elv); //auto apo to slider 
		vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
		//vec3 vNormal = normalMatrix * normal;
		//vVisible = step(0.0, dot(-normalize(mvPosition.xyz), normalize(vNormal)));

		gl_PointSize = size;
		gl_Position = projectionMatrix * mvPosition;
}`//tono

  const fs = `
  uniform sampler2D colorTexture;
  uniform sampler2D elevTexture;
  uniform float waterLevel;
  ///uniform sampler2D waterElevTexture;

  varying vec2 vUv;
  //varying float vVisible;
  varying float vElevation;
 
  void main() {
    vec4 baseColor = texture2D(colorTexture, vUv);
        if (vElevation < waterLevel) {
          vec3 waterColor = vec3(0.02, 0.04, 0.12); // dark blue water
         // float depth = smoothstep(waterLevel, waterLevel - 0.4, vElevation);//07 kati ginetai
          //vec3 col = mix(waterColor, baseColor.rgb, depth);
          gl_FragColor = vec4(waterColor, 1.0);
          return;
        }
          
    gl_FragColor = baseColor;

          /*  float waterMask = texture2D(waterElevTexture, vUv).r;
          vec3 c = texture2D(waterElevTexture, vUv).rgb;
          float mask = c.b * 0.6 + c.g * 0.3 + c.r * 0.1;


            if (waterMask > waterLevel) {
              vec3 waterColor = vec3(0.05, 0.02, 0.09);
              float depth = smoothstep(waterLevel, 1.0, waterMask);
              vec3 col = mix(waterColor, baseColor.rgb, depth);
              gl_FragColor = vec4(col, 1.0);
              return;
             }*/

/*
    if (vElevation < waterLevel) {
        vec3 waterColor = vec3(0.05, 0.02, 0.09);
        float depth = smoothstep(waterLevel, waterLevel - 0.15, vElevation);
        vec3 col = mix(waterColor, baseColor.rgb, depth);
        gl_FragColor = vec4(col, 1.0);
        return;
    }*/
   
    
    //float shade = mix(0.7, 1.3, vElevation); // valleys darker, mountains lighter
    //shade = clamp(shade, 0.6, 1.4);

   // vec3 finalColor = baseColor.rgb * shade;
             //  if (vVisible < 0.5) discard;//wtf????????????????????
   // gl_FragColor = vec4(finalColor, baseColor.a);
}
`


  const pointsMat = new THREE.ShaderMaterial({//auto dimiourgei material
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    transparent: false,
    depthWrite: true,
    depthTest: true
  });

  return pointsMat;
}

function getFresnelMat({ rimHex = 0x0088ff, facingHex = 0x000000 } = {}) {
  const uniforms = {
    color1: { value: new THREE.Color(rimHex) },
    color2: { value: new THREE.Color(facingHex) },
    fresnelBias: { value: 0.05 },
    fresnelScale: { value: 1.0 },
    fresnelPower: { value: 4.0 },
  };
  /*========================the glow/atmosphere sphere.=======================================*/
  /*----------------------------------------------*/
  const vs = `
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;
  varying float vReflectionFactor;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    vec3 I = worldPosition.xyz - cameraPosition;
    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
    gl_Position = projectionMatrix * mvPosition;
  }
  `;
  /*--------------------------------------------*/
  const fs = `
  uniform vec3 color1;
  uniform vec3 color2;
  
  varying float vReflectionFactor;
  
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;
  /*--------------------------------------------------------------------------------------*/
  const fresnelMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
  return fresnelMat;
}

/* python -m http.server         */