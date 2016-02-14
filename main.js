//durdle dwarves, a cellular automaton


function wrap(a, size) {
    return (a + size) % size;
}

//some nice little global state
var w = 180;
var h = 180;
var cell_size = 5;
var paused = true;


var current_world = new Array(w);
for(var x = 0; x < w; ++x) {
    current_world[x] = new Array(h);
    for (var y = 0; y < h; ++y) {
        current_world[x][y] = '_';
    }
}
var template_buffer = new Array(w);
for(var x = 0; x < w; ++x) {
    template_buffer[x] = new Array(h);
    template_buffer[x].fill(null);
}

var canvas = document.getElementById('canvas');
canvas.width = w * cell_size;
canvas.height = h * cell_size;
var slider = document.getElementById('slider');
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
    // green dwarves count as regular dwarves
    if (cell_contents == 'G') {
        cell_contents = 'D';
    }
    if(rule_contents == 's' && cell_contents != 'S') {
        return true;
    }
    if(rule_contents == 'd' && cell_contents != 'G' && cell_contents != 'D') {
        return true;
    }
    if(rule_contents == 'X' && cell_contents != '_') {
        return true;
    }

    return rule_contents == cell_contents;
}

function ruleTriggered(rule, dwarf, old_world) {
    //each rule has a list of cells to check. if they all match, we trigger
    for (var i = 0; i < rule.pattern.length; ++i) {
        var rule_cell = rule.pattern[i];
        var grid_x = wrap(dwarf.x + rule_cell.x, w);
        var grid_y = wrap(dwarf.y + rule_cell.y, h);
        var cell_contents = old_world[grid_x][grid_y];
        if (!cellMatchesRule(cell_contents, rule_cell.val)) {
            return false;
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

function applyOutcome(rule, dwarf, new_template) {
    //each rule has a list of outcomes to apply
    for (var i = 0; i < rule.outcome.length; ++i) {
        var new_cell = rule.outcome[i];
        var grid_x = wrap(dwarf.x + new_cell.x, w);
        var grid_y = wrap(dwarf.y + new_cell.y, h);
        var new_letter = new_cell.val;

        if (new_letter == 'O') {
            new_letter = dwarf.letter;
        }

        new_template[grid_x][grid_y] = priority(new_letter, new_template[grid_x][grid_y]);
    }
}

function advanceDwarf(dwarf, old_world, new_template) {
    for (var i = 0; i < rules.length; ++i) {
        var rule = rules[i];
        if (ruleTriggered(rule, dwarf, old_world)) {
            applyOutcome(rule, dwarf, new_template)
            return;
        }
    }
}

function applyTemplate(new_template, world) {
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var new_letter = new_template[x][y];
            if(new_letter) {
                world[x][y] = new_letter;
            }
            new_template[x][y] = null;
        }
    }
}


function makeNewWorld(dwarves, old_world, new_template) {

    //deep copy nested arrays
    var new_world = $.extend(true, [], old_world);
    for (var i = 0; i < dwarves.length; ++i) {
        advanceDwarf(dwarves[i], old_world, new_template);
    }
    applyTemplate(new_template, new_world);
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
    latest_idx: 0, // chronologically latest of the states in buffer
    //the current state can be different from the latest state if we're doing rewinding

    curr_gen_number: 0
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
    current_world = makeNewWorld(dwarves, current_world, template_buffer);
    drawWorld();

    hist.curr_idx = wrap(hist.curr_idx + 1, hist.size);
    hist.buffer[hist.curr_idx] = current_world;

    hist.latest_idx = hist.curr_idx;
    if (hist.curr_idx == hist.earliest_idx) {
        hist.earliest_idx = wrap(hist.earliest_idx + 1, hist.size);
    }

    slider.max = wrap(hist.size - hist.earliest_idx, hist.size) + hist.curr_idx;
    slider.value = slider.max;

    if(!paused) {
        setTimeout(update, 0)
    }
}

function togglePause() {
    if(paused) {
        paused = false;
        slider.disabled = true;
        update();
    } else {
        paused = true;
        slider.disabled = false;
    }
}


function previousState() {
    if(!paused || hist.curr_idx == hist.earliest_idx) {
        return;
    }
    hist.curr_idx = wrap(hist.curr_idx - 1, hist.size);
    current_world = hist.buffer[hist.curr_idx];
    slider.value--;
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
    slider.value++;
    drawWorld();
}

function sliderChange() {
    hist.curr_idx = wrap(hist.earliest_idx + parseInt(slider.value), hist.size);
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
    current_world[90][h-2] = 'G';
}

//init

//preprocess rule definitions so we have a list of which squares we care about in rules
var rules = [];

for (var i = 0; i < rule_definitions.length; ++i) {
    var defn = rule_definitions[i];
    var new_pattern = [];
    var new_outcome = [];
    for (var s = 0; s < 25; ++s) {
        if(defn.pattern[s] != "*" && defn.pattern[s] != "O") {
            new_pattern.push({x: s % 5 - 2, y:Math.floor(s / 5) - 2, val:defn.pattern[s]});
        }
        if(defn.outcome[s] != "*") {
            new_outcome.push({x: s % 5 - 2, y:Math.floor(s / 5) - 2, val:defn.outcome[s]});
        }
    }
    rules.push({name: defn.name, pattern: new_pattern, outcome: new_outcome});
}


setUpDefaultWorld();
hist.buffer[0] = current_world;
drawWorld();