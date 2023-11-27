/** Seeded random generator (simple fast counter 32) */
export function createRand(a, b, c, d) {
	let rand = createIntRand(a, b, c, d);
	return function() {
		return rand() / 4294967296;
    };
}

/** Seeded integer random generator */
export function createIntRand(a, b, c, d) {
    let rand = function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0);
    }
    for (let i = 0; i < 15; i++) rand();
    return rand;
}