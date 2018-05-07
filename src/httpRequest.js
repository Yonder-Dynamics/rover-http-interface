// import { builtinModules } from "module";

function request(addr,method,data,callbacks){
    const shouldBeAsync = true;
  
    const request = new XMLHttpRequest();
  
    request.onload = ()=>callbacks.onload(request);
    request.onerror = ()=>callbacks.onerror(request);
  
    request.open(method, "http://"+addr, shouldBeAsync);
  
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
    // Actually sends the request to the server.
    request.send(data);
}

function make_connection(addr){
    return {
        addr:addr,
        request:(method,data,callbacks)=>{
            if(callbacks === undefined){
                callbacks = {
                    onload: ()=>{},
                    onerror:()=>{},
                };
            }
            request(addr,method,data,callbacks);
        }
    }
}
module.exports = make_connection;