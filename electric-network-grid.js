import {TYPE, STATE, ENERGY, NEVER, MIN_SATISFACTION} from './entity-properties.js';
import {ENTITY_ELECTRIC_CONSUMPTIONS} from './entity-definitions.js';

function Grid(poles) {
  this.poles = poles;
  
  this.generators = new Set();
  this.consumerss = new Map();
  for (let el of ENTITY_ELECTRIC_CONSUMPTIONS) {
    this.consumerss.set(el, new Set());
  }
  
  this.satisfaction = 0;
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

const DUMMY_SET = {add: () => {}, delete: () => {}},
    MULTI_GRID = {
      satisfaction: 0,
      consumerss: {
        get: () => DUMMY_SET,
      },
      generators: DUMMY_SET,
    };

Grid.fromPole = function(pole) {
  const grid = new Grid(new Set());
  grid.add(pole);
  return grid;
};

Grid.prototype.update = function(time, dt) {
  let demand = 0, output = 0;
  for (let [el, consumers] of this.consumerss) {
    demand += el * consumers.size;
  }
  if (!demand) {
    for (let generator of this.generators) {
      if (generator.state == STATE.working) {
        generator.state = STATE.idle;
        generator.animation = Math.floor(generator.animation +
            (time - generator.taskStart) * generator.animationSpeed / 60) %
            generator.animationLength;
        generator.taskStart = NEVER;
      }
    }
    return;
  }
  for (let generator of this.generators) {
    const steam = generator.inputFluidTank.tanklets[0].amount;
    const needed = generator.data.fluidConsumption * dt / 1000;
    if (steam < needed) {
      output += steam / needed * generator.data.powerOutput;
    } else {
      output += generator.data.powerOutput;
    }
  }
  const satisfaction = output > demand ? 1 : output / demand;
  const production = output < demand ? 1 : demand / output;
  for (let generator of this.generators) {
    const steam = generator.inputFluidTank.tanklets[0].amount;
    if (!steam) {
      if (generator.state == STATE.working) {
        generator.state = STATE.idle;
        generator.animation = Math.floor(generator.animation +
            (time - generator.taskStart) * generator.animationSpeed / 60) %
            generator.animationLength;
        generator.taskStart = NEVER;
      }
      continue;
    }
    const needed = generator.data.fluidConsumption * dt / 1000;
    generator.inputFluidTank.tanklets[0].amount -=
        Math.min(needed * production,
        generator.inputFluidTank.tanklets[0].amount);
    if (generator.state != STATE.working) {
      generator.state = STATE.working;
      generator.taskStart = time;
    }
  }
  if (Math.round(satisfaction * 100) !=
      Math.round(this.satisfaction * 100)) {
    for (let [el, consumers] of this.consumerss) {
      for (let entity of consumers) {
        if (entity.state != STATE.running) continue;
        // Entity delta time.
        const edt = time - entity.taskStart;
        const p = edt / (entity.taskEnd - entity.taskStart);
        const d = satisfaction < MIN_SATISFACTION ? NEVER :
            entity.taskDuration / satisfaction;
        entity.taskStart = time - p * d;
        entity.taskEnd = entity.nextUpdate =
            time + (1 - p) * d;
        if (entity.animationLength) {
          const oldSpeed = entity.animationSpeed;
          entity.animationSpeed = satisfaction < MIN_SATISFACTION ?
              1 / NEVER : satisfaction;
          const offset = satisfaction < MIN_SATISFACTION ?
              0 : p * entity.taskDuration / 60;
          entity.animation = (((entity.animation +
              edt * oldSpeed / 60 - offset) % entity.animationLength) +
              entity.animationLength) % entity.animationLength;
        }
      }
    }
    this.satisfaction = satisfaction;
  }
};

Grid.prototype.draw = function(ctx, view) {
  ctx.fillStyle = this.color;
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let pole of this.poles) {
    ctx.fillRect(
        (pole.x + 0.35) * view.scale - view.x,
        (pole.y + 0.35) * view.scale - view.y,
        (pole.width - 0.7) * view.scale,
        (pole.height - 0.7) * view.scale);
    ctx.beginPath();
    for (let consumer of pole.electricConnections) {
      ctx.moveTo((pole.x + pole.width / 2) * view.scale - view.x,
          (pole.y + pole.height / 2) * view.scale - view.y);
      ctx.lineTo((consumer.x + consumer.width / 2) * view.scale - view.x,
          (consumer.y + consumer.height / 2) * view.scale - view.y);
    }
    ctx.stroke();
    window.numberOtherDraws++;
  }
  ctx.beginPath();
  for (let generator of this.generators) {
    ctx.moveTo((generator.x + generator.width / 2 + 0.4) * view.scale - view.x,
        (generator.y + generator.height / 2) * view.scale - view.y);
    ctx.arc((generator.x + generator.width / 2) * view.scale - view.x,
        (generator.y + generator.height / 2) * view.scale - view.y,
        0.4 * view.scale, 0, 2 * Math.PI);
  }
  ctx.stroke();
  window.numberOtherDraws++;
  ctx.beginPath();
  for (let consumers of this.consumerss.values()) {
    for (let consumer of consumers) {
      ctx.moveTo((consumer.x + consumer.width / 2 + 0.2) * view.scale - view.x,
          (consumer.y + consumer.height / 2) * view.scale - view.y);
      ctx.arc((consumer.x + consumer.width / 2) * view.scale - view.x,
          (consumer.y + consumer.height / 2) * view.scale - view.y,
          0.2 * view.scale, 0, 2 * Math.PI);
    }
  }
  ctx.fill();
  ctx.globalAlpha = 1;
  window.numberOtherDraws++;
};

Grid.prototype.add = function(pole) {
  this.poles.add(pole);
  pole.data.grid = this;
};

Grid.prototype.join = function(other, network, time) {
  if (other == this) return;
  if (this.poles.size < other.poles.size) {
    other.join(this, network, time);
    return;
  }
  
  for (let pole of other.poles) {
    this.poles.add(pole);
    pole.data.grid = this;
  }
  for (let pole of other.poles) {
    for (let entity of pole.electricConnections) {
      if (entity.type == TYPE.generator) {
        network.modifyGenerator(entity);
      }
      if (entity.energySource == ENERGY.electric) {
        network.modifyConsumer(entity, time);
      }
    }
  }
  other.poles.clear();
  other.generators.clear();
  other.consumerss.clear();
};

Grid.prototype.split = function(entity, not, targets, network, time) {
  const stack = [entity], poles = new Set();
  while (stack.length) {
    const pole = stack.pop();
    if (targets.includes(pole))
      return;
    poles.add(pole);
    for (let other of pole.data.wires) {
      if (other == not || poles.has(other)) continue;
      stack.push(other);
    }
  }
  
  const segment = new Grid(poles);
  segment.satisfaction = this.satisfaction;
  for (let pole of poles) {
    pole.data.grid = segment;
    this.poles.delete(pole);
  }
  for (let pole of poles) {
    for (let entity of pole.electricConnections) {
      if (entity.type == TYPE.generator) {
        network.modifyGenerator(entity);
      }
      if (entity.energySource == ENERGY.electric) {
        network.modifyConsumer(entity, time);
      }
    }
  }
  return segment;
}

export {Grid, MULTI_GRID};
