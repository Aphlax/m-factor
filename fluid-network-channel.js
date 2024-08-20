import {TYPE} from './entity-properties.js';

function Channel(pipes) {
  this.pipes = pipes;
  
  this.fluid = 0;
  this.amount = 0;
  this.capacity = 0;
  
  this.inputTanklets = new Map();
  
  const c = Math.floor(Math.random() * 255 * 2 + 1);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Channel.fromPipe = function(pipe) {
  const channel = new Channel(new Set());
  channel.add(pipe);
  return channel;
};

Channel.prototype.update = function(time, dt) {
  
};

Channel.prototype.draw = function(ctx, view) {
  return;
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

Channel.prototype.addInputEntity = function(entity, pipe) {
  for (let i = 0; i < entity.outputFluidTank.connectionPoints.length; i++) {
    const p = entity.outputFluidTank.connectionPoints[i];
    if (pipe.x == this.x + p.x &&
        pipe.y == this.y + p.y) {
      const tanklet = entity.outputFluidTank.tanklets[i] ??
          entity.outputFluidTank.tanklets[0];
      this.inputTanklets.set(entity, tanklet);
    }
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
  
  for (let entity of pipe.inputEntities) {
    this.inputTanklets.delete(entity);
  }
};

Channel.prototype.join = function(other) {
  if (other == this) return true;
  if (other.fluid && this.fluid &&
      other.fluid != this.fluid) return false;
  
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
  
  return true;
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
    
    this.capacity -= p.capacity;
    segment.capacity += p.capacity;
    
    for (let entity of p.inputEntities) {
      segment.set(entity, this.inputTanklets.get(entity));
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
