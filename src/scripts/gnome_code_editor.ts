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
		this.drawCommands();

		this.gnomeCodeGroup = game.add.group();
		this.gnomeCodeGroup.fixedToCamera = true;
		this.drawGnomeCode();

		this.world.selectionListener = () => {
			this.drawGnomeCode();
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
		this.drawButton(100, 100, "button-straight", new Command(CommandType.WALK));
		this.drawButton(15, 175, "button-turn-left", new Command(CommandType.LEFT));
		this.drawButton(100, 175, "button-interact", new Command(CommandType.ACT));
		this.drawButton(185, 175, "button-turn-right", new Command(CommandType.RIGHT));

		//TODO add library buttons (dependent on libraries in current level)
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

	//TODO: tooltips, hint to select a building, show delay, placeholders, better readonly styling, frame around code
	drawGnomeCode() {
		this.gnomeCodeGroup.removeAll(true);
		if (!this.world.selectedBuilding) {
			this.commandsGroup.visible = false;
			return;
		}

		let readonly = this.world.selectedBuilding.model.readonly;
		this.commandsGroup.visible = !readonly;
		if (readonly) {
			let message = (this.world.selectedBuilding.model.type === "LIBRARY") ?
				"This library routine can't be changed" : "This gnome's routine can't be changed";
			let textObject = new Phaser.Text(this.game, 10, 270, message, Messages.TEXT_STYLE);
			this.gnomeCodeGroup.add(textObject);
			textObject.wordWrapWidth = WorldConstants.MINIMUM_GAME_WIDTH;
		}


		let gnomeCode = this.world.selectedBuilding.gnomeCode;
		let x = 10;
		let y = 300;
		gnomeCode.forEach((command, index) => {
			let sprite = new Phaser.Sprite(this.game, x, y, GnomeCodeEditor.getCommandRenderTexture(this.game, command));
			sprite.inputEnabled = true;
			sprite.input.useHandCursor = true;
			sprite.events.onInputUp.add(() => {
				gnomeCode.splice(index, 1);
				this.drawGnomeCode();
			}, this);
			this.gnomeCodeGroup.add(sprite);
			x += 80;
			if (x > 375) {
				x = 10;
				y += 80;
			}
		});
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
				return "library-" + command.args[0];
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
