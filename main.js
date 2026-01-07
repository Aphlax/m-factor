/**
 * Main startup file for mFactor.
 */
import {Game} from "./game.js";

(function() {
  "use strict";
  let canvas, ctx, game;
  let lastFrame, nextFps, frameCount, frameRate;
  let updateTime, totalUpdateTime, avgUpdateTime, maxUpdateTime,
      drawTime, totalDrawTime, avgDrawTime, maxDrawTime;
  window.onload = onload;

  function onload() {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d', {alpha: false});
    
    game = new Game(canvas);
    canvas.addEventListener("touchstart", game.touchStart.bind(game), false);
    canvas.addEventListener("touchend", game.touchEnd.bind(game), false);
    canvas.addEventListener("touchmove", game.touchMove.bind(game), false);
    canvas.addEventListener("wheel", game.mouseWheel.bind(game), false);

    nextFps = lastFrame = performance.now();
    frameCount = frameRate = 0;
    updateTime = totalUpdateTime = avgUpdateTime = maxUpdateTime = 0;
    drawTime = totalDrawTime = avgDrawTime = maxDrawTime = 0;
    window.requestAnimationFrame(loop);
  }

  function loop(time) {
    lastFrame = time;
    frameCount++;
    if (time >= nextFps) {
  	frameRate = Math.round(frameCount / (time - nextFps + 500) * 1000);
      avgUpdateTime = Math.round(totalUpdateTime / frameCount);
      avgDrawTime = Math.round(totalDrawTime / frameCount);
      maxUpdateTime = updateTime;
      maxDrawTime = drawTime;
      frameCount = 0;
      updateTime = totalUpdateTime = 0;
      drawTime = totalDrawTime = 0;
  	nextFps = time + 500;
    }
    
    const timestampStart = performance.now();
    game.update(time);
    const timestampUpdate = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.numberImageDraws = 0;
    window.numberOtherDraws = 0;
    game.draw(ctx, time);
    const timestampDraw = performance.now();
    const update = timestampUpdate - timestampStart;
    totalUpdateTime += update;
    if (update > updateTime) updateTime = update;
    const draw = timestampDraw - timestampUpdate;
    totalDrawTime += draw;
    if (draw > drawTime) drawTime = draw;
    
    if (game.settings?.debugInfo) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "black";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "end";
      ctx.fillText(frameRate + "", canvas.width - 60, 24);
      ctx.fillText((game.playTime / 1000).toFixed(1), canvas.width - 60, 48);
      ctx.fillText(window.numberImageDraws + " dI", canvas.width - 60, 72);
      ctx.fillText(window.numberOtherDraws + " dO", canvas.width - 60, 96);
      ctx.textAlign = "start";
      ctx.fillText((Math.round(maxUpdateTime * 10) / 10) + "/" +
          (Math.round(maxDrawTime * 10) / 10), 40, 55);
      if (game.debug !== undefined) {
        ctx.fillText(game.debug, 4, 28);
      }
      
      ctx.beginPath();
      ctx.arc(20, 50, 15, 0, 2 * Math.PI, false);
      ctx.fillStyle = "lightgray";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.arc(20, 50, 15, 0, 2 * Math.PI * avgUpdateTime / 11.1, false);
      ctx.lineTo(20, 50);
      ctx.fillStyle = "green";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.arc(20, 50, 15, 2 * Math.PI * avgUpdateTime / 11.1, 2 * Math.PI * (avgDrawTime + avgUpdateTime) / 11.1, false);
      ctx.lineTo(20, 50);
      ctx.fillStyle = "orange";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
      ctx.stroke();
    }
    
    window.requestAnimationFrame(loop);
  }
})();
