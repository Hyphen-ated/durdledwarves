// thing from stackoverflow to make it easy to get mouse position on canvas
function relMouseCoords(event){
var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x:x, y:y};
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
//////////////////////


var getHashValue = function(key) {
    var hash = location.hash;
    if (hash.length < 2) return;
    hash = hash.substring(1); //take off the #
    var params = hash.split(",");
    for (var i = 0; i < params.length; ++i) {
        var param = params[i];
        var param_key = param.substring(0, param.indexOf('='));
        if(param_key == key) {
            return param.substring(param.indexOf('=')+1, param.length);
        }
    }
    return null;
};


function wrap(a, size) {
    return (a + size) % size;
}

//got this from http://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
function bresenhamLine(x0, y0, x1, y1, val_id, setPixel){
    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true){
        setPixel(x0,y0, val_id);

        if ((x0==x1) && (y0==y1)) break;
        var e2 = 2*err;
        if (e2 >-dy){ err -= dy; x0  += sx; }
        if (e2 < dx){ err += dx; y0  += sy; }
    }
}