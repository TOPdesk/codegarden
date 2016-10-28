namespace Messages {
	/**
	 * Function for showing a message to the player. It stays visible until clicked.
	 * @param message The message to show
	 */
	export function show(message: string) {
		let messageArea = document.getElementById("outerMessageArea");
		let textPart = document.getElementById("innerMessageArea");
		messageArea.style.display = "block";
		textPart.innerText = message;

		let handleClick = () => {
			messageArea.style.display = "none";
			messageArea.removeEventListener("click", handleClick);
		};
		messageArea.addEventListener("click", handleClick);
	}
}
