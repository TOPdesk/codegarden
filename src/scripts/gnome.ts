/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

class Gnome extends Phaser.Sprite {
	private _location: Point;
	set location(location: Point) {
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(location);
		this.game.add.tween(this).to({
			x: screenCoordinates.x + 60, y: screenCoordinates.y - 180,
		}, 500, Phaser.Easing.Quartic.Out).start();
		this._location = location;
	}
	get location(): Point {
		return this._location;
	}

	public direction: Direction = Direction.SE;

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, x, y, "gnome_facing_se");
		this.anchor.x = 0.4;
		this.location = new Point(2, 2);
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
