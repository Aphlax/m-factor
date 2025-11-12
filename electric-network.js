import {Grid} from './electric-network-grid.js';
import {TYPE, STATE, NEVER, MIN_SATISFACTION} from './entity-properties.js';

function ElectricNetwork(gameMap) {
  this.gameMap = gameMap;
  this.grids = [];
}

ElectricNetwork.prototype.addPole = function(entity, time) {
  const reach = entity.data.wireReach;
  const area = [entity.x - reach, entity.y - reach, reach * 2, reach * 2];
  const poles = this.gameMap.getEntitiesIn(...area, TYPE.electricPole);
  const distList = [];
  for (let pole of poles) {
    if (pole == entity) continue;
    const minReach = reach <= pole.data.wireReach ?
        reach : pole.data.wireReach;
    const dx = entity.x + entity.width / 2 -
        (pole.x + pole.width / 2);
    const dy = entity.y + entity.height / 2 -
        (pole.y + pole.height / 2);
    const dist = dx * dx + dy * dy;
    if (dist > minReach * minReach)
      continue;
    let i = 0;
    while (dist > distList[i * 2]) i++;
    distList.splice(i* 2, 0, dist, pole);
  }
  let connected = false;
  distLoop:
  for (let i = 0; i < distList.length; i += 2) {
    const pole = distList[i + 1];
    for (let other of pole.data.wires) {
      if (entity.data.wires.has(other))
        continue distLoop;
    }
    entity.data.wires.add(pole);
    pole.data.wires.add(entity);
    if (!connected) {
      connected = true;
      pole.data.grid.add(entity);
    } else {
      pole.data.grid.join(entity.data.grid, time);
    }
  }
  if (!connected) {
    this.grids.push(Grid.fromPole(entity));
  }
};

ElectricNetwork.prototype.removePole = function(entity) {
  for (let pole of entity.data.wires) {
    otherLoop:
    for (let other of entity.data.wires) {
      if (pole == other) continue;
      if (pole.data.wires.has(other))
        continue;
      // Could these two poles be connected?
      const reach = pole.data.wireReach <= other.data.wireReach ?
          pole.data.wireReach : other.data.wireReach;
      const dx = pole.x + pole.width / 2 -
          (other.x + other.width / 2);
      const dy = pole.y + pole.height / 2 -
          (other.y + other.height / 2);
      const dist = dx * dx + dy * dy;
      if (dist > reach * reach)
        continue;
      // Check if there is a common neighbor forming a triangle.
      for (let neighbor of pole.data.wires) {
        if (neighbor != entity &&
            other.data.wires.has(neighbor))
          continue otherLoop;
      }
      pole.data.wires.add(other);
      other.data.wires.add(pole);
    }
  }
  for (let pole of entity.data.wires) {
    pole.data.wires.delete(entity);
  }
  entity.data.grid.poles.delete(entity);
  
  // split grid.
  const previous = [];
  for (let pole of entity.data.wires) {
    if (previous.length) {
      const segment = pole.data.grid.split(pole, entity, previous);
      if (segment) {
        this.grids.push(segment);
      }
    }
    previous.push(pole);
  }
};

/** This is called when a generator changes an electricConnection. */
ElectricNetwork.prototype.modifyGenerator = function(entity) {
  let grid = undefined;
  for (let pole of entity.electricConnections) {
    if (grid && grid != pole.data.grid) {
      if (entity.data.grid) {
        entity.data.grid.generators.delete(entity);
        entity.data.grid = undefined;
      }
      entity.state = STATE.multipleGrids;
      return;
    }
    if (!grid) {
      grid = pole.data.grid;
    }
  }
  if (!grid && entity.data.grid) {
    entity.data.grid.generators.delete(entity);
    entity.data.grid = undefined;
    entity.state = STATE.idle;
    return;
  }
  if (entity.data.grid == grid) {
    return;
  }
  entity.data.grid = grid;
  grid.generators.add(entity);
  entity.state = STATE.idle;
};

ElectricNetwork.prototype.modifyConsumer = function(entity, time) {
  let grid = undefined;
  for (let pole of entity.electricConnections) {
    if (grid && grid != pole.data.grid) {
      if (entity.data.grid) {
        const el = entity.state == STATE.running ?
            entity.energyConsumption1 : entity.energyConsumption0;
        entity.data.grid.consumerss.get(el).delete(entity);
        entity.data.grid = undefined;
      }
      if (entity.state == STATE.running) {
        const p = (time - entity.taskStart) / entity.taskDuration;
        entity.taskStart = time - p * NEVER;
        entity.taskEnd = time + (1 - p) * NEVER;
        entity.nextUpdate = NEVER;
        if (entity.animationLength) {
          const oldSpeed = entity.animationSpeed;
          entity.animationSpeed = 1 / NEVER;
          entity.animation = Math.floor(entity.animation +
              edt * oldSpeed / 60) %
              entity.animationLength;
        }
      }
      entity.state = STATE.multipleGrids;
      return;
    }
    if (!grid) {
      grid = pole.data.grid;
    }
  }
  if (!grid && entity.data.grid) {
    const el = entity.state == STATE.running ?
        entity.energyConsumption1 : entity.energyConsumption0;
    entity.data.grid.consumerss.get(el).delete(entity);
    entity.data.grid = undefined;
    if (entity.state == STATE.running) {
      const edt = time - entity.taskStart;
      const p = edt / (entity.taskEnd - entity.taskStart);
      entity.taskStart = time - p * NEVER;
      entity.taskEnd = entity.nextUpdate =
          time + (1 - p) * NEVER;
      if (entity.animationLength) {
        const oldSpeed = entity.animationSpeed;
        entity.animationSpeed = 1 / NEVER;
        entity.animation = Math.floor(entity.animation +
            edt * oldSpeed / 60) %
            entity.animationLength;
      }
    }
    return;
  }
  if (entity.data.grid == grid) {
    return;
  }
  entity.data.grid = grid;
  grid.consumerss.get(entity.energyConsumption0).add(entity);
  if (entity.state == STATE.running) {
    const edt = time - entity.taskStart;
    const p = edt / (entity.taskEnd - entity.taskStart);
    const d = grid.satisfaction < MIN_SATISFACTION ? NEVER :
        entity.taskDuration / grid.satisfaction;
    entity.taskStart = time - p * d;
    entity.taskEnd = entity.nextUpdate =
        time + (1 - p) * d;
    if (entity.animationLength) {
      const oldSpeed = entity.animationSpeed;
      entity.animationSpeed = grid.satisfaction < MIN_SATISFACTION ?
          1 / NEVER : grid.satisfaction;
      entity.animation = ((Math.floor(entity.animation +
          edt * oldSpeed / 60 -
          p * d * entity.animationSpeed / 60) %
          entity.animationLength) +
          entity.animationLength) % entity.animationLength;
    }
  }
};

ElectricNetwork.prototype.update = function(time, dt) {
  let removedGrids = 0;
  for (let i = 0; i < this.grids.length; i++) {
    if (!this.grids[i].poles.size) {
      removedGrids++;
      continue;
    }
    this.grids[i].update(time, dt);
    if (removedGrids) {
      this.grids[i - removedGrids] = this.grids[i];
    }
  }
  if (removedGrids) {
    this.grids.length -= removedGrids;
  }
};

ElectricNetwork.prototype.draw = function(ctx, view) {
  return;
  for (let i = 0; i < this.grids.length; i++) {
    this.grids[i].draw(ctx, view);
    ctx.fillStyle = this.grids[i].color;
    ctx.fillRect(10, 76 + i * 20, 10, 10);
    ctx.fillText((Math.floor(this.grids[i].satisfaction * 1000) / 10) + "", 25, 90 + i * 20);
  }
};

export {ElectricNetwork};
