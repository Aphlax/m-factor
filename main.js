/**
 * Main startup file for mFactor.
 */
import {Game} from "./game.js";

(function() {
  "use strict";
  let canvas, ctx, game;
  let lastFrame, nextFps, frameCount, frameRate;
  window.onload = onload;

  function onload() {
    canvas = document.getElementById('canvas');
    // canvas.requestFullscreen();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    
    game = new Game(canvas);
    canvas.addEventListener("touchstart", e => game.touchStart(e), false);
    canvas.addEventListener("touchend", e => game.touchEnd(e), false);
    canvas.addEventListener("touchmove", e => game.touchMove(e), false);

    nextFps = lastFrame = performance.now();
    frameCount = frameRate = 0;
    window.requestAnimationFrame(loop);
  }

  function loop(time) {
	let dt = time - lastFrame;
    lastFrame = time;
    frameCount++;
    if (time >= nextFps) {
  	frameRate = Math.round(frameCount / (time - nextFps + 500) * 1000);
      frameCount = 0;
  	nextFps = time + 500;
    }
    
    game.update(time, dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(time, dt, ctx);
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(frameRate + "", canvas.width - 32, 24);
    ctx.fillText(game.gameMap.view.scale, canvas.width - 100, 50);
    
    window.requestAnimationFrame(loop);
  }
  /*
  // Input handling.
  const preventCanvasMove = function(e) {
	if (e.target == canvas) {
	  e.preventDefault();
    }
  };
  document.body.addEventListener("touchstart", preventCanvasMove, {passive: false});
  document.body.addEventListener("touchend", preventCanvasMove, {passive: false});
  document.body.addEventListener("touchmove", preventCanvasMove, {passive: false});
  */
})();
