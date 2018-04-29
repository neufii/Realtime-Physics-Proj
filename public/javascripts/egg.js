var container, scene, camera, renderer, controls, stats, composer;
var clock = new THREE.Clock();

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


	var points = [];
	for ( var deg = 0; deg <= 180; deg += 6 ) {

    	var rad = Math.PI * deg / 180;
    	var point = new THREE.Vector2( ( 0.76 + .08 * Math.cos( rad ) ) * Math.sin( rad ) * 10, - Math.cos( rad ) *10 ); // the "egg equation"
    	//console.log( point ); // x-coord should be greater than zero to avoid degenerate triangles; it is not in this formula.
    	points.push( point );
	}

	var eggGeometry = new THREE.LatheBufferGeometry(points,32);
	var eggMaterial = new THREE.MeshPhongMaterial( { color: 0xffc560, transparent:true, opacity:0.6, refractionRatio: 0.95,envMap: scene.background, shininess: 10 } );
	eggMaterial.envMap.mapping = THREE.CubeRefractionMapping;
	egg = new THREE.Mesh( eggGeometry, eggMaterial );
	egg.position.set(0,0,0);
	egg.castShadow = true; 
	camera.lookAt(egg.position);
	scene.add(egg);

	//FLOOR
	// var floorMaterial = new THREE.MeshLambertMaterial( { color: 0x111111, side: THREE.DoubleSide } );
	// var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
	// var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	// floor.position.y = -10;
	// floor.rotation.x = Math.PI / 2;
	// floor.receiveShadow = true;
	//scene.add(floor);


	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 0.0 },
			"p":   { type: "f", value: 10 },
			glowColor: { type: "c", value: new THREE.Color(0xffffff) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );

	this.eggGlow = new THREE.Mesh( eggGeometry.clone(), customMaterial.clone() );
    eggGlow.position = egg.position;
	eggGlow.scale.multiplyScalar(1.2);
	scene.add( eggGlow);

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


}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

	// Composer
	// composer.setSize( window.innerWidth, window.innerHeight );
	effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight );
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
	eggGlow.material.uniforms.viewVector.value = 
		new THREE.Vector3().subVectors( camera.position, eggGlow.position );

}
function render() 
{
	renderer.render( scene, camera );
	// composer.render()
}