requirejs.config({
    "baseUrl": "js/components",
    "paths": {
        "three" : "../vendor/three.min",
        "dat" : "../vendor/dat.gui.min",
        "orbitControls" : "../vendor/OrbitControls",
        "tween" : "../vendor/Tween"
    },
    "shim": {
        "three": {exports: "THREE"},
        "orbitControls":{
        	deps: ["three"], 
        	exports: "THREE"
        },
        "dat": {exports: "dat"}
    }
});

require(['main']);