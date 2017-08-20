const F9_KEYCODE = 120;

let editor = ace.edit("textField");
editor.setTheme("ace/theme/textmate");
editor.session.setMode("ace/mode/json");
editor.session.setUseWrapMode(true);
editor.session.setUseSoftTabs(false);
editor.session.setTabSize(4);

let loadButton = document.getElementById("loadButton");
loadButton.onclick = () => {
	let stateManager = window.frames[0].codeGarden.state;
	let levelDefinition = JSON.parse(editor.getValue()).LEVEL_DEFINITION;
	try {
		if (stateManager.current !== "play") {
			stateManager.start("play", true, false, levelDefinition);
		}
		else {
			let currentGameWorld = stateManager.states.play.gameWorld;
			currentGameWorld.loadLevelFromDefinition(levelDefinition);
		}
	}
	catch (e) {
		alert(e);
	}
	window.frames[0].focus();
};
window.addEventListener("keyup", (event) => {
	if (event.keyCode === F9_KEYCODE) {
		loadButton.onclick();
	}
});
