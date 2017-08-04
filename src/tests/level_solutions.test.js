/**
 * These tests confirm that the levels have at least one viable solution. If a test fails due to intentional changes,
 * please fix it by coming up with a different solution.
 */
describe("Level solutions:", function() {
	const MAX_PROGRAM_TIME = 50; //If the level still isn't solved after this amount of time, just give up.
	const READONLY = "readonly";
	
	const game = new Game();
	const sandbox = sinon.sandbox.create();
	
	/**
	 * Attempt to fill in the provided program on the building. Throws an error if the program is too long, or if the
	 * building is readonly. The special program "readonly" can be used to test if the building is readonly instead.
	 * @param buildingName the building name which is used for error reporting
	 * @param building a CodeBuilding
	 * @param program the program, in shorthand notation
	 */
	function fillInProgram(buildingName, building, program) {
		if (program === READONLY) {
			if (!building.model.readonly) {
				throw new Error(`${buildingName} was expected to be readonly, but isn't.`);
			}
		}
		else {
			if (building.model.readonly) {
				throw new Error(`${buildingName} was unexpectedly readonly.`);
			}
			
			if (building.model.sizeLimit < program.length) {
				throw new Error(`Expected solution for ${buildingName} is too long. `
					+ `Max commands: ${building.model.sizeLimit} Required commands: ${program.length}`);
			}
			building.loadCodeFromString(program);
		}
	}
	
	/**
	 * Test a solution for a given level. This function throws an error if the solution doesn't succeed within a reasonable
	 * amount of time, or if the number of code buildings in the level doesn't match the expected solution.
	 * @param levelName the filename without extension
	 * @param housePrograms array of the programs for the gnome buildings, in order of occurrence in the level definition.
	 * They should be given as short-hand strings in the same syntax as in the level definition files.
	 * @param libraryPrograms array of the programs for the libraries, in order of occurrence in the level definition
	 */
	function testSolution(levelName, housePrograms = [], libraryPrograms = []) {
		const world = new GameWorld(game);
		world.loadLevelFromDefinition(__levels__[levelName].LEVEL_DEFINITION);
		expect(world.level.houses.length, "Number of houses").to.equal(housePrograms.length);
		expect(world.level.libraries.length, "Number of libraries").to.equal(libraryPrograms.length);
		
		for (let i = 0; i < housePrograms.length; i++) {
			fillInProgram(`House ${i}`, world.level.houses[i], housePrograms[i]);
		}
		for (let i = 0; i < libraryPrograms.length; i++) {
			fillInProgram(`Library ${i}`, world.level.libraries[i], libraryPrograms[i]);
		}
		
		world.spawnGnomes();
		for (let i = 0; i < MAX_PROGRAM_TIME; i++) {
			world.nextTick();
			if (world.levelIsWon) {
				return;
			}
			if (!world.gnomes.length) {
				throw new Error("All gnomes died or ran out of code before the level was solved.");
			}
		}
		throw new Error("Level was not solved after " + MAX_PROGRAM_TIME + " ticks.");
	}
	
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
		testSolution("tutorial_level_1", ["WWLWWLARA"]);
	});
	
	it("desert level 2 can be solved", function() {
		testSolution("tutorial_level_2", [READONLY, "WRWWWRWALWLA"]);
	});
	
	it("desert level 3 can be solved", function() {
		testSolution("tutorial_level_3", ["0RWWRRAL0"], [READONLY]);
	});
	
	it("desert level 4 can be solved", function() {
		testSolution("tutorial_level_4", ["W0LWLA", "A0"], ["LWWLA"]);
	});
	
	it("desert level 5 can be solved", function() {
		testSolution("tutorial_level_5", [READONLY, "0", "WRWLWA"], ["AWA"]);
	});
	
	it("desert level 6 can be solved", function() {
		testSolution("tutorial_level_6", ["W0A", "LARWW0LA", "0"], ["ARW1", "WRAL"]);
	});
	
	it("swamp level 1 can be solved", function() {
		testSolution("swamp_level_1", ["LWWARRWLWWA", "WAWRWALWLA"]);
	});
});