/**
 * Allows the player to see and edit the code of a code building
 */
import RenderTexture = Phaser.RenderTexture;

class GnomeCodeEditor {
	private commandsGroup: Phaser.Group;
	private gnomeCodeGroup: Phaser.Group;

	constructor (private game: Phaser.Game, private world: GameWorld) {
		this.commandsGroup = game.add.group();
		this.commandsGroup.fixedToCamera = true;

		this.gnomeCodeGroup = game.add.group();
		this.gnomeCodeGroup.fixedToCamera = true;
		this.drawGnomeCode();

		this.world.selectionListener = () => {
			this.drawGnomeCode();
			this.drawCommands();
		};
	}

	public deleteLastCommand() {
		if (!this.world.selectedBuilding
			|| this.world.selectedBuilding.model.readonly
			|| !this.world.selectedBuilding.gnomeCode.length) {
			return;
		}

		this.world.selectedBuilding.gnomeCode.pop();
		this.drawGnomeCode();
	}

	public appendCommand(command: Command) {
		if (!this.world.selectedBuilding
			|| this.world.selectedBuilding.model.readonly
			|| this.world.selectedBuilding.gnomeCode.length >= this.world.selectedBuilding.model.sizeLimit) {
			return;
		}

		this.world.selectedBuilding.gnomeCode.push(command);
		this.drawGnomeCode();
	}

	drawCommands() {
		this.commandsGroup.removeAll(true);
		if (!this.world.selectedBuilding) {
			return;
		}

		let frame = new Phaser.Graphics(this.game);
		this.commandsGroup.add(frame);

		function x(index) {
			return 720 + (index * 85);
		}
		function y(index) {
			return 35 + (index * 85);
		}

		let libraryCount;
		for (libraryCount = 0; libraryCount < this.world.level.libraries.length; libraryCount++) {
			this.drawButton(x(libraryCount % 3), y(Math.floor(libraryCount / 3)),
				"library-" + (libraryCount + 1) + "-button", new Command(CommandType.CALL_ROUTINE, [libraryCount]));
		}

		let arrowYStart = 1 + Math.floor((libraryCount - 2) / 3);

		this.drawButton(x(1), y(arrowYStart), "button-straight", new Command(CommandType.WALK));
		this.drawButton(x(0), y(arrowYStart + 1), "button-turn-left", new Command(CommandType.LEFT));
		this.drawButton(x(1), y(arrowYStart + 1), "button-interact", new Command(CommandType.ACT));
		this.drawButton(x(2), y(arrowYStart + 1), "button-turn-right", new Command(CommandType.RIGHT));

		let text = new Phaser.Text(this.game, x(0) + 5, y(arrowYStart + 2), "Commands", Messages.TEXT_STYLE);
		this.commandsGroup.add(text);

		frame.lineStyle(3, 0x000000, 1.0);
		frame.beginFill(0xffffff);
		frame.drawRoundedRect(x(0) - 20, 20, 295, text.y + text.height - 10, 5);
		frame.endFill();
	}

	drawButton(x: number, y: number, spriteKey: string, command: Command) {
		let button = new Phaser.Sprite(this.game, x, y, WorldConstants.SPRITE_SHEET, spriteKey);
		button.inputEnabled = true;
		button.input.useHandCursor = true;
		button.events.onInputDown.add(() => {
			button.frameName = spriteKey + "-pressed";
		});
		button.events.onInputUp.add(() => {
			button.frameName = spriteKey;
			this.appendCommand(command);
		});
		this.commandsGroup.add(button);
	}

	//TODO: tooltips, hint to select a building, placeholders, better readonly styling
	drawGnomeCode() {
		this.gnomeCodeGroup.removeAll(true);
		if (!this.world.selectedBuilding) {
			this.commandsGroup.visible = false;
			return;
		}
		let readonly = this.world.selectedBuilding.model.readonly;

		const startX = 5;
		const startY = 500;
		const blockwidth = 80;

		let gnomeCodeFrame = new Phaser.Graphics(this.game);
		this.gnomeCodeGroup.add(gnomeCodeFrame);
		gnomeCodeFrame.lineStyle(3, 0x000000, 1.0);
		gnomeCodeFrame.beginFill(0xeeeeee);
		gnomeCodeFrame.drawRect(-5, startY - 5, this.game.width + 10, this.game.height);
		gnomeCodeFrame.endFill();

		this.commandsGroup.visible = !readonly;
		let message = (this.world.selectedBuilding.model.type === "LIBRARY") ?
			"Library routine" : "Gnome routine";
		if (readonly) {
			message += " (can't be changed)";
		}

		let textObject = new Phaser.Text(this.game, startX, startY, message, Messages.TEXT_STYLE);
		this.gnomeCodeGroup.add(textObject);
		textObject.wordWrapWidth = WorldConstants.MINIMUM_GAME_WIDTH;

		if (this.world.selectedBuilding.delay) {
			let sprite = new Phaser.Sprite(this.game, 900, startY - 10, WorldConstants.SPRITE_SHEET, "pause-button");
			this.gnomeCodeGroup.add(sprite);
			let delayCount = new Phaser.Text(this.game, 960, startY, this.world.selectedBuilding.delay.toString(), Messages.TEXT_STYLE);
			delayCount.x = sprite.x + (sprite.width / 2) - (delayCount.width / 2);
			delayCount.y = sprite.y + (sprite.height / 2) - (delayCount.height / 2);
			this.gnomeCodeGroup.add(delayCount);
		}

		let gnomeCode = this.world.selectedBuilding.gnomeCode;

		let x = startX;
		let y = startY + textObject.height;

		gnomeCode.forEach((command, index) => {
			let sprite = new Phaser.Sprite(this.game, x, y, GnomeCodeEditor.getCommandRenderTexture(this.game, command));
			sprite.inputEnabled = true;
			sprite.input.useHandCursor = true;
			sprite.events.onInputUp.add(() => {
				gnomeCode.splice(index, 1);
				this.drawGnomeCode();
			}, this);
			this.gnomeCodeGroup.add(sprite);
			x += blockwidth;
			if (x >= (startX + (12 * blockwidth))) {
				x = startX;
				y += blockwidth;
			}
		});

		if (this.world.selectedBuilding.model.sizeLimit && gnomeCode.length < this.world.selectedBuilding.model.sizeLimit) {
			for (let i = gnomeCode.length; i < this.world.selectedBuilding.model.sizeLimit; i++) {
				let sprite = new Phaser.Sprite(this.game, x, y, WorldConstants.SPRITE_SHEET, "mushrooms_3"); //TODO placeholder
				this.gnomeCodeGroup.add(sprite);
				x += blockwidth;
				if (x >= (startX + (12 * blockwidth))) {
					x = startX;
					y += blockwidth;
				}
			}
		}
	}

	static getCommandRenderTexture(game: Phaser.Game, command: Command): RenderTexture {
		let rectangle = new Phaser.Graphics(game);
		rectangle.beginFill(GnomeCodeEditor.getCommandFillColor(command));
		rectangle.lineStyle(3, GnomeCodeEditor.getCommandLineColor(command), 1);
		rectangle.drawRoundedRect(3, 3, 72, 72, 8);

		let texture = new RenderTexture(game, 78, 78);
		texture.render(rectangle);
		texture.renderRawXY(new Phaser.Image(game, 0, 0, WorldConstants.SPRITE_SHEET, GnomeCodeEditor.getCommandIconKey(command)), 4, 3);
		return texture;
	}

	static getCommandIconKey(command: Command): string {
		switch (command.type) {
			case CommandType.WALK:
				return "control-straight";
			case CommandType.LEFT:
				return "control-turn-left";
			case CommandType.RIGHT:
				return "control-turn-right";
			case CommandType.ACT:
				return "control-interact";
			case CommandType.CALL_ROUTINE:
				return "library-" + (command.args[0] + 1);
			default:
				return "king-button"; //Unknown command
		}
	}

	static getCommandFillColor(command: Command) {
		if (command.type !== CommandType.CALL_ROUTINE) {
			return 0xFFEE00;
		}

		switch (command.args[0]) {
			case 0: return 0xF19E60;
			case 1: return 0xA189C0;
			case 2: return 0x66C298;
			case 3: return 0xBF8BB5;
			default: return 0xCCCCCC; //no graphics yet
		}
	}

	static getCommandLineColor(command: Command) {
		if (command.type !== CommandType.CALL_ROUTINE) {
			return 0xEEA91E;
		}

		switch (command.args[0]) {
			case 0: return 0xB96C36;
			case 1: return 0x6B5894;
			case 2: return 0x3C9B6E;
			case 3: return 0xAA659E;
			default: return 0x888888; //no graphics yet
		}
	}

}
