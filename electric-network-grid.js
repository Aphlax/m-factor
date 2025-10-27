

function Grid(poles) {
  this.poles = poles;
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Grid.fromPole = function(pole) {
  const grid = new Grid(new Set());
  grid.add(pole);
  return grid;
};

Grid.prototype.update = function(time, dt) {
  
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
  other.poles.clear();
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
  }
  return segment;
}

export {Grid};
