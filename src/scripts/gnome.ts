/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

class Gnome extends Phaser.Sprite {
	private location: Point = new Point(0, 0);
	private direction: Direction = Direction.SE;

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, x, y, "gnome_facing_se");
		this.anchor.setTo(.4, .5);
		game.add.existing(this);
	}

	rotateLeft() {
		this.direction = Direction.rotateLeft(this.direction);
		this.faceDirection();
	}

	rotateRight() {
		this.direction = Direction.rotateRight(this.direction);
		this.faceDirection();
	}

	moveForward() {
		let newLocation = this.location.getNeighbor(this.direction);
		this.location = newLocation;
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(newLocation);
		this.game.add.tween(this).to({
			x: screenCoordinates.x + 60, y: screenCoordinates.y,
		}, 500, Phaser.Easing.Quartic.Out).start();
	}

	private faceDirection() {
		switch (this.direction) {
			case Direction.NW:
				this.loadTexture("gnome_facing_nw");
				this.scale.x = 1;
				break;
			case Direction.NE:
				this.loadTexture("gnome_facing_nw");
				this.scale.x = -1;
				break;
			case Direction.SE:
				this.loadTexture("gnome_facing_se");
				this.scale.x = 1;
				break;
			case Direction.SW:
				this.loadTexture("gnome_facing_se");
				this.scale.x = -1;
				break;
		}
	}
}
