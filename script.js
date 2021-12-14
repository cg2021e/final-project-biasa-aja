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
