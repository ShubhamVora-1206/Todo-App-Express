var table = document.querySelector("#table1");
const ip = document.getElementById("ip");
var strike=false;
const save= document.getElementById("save");
var fromBut=false;
var heroUrl = "https://todoappexpresswithlogin.herokuapp.com/"
ip.addEventListener("keypress",function(event){
  if(event.key=="Enter"){
  fromBut=true;
  const value = ip.value;
  const request = new XMLHttpRequest();
  console.log("Inside save, sending post request");
  request.open("POST",heroUrl+"todo");
  request.setRequestHeader("Content-Type","application/json");
  request.send(JSON.stringify({text:value,strike:strike}));

  request.addEventListener("load",function(){
    console.log("in request event listener");
    if(request.status===200){
      taskDisplay(value,fromBut);
      ip.value='';

      //TODO add request Listener
     }
    else{
      console.log("error occured");
    }
  })
}
})


const getAllTodoRequests = new XMLHttpRequest();
console.log("Sending get request");
getAllTodoRequests.open("GET",heroUrl+"todo");
getAllTodoRequests.send();

getAllTodoRequests.addEventListener("load",function(){
  fromBut=false;
  console.log("in getAllTodoRequests event listener");
  if (getAllTodoRequests.status===200){
    var todos = JSON.parse(getAllTodoRequests.responseText);
    todos.forEach(function(value){
      console.log(value);
      taskDisplay(value,fromBut)
    })
  }
  else{
    console.log("error in getting all");
  }
})

function taskDisplay(value,fromBut){
  var Row = document.createElement("tr");
  var celltxt = document.createElement("td");
  var celltxt2 = document.createElement("td");
  var compButton = document.createElement("button");
  var delButton = document.createElement("button");
  var editButton = document.createElement("button");
  var delIco = document.createElement("i");
  var editIco = document.createElement("i");
  var compIco = document.createElement("i");

  delIco.className="fa fa-trash";
  editIco.className="fa fa-pencil";
  compIco.className = "fa fa-check";
  
  // compButton.innerText = "Done";
  // // delButton.innerText = "Delete";
  // editButton.innerText = "Edit";
  

  if (fromBut){
  celltxt.innerText = value;
  celltxt.classList.add("p");
  }
  else{
    celltxt.innerText = value.text;
    if(value.strike===true){
      celltxt.style.textDecoration = "line-through";
    }
    celltxt.classList.add("p");
  }
  delButton.appendChild(delIco);
  editButton.appendChild(editIco);
  compButton.appendChild(compIco);
  celltxt2.appendChild(compButton);
  celltxt2.appendChild(editButton);
  celltxt2.appendChild(delButton);
  Row.appendChild(celltxt);
  Row.appendChild(celltxt2);
  table.appendChild(Row);

  // parent.appendChild(elem);
  // parent.appendChild(btn);
  delButton.addEventListener("click",function(){
    deleter(value,fromBut,Row)
    });
  editButton.addEventListener("click",function(){
    editor(value,fromBut,celltxt);
  });
  compButton.addEventListener("click",function(){
    completer(value,fromBut,strike,celltxt);
  })
}


function deleter(value,fromBut,Row){
  const delRequest = new XMLHttpRequest();
  console.log("inside delete btn event listner");
  delRequest.open("POST",heroUrl+"delete");
  delRequest.setRequestHeader("Content-Type","application/json");
  console.log(value);
  if (fromBut){
    delRequest.send(JSON.stringify({text:value}));
  }
  else{
  delRequest.send(JSON.stringify({text:value.text}));
  }

  delRequest.addEventListener("load",function(){
    console.log("bring back after delete");
    if (delRequest.status===200){
    table.removeChild(Row);
    
  }
  else{
    console.log("error in getting all");
  }
})
    // taskDisplay(value,fromBut);
    // window.location.reload();
 }

function editor(value,fromBut,celltxt){
  const editRequest = new XMLHttpRequest();
  console.log("in edit btn");
  editRequest.open("POST",heroUrl+"edit");
  editRequest.setRequestHeader("Content-Type","application/json");
  console.log(value);
  var newValue = prompt("enter new value: ");
  if(fromBut){
    editRequest.send(JSON.stringify({text:value,ntext:newValue}));
  }
  else{
    editRequest.send(JSON.stringify({text:value.text,ntext:newValue}));
  }
  editRequest.addEventListener("load",function(){
    console.log("bring back after edit");
    if (editRequest.status===200){
    celltxt.innerText = newValue;
    
    }
    else{
      console.log("error in getting all");
    }
  })
}

function completer(value,fromBut,strike,celltxt){
  const compRequest = new XMLHttpRequest();
  console.log("in Comp button");
  compRequest.open("POST",herou+"complete");
  compRequest.setRequestHeader("Content-Type","application/json");
  console.log(value);
  if(fromBut){
    compRequest.send(JSON.stringify({text:value,strike:strike}));
  }
  else{
    compRequest.send(JSON.stringify({text:value.text,strike:strike}));
  }
  compRequest.addEventListener("load",function(){
    console.log("bring back after COMPLETE");
    if (compRequest.status===200){
      celltxt.style.textDecoration = "line-through";
  }
  else{
    console.log("error in getting all");
  }
  })
}