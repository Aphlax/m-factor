import {COLOR} from './ui-properties.js';

const B = {
  save: 1,
  load: 2,
  back: 3,
};

const BUTTONS = [
  {
    id: B.save,
    label: "Save",
    fillColor: COLOR.buttonBackground,
    pressedColor: COLOR.buttonBackgroundPressed,
    strokeColor: COLOR.buttonBorder,
  }, {
    id: B.load,
    label: "Load",
    fillColor: COLOR.buttonBackground,
    pressedColor: COLOR.buttonBackgroundPressed,
    strokeColor: COLOR.buttonBorder,
  }, {
    id: B.back,
    label: "Continue",
    fillColor: COLOR.buttonBackground,
    pressedColor: COLOR.buttonBackgroundPressed,
    strokeColor: COLOR.buttonBorder,
  }
];

function GameMenu(game, canvas) {
  this.game = game;
  this.canvas = canvas;
  
  this.pressedIndex = -1;
}

GameMenu.prototype.draw = function(ctx) {
  const x = this.canvas.width / 2 - 120;
  const y = this.canvas.height / 2 - 140;
  
  ctx.fillStyle = "#00000060";
  ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(x - 20, y - 20, 280, 320);
  ctx.strokeStyle = COLOR.border1;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 20, y - 20, 280, 320);
  
  ctx.font = "32px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let i = 0; i < BUTTONS.length; i++) {
    ctx.fillStyle = this.pressedIndex == i ?
        BUTTONS[i].pressedColor : BUTTONS[i].fillColor;
    ctx.fillRect(x, y + i * 100, 240, 80);
    ctx.strokeStyle = BUTTONS[i].strokeColor;
    ctx.strokeRect(x, y + i * 100, 240, 80);
    ctx.fillStyle = COLOR.primary;
    ctx.fillText(BUTTONS[i].label, x + 120, y + 45 + i * 100);
  }
  ctx.textAlign = "start";
};

GameMenu.prototype.touchStart = function(e) {
  const x = this.canvas.width / 2 - 120;
  const y = this.canvas.height / 2 - 140;
  
  if (e.touches.length > 1) return;
  const t = e.touches[0];
  if (t.clientX < x || t.clientX > x + 240 ||
      t.clientY < y || t.clientY > y + 280 ||
      (t.clientY - y) % 100 > 80) {
    return;
  }
  this.pressedIndex = Math.floor((t.clientY - y) / 100);
};

GameMenu.prototype.touchMove = function(e, longTouch) {
  this.pressedIndex = -1;
};

GameMenu.prototype.touchEnd = function(e, shortTouch) {
  if (this.pressedIndex == -1) return;
  const id = BUTTONS[this.pressedIndex].id;
  if (id == B.back) {
    this.game.continuePlay();
  } else if (id == B.save) {
    this.game.saveGame();
  } else if (id == B.load) {
    this.game.loadGame();
  }
  this.pressedIndex = -1;
};

export {GameMenu};
