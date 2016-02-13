// thing from stackoverflow to make it easy to get mouse position on canvas
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;


function clampx(x) {
    return (x + w) % w;
}
function clampy(y) {
    return (y + h) % h;
}


var w = 150;
var h = 150;
var cell_size = 5;

var current_world = new Array(w);
for(var x = 0; x < w; ++x) {
    current_world[x] = new Array(h);
    for (var y = 0; y < h; ++y) {
        current_world[x][y] = '_';
    }
}

var paused = false;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function cellMatchesRule(cell_contents, rule_contents) {
    if (rule_contents == '*' || rule_contents == 'O') {
        return true;
    }
    // green dwarves count as regular dwarves
    if (cell_contents == 'G') {
        cell_contents = 'D';
    }
    return rule_contents == cell_contents;
}

function ruleTriggered(rule, dwarf, old_world) {
    for (var xd = -2; xd <= 2; ++xd) {
        for(var yd = -2; yd <= 2; ++yd) {
            var grid_x = clampx(dwarf.x + xd);
            var grid_y = clampy(dwarf.y + yd);
            var cell_contents = old_world[grid_x][grid_y];
            var rule_contents = rule.pattern.charAt((xd + 2) + ((yd + 2) * 5));
            if (!cellMatchesRule(cell_contents, rule_contents)) {
                return false;
            }
        }
    }
    return true;
}

function priority(a, b) {
    if (a == 'G' || b == 'G') return 'G';
    if (a == 'D' || b == 'D') return 'D';
    if (a == 'S' || b == 'S') return 'S';
    return '_';
}

function applyOutcome(rule, dwarf, new_world, old_world) {
    for (var xd = -2; xd <= 2; ++xd) {
        for(var yd = -2; yd <= 2; ++yd) {
            var new_letter = rule.outcome.charAt((xd + 2) + ((yd + 2) * 5));
            if(new_letter == '*') {
                continue;
            }
            if(new_letter == 'O') {
                new_letter = dwarf.letter;
            }
            var grid_x = clampx(dwarf.x + xd);
            var grid_y = clampy(dwarf.y + yd);
            var old_cell = old_world[grid_x][grid_y];
            var new_cell = new_world[grid_x][grid_y];
            if(old_cell != new_cell) {
                new_letter = priority(old_cell, new_cell);
            }
            new_world[grid_x][grid_y] = new_letter;
        }
    }
}

function advanceDwarf(dwarf, old_world, new_world) {
    for (var i = 0; i < rules.length; ++i) {
        var rule = rules[i];
        if (ruleTriggered(rule, dwarf, old_world)) {
            applyOutcome(rule, dwarf, new_world, old_world)
            return;
        }
    }
}


function makeNewWorld(dwarves, old_world) {
    //deep copy nested arrays
    var new_world = $.extend(true, [], old_world);
    for (var i = 0; i < dwarves.length; ++i) {
        advanceDwarf(dwarves[i], old_world, new_world);
    }
    return new_world;
}

var colorsByLetter = {
    "G": "#00FF99",
    "D": "#FF9900",
    "_": "#050505",
    "S": "#999999"
}

function update() {
    dwarves = [];
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            ctx.fillStyle = colorsByLetter[letter];
            if (letter == "G" || letter == "D") {
                dwarves.push({"x": x, "y": y, "letter": letter});
            }
            ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size)
        }
    }
    new_world = makeNewWorld(dwarves, current_world);
    current_world = new_world;
    setTimeout(update, 0)
}


for(var i =0; i < w; ++i) {
    current_world[i][h-3] = 'S';
}
current_world[75][h-4] = 'G';
update();