/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
///<reference path="game_object.ts"/>

class CodeBuilding extends GameObject {
	public gnomeCode: Command[];
	public delay: number;

	private selectionIndicator;

	constructor(game: Phaser.Game, public model: CodeBuildingModel, sprite) {
		super(game, model, sprite, false);
		this.inputEnabled = true;
		this.input.pixelPerfectClick = true;
		this.input.useHandCursor = true;

		this.gnomeCode = [];
		if (model.initialCode) {
			for (let i = 0; i < model.initialCode.length; i++) {
				this.gnomeCode.push(CommandType.getCommandTypeForShorthand(model.initialCode.charAt(i)));
			}
		}

		game.add.existing(this);
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
}

interface CodeBuildingModel extends GameObjectModel {
	initialCode?: string;
	sizeLimit: number;
	readonly?: boolean;
	delay?: number;
}
