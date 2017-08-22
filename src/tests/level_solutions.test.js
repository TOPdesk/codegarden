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
	 * Test a solution for a given level. This function throws an error in the following situations:
	 * - the level is already won before any gnome moves
	 * - the expected solution doesn't fit in the level's code buildings
	 * - victory doesn't occur within MAX_PROGRAM_TIME moves
	 * @param levelName the filename without extension
	 * @param housePrograms array of the programs for the gnome buildings, in order of occurrence in the level definition.
	 * They should be given as short-hand strings in the same syntax as in the level definition files.
	 * @param libraryPrograms array of the programs for the libraries, in order of occurrence in the level definition
	 */
	function testSolution(levelName, housePrograms = [], libraryPrograms = []) {
		const world = new GameWorld(game);
		world.loadLevelFromDefinition(__levels__[levelName].LEVEL_DEFINITION);
		expect(world.level.checkVictory(), "Level already won on start-up").to.be.false;

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
	
	it("desert_basics can be solved", function() {
		testSolution("desert_basics", ["WWLWWLARA"]);
	});
	
	it("desert_simple_readonly can be solved", function() {
		testSolution("desert_simple_readonly", [READONLY, "WRWWWRWALWLA"]);
	});
	
	it("desert_mushroom_tutorial can be solved", function() {
		testSolution("desert_mushroom_tutorial", ["LWARWWRALA"]);
	});
	
	it("desert_no_cactus_hugging can be solved", function() {
		testSolution("desert_no_cactus_hugging", [READONLY, "WALWWRRWWA"]);
	});
	
	it("desert_mushroom_book can be solved", function() {
		testSolution("desert_mushroom_book", ["0RWWRRAL0"], [READONLY]);
	});
	
	it("desert_sharing can be solved", function() {
		testSolution("desert_sharing", ["W0LWLA", "A0"], ["LWWLA"]);
	});

	it("desert_twin_cactuses can be solved", function() {
		testSolution("desert_twin_cactuses", [READONLY, READONLY], ["R1W11A", READONLY]);
	});
	
	it("desert_delay can be solved", function() {
		testSolution("desert_delay", [READONLY, "0", "WRWLWA"], ["AWA"]);
	});

	it("desert_recursion can be solved", function() {
		testSolution("desert_recursion", [READONLY], ["LWWA", READONLY]);
	});
	
	it("desert_finale can be solved", function() {
		testSolution("desert_finale", ["W0A", "LARWW0LA", "0"], ["ARW1", "WRAL"]);
	});
	
	it("swamp_terrain_tutorial can be solved", function() {
		testSolution("swamp_terrain_tutorial", ["LWWARRWLWWA", "WAWRWALWLA"]);
	});
	
	
});
