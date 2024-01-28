import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';

function drawBelt(ctx, view, time) {
  if ((this.x + this.width) * view.scale <= view.x)
    return;
  if (this.x * view.scale > view.x + view.width)
    return;
  if ((this.y + this.height) * view.scale <= view.y)
    return;
  if ((this.y - 1) * view.scale > view.y + view.height)
    return;
  let animation = Math.floor(this.animation +
      time * this.animationSpeed / 60) % this.animationLength;
  const sprite = SPRITES.get(this.sprite + animation);
  const xScale = this.width * view.scale /
      (sprite.width - sprite.left - sprite.right);
  const yScale = this.height * view.scale /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      this.x * view.scale - view.x -
          sprite.left * xScale,
      this.y * view.scale - view.y -
          sprite.top * yScale,
      sprite.width * xScale,
      sprite.height * yScale);
  if (this.data.beltEndSprite) {
    const s = SPRITES.get(this.data.beltEndSprite + animation);
    const x = this.x - (this.direction - 2) % 2;
    const y = this.y + (this.direction - 1) % 2;
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        x * view.scale - view.x - s.left * xScale,
        y * view.scale - view.y - s.top * yScale,
        s.width * xScale,
        s.height * yScale);
  }
  if (this.data.beltBeginSprite) {
    const s = SPRITES.get(this.data.beltBeginSprite + animation);
    const x = this.x + (this.direction - 2) % 2;
    const y = this.y - (this.direction - 1) % 2;
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        x * view.scale - view.x - s.left * xScale,
        y * view.scale - view.y - s.top * yScale,
        s.width * xScale,
        s.height * yScale);
  }
  if (this.data.beltExtraRightSprite) {
    const s = SPRITES.get(this.data.beltExtraRightSprite + animation);
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        this.x * view.scale - view.x - s.left * xScale,
        this.y * view.scale - view.y - s.top * yScale,
        s.width * xScale,
        s.height * yScale);
  }
  if (this.data.beltExtraLeftSprite) {
    const s = SPRITES.get(this.data.beltExtraLeftSprite + animation);
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        this.x * view.scale - view.x - s.left * xScale,
        this.y * view.scale - view.y - s.top * yScale,
        s.width * xScale,
        s.height * yScale);
  }
}

function drawInserterHand(ctx, view, time) {
  const base = SPRITES.get(this.data.inserterHandSprites);
  const hand = SPRITES.get(this.data.inserterHandSprites +
      (this.data.inserterItem ? 2 : 1));
  
  const angle = (time / 2 % 1000) / 1000 * 2;
  
  const scale = view.scale / 32;
  const bend = -0.22 * Math.cos(angle * Math.PI);
  const handScale = 0.55 + 0.2 * Math.sin(angle * Math.PI) +
      0.1 * Math.cos(angle * 2 * Math.PI);
  const baseScale = 0.55 - 0.2 * Math.sin(angle * Math.PI);
  ctx.translate(
      (this.x + 0.5) * view.scale - view.x,
      (this.y + 0.5) * view.scale - view.y);
  ctx.rotate((-0.5 + angle + bend) * Math.PI);
  ctx.translate(0, 24 * scale * baseScale);
  ctx.rotate((1 - bend * 1.9) * Math.PI);
  
  if (this.data.inserterItem) {
    ctx.translate(0, -40 * scale * handScale);
    ctx.rotate(this.data.inserterPickupBend * Math.PI);
    const item = SPRITES.get(ITEMS.get(this.data.inserterItem).sprite);
    ctx.drawImage(item.image,
        item.x, item.y, item.width, item.height,
        -8 * scale, -8 * scale,
        16 * scale, 16 * scale);
    ctx.rotate(-this.data.inserterPickupBend * Math.PI);
    ctx.translate(0, 40 * scale * handScale);
  }
  
  ctx.scale(1, handScale);
  ctx.drawImage(hand.image,
      hand.x, hand.y, hand.width, hand.height,
      -9 * scale,
      -40 * scale,
      hand.width * scale,
      hand.height * scale);
  ctx.scale(1, 1 / handScale);
  
  ctx.rotate(bend * 1.9 * Math.PI);
  ctx.scale(1, baseScale);
  ctx.drawImage(base.image,
      base.x, base.y, base.width, base.height,
      -4 * scale,
      -4 * scale,
      base.width * scale,
      base.height * scale);
  ctx.setTransform();
}

export {drawBelt, drawInserterHand};
