// thing from stackoverflow to make it easy to get mouse position on canvas
function relMouseCoords(event){
var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x:x, y:y};
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
//////////////////////