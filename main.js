/**
 * Main startup file for mFactor.
 */
import {Game} from "./game.js";

(function() {
  "use strict";
  let canvas, ctx, game;
  let lastFrame, nextFps, frameCount, frameRate;
  let updateTime, drawTime;
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
    updateTime = drawTime = 0;
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
    
    const timestampStart = performance.now();
    game.update(time);
    const timestampUpdate = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx, time);
    const timestampDraw = performance.now();
    updateTime = (timestampUpdate - timestampStart) / 11.11 * 0.4 + updateTime * 0.6;
    drawTime = (timestampDraw - timestampUpdate) / 11.11 * 0.4 + drawTime * 0.6;
    
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(frameRate + "", canvas.width - 48, 24);
    ctx.fillText(Math.round(game.gameMap.view.scale * 10) / 10, canvas.width - 48, 48);
    ctx.fillText(game.seed, canvas.width - 48, 72);
    if (game.debug !== undefined) {
      ctx.fillText(game.debug, 4, 28);
    }
    
    ctx.beginPath();
    ctx.arc(20, 50, 15, 0, 2 * Math.PI, false);
    ctx.fillStyle = "lightgray";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.arc(20, 50, 15, 0, 2 * Math.PI * updateTime, false);
    ctx.lineTo(20, 50);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.arc(20, 50, 15, 2 * Math.PI * updateTime, 2 * Math.PI * (drawTime + updateTime), false);
    ctx.lineTo(20, 50);
    ctx.fillStyle = "orange";
    ctx.fill();
    
    window.requestAnimationFrame(loop);
  }
})();
