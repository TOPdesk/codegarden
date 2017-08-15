namespace LevelList {
	export const LEVELS = [
		"tutorial_level_1",
		"tutorial_level_2",
		"tutorial_level_3",
		"tutorial_level_4",
		"tutorial_level_5",
		"tutorial_level_6",
		"swamp_level_1",
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
