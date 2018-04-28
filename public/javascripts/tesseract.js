var container, scene, camera, renderer, controls, stats, composer;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var sphere;

init();
animate();

function init() {

	// SCENE
	scene = new THREE.Scene();

	scene.background = new THREE.CubeTextureLoader()
					.setPath( '../images/tesseract/' )
					.load( [ 'nebula-xpos.png', 'nebula-xneg.png', 'nebula-ypos.png', 'nebula-yneg.png', 'nebula-zpos.png', 'nebula-zneg.png' ] );

	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,0,50);

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById('ThreeJS');
	container.appendChild(renderer.domElement);

	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// LIGHT

	// spotlight #1 -- yellow, dark shadow
	var spotlight = new THREE.SpotLight(0xffffff);
	spotlight.position.set(-60,150,-30);
	spotlight.angle = Math.PI/4;
	spotlight.intensity = 1;
	spotlight.shadow.mapSize.width = 1024; // default is 512
	spotlight.shadow.mapSize.height = 1024; // default is 512

	// must enable shadow casting ability for the light
	spotlight.castShadow = true;
	scene.add(spotlight);
	// spotlight #2 -- red, light shadow
	var spotlight2 = new THREE.SpotLight(0xffffff);
	spotlight2.position.set(60,150,-60);
	spotlight2.angle = Math.PI/4;
	spotlight2.shadow.mapSize.width = 1024; // default is 512
	spotlight2.shadow.mapSize.height = 1024; // default is 512
	spotlight2.intensity = 0.5;
	spotlight2.castShadow = true;
	scene.add(spotlight2);

	
	// spotlight #3
	var spotlight3 = new THREE.SpotLight(0xffffff);
	spotlight3.position.set(150,80,-100);
	spotlight3.intensity = 1;
	spotlight3.castShadow = true;
	spotlight3.shadow.mapSize.width = 1024; // default is 512
	spotlight3.shadow.mapSize.height = 1024; // default is 512

	scene.add(spotlight3);

	// change the direction this spotlight is facing
	var lightTarget = new THREE.Object3D();
	lightTarget.position.set(150,10,-100);
	scene.add(lightTarget);
	spotlight3.target = lightTarget;
	renderer.shadowMap.enabled = true;

	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0,0,0)
	scene.add(pointLight)

	//ADJUST SHADOW DARKNESS
	scene.add( new THREE.AmbientLight( 0xffffff, 1 ) );


	var tesseractGeometry = new THREE.BoxBufferGeometry(15,15,15);
	var tesseractMaterial = new THREE.MeshPhongMaterial( { color: 0x00ffff, transparent:true, opacity:0.8, refractionRatio: 0.95,envMap: scene.background, shininess: 20, side: THREE.DoubleSide } );
	tesseractMaterial.envMap.mapping = THREE.CubeRefractionMapping;
	tesseract = new THREE.Mesh( tesseractGeometry, tesseractMaterial );
	tesseract.position.set(0,0,0);
	tesseract.castShadow = true; 
	camera.lookAt(tesseract.position);
	scene.add(tesseract);

	//FLOOR
	var floorMaterial = new THREE.MeshLambertMaterial( { color: 0x111111, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -10;
	floor.rotation.x = Math.PI / 2;
	floor.receiveShadow = true;
	//scene.add(floor);


	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 0.8 },
			"p":   { type: "f", value: 1.1 },
			glowColor: { type: "c", value: new THREE.Color(0x00ffff) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );

	this.tesseractGlow = new THREE.Mesh( tesseractGeometry.clone(), customMaterial.clone() );
    tesseractGlow.position = tesseract.position;
	tesseractGlow.scale.multiplyScalar(1.1);
	scene.add(tesseractGlow);

	// POST
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );

	effectBloom = new THREE.BloomPass( 10, 25, 8, 256 );
	composer.addPass( effectBloom );

}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}
function update()
{
	if ( keyboard.pressed("z") ) 
	{ 
		// do something
	}
	
	controls.update();
	stats.update();
	tesseractGlow.material.uniforms.viewVector.value = 
		new THREE.Vector3().subVectors( camera.position, tesseractGlow.position );

}
function render() 
{
	renderer.render( scene, camera );
	composer.render()
}