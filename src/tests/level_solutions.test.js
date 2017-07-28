const MAX_PROGRAM_TIME = 50; //If the level still isn't solved after this amount of time, just give up.
let game = new Game();

/**
 * Test a solution for a given level. This function throws an error if the solution doesn't succeed within a reasonable
 * amount of time, or if the number of code buildings in the level doesn't match the expected solution.
 * @param levelName the filename without extension
 * @param housePrograms the programs for the gnome buildings, in order of occurrence in the level definition
 * @param libraryPrograms the programs for the libraries, in order of occurrence in the level definition
 */
function testSolution(levelName, housePrograms = [], libraryPrograms = []) {
	const world = new GameWorld(game);
	
	world.loadLevelFromDefinition(__levels__[levelName].LEVEL_DEFINITION);
	expect(world.level.houses.length, "Number of houses").to.equal(housePrograms.length);
	expect(world.level.libraries.length, "Number of libraries").to.equal(libraryPrograms.length);
	for (let i = 0; i < housePrograms.length; i++) {
		world.level.houses[i].loadCodeFromString(housePrograms[i]);
	}
	for (let i = 0; i < libraryPrograms.length; i++) {
		world.level.libraries[i].loadCodeFromString(libraryPrograms[i]);
	}
	world.spawnGnomes();
	for (let i = 0; i < MAX_PROGRAM_TIME; i++) {
		world.nextTick();
		if (world.levelIsWon) {
			return;
		}
		if (!world.gnomes.length) {
			throw new Error("All gnomes died or ran out of code");
		}
	}
	throw new Error("Level was not solved after " + MAX_PROGRAM_TIME + " ticks.");
}

describe("Level solutions:", function() {
	const sandbox = sinon.sandbox.create();
	
	before(function() {
		//Stub out some graphics-related functionalities in Phaser to avoid log spam
		sandbox.stub(Phaser.Animation.prototype, "play");
		sandbox.stub(Phaser.Cache.prototype, "getImage").callsFake(function() {
			return this.getItem("__missing", Phaser.Cache.IMAGE, "getImage");
		});
		let consoleWarn = console.warn;
		sandbox.stub(console, "warn").callsFake(function(value) {
			if (value.indexOf("Cannot set frameName:") === 0) {
				return; //Silence warnings about missing frames
			}
			consoleWarn(value);
		});
	});
	
	after(function() {
		sandbox.resetBehavior();
	});
	
	it("desert level 1 can be solved", function() {
		testSolution("tutorial_level_1", ["wwlwwlara"]);
	});
});
