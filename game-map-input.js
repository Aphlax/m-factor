const LONG_TOUCH_DURATION = 500;
const MIN_SCALE = 5;
const MAX_SCALE = 32;

function GameMapInput(gameMap, view) {
  this.gameMap = gameMap;
  this.view = view;
  this.touches = new Array(3).fill(0).map(() => ({x: 0, y: 0}));
  this.longTouchStarted = false;
  this.longTouchEnd = 0;
  this.longTouch = false;
}

GameMapInput.prototype.update = function(time) {
  // Long tap detection.
  if (this.longTouchStarted) {
    this.longTouchStarted = false;
    this.longTouchEnd = time + LONG_TOUCH_DURATION;
  } else if (this.longTouchEnd && time >= this.longTouchEnd) {
    this.longTouchEnd = 0;
    this.longTouch = true;
    navigator.vibrate(200);
  }
};

GameMapInput.prototype.touchStart = function(e) {
  if (e.touches.length == 1) {
    this.longTouchStarted = true;
  } else if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  this.setTouches(e);
};

/**
  exactly 1 move update per update
  move happens only after significant move.
*/
GameMapInput.prototype.touchMove = function(e) {
  if (!this.longTouch) {
    let dx, dy;
    if (e.touches.length > 1) {
      const emx = (e.touches[0].clientX + e.touches[1].clientX);
      const emy = (e.touches[0].clientY + e.touches[1].clientY);
      const omx = (this.touches[0].x + this.touches[1].x) / 2;
      const omy = (this.touches[0].y + this.touches[1].y) / 2;
      const oldDist = Math.sqrt((this.touches[0].x - this.touches[1].x)**2 + (this.touches[0].y - this.touches[1].y)**2);
      const newDist = Math.sqrt((e.touches[0].clientX - e.touches[1].clientX)**2 + (e.touches[0].clientY - e.touches[1].clientY)**2);
      let scale = this.view.scale * newDist / oldDist;
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) / this.view.scale;
      this.view.scale *= scale;
      this.view.x = Math.round((this.view.x + emx / 2) * scale - emx + omx);
      this.view.y = Math.round((this.view.y + emy / 2) * scale - emy + omy);
    } else {
      const dx = e.touches[0].clientX - this.touches[0].x;
      this.view.x = Math.round(this.view.x - dx);
      const dy = e.touches[0].clientY - this.touches[0].y;
      this.view.y = Math.round(this.view.y - dy);
    }
    
    
  }
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  this.setTouches(e);
};

GameMapInput.prototype.touchEnd = function(e) {
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  if (this.longTouch) {
    this.longTouch = false;
  }
  this.setTouches(e);
};

GameMapInput.prototype.setTouches = function(e) {
  for (let i = 0; i < 3; i++) {
    if (e.touches[i]) {
      this.touches[i].x = e.touches[i].clientX;
      this.touches[i].y = e.touches[i].clientY;
    } else if (this.touches[i].x || this.touches[i].y) {
      this.touches[i].x = 0;
      this.touches[i].y = 0;
    }
  }
};

export {GameMapInput};
