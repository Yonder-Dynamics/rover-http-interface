
var computeAddress = "127.0.0.1";

var inputElem = document.getElementById("compute-node-input")
inputElem.placeholder = computeAddress;

function httpRequest(addr,method,data,callback){
  const shouldBeAsync = true;

  const request = new XMLHttpRequest();

  request.onload = function () {
     callback(request);
  }

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
        httpRequest(computeAddress,"POST",JSON.stringify({test:"test"}),(request)=>{
          console.log(request.status);
          console.log(request.responseText);
        });
    }
}


const addressForm = document.getElementById("compute-node-form");
addressForm.onsubmit = setLocalComputeAddress;

export {httpRequest};

