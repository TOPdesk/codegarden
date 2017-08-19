namespace LevelList {
	export const LEVELS = [
		"desert_basics",
		"desert_simple_readonly",
		"desert_mushroom_book",
		"desert_sharing",
		"desert_delay",
		"desert_finale",
	];

	/**
	 * Experimental levels are loaded on startup, but are not part of the level order
	 */
	export const EXPERIMENTAL_LEVELS = [
		"desert_no_cactus_hugging",
		"desert_recursion",
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
