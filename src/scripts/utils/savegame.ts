/**
 * Functions for saving/loading the game progress.
 * Local storage can sometimes end up in a corrupted state in Firefox, which would crash the browser if the error
 * wasn't caught. See https://stackoverflow.com/questions/18877643/error-in-local-storage-ns-error-file-corrupted-firefox
 */
namespace SaveGame {
	/**
	 * @returns {string} The name of the player's current level. If the player has no saved progress, the first level
	 * is returned.
	 */
	export function getLevel(): string {
		try {
			let level = localStorage.getItem("lastLevel");
			if (LevelList.LEVELS.indexOf(level) !== -1) {
				return level;
			}
		}
		catch (e) {
			console.error(e);
		}
		return LevelList.LEVELS[0];
	}

	export function setLevel(level: string) {
		try {
			if (!level) {
				localStorage.removeItem("lastLevel");
			}
			else {
				localStorage.setItem("lastLevel", level);
			}
		}
		catch (e) {
			console.error(e);
		}
	}
}
