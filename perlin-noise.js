"use strict";

import {createRand} from './utils.js';

function PerlinNoise(seed, scale, octaves, freq, amp) {
	this.scale = scale ?? 0.01;
	this.octaves = octaves ?? 1;
	this.freq = freq ?? 1;
	this.amp = amp ?? 1;
	let rand = createRand(...seed);
	this.permutation = new Array(512).fill(0).map((a, i) => i);
	for (let i = this.permutation.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * i), t = this.permutation[i];
		this.permutation[i] = this.permutation[j];
		this.permutation[j] = t;
    }
    this.permutation.push(...this.permutation);
}

PerlinNoise.prototype.getNoise = function(x, y) {
	x %= 512;
	y %= 512;
	const x_ = Math.floor(x);
	const y_ = Math.floor(y);
	
	const bottomLeft = getDir(this.permutation[this.permutation[x_] + y_]);
	const bottomRight = getDir(this.permutation[this.permutation[x_ + 1] + y_]);
	const topLeft = getDir(this.permutation[this.permutation[x_] + y_ + 1]);
	const topRight = getDir(this.permutation[this.permutation[x_ + 1] + y_ + 1]);
	
	const a = dot(bottomLeft, {x: x - x_, y: y - y_});
	const b = dot(bottomRight, {x: x - x_ - 1, y: y - y_});
	const c = dot(topLeft, {x: x - x_, y: y - y_ - 1});
	const d = dot(topRight, {x: x - x_ - 1, y: y - y_ - 1});
	
	return lerp(fade(y - y_), lerp(fade(x - x_), a, b), lerp(fade(x - x_), c, d));
}

PerlinNoise.prototype.get = function(x, y) {
	let noise = 0;
	for (let i = 0; i < this.octaves; i++) {
		let scale = this.scale * this.freq ** i;
		noise += this.getNoise(x * scale, y * scale) * this.amp ** i;
	}
	return (noise + 1) / 2;
}

function getDir(i) {
	return { x: i & 1 ? -1 : 1, y: i & 2 ? -1 : 1};
}

function dot(a, b) {
	return a.x * b.x + a.y * b.y;
}

function lerp(t, a, b) {
	return a + t * (b - a);
}

function fade(t) {
	return ((6 * t - 15) * t + 10) * t * t * t;
}

export {PerlinNoise};