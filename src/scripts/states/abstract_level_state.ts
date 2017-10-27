/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -3 * WorldConstants.BLOCK_WIDTH;
	const CAMERA_OFFSET_Y = -50;
	
	export class AbstractLevelState extends Phaser.State {
		create() {
			this.handleSizeChange();
			this.scale.onSizeChange.add(() => this.handleSizeChange());
			this.game.stage.backgroundColor = 0xffffff;
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
		}

		private handleSizeChange() {
			//Not yet
		}
	}
}
