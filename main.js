/**
 * Main startup file for mFactor.
 */
import {Game} from "./game.js";

var STOP = false;

(function() {
  "use strict";
  let canvas, ctx, game;
  let lastFrame, nextFps, frameCount, frameRate;
  window.onload = onload;

  function onload() {
    canvas = document.getElementById('canvas');
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
    game.draw(ctx, time, dt);
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(frameRate + "", canvas.width - 32, 24);
    ctx.fillText(game.seed, canvas.width - 50, canvas.height - 5);
    ctx.fillText(game.gameMap.view.scale, canvas.width - 100, 50);
    
    if (!window.STOP)
      window.requestAnimationFrame(loop);
  }
})();
