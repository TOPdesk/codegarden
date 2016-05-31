/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="preload.ts"/>
/// <reference path="play.ts"/>

module States {
  export class BootState extends Phaser.State {

    init() {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
    }

    preload() {
      this.game.load.image('progressBar','assets/images/progressbar.png');
      this.game.load.image('logo', 'assets/images/logo.png');

      this.game.state.add('preload',PreloadState);
      this.game.state.add('play',PlayState);
    }

    create() {
      this.game.state.start('preload'); 
    }
  }
}
