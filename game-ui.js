import {Entity} from './entity.js';
import {UiWindow} from './ui-window.js';
import {TYPE, RESOURCE_LABELS} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';
import {COLOR} from './ui-properties.js';

function GameUi(game, canvas) {
  this.game = game;
  this.window = new UiWindow(this, canvas);
  this.window.initialize();
}

GameUi.prototype.update = function(time) {
  this.window.update(time);
};

GameUi.prototype.draw = function(ctx, time, view) {
  if (this.window.selectedEntity) {
    Entity.prototype.drawSelection.call(this.window.selectedEntity, ctx, view);
    if (this.window.selectedEntity.type) {
      this.window.selectedEntity.drawIO(ctx, view);
    }
  }
  
  this.window.draw(ctx, time);
};

export {GameUi};
