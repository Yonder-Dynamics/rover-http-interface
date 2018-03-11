
var computeAddress = "127.0.0.1:8002";
var tx2 = "100.80.231.5:8002";

const inputElem = document.getElementById("compute-node-input")
inputElem.placeholder = computeAddress;

function httpRequest(addr,method,data,callbacks){
  const shouldBeAsync = true;

  const request = new XMLHttpRequest();

  request.onload = ()=>callbacks.onload(request);
  request.onerror = ()=>callbacks.onerror(request);

  request.open(method, "http://"+addr, shouldBeAsync);

  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // request.setRequestHeader("goalv", "hello world");

  // Actually sends the request to the server.
  request.send(data);
}

function verifyAddress(addr){
    //basic regex to test input
    let regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/;

    if(regex.test(addr)){
        return true;
    }
    return false;
}

function setLocalComputeAddress(e){
    e.stopPropagation();
    e.preventDefault();

    if(verifyAddress(inputElem.value)){
        computeAddress = inputElem.value;
        // httpRequest(computeAddress,"POST",JSON.stringify({test:"test"}),(request)=>{
        //   console.log(request.status);
        //   console.log(request.responseText);
        // });
    }
}

function requestNewPosition(e){
  e.stopPropagation();
  e.preventDefault();
  let x = document.getElementById("request-x").value;
  let y = document.getElementById("request-y").value;
  let z = document.getElementById("request-z").value;

  let request = {
    "action":"set_goal",
    "data":[+x,+y,+z],
  }

  const callbacks = {
    onload: (_request)=>{},
    onerror:(_request)=>{console.error(_request);},
  }

  httpRequest(computeAddress,"POST",JSON.stringify(request),callbacks);

}

function resetConfiguration(e){
  e.stopPropagation();
  e.preventDefault();
  let request = {
    "action":"reset",
  }

  const callbacks = {
    onload: (_request)=>{},
    onerror:(_request)=>{console.error(_request);},
  }

  httpRequest(computeAddress,"POST",JSON.stringify(request),callbacks);
}


const addressForm = document.getElementById("compute-node-form");
addressForm.onclick = setLocalComputeAddress;

const requestForm = document.getElementById("compute-node-request");
requestForm.onclick = requestNewPosition;

const resetButton = document.getElementById("compute-node-reset");
resetButton.onclick = resetConfiguration;

export {httpRequest,computeAddress};

