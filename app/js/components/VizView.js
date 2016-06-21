define(['tween','three','dat', 'orbitControls'], function(TWEEN,THREE, dat, OrbitControls){

/////// Create a function we can use to publically access later
	var VizView = function (){
		return VizView;
	}

/////// Define Variables
	var container, camera, scene, renderer, uniforms, controls, light, plane;
	var s;
	var origin = { x : 0, y: 300 };
	var apex = { x : 400, y: 600 };
	var current = { x: 0, y: 300 };

	//////Specific vars for GUI rendering
		// maybe replace that by window... or something
	var userOpts    = {
	    range       : 800,
	    duration    : 2500,
	    delay       : 200,
	    easing      : 'Elastic.EaseInOut',
	    
	    changeColor : function() { 
	        light = new THREE.PointLight(0x00ff00);
	        scene.add(light);

	        s.material.color.setHex( '0x'+Math.floor(Math.random()*16777215).toString(16) );
	        console.log('Changed the fucking color.');
	    }
	};

/////// Tweening
	//TO DO ****** Create SetupTween() for GUI controls ************
	//Ensure there's nothing left over from previous loops
	TWEEN.removeAll();

	var easing = TWEEN.Easing.Sinusoidal.InOut;
	var tween = new TWEEN.Tween(current).to(apex, 2000).easing(easing);
	var tweenBack = new TWEEN.Tween(current).to(origin, 2000).easing(easing);
	
	tween.chain(tweenBack);
	tweenBack.chain(tween);

	tween.onUpdate(function() {
	    s.position.x = current.x;
	    s.position.y = current.y;
	});

	tweenBack.onUpdate(function() {
	    s.position.x = current.x;
	    s.position.y = current.y;
	});

	tween.start();

	// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	init();
	buildGround();
	animate();

/////// Start the show!
	
	function init() {

	/////////// create the scene and add the camera
	    
	    container = document.getElementById( 'container' );
	    scene = new THREE.Scene();
	    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	    camera.position.x = -900;
	    camera.position.z = 1000;
	    // camera.position.set(0,6,0);
	    scene.add( camera );

	/////////// build the GUI 
	   
	    buildGui(userOpts, function(){
	        console.log("userOpts", userOpts)
	        setupTween();
	    });

	/////////// Create Sphere
	    
	    s = new THREE.Mesh( new THREE.SphereGeometry( 200, 48, 32 ), new THREE.MeshLambertMaterial( { color: 0x0000ff, overdraw: 0.5 }) );
	    s.position.x = 200;
	    scene.add( s );

	//////////// Set up 3 point lighting 

	    // seafoam: 0x4DCCBD
	    var ambientLight = new THREE.AmbientLight( 0x020202 );
	    scene.add(ambientLight);

	    var frontLight = new THREE.DirectionalLight('white', 1);
	    frontLight.position.set(0.5, 0.5, 2);
	    scene.add(frontLight);
	    
	    var backLight = new THREE.DirectionalLight('white', 0.5);
	    backLight.position.set(-0.5, -0.5, -2);
	    scene.add(backLight);

	    renderer = new THREE.WebGLRenderer( { antialias: true } );
	    renderer.setClearColor(0x3066BE);
	    renderer.setPixelRatio( window.devicePixelRatio );

	    container.appendChild( renderer.domElement );

	    controls = new THREE.OrbitControls(camera, renderer.domElement);

	    onWindowResize();

	}

///////// Create the grid-like plane for grounding
	
	function buildGround() {

	    // Build Grid
	    var size = 500, step = 50;
	    var geometry = new THREE.Geometry();
	    for ( var i = - size; i <= size; i += step ) {
	        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
	        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
	        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
	        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
	    }
	    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );
	    var line = new THREE.Line( geometry, material );
	    line.position.y = -500;
	    scene.add( line );

	    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
	    geometry.rotateX = -Math.PI / 2;
	    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({visible: false}));
	    plane.position.y = -500;
	    scene.add(plane);
	    
	}

/////////// # Build gui with dat.gui
	
	function buildGui(options, callback) {

	    // collect all available easing in TWEEN library
	    var easings = {};
	    Object.keys(TWEEN.Easing).forEach(function(family){
	        Object.keys(TWEEN.Easing[family]).forEach(function(direction){
	            var name    = family+'.'+direction;
	            easings[name]   = name;
	        });
	    });
	    // the callback notified on UI change
	    var change  = function(){
	        callback(options)
	    }
	    // create and initialize the UI
	    var gui = new dat.GUI({ height  : 4 * 32 - 1 });
	    gui.add(options, 'range').name('Range coordinate').min(64).max(1280)    .onChange(change);
	    gui.add(options, 'duration').name('Duration (ms)').min(100).max(4000)   .onChange(change);
	    gui.add(options, 'delay').name('Delay (ms)').min(0).max(1000)       .onChange(change);
	    gui.add(options, 'easing').name('Easing Curve').options(easings)    .onChange(change);

	    gui.add(options, 'changeColor').name('Change Color To Green');
	}

/////////// Handle some housekeeping - resizing window events, animate, and render loops

	function onWindowResize( event ) {
	    renderer.setSize( window.innerWidth * .9, window.innerHeight * .9 );
	    camera.aspect = window.innerWidth * .9 / window.innerHeight * .9;
	    camera.updateProjectionMatrix();
	}

	function animate() {
	    requestAnimationFrame( animate );
	    render();
	}

	function render() {
	    TWEEN.update();
	    renderer.render( scene, camera );
	    camera.lookAt(new THREE.Vector3(0,0,0));
	}
})