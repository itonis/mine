var X_SIZE = 30;
var Y_SIZE = 16;
var BOMB_NUM = 99;
var BLOCK_SIZE =32;
var BORDER_SIZE = 2;

function randomPicks(list, number) {
    for (var i=0; i<number; i++) {
        var j = Math.floor(Math.random()*(list.length-i)) + i;
        var x = list[i];
        list[i] = list[j];
        list[j] = x;
    }
    return list.splice(0, number);
}

function genMap(clickedX, clickedY) {
    var clickedInd = clickedX*Y_SIZE + clickedY;
    var list = [];
    for (var i=0; i<X_SIZE*Y_SIZE; i++) {
        var diff = i-clickedInd;
        if (diff>-2 && diff<2)  continue;
        if (diff>-2-Y_SIZE && diff<2-Y_SIZE) continue;
        if (diff>-2+Y_SIZE && diff<2+Y_SIZE) continue;
        list.push(i);
    }
    var mineInds = randomPicks(list, BOMB_NUM);
    var ret = [];
    for (var x=0; x<X_SIZE; x++) {
        var row = [];
        for (var y=0; y<Y_SIZE; y++) {
            row.push(0);
        }
        ret.push(row);
    }
    for (var i=0; i<mineInds.length; i++) {
        var x = Math.floor(mineInds[i] / Y_SIZE);
        var y = mineInds[i] % Y_SIZE;
        ret[x][y] = 9;
        for (var dx=-1; dx<2; dx++) {
            for (var dy=-1; dy<2; dy++) {
                if (x+dx>X_SIZE-1 || x+dx<0 || y+dy>Y_SIZE-1 || y+dy<0) continue;
                ret[x+dx][y+dy] += 1;
            }
        }
    }
    return ret;
}

function drawBlock(x, y, color) {
    if (x>X_SIZE-1 || y>Y_SIZE-1) return;
    if (x<0 || y<0) return;
    if (flagged[x][y])  return;
    if (opened[x][y])   return;
    context.fillStyle = color;
    context.fillRect((BLOCK_SIZE+BORDER_SIZE)*x, (BLOCK_SIZE+BORDER_SIZE)*y, BLOCK_SIZE, BLOCK_SIZE);
}

function drawNumber(x, y, number) {
    drawBlock(x, y, CLICK_COLOR);
    context.fillStyle = NUMBER_COLORS[number];
    context.fillText(number, (BLOCK_SIZE+BORDER_SIZE)*x+9, (BLOCK_SIZE+BORDER_SIZE)*y+24, BLOCK_SIZE);
}

function drawChunk(centerX, centerY, color) {
    for (var i=-1; i<2; i++)
        for (var j=-1; j<2; j++)
            drawBlock(centerX+j, centerY+i, color);
}

function toggleFlag(x, y) {
    if (x>X_SIZE-1 || y>Y_SIZE-1) return;
    if (x<0 || y<0) return;
    if (opened[x][y])   return;
    if (flagged[x][y]) {
        flagged[x][y] = false;
        flagNum -= 1;
        document.getElementById("flags").innerHTML = BOMB_NUM - flagNum;
        drawBlock(x, y, HIGHLIGHT_COLOR);
    } else {
        drawBlock(x, y, NORMAL_COLOR);
        flagged[x][y] = true;
        flagNum += 1;
        document.getElementById("flags").innerHTML = BOMB_NUM - flagNum;
        context.fillStyle = "#ff0000";
        context.fillRect((BLOCK_SIZE+BORDER_SIZE)*x+BLOCK_SIZE/4, (BLOCK_SIZE+BORDER_SIZE)*y+BLOCK_SIZE/4, BLOCK_SIZE/2, BLOCK_SIZE/2);
    }
}

function openBlock(x, y) {
    if (x>X_SIZE-1 || y>Y_SIZE-1) return;
    if (x<0 || y<0) return;
    if (flagged[x][y])  return;
    if (opened[x][y])   return;
    
    //bomb
    if (map[x][y]>8) {
        onLose();
        return;
    }
    
    drawNumber(x, y, map[x][y]);
    opened[x][y] = true;
    openNum++;
    if (openNum==X_SIZE*Y_SIZE-BOMB_NUM) {
        onWin();
    }
    if (map[x][y]==0) {
        for (var i=-1; i<2; i++)
            for (var j=-1; j<2; j++)
                openBlock(x+j, y+i);
    }
}

function expandNumber(x, y) {
    if (x>X_SIZE-1 || y>Y_SIZE-1) return;
    if (x<0 || y<0) return;
    if (!opened[x][y])  return;
    var flagNum = 0;
    for (var i=-1; i<2; i++) {
        if (y+i<0 || y+i>Y_SIZE-1) continue;
        for (var j=-1; j<2; j++) {
            if (x+j<0 || x+j>X_SIZE-1) continue;
            if (flagged[x+j][y+i]) flagNum++;
        }
    }
    if (flagNum == map[x][y]) {
        for (var i=-1; i<2; i++)
            for (var j=-1; j<2; j++)
                openBlock(x+j, y+i);
    }
}

function bigText(text, fillColor) {
    context.font = "bold 144px Arial";
    context.textAlign = "center";
    context.strokeStyle = "#0e0e0e";
    context.lineWidth = 4;
    context.strokeText(text, (BLOCK_SIZE+BORDER_SIZE)*X_SIZE/2+1, BLOCK_SIZE*10/16*Y_SIZE, 400);
    context.fillStyle = fillColor;
    context.fillText(text, (BLOCK_SIZE+BORDER_SIZE)*X_SIZE/2, BLOCK_SIZE*10/16*Y_SIZE-2, 400);   
}

function detachLiseners() {
    canvas.removeEventListener("mousemove", canvasMouseMove);
    canvas.removeEventListener("mousedown", canvasMouseDown);
    canvas.removeEventListener("mouseup", canvasMouseUp);
}

function onEnd() {
    detachLiseners();
    clearInterval(timer);
    window.setTimeout(function() {
        canvas.addEventListener("mouseup", function(evt){
           window.location.reload();
        });
    }, 250);
}

function onWin() {
    onEnd();
    bigText("WIN", "#ff0000");
}

function onLose() {
    onEnd();
    bigText("LOSE", "#770e0e");
    // window.location.assign("https://youtu.be/4pXfHLUlZf4?t=27");
}

var NORMAL_COLOR = "#2266FF";
var HIGHLIGHT_COLOR = "#88ccFF";
var CLICK_COLOR = "#cccccc";
var BACK_COLOR = "#aaaaaa";
var NUMBER_COLORS =    [CLICK_COLOR,
                        "#0000ff",
                        "#00aa00",
                        "#ee0000",
                        "#110088",
                        "#660000",
                        "#00cccc",
                        "#070707",
                        "#333333"]

var canvas = document.getElementById('mineSweeper');
var context = canvas.getContext('2d');
var title = document.getElementById('title');

var lastBlock = {x:0, y:0};

var pressedL;
var pressedR;
var pressedM;

var flagged;
var opened;
var openNum;
var flagNum;

var timeMill;
var timer;
var INTERVAL = 500;

var map;

function canvasMouseMove(evt) {
    var nowX = Math.floor(evt.offsetX/(BLOCK_SIZE+BORDER_SIZE));
    var nowY = Math.floor(evt.offsetY/(BLOCK_SIZE+BORDER_SIZE));
    
    title.innerHTML='(' + nowX + ", " + nowY + ")";
    if (pressedM || (pressedL&& pressedR)) 
        drawChunk(lastBlock.x, lastBlock.y, NORMAL_COLOR);
    drawBlock(lastBlock.x, lastBlock.y, NORMAL_COLOR);
    
    if (pressedM || (pressedL&&pressedR))
        drawChunk(nowX, nowY, CLICK_COLOR);
    drawBlock(nowX, nowY, pressedL?CLICK_COLOR: HIGHLIGHT_COLOR);
    
    lastBlock.x = nowX;
    lastBlock.y = nowY; 
}
canvas.addEventListener('mousemove', canvasMouseMove);

function canvasMouseDown(evt) {
    evt.preventDefault();
    switch (evt.button) {
        case 0:
            pressedL = true;
            break;
        case 2:
            pressedR = true;
            if (!pressedL)
                toggleFlag(lastBlock.x, lastBlock.y);
            break;
        case 1:
            pressedM = true;
            break;
        default:
    }
    
    if (pressedM || (pressedL&&pressedR)) 
        drawChunk(lastBlock.x, lastBlock.y, CLICK_COLOR);
    drawBlock(lastBlock.x, lastBlock.y, CLICK_COLOR);
}
canvas.addEventListener('mousedown', canvasMouseDown);

function canvasMouseUp(evt) {
    evt.preventDefault();

    switch (evt.button) {
        case 0:
		    if (timer==null) {
				timer = setInterval(function(){
					timeMill += INTERVAL;
					document.getElementById("time").innerHTML = Math.floor(timeMill/1000);
				}, INTERVAL);
			}
			if (!map)   map = genMap(lastBlock.x, lastBlock.y);
            pressedL = false;
            if (pressedR && !pressedM) {
                drawChunk(lastBlock.x, lastBlock.y, NORMAL_COLOR);
                expandNumber(lastBlock.x, lastBlock.y);
            } else {
                openBlock(lastBlock.x, lastBlock.y);
            }
            break;
        case 1:
            pressedM = false;
            if (!(pressedL && pressedR)) {
                drawChunk(lastBlock.x, lastBlock.y, NORMAL_COLOR);
                expandNumber(lastBlock.x, lastBlock.y);
            }
            break;
        case 2:
            pressedR = false;
            if (pressedL && !pressedM) {
                drawChunk(lastBlock.x, lastBlock.y, NORMAL_COLOR);
                expandNumber(lastBlock.x, lastBlock.y);
                drawBlock(lastBlock.x, lastBlock.y, CLICK_COLOR);
            }
            break;
        default:
    }
}
canvas.addEventListener('mouseup', canvasMouseUp);

canvas.oncontextmenu = function(e){e.preventDefault();}
canvas.onselectstart = function () { return false; }
context.fillStyle = BACK_COLOR;

function init() {
	pressedL = false;
	pressedR = false;
	pressedM = false;
	flagged = [];
	opened = [];
	for (var i=0; i<X_SIZE; i++) {
		var list = [];
		var list2 = [];
		for (var j=0; j<Y_SIZE; j++) {
			list.push(false);
			list2.push(false);
	}
    flagged.push(list);
    opened.push(list2);
}
	openNum = 0;
	flagNum = 0;
	timeMill = 0;
	timer = null;

	map = null;
	context.fillRect(0, 0, X_SIZE*BLOCK_SIZE+(X_SIZE-1)*BORDER_SIZE, Y_SIZE*BLOCK_SIZE+(Y_SIZE-1)*BORDER_SIZE);
	for (var i=0; i<Y_SIZE; i++) {
		for (var j=0; j<X_SIZE; j++) {
			drawBlock(j, i, NORMAL_COLOR);
		}
	}
}

context.font = "bold 24px Courier";

init();