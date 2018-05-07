// scripts for toggling button text and color

//var count = 1;

const make_connection = require("./httpRequest.js");

var toggleKill = function(endpoint) {
  button_elem = document.getElementById("kill");
  if (button_elem.innerHTML === "KILL") {
    button_elem.innerHTML = "UNKILL";
    endpoint.request("POST",JSON.stringify({action:"kill"}))
    // button_elem.innerHTML = '#26C040';
  } else {
    button_elem.innerHTML = "KILL";
    endpoint.request("POST",JSON.stringify({action:"unkill"}))
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

function main(){
  let kill_endpoint = make_connection("127.0.0.1:8002/kill");
  document.getElementById("kill").onclick  = ()=>toggleKill(kill_endpoint);
  document.getElementById("drive").onclick = ()=>toggleDrive();
}

main();
