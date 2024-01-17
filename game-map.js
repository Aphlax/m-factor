import {MapGenerator} from './map-generator.js';
import {Chunk, SIZE} from './chunk.js';
import {GameMapInput} from './game-map-input.js';
import {GameUi} from './game-ui.js';
import {TYPE, MAX_SIZE, rectOverlap} from './entity-properties.js';
import {Entity} from './entity.js';
import {TransportNetwork} from './transport-network.js';

function GameMap(canvas) {
  this.mapGenerator = new MapGenerator();
  this.view = {
    x: Math.floor(-canvas.width / 2),
    y: Math.floor(-canvas.height / 2),
    width: canvas.width,
    height: canvas.height,
    scale: 24,
  };
  this.input = new GameMapInput(this, this.view);
  this.ui = new GameUi(this);
  this.chunks = new Map();
  this.transportNetwork = new TransportNetwork(this);
  this.selectedEntity = undefined;
}

GameMap.prototype.initialize = function(seed) {
  this.chunks = new Map(); // Reset.
  this.mapGenerator.initialize(seed);
  this.transportNetwork.reset();
};

GameMap.prototype.update = function(time) {
  for (let chunks of this.chunks.values()) {
    for (let chunk of chunks.values()) {
      for (let entity of chunk.entities) {
        entity.update(this, time);
      }
    }
  }
  this.ui.update(time);
  this.transportNetwork.update(time);
  
  // Generate missing chunks.
  const size = SIZE * this.view.scale;
  const viewX = Math.floor(this.view.x / size),
      viewY = Math.floor(this.view.y / size);
  for (let x = 0; x <= Math.ceil(this.view.width / size); x++) {
	for (let y = 0; y <= Math.ceil(this.view.height / size); y++) {
      const cx = viewX + x;
      const cy = viewY + y;
      if (!this.chunks.has(cx)) {
        this.chunks.set(cx, new Map());
      }
      if (!this.chunks.get(cx).has(cy)) {
        this.chunks.get(cx).set(cy,
            new Chunk(cx, cy)
                .generate(this.mapGenerator));
      }
    }
  }
  this.input.update(time);
};

GameMap.prototype.draw = function(ctx, time) {
  const size = SIZE * this.view.scale;
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x) continue;
    if (x * size > this.view.width + this.view.x) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y) continue;
      if (y * size > this.view.height + this.view.y) continue;
      chunk.drawTerrain(ctx, this.view);
    }
  }
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - 0.5 * this.view.scale) continue;
    if (x * size > this.view.width + this.view.x + 0.5 * this.view.scale) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - 0.5 * this.view.scale) continue;
      if (y * size > this.view.height + this.view.y + 0.5 * this.view.scale) continue;
      chunk.drawResources(ctx, this.view);
    }
  }
  ctx.globalAlpha = 0.7;
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - this.view.scale * (MAX_SIZE + 2)) continue;
    if (x * size > this.view.width + this.view.x) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - this.view.scale * MAX_SIZE) continue;
      if (y * size > this.view.height + this.view.y) continue;
      for (let entity of chunk.entities) {
        if (!entity.spriteShadow) continue;
        entity.drawShadow(ctx, this.view, time);
      }
    }
  }
  ctx.globalAlpha = 1;
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - this.view.scale * MAX_SIZE) continue;
    if (x * size > this.view.width + this.view.x) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - this.view.scale * MAX_SIZE) continue;
      if (y * size > this.view.height + this.view.y) continue;
      for (let entity of chunk.entities) {
        entity.draw(ctx, this.view, time);
      }
    }
  }
  if (this.selectedEntity) {
    this.ui.drawSelection(ctx, this.view, this.selectedEntity);
  }
  this.ui.draw(ctx, time);
  this.transportNetwork.draw(ctx, this.view);
};

GameMap.prototype.createEntity = function(name, x, y, direction, time) {
  // Create should not do any checks if there is enough space etc.
  const entity = new Entity().setup(name, x, y, direction, time);
  
  const cx = Math.floor(x / SIZE);
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.has(cx) || !this.chunks.get(cx).has(cy))
    return;
  
  this.connectEntity(entity, time);
  
  const entities = this.chunks.get(cx).get(cy).entities;
  const i = entities.findIndex(e => e.y >= y && (e.y > y || e.x > x));
  entities.splice(i, 0, entity);
  
  // TODO: check if connected machines were blocked & unblock them, use time
  return entity;
}

GameMap.prototype.deleteEntity = function(entity) {
  if (!entity) return;
  const cx = Math.floor(entity.x / SIZE);
  const cy = Math.floor(entity.y / SIZE);
  const entities = this.chunks.get(cx).get(cy).entities;
  entities.splice(entities.indexOf(entity), 1);
  
  this.disconnectEntity(entity);
};

GameMap.prototype.canPlace = function(x, y, width, height, ignoredEntity) {
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (this.getTerrainAt(x + i, y + j) >= S.water)
        return [false, x + i, y + j];
    }
  }
  const cx1 = Math.floor((x - MAX_SIZE) / SIZE);
  const cx2 = Math.floor((x + width - 1) / SIZE);
  const cy1 = Math.floor((y - MAX_SIZE) / SIZE);
  const cy2 = Math.floor((y + height - 1) / SIZE);
  for (let i = cx1; i <= cx2; i++) {
    if (!this.chunks.has(i)) {
      if (i == cx1 && cx1 != Math.floor(x / SIZE))
        continue;
      return [false, i * SIZE, y];
    }
    for (let j = cy1; j <= cy2; j++) {
      if (!this.chunks.get(i).has(j)) {
        if (j == cy1 && cy1 != Math.floor(y / SIZE))
          continue;
        return [false, x, j * SIZE];
      }
      for (let entity of this.chunks.get(i).get(j).entities) {
        if (entity == ignoredEntity) continue;
        if (x + width > entity.x && x < entity.x + entity.width &&
            y + height > entity.y && y < entity.y + entity.height)
          return [false, entity.x, entity.y];
      }
    }
  }
  return [true];
}

GameMap.prototype.getEntityAt = function(x, y) {
  const cx1 = Math.floor(x / SIZE);
  const cx2 = Math.floor((x + MAX_SIZE) / SIZE);
  const cy1 = Math.floor(y / SIZE);
  const cy2 = Math.floor((y + MAX_SIZE) / SIZE);
  for (let i = cx1; i <= cx2; i++) {
    if (!this.chunks.has(i)) continue;
    for (let j = cy1; j <= cy2; j++) {
      if (!this.chunks.get(i).has(j)) continue;
      for (let entity of this.chunks.get(i).get(j).entities) {
        if (x >= entity.x && x < entity.x + entity.width &&
            y >= entity.y && y < entity.y + entity.height)
          return entity;
      }
    }
  }
  return undefined;
}

GameMap.prototype.connectEntity = function(entity, time) {
  const x = entity.x - 2, y = entity.y - 2,
        width = entity.width + 4, height = entity.height + 4;
  const cx1 = Math.floor((x - MAX_SIZE) / SIZE);
  const cx2 = Math.floor((x + width - 1) / SIZE);
  const cy1 = Math.floor((y - MAX_SIZE) / SIZE);
  const cy2 = Math.floor((y + height - 1) / SIZE);
  for (let i = cx1; i <= cx2; i++) {
    if (!this.chunks.has(i)) continue;
    for (let j = cy1; j <= cy2; j++) {
      if (!this.chunks.get(i).has(j)) continue;
      for (let other of this.chunks.get(i).get(j).entities) {
        if (rectOverlap(entity.x, y, entity.width, 2, other) ||
            rectOverlap(entity.x + entity.width, entity.y, 2, entity.height, other) ||
            rectOverlap(entity.x, entity.y + entity.height, entity.width, 2, other) ||
            rectOverlap(x, entity.y, 2, entity.height, other)) {
          if (entity.type == TYPE.mine) {
            entity.connectMine(other, time);
          }
          if (other.type == TYPE.mine) {
            other.connectMine(entity, time);
          }
          if (entity.type == TYPE.belt && other.type == TYPE.belt) {
            if (Math.abs(entity.x - other.x) + Math.abs(entity.y - other.y) == 1) {
              if (entity.connectBelt(other, time, this.transportNetwork)) {
                entity.updateBeltSprites();
                other.updateBeltSprites();
              }
            }
          }
        }
      }
    }
  }
  if (entity.type == TYPE.belt) {
    this.transportNetwork.addBelt(entity);
  }
}

GameMap.prototype.disconnectEntity = function(entity) {
  entity.inputEntities.forEach(other =>
      other.outputEntities.splice(other.outputEntities.indexOf(entity), 1));
  entity.outputEntities.forEach(other =>
      other.inputEntities.splice(other.inputEntities.indexOf(entity), 1));
  
  if (entity.type == TYPE.belt) {
    this.transportNetwork.removeBelt(entity);
    for (let other of entity.inputEntities) {
      if (other.type == TYPE.belt) {
        if (other.data.beltOutput == entity) {
          other.data.beltOutput = undefined;
        }
        other.updateBeltSprites();
      }
    }
    for (let other of entity.outputEntities) {
      if (other.type == TYPE.belt &&
          other.beltInputOutput()) {
        other.updateBeltSprites();
        this.transportNetwork.beltInputChanged(other);
      }
    }
  }
}

GameMap.prototype.getTerrainAt = function(x, y) {
  const cx = Math.floor(x / SIZE);
  if (!this.chunks.has(cx)) return;
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.get(cx).has(cy)) return;
  const chunk = this.chunks.get(cx).get(cy);
  return chunk.tiles[x - cx][y - cy];
}

GameMap.prototype.getResourceAt = function(x, y, remove) {
  const cx = Math.floor(x / SIZE);
  if (!this.chunks.has(cx)) return;
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.get(cx).has(cy)) return;
  const chunk = this.chunks.get(cx).get(cy);
  if (!chunk.resources || !chunk.resources[x - cx * SIZE]) return;
  if (remove) {
    const res = chunk.resources[x - cx * SIZE][y - cy * SIZE];
    delete chunk.resources[x - cx * SIZE][y - cy * SIZE];
    return res;
  }
  return chunk.resources[x - cx * SIZE][y - cy * SIZE];
}

GameMap.prototype.selectEntity = function(screenX, screenY) {
  const x = (this.view.x + screenX) / this.view.scale;
  const y = (this.view.y + screenY) / this.view.scale;
  this.selectedEntity = this.getEntityAt(x, y);
  if (this.selectedEntity) return;
  this.selectedEntity = this.getResourceAt(Math.floor(x), Math.floor(y));
}

export {GameMap};
