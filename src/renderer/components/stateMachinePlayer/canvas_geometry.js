import _ from 'lodash'

const canvasPadding = 2;
const lineWidth = 2;
const strokeStyle = '#a0a0a0';
const fillStyle = 'rgba(255, 255, 255, 0)'; // "#fff"; 不透明

export const creatGeometry = (type,width,height,color) => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    switch (type){
        case "fillet_rectangle":
            creatFilletRectangle(ctx,width,height,color);
            break;
        case "diamond":
            creatDiamond(ctx,width,height,color);
            break;
        case "circle":
            creatCircle(ctx,width,height,color);
            break;
    }
    return canvas
}

export const updateGeometry = (canvas,type,width,height,color) => {
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect( 0 , 0 , width, height);
    switch (type){
        case "fillet_rectangle":
            creatFilletRectangle(ctx,width,height,color);
            break;
        case "diamond":
            creatDiamond(ctx,width,height,color);
            break;
        case "circle":
            creatCircle(ctx,width,height,color);
            break;
    }
}

function creatCircle(ctx,w,h,color){
    let r = (w - canvasPadding*2)/2;
    let xy = canvasPadding + r;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color||strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.arc(xy,xy,r,0,2*Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function creatDiamond(ctx,w,h,color){
    let width = w - canvasPadding*2, height = h - canvasPadding*2;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color||strokeStyle;
    ctx.fillStyle = color||fillStyle;
    let ox = canvasPadding + width/2,oy = canvasPadding;
    ctx.moveTo(ox,oy);
    ctx.lineTo(ox + width/2, oy + height/2);
    ctx.lineTo(ox, oy + height);
    ctx.lineTo(canvasPadding, oy + height/2);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function creatFilletRectangle(ctx,w,h,color){
    let ox = canvasPadding,oy = canvasPadding, r = 10;
    let width = w - canvasPadding*2, height = h - canvasPadding*2;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color||strokeStyle;
    ctx.fillStyle = fillStyle;
    //ctx.lineCap="round";
    let x1 = ox + r,y1 = oy;
    ctx.moveTo(x1,y1);
    let x2 = x1 + width - r*2, y2 = y1;
    ctx.lineTo(x2, y2);
    let x3 = x2 + r, y3 = y2, x4 = x3, y4 = y3 + r;
    ctx.arcTo(x3, y3, x4, y4, r);
    let x5 = x4, y5 = y4 + height - r*2;
    ctx.lineTo(x5, y5);
    let x6 = x5, y6 = y5 + r, x7 = x2, y7 = y6;
    ctx.arcTo(x6, y6, x7, y7, r);
    let x8 = x1, y8 = y7;
    ctx.lineTo(x8,y8);
    let x9 = ox, y9 = y8, x10 = x9, y10 = y5;
    ctx.arcTo(x9, y9, x10, y10, r);
    let x11 = x10, y11 = y4;
    ctx.lineTo(x11,y11);
    ctx.arcTo(ox, oy, x1, y1, r);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}


function drawGrid(canvas,width,height,spacing,boldIndex){
    let ctx = canvas.getContext("2d");
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.style.background = '#ffffff';
    canvas.width = width;
    canvas.height = height;
    //横向绘制
    let columnNumber = Math.floor(width/spacing);
    for(let i=0;i<=columnNumber;i++){
        ctx.beginPath();
        ctx.lineWidth = 1;
        let x = i*spacing;
        ctx.strokeStyle = "#f6f6f6";
        if((i+1)%boldIndex==0){
            ctx.strokeStyle = "#ededed";
        }
        ctx.moveTo(x,0);
        ctx.lineTo(x,height);
        ctx.stroke();
        ctx.closePath();
    }


    //纵向绘制
    let rowNumber = Math.floor(height/spacing);
    for(let i=0;i<=rowNumber;i++){
        ctx.beginPath();
        ctx.lineWidth = 1;
        let y = i*spacing;
        ctx.strokeStyle = "#f6f6f6";
        if((i+1)%boldIndex==0){
            ctx.strokeStyle = "#ededed";
        }
        ctx.moveTo(0,y);
        ctx.lineTo(width,y);
        ctx.stroke();
        ctx.closePath();
    }
}

export const updateCanvasGrid = (canvas,width,height,spacing,boldIndex) =>{
    drawGrid(canvas,width,height,spacing,boldIndex)
}

export const creatCanvasGrid = (width,height,spacing,boldIndex) =>{
    let canvas = document.createElement("canvas");
    drawGrid(canvas,width,height,spacing,boldIndex)
    return canvas
}

export const creatArrowLine = (p0,p1,lineWidth) => {
    let canvas = document.createElement("canvas");
    let position = drawArrow(canvas,p0,p1,lineWidth);
    return {
        canvas: canvas,
        top: position.top,
        left: position.left
    }
}

export const updateArrowLine = (canvas,p0,p1,lineWidth,color) => {
    let ctx = canvas.getContext("2d");
    ctx.clearRect( 0 , 0 , canvas.width, canvas.height);
    let position = drawArrow(canvas,p0,p1,lineWidth,color);
    return {
        top: position.top,
        left: position.left
    }
}

function drawArrow(canvas,p0,p1,lineWidth,color){
    let ctx = canvas.getContext("2d");
    let w = Math.abs(p0.x - p1.x), h = Math.abs(p0.y - p1.y);
    canvas.width = w<6?20:w+12;
    canvas.height = h<6?20:h+12;
    let top = 0, left = 0;
    ctx.beginPath();
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color||strokeStyle;
    //四种情况
    if(p1.x >= p0.x && p1.y >= p0.y){
        ctx.translate(6,6);
        top = p0.y-6;
        left = p0.x-6;
    }else if(p1.x >= p0.x && p1.y < p0.y){
        ctx.translate(6,h+6);
        top = p0.y-h-6;
        left = p0.x-6;
    }else if(p1.x < p0.x && p1.y < p0.y){
        ctx.translate(w+6,h+6);
        top = p0.y - h - 6;
        left = p0.x - w - 6;
    }else{
        ctx.translate(w+6,6);
        top = p0.y-6;
        left = p0.x-w-6;
    }
    ctx.moveTo(0,0);
    ctx.lineTo(p1.x-p0.x,p1.y - p0.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
   // 绘制箭头
    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = color||strokeStyle;
    if(p1.x >= p0.x && p1.y >= p0.y){
        ctx.translate(w+6,h+6);
    }else if(p1.x >= p0.x && p1.y < p0.y){
        ctx.translate(w+6,6);
    }else if(p1.x < p0.x && p1.y < p0.y){
        ctx.translate(6,6);
    }else{
        ctx.translate(6,h+6);
    }
    let deg = getVectorIncludedAngle({x: p1.x-p0.x, y: p1.y - p0.y}, {x: 2, y: 0}, {x: 0, y: 0});
    ctx.rotate(-deg*Math.PI/180);
    ctx.moveTo(0,0);
    ctx.lineTo(-10,-6);
    ctx.lineTo(-10,6);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    return {left: left, top: top}
}

export const  shortcutKeys = {
                32: 'space',
                187: '+',
                189: '-'
            }

//获取两点间距离
export function getLengthFromTwoPoint(p1, p2) {
    let l = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    return parseFloat(l.toFixed(2))
}

//获取最近点
export function getMinPoint(p0, arr) {
    let lengths = [];
    for(let i=0;i<arr.length;i++){
        lengths.push({
            x: arr[i].x,
            y: arr[i].y,
            length: getLengthFromTwoPoint(p0,arr[i]),
            index: i
        })
    }
    return _.minBy(lengths, function(o) { return o.length; });
}

//向量夹角
export const getVectorIncludedAngle = function(p1,p2,o){
    let v1 = {x: p1.x - o.x, y: p1.y - o.y};
    let v2 = {x: p2.x - o.x, y: p2.y - o.y};
    let v1L = Math.sqrt(Math.pow(v1.x,2)+Math.pow(v1.y,2));
    let v2L = Math.sqrt(Math.pow(v2.x,2)+Math.pow(v2.y,2));
    let r = (v1.x*v2.x+v1.y*v2.y)/(v1L*v2L)
    let rad = Math.acos(r>1?1:r);
    let direction = (v1.x*v2.y-v2.x*v1.y)>0?1:-1;
    return direction*rad*180/Math.PI
}

//计算点到线距离
export const getDistanceFromLinePoint = function(p,line){
    //得出直线公式
    let k = (line.y2 - line.y1)/(line.x2 - line.x1);
    let b = line.y1 - k*line.x1;
    let A = k,B = -1, C = b;
    return Math.abs(A*p.x + B*p.y + C)/Math.sqrt(Math.pow(A,2) + Math.pow(B,2));
}

//判断点是否在多边形
export const  isInsidePolygon = (pt, poly) => {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}