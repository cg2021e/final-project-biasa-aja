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
