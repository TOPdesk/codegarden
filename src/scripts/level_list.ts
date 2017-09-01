namespace LevelList {
	export const LEVELS = [
		"desert_basics",
		"desert_simple_readonly",
		"desert_mushroom_tutorial",
		"desert_mushroom_book",
		"desert_recursion",
		"desert_sharing",
		"desert_no_cactus_hugging",
		"desert_delay",
		"desert_twin_cactuses",
		"desert_finale",
	];

	/**
	 * Experimental levels are loaded on startup, but are not part of the level order
	 */
	export const EXPERIMENTAL_LEVELS = [
		"swamp_terrain_tutorial",
	];

	/**
	 * Get the next level. This returns undefined for the last level and for levels which are not part of the level order.
	 * @param {string} level the name of the current level
	 */
	export function getNext(level: any): string | undefined {
		if (LEVELS.indexOf(level) === -1) {
			return;
		}
		let nextLevelIndex = LEVELS.indexOf(level) + 1;
		return LEVELS[nextLevelIndex];
	}
}
