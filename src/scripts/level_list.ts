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
		"swamp_terrain_tutorial",
	];

	/**
	 * Get the next level. This returns undefined for the last level. If the current level does not have a known position
	 * in the level order, the first level is returned.
	 * @param {string} level the name of the current level
	 */
	export function getNext(level: any): string | undefined {
		let nextLevelIndex = LEVELS.indexOf(level) + 1;
		return LEVELS[nextLevelIndex];
	}
}
