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
    lastFrame = time;
    frameCount++;
    if (time >= nextFps) {
  	frameRate = Math.round(frameCount / (time - nextFps + 500) * 1000);
      frameCount = 0;
  	nextFps = time + 500;
    }
    
    game.update(time);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx, time);
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(frameRate + "", canvas.width - 48, 24);
    ctx.fillText(Math.round(game.gameMap.view.scale * 10) / 10, canvas.width - 48, 48);
    ctx.fillText(game.seed, canvas.width - 48, 72);
    if (game.debug !== undefined) {
      ctx.fillText(game.debug, 4, 28);
    }
    
    if (!window.STOP)
      window.requestAnimationFrame(loop);
  }
})();
