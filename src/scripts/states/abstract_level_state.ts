/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>

namespace States {
	const CAMERA_OFFSET_Y = -200;

	export class AbstractLevelState extends Phaser.State {
		create() {
			this.handleSizeChange();
			this.scale.onSizeChange.add(() => this.handleSizeChange());
			this.game.stage.backgroundColor = 0xffffff;
		}

		private handleSizeChange() {
			let offsetX = (-this.game.width + WorldConstants.BLOCK_WIDTH) / 2;
			this.game.camera.setPosition(offsetX, CAMERA_OFFSET_Y);
		}
	}
}
