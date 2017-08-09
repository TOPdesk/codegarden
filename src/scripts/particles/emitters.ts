namespace ParticleEmitters {
	export function waterObject(game: Phaser.Game, x: number, y: number) {
		let emitter = game.add.emitter(x, y - 50, 5);
		emitter.makeParticles(WorldConstants.SPRITE_SHEET, "waterdrop_filled");
		emitter.width = 20;
		emitter.setYSpeed(100, 150);
		emitter.setXSpeed(-5, 5);

		emitter.minRotation = 0;
		emitter.maxRotation = 0;
		emitter.setAlpha(1, 0, 1000, Phaser.Easing.Sinusoidal.Out);
		emitter.start(false, WorldConstants.TURN_LENGTH_IN_MILLIS, 50, 5);
	}

	export function beardExplosion(game: Phaser.Game, x: number, y: number) {
		let emitter = game.add.emitter(x, y, 20);
		emitter.makeParticles(WorldConstants.SPRITE_SHEET, "beard_particle");
		emitter.gravity = -30;
		emitter.setAlpha(1, 0, 1500, Phaser.Easing.Sinusoidal.Out);
		emitter.start(true, 1500, null, 20);
	}
}
