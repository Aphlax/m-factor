

function FluidNetwork(gameMap) {
  this.gameMap = gameMap;
  
  this.channels = [];
}

FluidNetwork.prototype.addPipe = function(pipe) {
  let connected = false;
  for (let i = 0; i < 4; i++) {
    const other = pipe.data.pipes[i];
    if (other) {
      if (connected) {
        pipe.data.channel.join(other.data.channel);
      } else {
        other.data.channel.add(pipe);
        connected = true;
      }
    }
  }
  if (!connected) {
    this.channels.push(Channel.fromPipe(pipe));
  }
};

FluidNetwork.prototype.removePipe = function(pipe) {
  let previous1 = undefined,
      previous2 = undefined,
      previous3 = undefined;
  pipe.data.channel.remove(pipe);
  for (let i = 0; i < 4; i++) {
    const other = pipe.data.pipes[i];
    if (other) {
      if (previous1) {
        const split = other.data.channel.split(
            other, pipe, previous1, previous2, previous3);
        if (split) {
          this.channels.push(split);
        }
      }
      if (!previous1) {
        previous1 = other;
      } else if (!previous2) {
        previous2 = other;
      } else {
        previous3 = other;
      }
    }
  }
};

FluidNetwork.prototype.update = function(time, dt) {
  let removedChannels = 0;
  for (let i = 0; i < this.channels.length; i++) {
    if (!this.channels[i].pipes.size) {
      removedChannels++;
      continue;
    }
    this.channels[i].update(time, dt);
    if (removedChannels) {
      this.channels[i - removedChannels] = this.channels[i];
    }
  }
  if (removedChannels) {
    this.channels.length -= removedChannels;
  }
};

FluidNetwork.prototype.draw = function(ctx, view) {
  for (let channel of this.channels) {
    channel.draw(ctx, view);
  }
};

function Channel(pipes) {
  this.pipes = pipes;
  const c = Math.floor(Math.random() * 255 * 2);
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
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 1;
  for (let pipe of this.pipes) {
    ctx.strokeRect(
        (pipe.x + 0.1) * view.scale - view.x,
        (pipe.y + 0.1) * view.scale - view.y,
        view.scale * 0.8, view.scale * 0.8);
  }
};

Channel.prototype.add = function(pipe) {
  this.pipes.add(pipe);
  pipe.data.channel = this;
};

Channel.prototype.remove = function(pipe) {
  this.pipes.delete(pipe);
  pipe.data.channel = undefined;
};

Channel.prototype.join = function(other) {
  if (other == this) return;
  
  for (let pipe of other.pipes) {
    this.pipes.add(pipe);
    pipe.data.channel = this;
  }
  
  other.pipes.clear();
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
          !pipes.has(p.data.pipes[i])) {
        stack.push(p.data.pipes[i]);
      }
    }
  }
  const split = new Channel(pipes);
  for (let p of pipes) {
    p.data.channel = split;
    a.data.channel.pipes.delete(p);
  }
  return split;
};

export {FluidNetwork};
