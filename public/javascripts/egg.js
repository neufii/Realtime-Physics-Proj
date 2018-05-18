var container, scene, camera, renderer, controls, stats, composer;
var clock = new THREE.Clock();
var tick = 0;

// Particle
var particleSystem, particleUniforms, particleGeometry, particles;
var num_particles = 20
var positions = [];
var colors = [];
var sizes = [];

var sphere;

var effectFXAA, bloomPass, renderScene;
var composer;

init();
animate();

function init() {

	// SCENE
	scene = new THREE.Scene();

	scene.background = new THREE.CubeTextureLoader()
					.setPath( '../images/egg/' )
					.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
					// .load( [ 'DarkSea-xpos.jpg', 'DarkSea-xneg.jpg', 'DarkSea-ypos.jpg', 'DarkSea-yneg.jpg', 'DarkSea-zpos.jpg', 'DarkSea-zneg.jpg' ] );

	// scene.background = new THREE.Color( 0x000000 )
	
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
	window.addEventListener( 'resize', onWindowResize, false );

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
	//scene.add(spotlight);
	// spotlight #2 -- red, light shadow
	var spotlight2 = new THREE.SpotLight(0xffffff);
	spotlight2.position.set(60,150,-60);
	spotlight2.angle = Math.PI/4;
	spotlight2.shadow.mapSize.width = 1024; // default is 512
	spotlight2.shadow.mapSize.height = 1024; // default is 512
	spotlight2.intensity = 0.5;
	spotlight2.castShadow = true;
	//scene.add(spotlight2);

	
	// spotlight #3
	var spotlight3 = new THREE.SpotLight(0xffffff);
	spotlight3.position.set(150,80,-100);
	spotlight3.intensity = 1;
	spotlight3.castShadow = true;
	spotlight3.shadow.mapSize.width = 1024; // default is 512
	spotlight3.shadow.mapSize.height = 1024; // default is 512

	//scene.add(spotlight3);

	// change the direction this spotlight is facing
	var lightTarget = new THREE.Object3D();
	lightTarget.position.set(150,10,-100);
	scene.add(lightTarget);
	spotlight3.target = lightTarget;
	renderer.shadowMap.enabled = true;

	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0,0,0)
	//scene.add(pointLight)

	//ADJUST SHADOW DARKNESS
	scene.add( new THREE.AmbientLight( 0xffffff, 2 ) );

	console.log(document.getElementById( 'glowVertexShader' ).textContent)
	//LAVA
	// var textureLoader = new THREE.TextureLoader();
	// uniforms = {
	// 	fogDensity: { value: 0.45 },
	// 	fogColor: { value: new THREE.Vector3( 0, 0, 0 ) },
	// 	time: { value: 1.0 },
	// 	uvScale: { value: new THREE.Vector2( 3.0, 1.0 ) },
	// 	texture1: { value: textureLoader.load( '../images/egg/cloud.png' ) },
	// 	texture2: { value: textureLoader.load( '../images/egg/lavatile.jpg' ) }
	// 			};
	// uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
	// uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;
	// var size = 0.65;
	// var material = new THREE.ShaderMaterial( {
	// 	uniforms: uniforms,
	// 	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	// 	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	// } );

	var points = [];
	for ( var deg = 0; deg <= 180; deg += 6 ) {

    	var rad = Math.PI * deg / 180;
    	var corx = Math.max(( 0.76 + .08 * Math.cos( rad ) ) * Math.sin( rad ) * 10,0);
    	var cory = - Math.cos( rad ) *10
    	var point = new THREE.Vector2(corx, cory); // the "egg equation"
    	console.log( point );
    	points.push( point );
	}

	eggTexture = new THREE.TextureLoader().load('../images/egg/iceflake.jpg' );

	var eggGeometry = new THREE.LatheBufferGeometry(points,32);
	var eggMaterial = new THREE.MeshPhongMaterial( { 
		map: eggTexture, 
		color: 0xffc560, 
		transparent:true, 
		opacity:0.7, 
		refractionRatio: 0.3,
		envMap: scene.background, 
		shininess: 3,
		combine: THREE.MixOperation, 
		reflectivity: 0.3 ,
		side: THREE.FrontSide 
	});
	eggMaterial.envMap.mapping = THREE.CubeRefractionMapping;
	egg = new THREE.Mesh( eggGeometry, eggMaterial );
	egg.position.set(0,0,0);
	egg.castShadow = true; 
	camera.lookAt(egg.position);

	scene.add(egg);


	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 0.0 },
			"p":   { type: "f", value: 10 },
			glowColor: { type: "c", value: new THREE.Color(0xffffff) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   document.getElementById( 'glowVertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'glowFragmentShader' ).textContent,
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
	}   );

	this.eggGlow = new THREE.Mesh( eggGeometry.clone(), customMaterial.clone() );
    eggGlow.position = egg.position;
	eggGlow.scale.multiplyScalar(1.0005);
	scene.add( eggGlow);

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( 1.25 );
	var effectFilm = new THREE.FilmPass( 0.35, 0.95, 2048, false );
	effectFilm.renderToScreen = true;
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderModel );
	composer.addPass( effectBloom );
	composer.addPass( effectFilm );


	// POST
	// renderScene = new THREE.RenderPass( scene, camera );
	// effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
	// effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	// bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.12, 0.92); //1.0, 9, 0.5, 512);
	// bloomPass.renderToScreen = true;
	// composer = new THREE.EffectComposer( renderer );
	// composer.setSize( window.innerWidth, window.innerHeight );
	// composer.addPass( renderScene );
	// composer.addPass( effectFXAA );
	// composer.addPass( bloomPass );
	// renderer.gammaInput = true;
	// renderer.gammaOutput = true;

	// 
	// Simple Glow
	// 
	var spriteMap = new THREE.TextureLoader().load( '../images/tesseract/glow.png' );
	var spriteMaterial = new THREE.SpriteMaterial( { 
		map: spriteMap, 
		color: 0xffee55, 
		transparent: false, 
		blending: THREE.AdditiveBlending 
	} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(40, 40, 1)
	scene.add( sprite );


	// 
	// Particle
	// 
	particles = new THREE.Geometry()
  	var pMaterial = new THREE.PointsMaterial({
		color: 0x333333,
		size: 5,
		map: new THREE.TextureLoader().load( "../images/particle/smokeparticle.png" ),
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false,
	});

	var radius = 4
	// now create the individual particles
	for (var p = 0; p < num_particles; p++) {

		// create a particle with random
		// position values, -250 -> 250
		//TODO: recreate generate point
		pos_chance = Math.random()*10
		if (pos_chance < 1){
			var pX = ( Math.random() * 2 - 1 ) * radius/2.2,
			pY = ( Math.random() * 2 - 1 ) * radius/2.2 - 4,
			pZ = ( Math.random() * 2 - 1 ) * radius/2.2,
			particle = new THREE.Vector3(pX, pY, pZ)
		}else if (pos_chance < 3) {
			var pX = ( Math.random() * 2 - 1 ) * radius/1.7,
				pY = ( Math.random() * 2 - 1 ) * radius/1.7 - 4,
				pZ = ( Math.random() * 2 - 1 ) * radius/1.7,
				particle = new THREE.Vector3(pX, pY, pZ)
		}else {
			var pX = ( Math.random() * 2 - 1 ) * radius,
				pY = ( Math.random() * 2 - 1 ) * radius - 3,
				pZ = ( Math.random() * 2 - 1 ) * radius,
				particle = new THREE.Vector3(pX, pY, pZ)
		}

			particle.velocity = new THREE.Vector3(
				Math.random() * 10 - 5,              
				Math.random() * 10 - 5, 
				Math.random() * 10 - 5
			);            

		// add it to the geometry
		particles.vertices.push(particle);
	}

	// create the particle system
	particleSystem = new THREE.Points(
		particles,
		pMaterial
	);

	particleSystem.sortParticles = true;

	// add it to the scene
	scene.add(particleSystem);

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

	// Composer
	// composer.setSize( window.innerWidth, window.innerHeight );
}

function animate() 
{
  requestAnimationFrame( animate );
	render();		
	update();
}
function update()
{

	controls.update();
	stats.update();
	eggGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( camera.position, eggGlow.position );

	var dt = clock.getDelta() * 0.5;
	// uniforms.time.value += 0.2 * dt;

	// random move particle
	var pCount = num_particles;
	while (pCount--) {

		// get the particle
		var particle = particles.vertices[pCount];

		//TODO: edit bound for y axis
		// check if we need to reset
		var rad = Math.acos(particle.y/-10)
		var X_bound = (( 0.5 + .08 * Math.cos( rad ) ) * Math.sin( rad ) * 10) ;
		var Y_bound = 6;

		//console.log(Y_bound)
		if (particle.x > X_bound) {
			particle.velocity.x = -1 * particle.velocity.x;
		}
		if (particle.z < -1*X_bound) {
			particle.velocity.z = -1 * particle.velocity.z;
		}
		if (particle.z > X_bound) {
			particle.velocity.z = -1 * particle.velocity.z;
		}
		if (particle.y < -1*Y_bound) {
			particle.velocity.y = -1 * particle.velocity.y;
		}
		if (particle.y > Y_bound) {
			particle.velocity.y = -1 * particle.velocity.y;
		}
		if (particle.x < -1*X_bound) {
			particle.velocity.x = -1 * particle.velocity.x;
		}
		

		// and the position
		particle.x = particle.x + particle.velocity.x * dt
		particle.y = particle.y + particle.velocity.y * dt
		particle.z = particle.z + particle.velocity.z * dt
	}

	// flag to the particle system
	// that we've changed its vertices.
	particles.verticesNeedUpdate = true

}
function render() 
{
	renderer.clear();
	// composer.render( 0.01 );
	renderer.render( scene, camera );
	// composer.render()
}