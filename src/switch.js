// scripts for toggling button text and color

//var count = 1;

var toggleKill = function() {
  button_elem = document.getElementById("kill");
   if (button_elem.innerHTML === "KILL") {
	button_elem.innerHTML = "UNKILL";
        // button_elem.innerHTML = '#26C040';
	
  } else {
	button_elem.innerHTML = "KILL";
	// button_elem.innerHTML = '#FF000';
  }
}

// red - #FC4545, #FF0000
// green - #26C040

var toggleDrive = function () {
  button_elem = document.getElementById("drive");
  if (button_elem.innerHTML === "DRIVE") {
	button_elem.innerHTML = "ARM";
  } else {
	button_elem.innerHTML = "DRIVE";
  }
}

document.getElementById("kill").onclick = toggleKill;
document.getElementById("drive").onclick = toggleDrive;
