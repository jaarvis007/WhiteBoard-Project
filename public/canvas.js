let canvas=document.querySelector("canvas");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let pencilColor=document.querySelectorAll(".pencil-color");
let pencilWidthElem=document.querySelector(".pencil-width");
let eraserWidthElem=document.querySelector(".eraser-width");
let download=document.querySelector(".download");
let redo=document.querySelector(".redo");
let undo=document.querySelector(".undo");

let penColor="red";
let eraserColor="white";
let penWidth=pencilWidthElem.value;
let eraserWidth=eraserWidthElem.value;

let undoRedoTracker=[]; //stores graphic action
track=0; //index of above array

let mousedown=false;

//API
let tool = canvas.getContext("2d");

tool.strokeStyle=penColor; //set default size and color
tool.lineWidth=penWidth;

//mousedown->start new path
//mousemove->path fill(graphics)

canvas.addEventListener("mousedown" ,(e)=>{
    mousedown=true;
    // beginPath({
    //     x:e.clientX,
    //     y:e.clientY
    // })

    let  data={
        x:e.clientX,
        y:e.clientY
    }
    socket.emit("beginPath",data);
})

canvas.addEventListener("mousemove" ,(e)=>{
    if(mousedown){
        let data={
            x:e.clientX, 
            y:e.clientY, 
            color: eraserflag? eraserColor:penColor,
            width: eraserflag? eraserWidth:penWidth
        }
        socket.emit("drawStroke",data);
    }
})

canvas.addEventListener("mouseup" ,(e)=>{
    mousedown=false;

    let url=canvas.toDataURL();
    undoRedoTracker.push(url); //insert action into array
})

undo.addEventListener("click", (e) => {
    if (track > 0) track--;
    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("redoUndo",data);
})

redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length-1) track++;
    // track action
    let trackObj = {
        trackValue: track,
        undoRedoTracker
    }
    undoRedoCanvas(trackObj);
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image(); // new image reference element
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj){
    tool.beginPath();
    tool.moveTo(strokeObj.x,strokeObj.y);
}

function drawStroke(strokeObj){
    tool.strokeStyle=strokeObj.color;
    tool.lineWidth=strokeObj.width;
    tool.lineTo(strokeObj.x,strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem)=>{
    colorElem.addEventListener("click",(e)=>{
        let color=colorElem.classList[0];
        penColor=color;
        tool.strokeStyle=penColor;
    })
})

pencilWidthElem.addEventListener("change",(e)=>{
    penWidth=pencilWidthElem.value;
    tool.lineWidth=penWidth;
})

eraserWidthElem.addEventListener("change",(e)=>{
    eraserWidth=eraserWidthElem.value;
    tool.lineWidth=eraserWidth;
})

eraser.addEventListener("click",(e)=>{
     if(eraserflag){
         tool.strokeStyle=eraserColor;
         tool.lineWidth=eraserWidth;
     }

     else{
        tool.strokeStyle=pencilColor;
        tool.lineWidth=penWidth;
     }
})

download.addEventListener("click" ,(e)=>{
    let url=canvas.toDataURL(); //canvas data to url;

    let a = document.createElement("a");
    a.href=url; //download url
    a.download="project.jpg";
    a.click();
})

socket.on("beginPath",(data)=>{
    //data->data
    beginPath(data);  
})

socket.on("drawStroke",(data)=>{
    //tranfer data to all connected computer
    drawStroke(data);  
})

socket.on("redoUndo",(data)=>{
    //tranfer data to all connected computer
    undoRedoCanvas(data);  
})