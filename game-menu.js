import {COLOR} from './ui-properties.js';
import {STORAGE} from './storage.js';
const B = {
  save: 1,
  load: 2,
  settings: 4,
  back: 3,
};

const BUTTONS = [
  {id: B.save, label: "Save"},
  {id: B.load, label: "Load"},
  {id: B.settings, label: "Settings"},
  {id: B.back, label: "Continue"},
];

function UiPauseMenu(game, canvas) {
  this.game = game;
  this.canvas = canvas;
  
  this.pressedIndex = -1;
}

UiPauseMenu.prototype.draw = function(ctx) {
  const height = BUTTONS.length * 100 + 20;
  const x = this.canvas.width / 2 - 120;
  const y = this.canvas.height / 2 - height / 2 + 20;
  
  ctx.fillStyle = COLOR.scrim;
  ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(x - 20, y - 20, 280, height);
  ctx.strokeStyle = COLOR.border1;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 20, y - 20, 280, height);
  
  ctx.font = "32px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let i = 0; i < BUTTONS.length; i++) {
    ctx.fillStyle = this.pressedIndex == i ?
        COLOR.buttonBackgroundPressed : COLOR.buttonBackground;
    ctx.fillRect(x, y + i * 100, 240, 80);
    ctx.strokeStyle = COLOR.buttonBorder;
    ctx.strokeRect(x, y + i * 100, 240, 80);
    ctx.fillStyle = COLOR.primary;
    ctx.fillText(BUTTONS[i].label, x + 120, y + 45 + i * 100);
  }
  ctx.textAlign = "start";
};

UiPauseMenu.prototype.touchStart = function(e) {
  const height = BUTTONS.length * 100 + 20;
  const x = this.canvas.width / 2 - 120;
  const y = this.canvas.height / 2 - height / 2 + 20;
  const {clientX: px, clientY: py} = e.touches[0];
  
  if (e.touches.length > 1) return;
  if (px < x || px > x + 240 ||
      py < y || py >= y + 100 * BUTTONS.length ||
      (py - y) % 100 > 80) {
    return;
  }
  this.pressedIndex = Math.floor((py - y) / 100);
};

UiPauseMenu.prototype.touchMove = function(e, longTouch) {
  this.pressedIndex = -1;
};

UiPauseMenu.prototype.touchEnd = function(e, shortTouch) {
  if (this.pressedIndex == -1) return;
  const id = BUTTONS[this.pressedIndex].id;
  if (id == B.back) {
    this.game.continuePlay();
  } else if (id == B.save) {
    this.game.saveGame();
  } else if (id == B.load) {
    this.game.loadGame();
  } else if (id == B.settings) {
    this.game.openSettings();
  }
  this.pressedIndex = -1;
};

function UiSettingsMenu(game, canvas) {
  this.game = game;
  this.canvas = canvas;
}

UiSettingsMenu.prototype.initialize = function() {
  const s = this.game.settings;
  this.settings = [s.altMode,
      s.debugInfo, s.debugBelts, s.debugPipes, s.debugPoles,
      s.godMode];
  
  this.pressedIndex = -1;
};

const SETTINGS = [
  {x: -60, y: 35, width: 40, height: 40, label: "‹"},
  {x: 20, y: -80, width: -40, height: 60, label: "Back"},
  {x: -140, y: 118, width: 120, height: 40, onOff: 1},
  {x: -140, y: 198, width: 120, height: 40, onOff: 1},
  {x: -140, y: 278, width: 120, height: 40, onOff: 1},
  {x: -140, y: 358, width: 120, height: 40, onOff: 1},
  {x: -140, y: 438, width: 120, height: 40, onOff: 1},
  {x: -140, y: 518, width: 120, height: 40},
];

UiSettingsMenu.prototype.draw = function(ctx) {
  const {width, height} = this.canvas;
  
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(0, 0, width, height);
  
  ctx.font = "32px monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText("Settings", 20, 60);
  
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.strokeStyle = COLOR.buttonBorder;
  ctx.lineWidth = 1;
  for (let i = 0; i < SETTINGS.length; i++) {
    ctx.fillStyle = this.pressedIndex == i ?
        COLOR.buttonBackgroundPressed : COLOR.buttonBackground;
    let {x, y, width: w, height: h, label, onOff} = SETTINGS[i];
    if (x < 0) x = width + x;
    if (w < 0) w = width + w;
    if (y < 0) y = height + y;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    if (label) {
      ctx.fillStyle = COLOR.primary;
      ctx.fillText(label, x + w / 2, y + h / 2 + 2);
    }
    if (onOff) {
      onOff = this.settings[i - 2];
      ctx.strokeRect(x + 3 + (onOff ? 0 : 55), y + 3, onOff ? 52 : 59, h - 6);
      ctx.fillStyle = onOff ? COLOR.primary : COLOR.secondary;
      ctx.fillText("On", x + 28, y + h / 2 + 2);
      ctx.fillStyle = onOff ? COLOR.secondary : COLOR.primary;
      ctx.fillText("Off", x + 88, y + h / 2 + 2);
    }
  }
  
  ctx.textAlign = "start";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText("Alt mode", 20, 140);
  ctx.fillText("Debug info", 20, 220);
  ctx.fillText("Debug belts", 20, 300);
  ctx.fillText("Debug pipes", 20, 380);
  ctx.fillText("Debug electric poles", 20, 460);
  
  ctx.fillText("[cheat] God mode", 20, 540);
  let {x, y, width: w, height: h} = SETTINGS[7];
  ctx.textAlign = "center";
  ctx.fillText(this.settings[5] ? "enabled" : "turn On", width + x + w / 2, y + h / 2 + 2);
  ctx.textAlign = "start";
  if (this.settings[5]) {
    ctx.strokeRect(width + x + 3, y + 3, w - 6, h - 6);
  }
};

UiSettingsMenu.prototype.touchStart = function(e) {
  if (e.touches.length > 1) {
    this.pressedIndex = -1;
    return;
  }
  const {width, height} = this.canvas;
  const {clientX: px, clientY: py} = e.touches[0];
  
  for (let i = 0; i < SETTINGS.length; i++) {
    let {x, y, width: w, height: h} = SETTINGS[i];
    if (x < 0) x = width + x;
    if (w < 0) w = width + w;
    if (y < 0) y = height + y;
    if (px > x && px <= x + w &&
        py > y && py <= y + h) {
      this.pressedIndex = i;
      return;
    }
  }
};

UiSettingsMenu.prototype.touchMove = function(e) {
  this.pressedIndex = -1;
};

UiSettingsMenu.prototype.touchEnd = function(e) {
  if (this.pressedIndex == -1) return;
  if (this.pressedIndex <= 1) {
    this.game.openMenu();
  } else if (this.pressedIndex == 7) {
    this.settings[5] = true;
    this.game.storage.save(STORAGE.settings, {name: "godMode", value: true});
    this.game.settings.godMode = true;
  } else {
    const value = this.settings[this.pressedIndex - 2] = !this.settings[this.pressedIndex - 2];
    if (this.pressedIndex == 2) {
      this.game.storage.save(STORAGE.settings, {name: "altMode", value});
      this.game.settings.altMode = value;
    } else if (this.pressedIndex == 3) {
      this.game.storage.save(STORAGE.settings, {name: "debugInfo", value});
      this.game.settings.debugInfo = value;
    } else if (this.pressedIndex == 4) {
      this.game.storage.save(STORAGE.settings, {name: "debugBelts", value});
      this.game.settings.debugBelts = value;
    } else if (this.pressedIndex == 5) {
      this.game.storage.save(STORAGE.settings, {name: "debugPipes", value});
      this.game.settings.debugPipes = value;
    } else if (this.pressedIndex == 6) {
      this.game.storage.save(STORAGE.settings, {name: "debugPoles", value});
      this.game.settings.debugPoles = value;
    }
  }
  this.pressedIndex = -1;
};


export {UiPauseMenu, UiSettingsMenu};
