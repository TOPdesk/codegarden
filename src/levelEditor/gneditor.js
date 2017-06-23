let inputArea = document.getElementById("textField");
inputArea.onkeydown = function(e) {
	if(e.keyCode===9 || e.which===9){
		e.preventDefault();
		let s = this.selectionStart;
		this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
		this.selectionEnd = s+1;
	}
};

let loadButton = document.getElementById("loadButton");
loadButton.onclick = () => {
	let stateManager = window.frames[0].codeGarden.state;
	try {
		if (stateManager.current !== "play") {
			stateManager.start("play", true, false, JSON.parse(inputArea.value).LEVEL_DEFINITION);
		}
		else {
			let currentGameWorld = stateManager.states.play.gameWorld;
			currentGameWorld.loadLevelFromDefinition(JSON.parse(inputArea.value).LEVEL_DEFINITION);
		}
	}
	catch (e) {
		alert(e);
	}
	window.frames[0].focus();
};
