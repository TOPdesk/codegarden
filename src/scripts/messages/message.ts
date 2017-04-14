namespace Messages {
	const TEXT_STYLE = { font: "24px MessageFont", fill: "#000",
		align: "left",
		boundsAlignH: "left",
		boundsAlignV: "top",
		wordWrap: true, wordWrapWidth: 800 };

	let messageGroup: Phaser.Group;

	function drawSpeechBubble(game: Phaser.Game, text: Phaser.Text) {
		let speechBubble = new Phaser.Graphics(game);
		speechBubble.lineStyle(2, 0x000000);
		speechBubble.beginFill(0xffffff);

		speechBubble.drawRoundedRect(-110, -270, text.width + 16, text.height, 12);
		speechBubble.endFill();
		return speechBubble;
	}

	/**
	 * Function for showing a message to the player. It stays visible until clicked.
	 * @param game The Phaser game
	 * @param message The message to show
	 * @param options See the MessageOptions interface. All options are optional.
	 */
	export function show(game: Phaser.Game, message: string, options?: MessageOptions) {
		let optionMap = options ? options : {};

		if (!messageGroup) {
			messageGroup = game.add.group(game.world, "message");
		}
		else {
			messageGroup.removeAll();
		}


		let king = messageGroup.add(new Phaser.Sprite(game, -200, -280, "gnome_king"));
		king.animations.add("hover");
		king.animations.play("hover", 10, true);
		game.add.tween(king).to({ y: -275 }, 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1).yoyo(true);

		let text = messageGroup.add(new Phaser.Text(game, -100, -270, message, TEXT_STYLE));

		let speechBubble = drawSpeechBubble(game, text);
		messageGroup.add(speechBubble, false, 0);

		let clickHandler = () => {
			text.destroy();
			king.destroy();
			speechBubble.destroy();
			if (optionMap.callback) {
				optionMap.callback();
			}
		};

		king.inputEnabled = true;
		king.input.useHandCursor = true;
		king.events.onInputDown.add(clickHandler, this);

		text.inputEnabled = true;
		text.input.useHandCursor = true;
		text.events.onInputDown.add(clickHandler, this);
	}

	export interface MessageOptions {
		callback?: () => any; //Function to execute after the player closes the message. Its return value is ignored.
	}
}
