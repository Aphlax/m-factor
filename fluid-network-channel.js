import {TYPE, STATE} from './entity-properties.js';

const DEFAULT_TRANSFER = 1200;

function Channel(pipes) {
  this.pipes = pipes;
  
  this.fluid = 0;
  this.amount = 0;
  this.capacity = 0;
  
  this.inputTanklets = new Map();
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Channel.fromPipe = function(pipe) {
  const channel = new Channel(new Set());
  channel.add(pipe);
  return channel;
};

Channel.prototype.update = function(time, dt) {
  let inlet = 0;
  for (let [entity, tanklet] of this.inputTanklets.entries()) {
    if (tanklet.constantProduction && entity.state == STATE.running) {
      if (tanklet.constantProduction < 0) continue;
      const amount = Math.round(tanklet.constantProduction * dt / 1000);
      if (tanklet.amount < amount) {
        tanklet.amount += amount;
      } else {
        inlet += amount;
      }
    } else {
      const amount = DEFAULT_TRANSFER * dt / 1000;
      const transfer = Math.min(tanklet.amount, amount);
      inlet += transfer;
    }
  }
  const p = Math.min((this.capacity - this.amount) / inlet, 1);
  for (let [entity, tanklet] of this.inputTanklets.entries()) {
    if (tanklet.constantProduction && entity.state == STATE.running) {
      if (tanklet.constantProduction < 0) continue;
      const amount = Math.round(tanklet.constantProduction * dt / 1000);
      if (tanklet.amount < amount) {
        tanklet.amount += amount;
      } else {
        this.amount += Math.round(amount * p);
      }
    } else {
      const amount = DEFAULT_TRANSFER * dt / 1000;
      const transfer = Math.round(p * Math.min(tanklet.amount, amount));
      this.amount += transfer;
      tanklet.amount -= transfer;
    }
  }
};

Channel.prototype.draw = function(ctx, view) {
  // return;
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 1;
  for (let pipe of this.pipes) {
    ctx.strokeRect(
        (pipe.x + 0.1) * view.scale - view.x,
        (pipe.y + 0.1) * view.scale - view.y,
        (pipe.width - 0.2) * view.scale,
        (pipe.height - 0.2) * view.scale);
  }
};

/** Returns true if this is an invalid connection and it should be removed. */
Channel.prototype.addInputEntity = function(entity, pipe) {
  for (let i = 0; i < entity.outputFluidTank.connectionPoints.length; i++) {
    const p = entity.outputFluidTank.connectionPoints[i];
    if (pipe.x != entity.x + p.x ||
        pipe.y != entity.y + p.y) continue;
    const tanklet = entity.outputFluidTank.tanklets[i] ??
        entity.outputFluidTank.tanklets[0];
    if (this.fluid && tanklet.fluid != this.fluid) {
      return true;
    } else if (!this.fluid) {
      this.fluid = tanklet.fluid;
    }
    this.inputTanklets.set(entity, tanklet);
  }
};

Channel.prototype.add = function(pipe) {
  this.pipes.add(pipe);
  pipe.data.channel = this;
  
  this.capacity += pipe.data.capacity;
  
  for (let entity of pipe.inputEntities) {
    this.addInputEntity(entity, pipe);
  }
};

Channel.prototype.remove = function(pipe) {
  this.pipes.delete(pipe);
  pipe.data.channel = undefined;
  
  this.capacity -= pipe.data.capacity;
  if (this.amount > this.capacity) {
    this.amount = this.capacity;
  }
  
  inputLoop:
  for (let entity of pipe.inputEntities) {
    for (let output of entity.outputEntities) {
      if (output.type == TYPE.pipe && output != pipe &&
          output.data.channel == this) {
        continue inputLoop;
      }
    }
    this.inputTanklets.delete(entity);
  }
};

Channel.prototype.join = function(other) {
  if (other == this) return;
  
  for (let pipe of other.pipes) {
    this.pipes.add(pipe);
    pipe.data.channel = this;
  }
  other.pipes.clear();
  
  this.capacity += other.capacity;
  this.amount += other.amount;
  this.fluid = this.fluid || other.fluid;
  
  for (let [entity, tanklet] of other.inputTanklets.entries()) {
    this.inputTanklets.set(entity, tanklet);
  }
};

Channel.prototype.split = function(pipe, not, a, b, c) {
  const stack = [pipe], pipes = new Set();
  while (stack.length) {
    const p = stack.pop();
    if (p == a || p == b || p == c) return;
    pipes.add(p);
    for (let i = 0; i < 4; i++) {
      if (p.data.pipes[i] &&
          p.data.pipes[i] != not &&
          p.data.pipes[i].type == TYPE.pipe &&
          !pipes.has(p.data.pipes[i])) {
        stack.push(p.data.pipes[i]);
      }
    }
  }
  const segment = new Channel(pipes);
  for (let p of pipes) {
    p.data.channel = segment;
    this.pipes.delete(p);
    
    this.capacity -= p.data.capacity;
    segment.capacity += p.data.capacity;
    
    for (let entity of p.inputEntities) {
      segment.inputTanklets.set(entity, this.inputTanklets.get(entity));
      this.inputTanklets.delete(entity);
    }
  }
  
  segment.fluid = this.fluid;
  const transfer = Math.floor(this.amount /
      (1 + this.capacity / segment.capacity));
  segment.amount = Math.min(transfer, segment.capacity);
  this.amount = Math.min(this.amount - transfer, this.capacity);
  
  return segment;
};

export {Channel};
