import {Grid} from './electric-network-grid.js';
import {TYPE} from './entity-properties.js';

function ElectricNetwork(gameMap) {
  this.gameMap = gameMap;
  this.grids = [];
}

ElectricNetwork.prototype.addPole = function(entity) {
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
      pole.data.grid.join(entity.data.grid);
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

ElectricNetwork.prototype.addConsumer = function(entity) {
  
};

ElectricNetwork.prototype.addGenerator = function(entity) {
  
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
  for (let grid of this.grids) {
    grid.draw(ctx, view);
  }
};

export {ElectricNetwork};
