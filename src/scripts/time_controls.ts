const TIME_X_BUTTON_OFFSET = 90;
const TIME_Y_BUTTON_OFFSET = 10;
const TIME_X_BUTTON_DISTANCE = 50;

enum TimerState {
	PAUSED, SLOW, FAST
}

/**
 * Allows the player to control the flow of time in the world by clicking buttons.
 */
class TimeControls {
	private xButtonOffset = TIME_X_BUTTON_OFFSET;
	private timerState = TimerState.PAUSED;

	private timer: Phaser.Timer;

	private playSlowButton: Phaser.Sprite;
	private playFastButton: Phaser.Sprite;

	constructor (private game: Phaser.Game, private world: GameWorld, private victoryCallback) {
		this.drawButton("stop-button", () => this.reset());
		this.drawButton("1-step-button", () => this.takeSingleStep());
		this.playSlowButton = this.drawButton("play-button", () => this.playSlowOrPause());
		this.playFastButton = this.drawButton("play-fast-button", () => this.playFastOrPause());
	}

	private drawButton(pictureKey, trigger: Function): Phaser.Sprite {
		let button = this.game.add.sprite(this.xButtonOffset, TIME_Y_BUTTON_OFFSET, WorldConstants.SPRITE_SHEET, pictureKey);
		this.xButtonOffset += TIME_X_BUTTON_DISTANCE;

		button.inputEnabled = true;
		button.fixedToCamera = true;
		button.events.onInputDown.add(trigger, this);
		button.input.useHandCursor = true;
		return button;
	}

	reset() {
		this.stopTimer();
		this.world.resetGame();
	}

	stopTimer() {
		if (this.timer) {
			this.timer.destroy();
			this.timer = null;
		}
		this.timerState = TimerState.PAUSED;
		this.playSlowButton.loadTexture(WorldConstants.SPRITE_SHEET, "play-button");
		this.playFastButton.loadTexture(WorldConstants.SPRITE_SHEET, "play-fast-button");
	}

	playSlowOrPause() {
		let oldTimerState = this.timerState;
		this.stopTimer();
		if (oldTimerState !== TimerState.SLOW) {
			this.timerState = TimerState.SLOW;
			this.startWorldTimer(WorldConstants.SLOW_TURN_LENGTH);
			this.playSlowButton.loadTexture(WorldConstants.SPRITE_SHEET, "pause-button");
		}
	}

	playFastOrPause() {
		let oldTimerState = this.timerState;
		this.stopTimer();
		if (oldTimerState !== TimerState.FAST) {
			this.timerState = TimerState.FAST;
			this.startWorldTimer(WorldConstants.FAST_TURN_LENGTH);
			this.playFastButton.loadTexture(WorldConstants.SPRITE_SHEET, "pause-button");
		}
	}

	takeSingleStep() {
		if (!this.world.hasLivingGnomes()) {
			this.reset();
			this.world.spawnGnomes();
		}
		else {
			this.stopTimer();
			this.takeStepAndHandleResults();
		}
	}

	private startWorldTimer(stepLength: number) {
		if (!this.world.hasLivingGnomes()) {
			this.world.resetGame();
			this.world.spawnGnomes();
		}

		this.timer = this.game.time.create();
		this.timer.loop(stepLength, () => {
			this.takeStepAndHandleResults();
		});
		this.timer.start();
	}

	private takeStepAndHandleResults() {
		let wasWon = this.world.levelIsWon;
		this.world.nextTick();
		if (!wasWon && this.world.levelIsWon) {
			this.victoryCallback();
		}
		else if (!this.world.hasLivingGnomes()) {
			this.stopTimer();
		}
	}
}

