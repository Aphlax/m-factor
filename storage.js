import {GameMap} from './game-map.js';
import {Chunk} from './chunk.js';
import {ENTITIES, PROTO_TO_NAME} from './entity-definitions.js';
import {TYPE} from './entity-properties.js';
import {PROTO_TO_RECIPE} from './recipe-definitions.js';

const DB = "m-factor",
    VERSION = 1;
const SAVES = "saves";

const MODE = {
  none: 0,
  ready: 1,
  saving: 2,
  loading: 3,
};

function Storage(game) {
  this.game = game;
  this.db = undefined;
  
  this.mode = MODE.none;
  this.lastError = undefined;
}

Storage.prototype.initialize = function() {
  const request = indexedDB.open(DB, VERSION);
  
  request.onerror = e => {
    console.log(this.lastError = e.target);
  };
  
  request.onupgradeneeded = e => {
    const db = e.target.result;

    const {transaction} = db.createObjectStore(
        SAVES, {keyPath: "name"});
        
    transaction.onerror = e => {
      console.log(this.lastError = e.target);
    };
    
    transaction.oncomplete = () => {
      this.db = db;
      this.mode = MODE.ready;
    };
  };
  
  request.onsuccess = e => {
    this.db = e.target.result;
    this.mode = MODE.ready;
  };
};

Storage.prototype.save = function(name, time, gameMap) {
  if (this.mode != MODE.ready) return;
  this.mode = MODE.saving;
  const transaction = this.db.transaction([SAVES], "readwrite");
  
  transaction.objectStore(SAVES).put({
    name,
    maps: [this.serializeMap(gameMap)],
    time,
  });
  
  transaction.onerror = e => {
    console.log(this.lastError = e.target);
  };
  
  transaction.oncomplete = e => {
    this.mode = MODE.ready;
  };
};

Storage.prototype.load = function(name) {
  if (this.mode != MODE.ready) return;
  this.mode = MODE.loading;
  const transaction = this.db.transaction([SAVES]);
  const request = transaction.objectStore(SAVES)
      .get(name);
      
  request.onsuccess = e => {
    const {maps, time} = request.result;
    console.log(maps[0]);
    this.game.playTime = time;
    const gameMap = this.deserializeMap(maps[0]);
    this.game.loadMap(gameMap);
    this.mode = MODE.ready;
  };
  
  transaction.onerror = e => {
    console.log(this.lastError = e.target);
  };
};

Storage.prototype.serializeMap = function(gameMap) {
  const entities = [], chunks = [];
  for (let [cx, gameChunks] of gameMap.chunks.entries()) {
    for (let [cy, chunk] of gameChunks.entries()) {
      for (let entity of chunk.entities) {
        entities.push(this.serializeEntity(
            entities.length, entity));
      }
      chunks.push({
        x: cx, y: cy,
        tiles: chunk.tiles,
        resources: chunk.resources,
      });
    }
  }
  const transportNetworkLanes =
      gameMap.transportNetwork.lanes
      .filter(lane => lane.belts.length)
      .map(lane => ({
        x: lane.belts[0].x,
        y: lane.belts[0].y,
        minusFlow: lane.minusFlow,
        minusItem: lane.minusItem,
        plusFlow: lane.plusFlow,
        plusItem: lane.plusItem,
      }));
  return {
    seed: gameMap.mapGenerator.seed,
    entities,
    chunks,
    transportNetworkLanes,
    view: gameMap.view,
  };
};

Storage.prototype.serializeEntity = function(index, entity) {
  const def = ENTITIES.get(entity.name);
  return {
    entity_number: index,
    name: def.prototypeName,
    position: {
      x: Math.floor(entity.x + entity.width / 2),
      y: Math.floor(entity.y + entity.height / 2),
    },
    ...(def.rotatable ? {direction: entity.direction * 2} : {}),
    ...(entity.data.recipe ?
        {recipe: entity.data.recipe.prototypeName} : {}),
    
    // Non-blueprintable.
    ...(entity.type == TYPE.inserter ||
        entity.type == TYPE.mine ||
        entity.type == TYPE.furnace ||
        entity.type == TYPE.assembler ||
        entity.type == TYPE.lab ? {
          animation: entity.animation,
          state: entity.state,
          nextUpdate: entity.nextUpdate,
          taskStart: entity.taskStart,
        } : {}),
    ...(entity.inputInventory ? {inputInventory:
        this.serializeInventory(entity.inputInventory)} : {}),
    ...(entity.outputInventory && (entity.inputInventory !=
        entity.outputInventory) ? {outputInventory:
        this.serializeInventory(entity.outputInventory)} : {}),
    
    ...(entity.type == TYPE.belt ? {
        beltSideLoadMinusWait: entity.data.beltSideLoadMinusWait,
        beltSideLoadPlusWait: entity.data.beltSideLoadPlusWait} : {}),
    ...(entity.type == TYPE.inserter ?
        {inserterItem: entity.data.inserterItem} : {}),
    ...(entity.type == TYPE.mine ? {
        minePattern: entity.data.minePattern,
        minedResource: entity.data.minedResource} : {}),
  };
};

Storage.prototype.serializeInventory = function(inventory) {
  return {
    items: inventory.items,
    amounts: inventory.amounts,
  };
};

Storage.prototype.deserializeMap = function(map) {
  const gameMap = new GameMap(this.game, map.seed);
  gameMap.initialize();
  Object.assign(gameMap.view, map.view);
  for (let c of map.chunks) {
    if (!gameMap.chunks.has(c.x)) {
      gameMap.chunks.set(c.x, new Map());
    }
    const chunk = new Chunk(c.x, c.y);
    Object.assign(chunk, c);
    gameMap.chunks.get(c.x).set(c.y, chunk);
  }
  for (let e of map.entities) {
    const name = PROTO_TO_NAME.get(e.name);
    const def = ENTITIES.get(name);
    const x = e.position.x - Math.floor(def.width / 2),
        y = e.position.y - Math.floor(def.height / 2),
        direction = (e.direction ?? 0) / 2;
    const entity = gameMap.createEntity(name, x, y, direction, 0);
    if (entity.type == TYPE.assembler && e.recipe) {
      entity.setRecipe(PROTO_TO_RECIPE.get(e.recipe));
    }
    e.entity = entity;
  }
  for (let e of map.entities) {
    // Separate loop to prevent connecting from changing timings.
    this.deserializeEntity(e, e.entity);
  }
  for (let lane of map.transportNetworkLanes) {
    const belt = gameMap.getEntityAt(lane.x, lane.y);
    if (belt != belt.data.lane.belts[0]) {
      // Circular lane, make it start at correct belt.
      belt.data.lane.split(belt);
    }
    belt.data.lane.minusFlow.push(...lane.minusFlow);
    belt.data.lane.minusItem = lane.minusItem;
    belt.data.lane.plusFlow.push(...lane.plusFlow);
    belt.data.lane.plusItem = lane.plusItem;
  }
  return gameMap;
};

Storage.prototype.deserializeEntity = function(e, entity) {
  if (entity.type == TYPE.furnace && e.recipe) {
    entity.data.recipe = PROTO_TO_RECIPE.get(e.recipe);
  }
  if (entity.type == TYPE.inserter ||
      entity.type == TYPE.mine ||
      entity.type == TYPE.furnace ||
      entity.type == TYPE.assembler ||
      entity.type == TYPE.lab) {
    entity.animation = e.animation;
    entity.state = e.state;
    entity.nextUpdate = e.nextUpdate;
    entity.taskStart = e.taskStart;
  }
  if (e.inputInventory) {
    entity.inputInventory.items.push(...e.inputInventory.items);
    entity.inputInventory.amounts.push(...e.inputInventory.amounts);
  }
  if (e.outputInventory) {
    entity.outputInventory.items.push(...e.outputInventory.items);
    entity.outputInventory.amounts.push(...e.outputInventory.amounts);
  }
  if (entity.type == TYPE.belt) {
    entity.data.beltSideLoadMinusWait = e.beltSideLoadMinusWait;
    entity.data.beltSideLoadPlusWait = e.beltSideLoadPlusWait;
  }
  if (entity.type == TYPE.inserter) {
    entity.data.inserterItem = e.inserterItem;
  }
  if (entity.type == TYPE.mine) {
    entity.data.minePattern = e.minePattern;
    entity.data.minedResource = e.minedResource;
  }
};

export {Storage};
