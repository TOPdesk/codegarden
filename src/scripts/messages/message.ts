namespace Messages {
	/**
	 * Function for showing a message to the player. It stays visible until clicked.
	 * @param message The message to show
	 * @param options See the MessageOptions interface. All options are optional.
	 */
	export function show(message: string, options?: MessageOptions) {
		let optionMap = options ? options : {};
		let messageArea = document.getElementById("outerMessageArea");
		let textPart = document.getElementById("innerMessageArea");
		messageArea.style.display = "block";
		textPart.innerText = message;

		let handleClick = () => {
			messageArea.style.display = "none";
			if (optionMap.callback) {
				optionMap.callback();
			}
			messageArea.removeEventListener("click", handleClick);
		};
		messageArea.addEventListener("click", handleClick);
	}

	export interface MessageOptions {
		callback?: () => any; //Function to execute after the player closes the message. Its return value is ignored.
	}
}
