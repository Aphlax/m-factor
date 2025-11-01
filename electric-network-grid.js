import {TYPE, STATE} from './entity-properties.js';

function Grid(poles) {
  this.poles = poles;
  
  this.generators = new Set();
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Grid.fromPole = function(pole) {
  const grid = new Grid(new Set());
  grid.add(pole);
  return grid;
};

Grid.prototype.update = function(time, dt) {
  for (let generator of this.generators) {
    const ready = generator.inputFluidTank.tanklets[0].amount > 0;
    if (generator.state != STATE.running && ready) {
      generator.state = STATE.running;
      generator.taskStart = time;
    }
  }
};

Grid.prototype.draw = function(ctx, view) {
  ctx.fillStyle = this.color;
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 1;
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
};

Grid.prototype.add = function(pole) {
  this.poles.add(pole);
  pole.data.grid = this;
};

Grid.prototype.join = function(other) {
  if (other == this) return;
  
  for (let pole of other.poles) {
    this.poles.add(pole);
    pole.data.grid = this;
  }
  for (let entity of other.generators) {
    this.generators.add(entity);
    entity.data.grid = this;
  }
  other.poles.clear();
  other.generators.clear();
};

Grid.prototype.split = function(entity, not, targets) {
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
  for (let pole of poles) {
    pole.data.grid = segment;
    this.poles.delete(pole);
    
    for (let entity of pole.electricConnections) {
      if (entity.type == TYPE.generator) {
        this.generators.delete(entity);
        segment.generators.add(entity);
        entity.data.grid = segment;
      }
    }
  }
  return segment;
}

export {Grid};
