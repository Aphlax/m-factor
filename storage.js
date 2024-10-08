import {GameMap} from './game-map.js';
import {Chunk} from './chunk.js';
import {ENTITIES, PROTO_TO_NAME} from './entity-definitions.js';
import {TYPE, ENERGY} from './entity-properties.js';
import {PROTO_TO_RECIPE} from './recipe-definitions.js';
import {COLOR} from './ui-properties.js';

const DB = "m-factor",
    VERSION = 1;
const SAVES = "saves";

const MODE = {
  initial: 0,
  ready: 1,
  saving: 2,
  loading: 3,
  error: 4,
};

function Storage(game) {
  this.game = game;
  this.db = undefined;
  
  this.mode = MODE.initial;
  this.lastError = undefined;
}

Storage.prototype.initialize = function() {
  const request = indexedDB.open(DB, VERSION);
  
  request.onerror = e => {
    console.log(this.lastError = e.target);
    this.mode = MODE.error;
  };
  
  request.onupgradeneeded = e => {
    const db = e.target.result;

    const {transaction} = db.createObjectStore(
        SAVES, {keyPath: "name"});
        
    transaction.onerror = e => {
      console.log(this.lastError = e.target);
      this.mode = MODE.error;
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
  
  const save = {
    name,
    map: this.serializeMap(gameMap),
    time,
  };
  transaction.objectStore(SAVES).put(save);
  
  transaction.onerror = e => {
    console.log(this.lastError = e.target);
    this.mode = MODE.error;
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
    if (!request.result) {
      console.log(this.lastError =
          "Error: Key (" + name + ") does not exist.");
      this.mode = MODE.error;
      return;
    }
    const {map, time} = request.result;
    this.game.playTime = time;
    const gameMap = this.deserializeMap(map);
    this.game.loadMap(time, gameMap);
    this.mode = MODE.ready;
  };
  
  transaction.onerror = e => {
    console.log(this.lastError = e.target);
    this.mode = MODE.error;
  };
};

Storage.prototype.draw = function(ctx, time) {
  if (this.mode == MODE.ready) return;
  
  const x = ctx.canvas.width / 2;
  const y = ctx.canvas.height - 110;
  
  ctx.beginPath();
  ctx.arc(x + 50, y, 22, 3 / 2 * Math.PI, Math.PI / 2);
  ctx.arc(x - 50, y, 22, Math.PI / 2, 3 / 2 * Math.PI);
  ctx.fillStyle = COLOR.background2;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border1;
  ctx.stroke();
  
  let textCenter = 0;
  if (this.mode == MODE.initial ||
      this.mode == MODE.saving ||
      this.mode == MODE.loading) {
    const a = time / 300,
        l = 0.5 * Math.sin(time / 250) + 1.5;
    ctx.beginPath();
    ctx.arc(x - 50, y, 13, a - l, a + l);
    ctx.strokeStyle = COLOR.progressBar;
    ctx.lineWidth = 5;
    ctx.stroke();
    textCenter = 16;
  }
  
  let text = "";
  if (this.mode == MODE.initial) {
    text = "Setup";
  } else if (this.mode == MODE.saving) {
    text = "Saving";
  } else if (this.mode == MODE.loading) {
    text = "Loading";
  } else if (this.mode == MODE.error) {
    text = "Error";
  }
  ctx.font = "18px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(text, x + textCenter, y);
  ctx.textAlign = "start";
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
  const fluidNetworkChannels =
      gameMap.fluidNetwork.channels
      .filter(channel => channel.pipes.size)
      .map(channel => {
        const [pipe] = channel.pipes;
        return {
          x: pipe.x,
          y: pipe.y,
          fluid: channel.fluid,
          amount: channel.amount,
        };
      });
  return {
    seed: gameMap.mapGenerator.seed,
    entities,
    chunks,
    transportNetworkLanes,
    fluidNetworkChannels,
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
    ...(def.rotatable || entity.type == TYPE.offshorePump ?
        {direction: entity.direction * 2} : {}),
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
          taskEnd: entity.taskEnd,
        } : {}),
    ...(entity.energySource == ENERGY.burner ? {
          energyStored: entity.energyStored,
        } : {}),
    ...(entity.inputInventory ? {inputInventory:
        this.serializeInventory(entity.inputInventory)} : {}),
    ...(entity.outputInventory && (entity.inputInventory !=
        entity.outputInventory) ? {outputInventory:
        this.serializeInventory(entity.outputInventory)} : {}),
    ...(entity.fuelInventory ? {fuelInventory:
        this.serializeInventory(entity.fuelInventory)} : {}),
    ...(entity.outputFluidTank ? {outputFluidTank:
        this.serializeFluidTank(entity.outputFluidTank)} : {}),
    
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

Storage.prototype.serializeFluidTank = function(fluidTank) {
  return fluidTank.tanklets.map(tanklet => ({
    fluid: tanklet.fluid,
    amount: tanklet.amount,
    constantProduction: tanklet.constantProduction,
  }));
};

Storage.prototype.deserializeMap = function(map) {
  const gameMap = new GameMap(map.seed);
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
    const direction = (e.direction ?? 0) / 2;
    const {width, height} = def.size ? def.size[direction] : def;
    const x = e.position.x - Math.floor(width / 2),
        y = e.position.y - Math.floor(height / 2);
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
  for (let channel of map.fluidNetworkChannels) {
    const pipe = gameMap.getEntityAt(channel.x, channel.y);
    pipe.data.channel.fluid = channel.fluid;
    pipe.data.channel.amount = channel.amount;
  }
  return gameMap;
};

Storage.prototype.deserializeEntity = function(e, entity) {
  if (entity.type == TYPE.inserter ||
      entity.type == TYPE.mine ||
      entity.type == TYPE.furnace ||
      entity.type == TYPE.assembler ||
      entity.type == TYPE.lab) {
    entity.animation = e.animation;
    entity.state = e.state;
    entity.nextUpdate = e.nextUpdate;
    entity.taskStart = e.taskStart;
    entity.taskEnd = e.taskEnd;
  }
  if (entity.energySource == ENERGY.burner) {
    entity.energyStored = e.energyStored;
  }
  if (e.inputInventory) {
    entity.inputInventory.items.push(...e.inputInventory.items);
    entity.inputInventory.amounts.push(...e.inputInventory.amounts);
  }
  if (e.outputInventory) {
    entity.outputInventory.items.push(...e.outputInventory.items);
    entity.outputInventory.amounts.push(...e.outputInventory.amounts);
  }
  if (e.fuelInventory) {
    entity.fuelInventory.items.push(...e.fuelInventory.items);
    entity.fuelInventory.amounts.push(...e.fuelInventory.amounts);
  }
  if (e.outputFluidTank) {
    for (let i = 0; i < e.outputFluidTank.length; i++) {
      entity.outputFluidTank.tanklets[i].fluid =
          e.outputFluidTank[i].fluid;
      entity.outputFluidTank.tanklets[i].amount =
          e.outputFluidTank[i].amount;
      entity.outputFluidTank.tanklets[i].constantProduction =
          e.outputFluidTank[i].constantProduction;
    }
  }
  if (entity.type == TYPE.furnace && e.recipe) {
    entity.data.recipe = PROTO_TO_RECIPE.get(e.recipe);
    entity.sprite = entity.data.workingAnimation;
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
