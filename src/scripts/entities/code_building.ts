/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
///<reference path="game_object.ts"/>

class CodeBuilding extends GameObject {
	public gnomeCode: Command[] = [];
	public delay: number;

	private selectionIndicator;

	constructor(game: Phaser.Game, public model: CodeBuildingModel, sprite) {
		super(game, model, sprite, false);
		this.inputEnabled = true;
		this.input.pixelPerfectClick = true;
		this.input.useHandCursor = true;

		this.loadCodeFromString(model.initialCode);

		game.add.existing(this);
	}

	public loadCodeFromString(code?: string) {
		if (!code) {
			return;
		}

		this.gnomeCode.splice(0, this.gnomeCode.length);
		for (let i = 0; i < code.length; i++) {
			this.gnomeCode.push(CommandType.getCommandTypeForShorthand(code.charAt(i).toUpperCase()));
		}
	}

	public select() {
		this.tint = 0xffff55;

		if (this.selectionIndicator) {
			this.selectionIndicator.destroy();
		}

		this.selectionIndicator = this.game.add.graphics(0, 0);
		this.selectionIndicator.beginFill(0xffff00, 0.4);
		this.selectionIndicator.moveTo(-WorldConstants.BLOCK_WIDTH / 2, -1000);
		this.selectionIndicator.lineTo(-WorldConstants.BLOCK_WIDTH / 2, -15);
		this.selectionIndicator.lineTo(0, WorldConstants.BLOCK_HEIGHT / 2 - 15);
		this.selectionIndicator.lineTo(WorldConstants.BLOCK_WIDTH / 2, -15);
		this.selectionIndicator.lineTo(WorldConstants.BLOCK_WIDTH / 2, -1000);
		this.selectionIndicator.endFill();
		this.addChild(this.selectionIndicator);
	}

	public deselect() {
		this.tint = 0xffffff;
		if (this.selectionIndicator) {
			this.selectionIndicator.destroy();
		}
	}

	static getLibraryColor(libraryIndex: number): string {
		switch (libraryIndex) {
			case 0: return "orange";
			case 1: return "purple";
			case 2: return "green";
			default: return "red";
		}
	}
}

interface CodeBuildingModel extends GameObjectModel {
	initialCode?: string;
	sizeLimit: number;
	readonly?: boolean;
	delay?: number;
}
