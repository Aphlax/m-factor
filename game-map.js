import {MapGenerator} from './map-generator.js';
import {Chunk} from './chunk.js';

const LONG_TOUCH_DURATION = 500;

function GameMap(canvas) {
  this.mapGenerator = new MapGenerator();
  this.touches = new Array(3).fill(0).map(() => ({x: 0, y: 0}));
  this.longTouchStarted = false;
  this.longTouchEnd = 0;
  this.longTouch = false;
  this.view = {
    x: Math.floor(-canvas.width / 2),
    y: Math.floor(-canvas.height / 2),
    width: canvas.width,
    height: canvas.height,
    scale: 5,
  };
}

GameMap.prototype.initialize = function(seed) {
  this.mapGenerator.initialize(seed);
  this.chunks = new Map();
};

GameMap.prototype.update = function(time) {
  // Generate missing chunks.
  const SIZE = Chunk.SIZE * this.view.scale;
  const viewX = Math.floor(this.view.x / SIZE),
      viewY = Math.floor(this.view.y / SIZE);
  for (let x = 0; x <= Math.ceil(this.view.width / SIZE); x++) {
	for (let y = 0; y <= Math.ceil(this.view.height / SIZE); y++) {
      const cx = viewX + x;
      const cy = viewY + y;
      if (!this.chunks.has(cx)) {
        this.chunks.set(cx, new Map());
      }
      if (!this.chunks.get(cx).has(cy)) {
        this.chunks.get(cx).set(cy, new Chunk(cx, cy).generate(this.mapGenerator));
      }
    }
  }
  // Long tap detection.
  if (this.longTouchStarted) {
    this.longTouchStarted = false;
    this.longTouchEnd = time + LONG_TOUCH_DURATION;
  } else if (this.longTouchEnd && time >= this.longTouchEnd) {
    this.longTouchEnd = 0;
    this.longTouch = true;
    navigator.vibrate(400);
  }
};

GameMap.prototype.draw = function(ctx) {
  const SIZE = Chunk.SIZE * this.view.scale;
  for (let [x, col] of this.chunks.entries()) {
    if ((x + 1) * SIZE <= this.view.x) continue;
    if (x * SIZE > this.view.width + this.view.x) continue;
    for (let [y, chunk] of col.entries()) {
  	if ((y + 1) * SIZE <= this.view.y) continue;
      if (y * SIZE > this.view.height + this.view.y) continue;
      chunk.draw(ctx, this.view);
    }
  }
};

GameMap.prototype.touchStart = function(e) {
  for (let i = 0; i < 3; i++) {
    if (e.touches[i]) {
      this.touches[i].x = e.touches[i].clientX;
      this.touches[i].y = e.touches[i].clientY;
    } else {
      this.touches[i].x = 0;
      this.touches[i].y = 0;
    }
  }
  if (e.touches.length == 1) {
    this.longTouchStarted = true;
  } else if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
};

/**
  exactly 1 move update per update
  move happens only after significant move.
*/
GameMap.prototype.touchMove = function(e) {
  if (!this.longTouch) {
    this.view.x = Math.round(this.view.x - e.touches[0].clientX + this.touches[0].x);
    this.view.y = Math.round(this.view.y - e.touches[0].clientY + this.touches[0].y);
  }
  for (let i = 0; i < 3; i++) {
    if (e.touches[i]) {
      this.touches[i].x = e.touches[i].clientX;
      this.touches[i].y = e.touches[i].clientY;
    } else {
      this.touches[i].x = 0;
      this.touches[i].y = 0;
    }
  }
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
};

GameMap.prototype.touchEnd = function(e) {
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  if (this.longTouch) {
    this.longTouch = false;
  }
};


export {GameMap};
