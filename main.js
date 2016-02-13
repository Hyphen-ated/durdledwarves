// this is an implementation of

function wrap(a, size) {
    return (a + size) % size;
}

//some nice little global state
var w = 150;
var h = 150;
var cell_size = 5;
var paused = true;


var current_world = new Array(w);
for(var x = 0; x < w; ++x) {
    current_world[x] = new Array(h);
    for (var y = 0; y < h; ++y) {
        current_world[x][y] = '_';
    }
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function clicked(event) {
    //clicking modifies the world, but only when paused.
    if(!paused) {
        return;
    }
    var pos = canvas.relMouseCoords(event);
    var x = Math.floor(pos.x / cell_size);
    var y = Math.floor(pos.y / cell_size);
    var letter = $('input[name=clickAddition]:checked').val();
    current_world[x][y] = letter;
    drawCell(x, y, letter);

    hist.latest_idx = hist.curr_idx;
}
canvas.addEventListener('click', clicked, false);

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
    //check the 5x5 grid of the rule against the world. if they all match, then we trigger
    for (var xd = -2; xd <= 2; ++xd) {
        for(var yd = -2; yd <= 2; ++yd) {
            var grid_x = wrap(dwarf.x + xd, w);
            var grid_y = wrap(dwarf.y + yd, h);
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
            var grid_x = wrap(dwarf.x + xd, w);
            var grid_y = wrap(dwarf.y + yd, h);
            var old_cell = old_world[grid_x][grid_y];
            var new_cell = new_world[grid_x][grid_y];
            if(old_cell != new_cell) {
                new_letter = priority(new_letter, new_cell);
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

function drawCell(x, y, letter) {
    ctx.fillStyle = colorsByLetter[letter];
    ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size)
}

function drawWorld() {
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            drawCell(x, y, letter);
        }
    }
}

// manually handle a circular buffer for history
var hist = {
    size: 500,
    buffer: new Array(500),
    curr_idx: 0, //the index into buffer where current_state goes
    earliest_idx: 0, // chronologically earliest of the states in buffer
    latest_idx: 0 // chronologically latest of the states in buffer
    //the current state can be different from the latest state if we're doing rewinding
}

function update() {
    dwarves = [];
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            if (letter == "G" || letter == "D") {
                dwarves.push({"x": x, "y": y, "letter": letter});
            }
        }
    }
    current_world = makeNewWorld(dwarves, current_world);
    drawWorld();

    hist.curr_idx = wrap(hist.curr_idx + 1, hist.size);
    hist.buffer[hist.curr_idx] = current_world;

    hist.latest_idx = hist.curr_idx;
    if (hist.curr_idx == hist.earliest_idx) {
        hist.earliest_idx = wrap(hist.earliest_idx + 1, hist.size);
    }

    if(!paused) {
        setTimeout(update, 0)
    }
}

function togglePause() {
    if(paused) {
        paused = false;
        update();
    } else {
        paused = true;
    }
}


function previousState() {
    if(!paused || hist.curr_idx == hist.earliest_idx) {
        return;
    }
    hist.curr_idx = wrap(hist.curr_idx - 1, hist.size);
    current_world = hist.buffer[hist.curr_idx];
    drawWorld();
}

function nextState() {
    if(!paused) {
        return;
    }
    //if we have no more precomputed history to advance, then compute a new state
    if(hist.curr_idx == hist.latest_idx) {
        update();
        return;
    }
    hist.curr_idx = wrap(hist.curr_idx + 1, hist.size);
    current_world = hist.buffer[hist.curr_idx];
    drawWorld();
}

function setUpDefaultWorld() {
    for(var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            current_world[x][y] = '_';
        }
    }

    for(var i =0; i < w; ++i) {
        current_world[i][h-1] = 'S';
    }
    current_world[75][h-2] = 'G';
}

//init
setUpDefaultWorld();
drawWorld();