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