/**
 * Functions for saving/loading the game progress.
 * Local storage can sometimes end up in a corrupted state in Firefox, which would crash the browser if the error
 * wasn't caught. See https://stackoverflow.com/questions/18877643/error-in-local-storage-ns-error-file-corrupted-firefox
 */
namespace SaveGame {
	export function getLevel(): string | null {
		try {
			return localStorage.getItem("lastLevel");
		}
		catch (e) {
			console.error(e);
			return null;
		}
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
