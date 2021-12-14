/**
 * Common options
 */
let startMusic  = true;   // auto start music (firefox only)
let cycleColor  = false;  // cycle colors 
let commonHue   = 0.038;  // initial color 
let commonColor = new THREE.Color();
commonColor.setHSL( commonHue, .8, .5 );

/**
 * Device screen info helper 
 */
const deviceInfo = (function(){
 const _w = window;
 const _s = window.screen;
 const _b = document.body;
 const _d = document.documentElement;
 
 return {
  screenWidth() {
   return Math.max( 0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0 );
  },
  screenHeight() {
   return Math.max( 0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0 );
  },
  screenRatio() {
   return this.screenWidth() / this.screenHeight();
  },
  screenCenterX() {
   return this.screenWidth() / 2;
  },
  screenCenterY() {
   return this.screenHeight() / 2;
  },
  mouseX( e ) {
   return Math.max( 0, e.pageX || e.clientX || 0 );
  },
  mouseY( e ) {
   return Math.max( 0, e.pageY || e.clientY || 0 );
  },
  mouseCenterX( e ) {
   return this.mouseX( e ) - this.screenCenterX();
  },
  mouseCenterY( e ) {
   return this.mouseY( e ) - this.screenCenterY();
  },
 }; 
})();

/**
 * Music player helper 
 */
const musicHelper = (function(){
 let wrap   = document.querySelector( '#player' ); 
 let button = wrap ? wrap.querySelector( 'button' ) : null; 
 let audio  = new Audio( 'http://ice1.somafm.com/u80s-256-mp3' ); 
 let step   = 0.01;
 let active = false; 
 let sto    = null; 
 
 let fadeIn = () => {
  audio.volume += 0.01; 
  if ( audio.volume >= 0.2 ) { audio.volume = 0.2; return; }
  sto = setTimeout( fadeIn, 100 ); 
 };
 
 let fadeOut = () => {
  audio.volume -= 0.02; 
  if ( audio.volume <= 0.01 ) { audio.volume = 0; audio.pause(); return; }
  sto = setTimeout( fadeOut, 100 ); 
 };
 
 let play = () => {
  if ( sto ) clearTimeout( sto ); 
  active = true;
  button.textContent = 'Stop music'; 
  audio.play(); 
  fadeIn();
 };
 
 let stop = () => {
  if ( sto ) clearTimeout( sto ); 
  active = false;
  button.textContent = 'Play music'; 
  fadeOut();
 };
 
 button.addEventListener( 'click', e => {
  e.stopPropagation(); 
  e.preventDefault(); 
  if ( active ) { stop(); } 
  else { play(); }
 });
 
 audio.preload = 'auto'; 
 audio.muted   = false; 
 audio.volume  = 0;
 return { play, stop };
})();


/**
 * Objek Bintang
 */
const starField = {
 group: null, 
 total: 400, 
 spread: 8000, 
 zoom: 1000, 
 ease: 12, 
 move: { x: 0, y: 1200, z: -1000 },  
 look: { x: 0, y:0, z: 0 }, 
 
 // create 
 create( scene ) {
  this.group = new THREE.Object3D();
  this.group.position.set( this.move.x, this.move.y, this.move.z );
  this.group.rotation.set( this.look.x, this.look.y, this.look.z );
 
  let geometry = new THREE.Geometry();
  let material = new THREE.PointsMaterial({
   size: 64,
   color: 0xffffff,
   opacity: 1,
   map: LoaderHelper.get( 'starTexture' ), 
   blending: THREE.AdditiveBlending,
   vertexColors: false,
   transparent: false,
   depthTest: false,
  });
  
  for ( let i = 0; i < this.total; i++ ) {
   let angle = ( Math.random() * Math.PI * 2 );
   let radius = THREE.Math.randInt( 0, this.spread );
  
   geometry.vertices.push( new THREE.Vector3(
    Math.cos( angle ) * radius,
    Math.sin( angle ) * radius / 10,
    THREE.Math.randInt( -this.spread, 0 )
   ));
  }
  this.group.add( new THREE.Points( geometry, material ) );
  scene.add( this.group );
 }, 
 
 // update 
 update( mouse ) {
  this.move.x = -( mouse.x * 0.005 );
  addEase( this.group.position, this.move, this.ease );
  addEase( this.group.rotation, this.look, this.ease );
 }, 
}; 


/**
 * Objek Gunung
 */
const mountains = {
 group: null, 
 simplex: null,
 geometry: null, 
 factor: 1000, // smoothness 
 scale: 1000, // terrain size
 speed: 0.0005, // move speed 
 cycle: 0, 
 ease: 18, 
 move: { x: 0, y: 0, z: -3500 },
 look: { x: 0, y: 0, z: 0 }, 
 
 create( scene ) {
  this.group = new THREE.Object3D();
  this.group.position.set( this.move.x, this.move.y, this.move.z );
  this.group.rotation.set( this.look.x, this.look.y, this.look.z );
  
  this.simplex  = new SimplexNoise(); 
  this.geometry = new THREE.PlaneGeometry( 10000, 1000, 128, 32 ); 
  
  let texture   = LoaderHelper.get( 'mountainTexture' );
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;
  
  let material  = new THREE.MeshPhongMaterial({
   color: 0xffffff,
   opacity: 1,
   map: texture, 
   blending: THREE.NoBlending,
   side: THREE.BackSide,
   transparent: false,
   depthTest: false,
  });
  
  let terrain = new THREE.Mesh( this.geometry, material );
  terrain.position.set( 0, -500, -3000 );
  terrain.rotation.x = ( Math.PI / 2 ) + 1.35;
  
  let light = new THREE.PointLight( 0xffffff, 8, 5500 );
  light.position.set( 0, 1200, -3500 );
  light.castShadow = false;
  light.color = commonColor;
  
  this.movePlain();
  this.group.add( terrain );
  this.group.add( light );
  scene.add( this.group );
 }, 
 
 // Membuat dataran gunung baru
 movePlain() {
  for ( let vertex of this.geometry.vertices ) {
   let xoff = ( vertex.x / this.factor ); 
   let yoff = ( vertex.y / this.factor ) + this.cycle; 
   let rand = this.simplex.noise2D( xoff, yoff ) * this.scale;
   vertex.z = rand;
  }
  this.geometry.verticesNeedUpdate = true;
  this.cycle -= this.speed;
 }, 
 
 // update 
 update( mouse ) {
  this.move.x = -( mouse.x * 0.02 );
  this.movePlain();
  addEase( this.group.position, this.move, this.ease );
  addEase( this.group.rotation, this.look, this.ease );
 }, 
};


/**
 * Objek dataran / alas
 */
const groundPlain = {
 group: null, 
 geometry: null, 
 material: null, 
 plane: null,
 simplex: null,
 factor: 300, // smoothness 
 scale: 30, // terrain size
 speed: 0.015, // move speed 
 cycle: 0, 
 ease: 12, 
 move: { x: 0, y: -300, z: -1000 },
 look: { x: 29.8, y: 0, z: 0 }, 
 
 // create
 create( scene ) {
  this.group = new THREE.Object3D();
  this.group.position.set( this.move.x, this.move.y, this.move.z );
  this.group.rotation.set( this.look.x, this.look.y, this.look.z );
  
  this.geometry = new THREE.PlaneGeometry( 4000, 2000, 128, 64 ); 
  this.material = new THREE.MeshLambertMaterial({
   color: 0xffffff,
   opacity: 1,
   blending: THREE.NoBlending,
   side: THREE.FrontSide,
   transparent: false,
   depthTest: false,
   wireframe: true, 
  });
 
  this.plane = new THREE.Mesh( this.geometry, this.material );
  this.plane.position.set( 0, 0, 0 );

  this.simplex = new SimplexNoise(); 
  this.moveNoise();
  
  this.group.add( this.plane );
  scene.add( this.group );
 }, 
 
 // Mengubah nilai kebisingan suara (noise) 
 moveNoise() {
  for ( let vertex of this.geometry.vertices ) {
   let xoff = ( vertex.x / this.factor ); 
   let yoff = ( vertex.y / this.factor ) + this.cycle; 
   let rand = this.simplex.noise2D( xoff, yoff ) * this.scale;
   vertex.z = rand;
  }
  this.geometry.verticesNeedUpdate = true;
  this.cycle += this.speed;
 }, 
 
 // update
 update( mouse ) {
  this.moveNoise();
  this.move.x = -( mouse.x * 0.04 );
  addEase( this.group.position, this.move, this.ease );
  addEase( this.group.rotation, this.look, this.ease );
 },
};