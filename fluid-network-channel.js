import {TYPE, STATE} from './entity-properties.js';
 
const DEFAULT_TRANSFER = 1200;

function Channel(pipes) {
  this.pipes = pipes;
  
  this.fluid = 0;
  this.amount = 0;
  this.capacity = 0;
  
  this.inputTanklets = new Map();
  this.outputTanklets = new Map();
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Channel.fromPipe = function(pipe) {
  const channel = new Channel(new Set());
  channel.add(pipe);
  return channel;
};

Channel.prototype.update = function(time, dt) {
  // Output to tanklets.
  const maxOutputAmount = Math.min(this.amount, DEFAULT_TRANSFER *
      Math.max(this.amount / this.capacity, 0.05) * dt / 1000);
  let outputAmount = 0;
  for (let [entity, tanklet] of this.outputTanklets.entries()) {
    if (!tanklet) {
      console.log(entity);
    }
    outputAmount += Math.min(tanklet.capacity -
        tanklet.amount, maxOutputAmount);
  }
  if (outputAmount) {
    const pOut = Math.min(this.amount / outputAmount, 1);
    if (pOut) {
      for (let [entity, tanklet] of this.outputTanklets.entries()) {
        const transfer = Math.floor(
            Math.min(tanklet.capacity - tanklet.amount,
            this.amount,
            Math.ceil(pOut * maxOutputAmount)));
        
        tanklet.amount += transfer;
        this.amount -= transfer;
        if (entity.state == STATE.missingItem) {
          entity.nextUpdate = time;
        }
      }
    }
  }
  
  // Input from tanklets.
  let maxInputAmount = DEFAULT_TRANSFER *
      Math.max(1 - this.amount / this.capacity, 0.05) * dt / 1000;
  if (maxInputAmount > this.capacity - this.amount)
    maxInputAmount = this.capacity - this.amount;
  let inputAmount = 0;
  for (let [entity, tanklet] of this.inputTanklets.entries()) {
    const transfer = Math.min(tanklet.amount, maxInputAmount);
    inputAmount += transfer;
  }
  const pIn = inputAmount ? Math.min((this.capacity - this.amount) / inputAmount, 1) : 0;
  for (let [entity, tanklet] of this.inputTanklets.entries()) {
    const transfer = Math.floor(
        Math.min(tanklet.amount,
        this.capacity - this.amount,
        Math.ceil(pIn * maxInputAmount)));
    this.amount += transfer;
    tanklet.amount -= transfer;
    
    if (entity.state == STATE.outputFull ||
        entity.state == STATE.itemReady) {
      entity.nextUpdate = time;
    }
  }
};

Channel.prototype.draw = function(ctx, view) {
  //return;
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 1;
  for (let pipe of this.pipes) {
    ctx.strokeRect(
        (pipe.x + 0.1) * view.scale - view.x,
        (pipe.y + 0.1) * view.scale - view.y,
        (pipe.width - 0.2) * view.scale,
        (pipe.height - 0.2) * view.scale);
  }
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = this.color;
  for (let entity of this.inputTanklets.keys()) {
    ctx.fillRect(
        (entity.x + 0.1) * view.scale - view.x,
        (entity.y + 0.1) * view.scale - view.y,
        (0.4) * view.scale,
        (0.4) * view.scale);
  }
  for (let entity of this.outputTanklets.keys()) {
    ctx.fillRect(
        (entity.x + entity.width - 0.5) * view.scale - view.x,
        (entity.y + entity.height - 0.5) * view.scale - view.y,
        (0.4) * view.scale,
        (0.4) * view.scale);
  }
  ctx.globalAlpha = 1;
};

/** Returns true if this is an invalid connection and it should be removed. */
Channel.prototype.addInputEntity = function(entity, index) {
  const tanklet = entity.outputFluidTank.tanklets[index] ??
      entity.outputFluidTank.tanklets[0];
  if (this.fluid && tanklet.fluid != this.fluid) {
    return true;
  } else if (!this.fluid) {
    this.fluid = tanklet.fluid;
  }
  this.inputTanklets.set(entity, tanklet);
};

Channel.prototype.removeInputEntity = function(entity) {
  this.inputTanklets.delete(entity);
};

/** Returns true if this is an invalid connection and it should be removed. */
Channel.prototype.addOutputEntity = function(entity, index) {
  const tanklet = entity.inputFluidTank.tanklets[index] ??
      entity.inputFluidTank.tanklets[0];
  if (this.fluid && tanklet.fluid != this.fluid) {
    return true;
  } else if (!this.fluid) {
    this.fluid = tanklet.fluid;
  }
  this.outputTanklets.set(entity, tanklet);
};

Channel.prototype.removeOutputEntity = function(entity) {
  this.outputTanklets.delete(entity);
};

Channel.prototype.add = function(pipe) {
  this.pipes.add(pipe);
  pipe.data.channel = this;
  
  this.capacity += pipe.data.capacity;
  
  for (let entity of pipe.inputEntities) {
    if (!entity.outputFluidTank) continue;
    this.addInputEntity(entity, 0);
  }
  for (let entity of pipe.outputEntities) {
    if (!entity.inputFluidTank) continue;
    this.addOutputEntity(entity, 0);
  }
  if (pipe.inputFluidTank?.internalInlet) {
    this.addOutputEntity(pipe, -1);
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
      if (output.data.pipeConnections &&
          output != pipe &&
          output.data.channel == this) {
        continue inputLoop;
      }
    }
    this.inputTanklets.delete(entity);
  }
  outputLoop:
  for (let entity of pipe.outputEntities) {
    for (let input of entity.inputEntities) {
      if (input.data.pipeConnections &&
          input != pipe &&
          input.data.channel == this) {
        continue outputLoop;
      }
    }
    this.outputTanklets.delete(entity);
  }
  if (pipe.inputFluidTank?.internalInlet) {
    this.outputTanklets.delete(pipe);
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
  for (let [entity, tanklet] of other.outputTanklets.entries()) {
    this.outputTanklets.set(entity, tanklet);
  }
};

Channel.prototype.split = function(pipe, not, a, b, c) {
  const stack = [pipe], pipes = new Set();
  while (stack.length) {
    const p = stack.pop();
    if (p == a || p == b || p == c) return;
    pipes.add(p);
    for (let i = 0; i < p.data.pipeConnections.length; i++) {
      if (p.data.pipes[i] &&
          p.data.pipes[i] != not &&
          p.data.pipes[i].data.pipeConnections &&
          !pipes.has(p.data.pipes[i])) {
        for (let j = 0; j < p.data.pipes[i].data.pipeConnections.length; j ++) {
          if (p.data.pipes[i].data.pipes[j] == p) {
            stack.push(p.data.pipes[i]);
            break;
          }
        }
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
      if (!this.inputTanklets.has(entity))
        continue;
      segment.inputTanklets.set(entity, this.inputTanklets.get(entity));
      this.inputTanklets.delete(entity);
    }
    for (let entity of p.outputEntities) {
      if (!this.outputTanklets.has(entity))
        continue;
      segment.outputTanklets.set(entity, this.outputTanklets.get(entity));
      this.outputTanklets.delete(entity);
    }
    if (p.inputFluidTank?.internalInlet) {
      segment.outputTanklets.set(p, this.outputTanklets.get(p));
      this.outputTanklets.delete(p);
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
