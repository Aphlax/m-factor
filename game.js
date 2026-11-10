"use strict";

import {World} from './world.js';
import {GameUi} from './game-ui.js';
import {UiPauseMenu, UiSettingsMenu, UiVictoryScreen} from './game-menu.js';
import {Storage, STORAGE} from './storage.js';
import {SPRITES} from './sprite-pool.js';
import {GMC} from './game-map-converter.js';
import {STATE} from './entity-properties.js';
import {MAP_SCALE_BOUNDRY} from './game-map-input.js';


const MODE = {
  loading: 0,
  playing: 2,
  pauseMenu: 3,
  settingsMenu: 4,
  victoryScreen: 5,
};

function Game(canvas) {
  this.canvas = canvas;
  this.mode = MODE.loading;
  this.spritePool = SPRITES;
  this.spritePool.load();
  this.storage = new Storage(this);
  this.storage.initialize();
  this.settings = this.storage.loadSettings();
  
  this.ui = new GameUi(this, canvas);
  this.pauseMenu = new UiPauseMenu(this, canvas);
  this.settingsMenu = new UiSettingsMenu(this, canvas);
  this.victoryScreen = new UiVictoryScreen(this, canvas);
  this.lastUpdate = 0;
  
  this.world = undefined;
  this.mode = MODE.loading;
}

Game.prototype.update = function(time) {
  if (this.ui.window.selectedEntity?.type) {
    const entity = this.ui.window.selectedEntity;
    this.debug = Object.keys(STATE)
        .filter(s => STATE[s] == entity.state)[0] +
        ", " + (entity.nextUpdate < 1000000 ?
        (entity.nextUpdate / 1000).toFixed(1) : "XXX") +
        ", " + (entity.taskStart < 1000000 ?
        (entity.taskStart / 1000).toFixed(1) : "XXX") +
        ", " + (entity.taskEnd < 1000000 ?
        (entity.taskEnd / 1000).toFixed(1) : "XXX");
  } else {
    this.debug = "";
  }
  if (this.mode == MODE.playing) {
    const dt = time - this.lastUpdate;
    if (dt < 100) {
      this.world.update(dt);
    }
    this.ui.update(time);
  } else if (this.mode == MODE.loading) {
    if (this.spritePool.isLoaded()) {
      this.world = World.create(114, this.canvas)
          .initialize(this);
      this.ui.setWorld(this.world);
      this.mode = MODE.playing;
    }
  }
  this.lastUpdate = time;
};

Game.prototype.draw = function(ctx, time) {
  if (this.mode == MODE.playing) {
    if (this.world.gameMap.view.scale >= MAP_SCALE_BOUNDRY) {
      this.world.drawGround(ctx);
      this.ui.drawGroundIndicators(ctx);
      this.world.draw(ctx);
    } else {
      this.world.drawMap(ctx);
    }
    this.ui.draw(ctx, time);
  } else if (this.mode == MODE.loading) {
    this.spritePool.draw(ctx, time);
    this.storage.draw(ctx, time);
  } else if (this.mode == MODE.pauseMenu) {
    if (this.world.gameMap.view.scale >= MAP_SCALE_BOUNDRY) {
      this.world.drawGround(ctx);
      this.world.draw(ctx);
    } else {
      this.world.drawMap(ctx);
    }
    this.ui.window.draw(ctx, this.world.playTime);
    this.pauseMenu.draw(ctx);
    this.storage.draw(ctx, time);
  } else if (this.mode == MODE.settingsMenu) {
    this.settingsMenu.draw(ctx);
    this.storage.draw(ctx, time);
  } else if (this.mode == MODE.victoryScreen) {
    if (this.world.gameMap.view.scale >= MAP_SCALE_BOUNDRY) {
      this.world.drawGround(ctx);
      this.world.draw(ctx);
    } else {
      this.world.drawMap(ctx);
    }
    this.ui.window.draw(ctx, this.world.playTime);
    this.victoryScreen.draw(ctx);
  }
};

Game.prototype.openMenu = function() {
  this.mode = MODE.pauseMenu;
};

Game.prototype.continuePlay = function() {
  this.mode = MODE.playing;
};

Game.prototype.openSettings = function() {
  this.mode = MODE.settingsMenu;
  this.settingsMenu.initialize();
};

Game.prototype.openVicoryScreen = function() {
  if (this.world.achievedVictory) return;
  this.world.achievedVictory = true;
  this.mode = MODE.victoryScreen;
};

Game.prototype.saveGame = function() {
  const save = {
    name: "",
    world: GMC.serializeWorld(this.world),
  };
  this.storage.save(STORAGE.saves, save);
};

Game.prototype.loadGame = function() {
  this.storage.load(STORAGE.saves, "").then(save => {
    const world = GMC.deserializeWorld(save.world);
    this.world = world.initialize(this);
    this.ui.setWorld(world);
  });
};

Game.prototype.touchStart = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchStart(e);
  } else if (this.mode == MODE.pauseMenu) {
    this.pauseMenu.touchStart(e);
  } else if (this.mode == MODE.settingsMenu) {
    this.settingsMenu.touchStart(e);
  } else if (this.mode == MODE.victoryScreen) {
    this.victoryScreen.touchStart(e);
  }
};

Game.prototype.touchMove = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchMove(e);
  } else if (this.mode == MODE.pauseMenu) {
    this.pauseMenu.touchMove(e);
  } else if (this.mode == MODE.settingsMenu) {
    this.settingsMenu.touchMove(e);
  } else if (this.mode == MODE.victoryScreen) {
    this.victoryScreen.touchMove(e);
  }
};

Game.prototype.touchEnd = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchEnd(e);
  } else if (this.mode == MODE.pauseMenu) {
    this.pauseMenu.touchEnd(e);
  } else if (this.mode == MODE.settingsMenu) {
    this.settingsMenu.touchEnd(e);
  } else if (this.mode == MODE.victoryScreen) {
    this.victoryScreen.touchEnd(e);
  }
};

Game.prototype.mouseWheel = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.mouseWheel(e);
  }
};

export {Game};
