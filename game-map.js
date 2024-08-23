import {MapGenerator} from './map-generator.js';
import {Chunk, SIZE} from './chunk.js';
import {S} from './sprite-definitions.js';
import {TYPE, STATE, MAX_SIZE, ENERGY, rectOverlap, ADJACENT} from './entity-properties.js';
import {Entity} from './entity.js';
import {TransportNetwork} from './transport-network.js';
import {FluidNetwork} from './fluid-network.js';

function GameMap(seed) {
  this.mapGenerator = new MapGenerator(seed);
  this.view = {
    x: -50,
    y: -50,
    width: 100,
    height: 100,
    scale: 24,
  };
  this.chunks = new Map(); // 2-D map of coordinate -> chunk
  this.transportNetwork = new TransportNetwork();
  this.fluidNetwork = new FluidNetwork(this);
  this.particles = []; // Expired particles.
}

GameMap.prototype.initialize = function() {
  this.mapGenerator.initialize();
};

GameMap.prototype.centerView = function(canvas) {
  this.view.x = Math.floor(-canvas.width / 2);
  this.view.y = Math.floor(-canvas.height / 2);
  this.view.width = canvas.width;
  this.view.height = canvas.height;
  this.view.scale = 24;
  return this;
};

GameMap.prototype.update = function(time, dt) {
  this.transportNetwork.update(time, dt);
  this.fluidNetwork.update(time, dt);
  for (let chunks of this.chunks.values()) {
    for (let chunk of chunks.values()) {
      for (let entity of chunk.entities) {
        if (entity.type == TYPE.belt ||
            entity.type == TYPE.chest) continue;
        if (time < entity.nextUpdate) continue;
        entity.update(this, time);
      }
      let expired = 0;
      for (let i = 0; i < chunk.particles.length; i++) {
        const p = chunk.particles[i];
        if (p.startTime + p.duration < time) {
          this.particles.push(p);
          expired++;
        } else if (expired) {
          chunk.particles[i - expired] = p;
        }
      }
      if (expired) {
        chunk.particles.length -= expired;
      }
    }
  }
  
  // Generate missing chunks.
  const size = SIZE * this.view.scale;
  const viewX = Math.floor(this.view.x / size),
      viewY = Math.floor(this.view.y / size);
  for (let x = 0; x <= Math.ceil(this.view.width / size); x++) {
	for (let y = 0; y <= Math.ceil(this.view.height / size); y++) {
      this.generateChunk(viewX + x, viewY + y);
    }
  }
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
  ctx.globalAlpha = 0.5;
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - this.view.scale * (MAX_SIZE + 2)) continue;
    if (x * size > this.view.width + this.view.x) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - this.view.scale * MAX_SIZE) continue;
      if (y * size > this.view.height + this.view.y + 1 * this.view.scale) continue;
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
        if (entity.type == TYPE.belt) {
          entity.drawBelt(ctx, this.view, time);
        }
      }
    }
  }
  this.transportNetwork.draw(ctx, this.view);
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - this.view.scale * MAX_SIZE) continue;
    if (x * size > this.view.width + this.view.x) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - this.view.scale * MAX_SIZE) continue;
      if (y * size > this.view.height + this.view.y + 1 * this.view.scale) continue;
      for (let entity of chunk.entities) {
        if (entity.type != TYPE.belt) {
          entity.draw(ctx, this.view, time);
          if ((entity.type == TYPE.furnace ||
              entity.type == TYPE.assembler) &&
              entity.data.recipe) {
            entity.drawRecipe(ctx, this.view, entity.data.recipe);
          }
        }
      }
    }
  }
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - 1 * this.view.scale) continue;
    if (x * size > this.view.width + this.view.x + 1 * this.view.scale) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - 1 * this.view.scale) continue;
      if (y * size > this.view.height + this.view.y + 1 * this.view.scale) continue;
      for (let entity of chunk.entities) {
        if (entity.type == TYPE.inserter) {
          entity.drawInserterHand(ctx, this.view, time);
        }
      }
    }
  }
  this.fluidNetwork.draw(ctx, this.view);
  for (let [x, chunks] of this.chunks.entries()) {
    if ((x + 1) * size <= this.view.x - this.view.scale * 7) continue;
    if (x * size > this.view.width + this.view.x) continue;
    for (let [y, chunk] of chunks.entries()) {
  	if ((y + 1) * size <= this.view.y - this.view.scale * 7) continue;
      if (y * size > this.view.height + this.view.y + this.view.scale * 7) continue;
      chunk.drawParticles(ctx, this.view, time);
    }
  }
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
  
  return entity;
};

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
      if (this.getTerrainAt(x + i, y + j) >= S.water) {
        return false;
      }
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
      return false;
    }
    for (let j = cy1; j <= cy2; j++) {
      if (!this.chunks.get(i).has(j)) {
        if (j == cy1 && cy1 != Math.floor(y / SIZE))
          continue;
        return false;
      }
      for (let entity of this.chunks.get(i).get(j).entities) {
        if (entity == ignoredEntity) continue;
        if (x + width > entity.x && x < entity.x + entity.width &&
            y + height > entity.y && y < entity.y + entity.height)
          return false;
      }
    }
  }
  return true;
};

GameMap.prototype.getEntityAt = function(x, y) {
  const cx1 = Math.floor((x - MAX_SIZE) / SIZE);
  const cx2 = Math.floor(x / SIZE);
  const cy1 = Math.floor((y - MAX_SIZE) / SIZE);
  const cy2 = Math.floor(y / SIZE);
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
};

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
          if (entity.type == TYPE.belt && other.type == TYPE.belt) {
            if (Math.abs(entity.x - other.x) + Math.abs(entity.y - other.y) == 1) {
              if (entity.connectBelt(other, time, this.transportNetwork)) {
                entity.updateBeltSprites();
                other.updateBeltSprites();
              }
            }
          }
          if (entity.type == TYPE.pipe && other.type == TYPE.pipe) {
            if (Math.abs(entity.x - other.x) + Math.abs(entity.y - other.y) == 1) {
              entity.connectPipe(other, time);
              entity.updatePipeSprites();
              other.updatePipeSprites();
            }
          }
          if (entity.type == TYPE.inserter) {
            entity.connectInserter(other, time);
          }
          if (other.type == TYPE.inserter) {
            other.connectInserter(entity, time);
          }
          if (entity.type == TYPE.mine) {
            entity.connectMine(other, time);
          }
          if (other.type == TYPE.mine) {
            other.connectMine(entity, time);
          }
          
          if (entity.type == TYPE.pipe && other.outputFluidTank) {
            other.connectFluidOutput(entity);
          }
          if (other.type == TYPE.pipe && entity.outputFluidTank) {
            entity.connectFluidOutput(other);
          }
        }
      }
    }
  }
  if (entity.type == TYPE.belt) {
    this.transportNetwork.addBelt(entity);
  } else if (entity.type == TYPE.pipe) {
    this.fluidNetwork.addPipe(entity);
  }
};

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
      if (other.type == TYPE.belt) {
        if (other.beltInputOutput()) {
          this.transportNetwork.beltInputChanged(other);
          for (let other2 of other.inputEntities) {
            if (other2.type == TYPE.belt) {
              other2.updateBeltSprites();
            }
          }
        }
        other.updateBeltSprites();
      }
    }
  }
  if (entity.type == TYPE.pipe) {
    this.fluidNetwork.removePipe(entity);
    entity.disconnectPipe();
  }
  if (entity.outputFluidTank) {
    for (let other of entity.outputEntities) {
      if (other.type == TYPE.pipe) {
        for (let i = 0; i < 4; i++) {
          if (other.data.pipes[i] == entity) {
            other.data.pipes[i] = undefined;
            other.updatePipeSprites();
            break;
          }
        }
      }
    }
  }
};

GameMap.prototype.generateChunk = function(cx, cy) {
  if (!this.chunks.has(cx)) {
    this.chunks.set(cx, new Map());
  }
  if (!this.chunks.get(cx).has(cy)) {
    this.chunks.get(cx).set(cy,
        new Chunk(cx, cy)
            .generate(this.mapGenerator));
  }
};

GameMap.prototype.getTerrainAt = function(x, y) {
  const cx = Math.floor(x / SIZE);
  if (!this.chunks.has(cx)) return;
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.get(cx).has(cy)) return;
  const chunk = this.chunks.get(cx).get(cy);
  return chunk.tiles[x - cx * SIZE][y - cy * SIZE];
};

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
};

GameMap.prototype.getSelectedEntity = function(screenX, screenY) {
  const x = (this.view.x + screenX) / this.view.scale;
  const y = (this.view.y + screenY) / this.view.scale;
  return this.getEntityAt(x, y) ||
      this.getResourceAt(Math.floor(x), Math.floor(y));
};

GameMap.prototype.tryCreateEntity = function(screenX, screenY, direction, entityDef, time) {
  direction = entityDef.rotatable ? direction : 0;
  const {width, height} = !entityDef.size ? entityDef :
      entityDef.size[direction];
  const x = Math.round((this.view.x + screenX) /
      this.view.scale - width / 2);
  const y = Math.round((this.view.y + screenY) /
      this.view.scale - height / 2);
  if (this.canPlace(x, y, width, height)) {
    this.createEntity(entityDef.name, x, y, direction, time);
    return true;
  }
  return false;
};

/** Returns the direction it is possible to place, otherwise -1. */
GameMap.prototype.canPlaceOffshorePump = function(x, y) {
  if (this.getTerrainAt(x, y) < S.water) return -1;
  let adjacent = 0, direction;
  for (let i = 0; i < ADJACENT.length; i++) {
    const {dx, dy} = ADJACENT[i];
    if (this.getTerrainAt(x + dx, y + dy) >= S.water) continue;
    direction = i;
    adjacent++;
  }
  if (adjacent != 1) return -1;
  const {dx, dy} = ADJACENT[direction];
  const px = -dy, py = dx;
  if (this.getTerrainAt(x - dx + px, y - dy + py) < S.water) return -1;
  if (this.getTerrainAt(x - dx - px, y - dy - py) < S.water) return -1;
  if (this.getTerrainAt(x + dx + px, y + dy + py) >= S.water) return -1;
  if (this.getTerrainAt(x + dx - px, y + dy - py) >= S.water) return -1;
  
  if (!this.canPlace(
      x + dx - Math.abs(px),
      y + dy - Math.abs(py),
      direction % 2 ? 1 : 3,
      direction % 2 ? 3 : 1)) return -1;
  
  return direction;
};

GameMap.prototype.createSmoke = function(x, y, time, duration) {
  const cx = Math.floor(x / SIZE);
  if (!this.chunks.has(cx)) return;
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.get(cx).has(cy)) return;
  const count = Math.floor(duration * 0.005);
  for (let i = 0; i < count; i++) {
    let p;
    if (this.particles.length) {
      p = this.particles[this.particles.length - 1];
      this.particles.length--;
    } else {
      p = {};
    }
    p.sprite = S.smoke;
    p.xStart = x - 0.59;
    p.yStart = y - 0.2;
    p.xEnd = x + 1.5 + Math.random();
    p.yEnd = y - 4 - 1.5 * Math.random();
    p.sizeStart = 0.4 + 0.15 * Math.random();
    p.sizeEnd = 2 + Math.random();
    p.startTime = time + i * duration / count;
    const d = (p.xEnd - p.xStart) ** 2 + (p.yEnd - p.yStart) ** 2;
    p.duration = (d + 25) / 55 * 4000;
    p.alphaStart = 0.8;
    p.alphaEnd = 0.05;
    p.animationLength = 60;
    p.animation = Math.floor(60 * Math.random());
    p.animationSpeed = 0.6;
    
    this.chunks.get(cx).get(cy).particles.push(p);
  }
};

export {GameMap};
