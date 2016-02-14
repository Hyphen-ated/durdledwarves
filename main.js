//durdle dwarves, a cellular automaton


function wrap(a, size) {
    return (a + size) % size;
}


var id = {
    "_": 1, //blank space
    "S": 2, //stone
    "D": 3, //dwarf
    "G": 4, //green dwarf (initially present or manually placed)
    "*": 5, // for rules: anything
    "X": 6, // for rules: not blank space
    "s": 7, // for rules: not stone
    "d": 8,  // for rules: not dwarf
    "O": 9 //for rules: the acting dwarf
}
//some nice little global state
var w = 180;
var h = 180;
var cell_size = 5;
var paused = true;
var frameskip = 0;
var frame_delay = 0;

var current_world = new Array(w);
for(var x = 0; x < w; ++x) {
    current_world[x] = new Array(h);
    for (var y = 0; y < h; ++y) {
        current_world[x][y] = id['_'];
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
    var val = $('input[name=clickAddition]:checked').val();
    var val_id = id[val];
    current_world[x][y] = val_id;
    drawCell(x, y, val_id);

    hist.latest_idx = hist.curr_idx;
}
canvas.addEventListener('click', clicked, false);
canvas.onmousedown = function(event) { event.preventDefault();};

//when they move the mouse, if they're holding click, then draw like they clicked
function mouseMove(event) {
    if (event.which == 1) {
        clicked(event);
    }
}
canvas.onmousemove = mouseMove;

cell_matching_table = {};
//cell_matching_table[cell_contents][rule_contents]
cell_matching_table[id['G']] = {}
cell_matching_table[id['G']][id["_"]] = false,
cell_matching_table[id['G']][id["S"]] = false,
cell_matching_table[id['G']][id["D"]] = true,
cell_matching_table[id['G']][id["X"]] = true,
cell_matching_table[id['G']][id["s"]] = true,
cell_matching_table[id['G']][id["d"]] = false

cell_matching_table[id['D']] = cell_matching_table[id['G']];

cell_matching_table[id['S']] = {}
cell_matching_table[id['S']][id["_"]] = false,
cell_matching_table[id['S']][id["S"]] = true,
cell_matching_table[id['S']][id["D"]] = false,
cell_matching_table[id['S']][id["X"]] = true,
cell_matching_table[id['S']][id["s"]] = false,
cell_matching_table[id['S']][id["d"]] = true

cell_matching_table[id['_']] = {}
cell_matching_table[id['_']][id["_"]] = true,
cell_matching_table[id['_']][id["S"]] = false,
cell_matching_table[id['_']][id["D"]] = false,
cell_matching_table[id['_']][id["X"]] = false,
cell_matching_table[id['_']][id["s"]] = true,
cell_matching_table[id['_']][id["d"]] = true

function cellMatchesRule(cell_contents, rule_contents) {
    return cell_matching_table[cell_contents][rule_contents]
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
    if (a == id['G'] || b == id['G']) return id['G'];
    if (a == id['D'] || b == id['D']) return id['D'];
    if (a == id['S'] || b == id['S']) return id['S'];
    return id['_'];
}

function applyOutcome(rule, dwarf, new_template) {
    //each rule has a list of outcomes to apply
    for (var i = 0; i < rule.outcome.length; ++i) {
        var new_cell = rule.outcome[i];
        var grid_x = wrap(dwarf.x + new_cell.x, w);
        var grid_y = wrap(dwarf.y + new_cell.y, h);
        var new_letter = new_cell.val;

        if (new_letter == id['O']) {
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

function applyTemplate(old_world, new_world, new_template) {
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var new_letter = new_template[x][y];
            if(new_letter != null) {
                new_world[x][y] = new_letter;
            } else {
                new_world[x][y] = old_world[x][y];
            }
            new_template[x][y] = null;
        }
    }
}


function makeNewWorld(dwarves, old_world, new_world, new_template) {
    for (var i = 0; i < dwarves.length; ++i) {
        advanceDwarf(dwarves[i], old_world, new_template);
    }
    applyTemplate(old_world, new_world, new_template);
    return new_world;
}

var colorsByLetter = {};

colorsByLetter[id["G"]] = "#00FF99";
colorsByLetter[id["D"]] = "#FF9900";
colorsByLetter[id["_"]] = "#050505";
colorsByLetter[id["S"]] = "#999999";


function drawCell(x, y, letter) {
    if(letter != id["_"]) {
        ctx.fillStyle = colorsByLetter[letter];
        ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
    }
}

function drawWorld() {
    ctx.fillStyle = colorsByLetter[id["_"]];
    ctx.fillRect(0, 0, w * cell_size, h * cell_size);
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            drawCell(x, y, letter);
        }
    }
}

// manually handle a circular buffer for history
var hist = {
    size: 1000,
    buffer: new Array(1000),
    curr_idx: 0, //the index into buffer where current_state goes
    earliest_idx: 0, // chronologically earliest of the states in buffer
    latest_idx: 0, // chronologically latest of the states in buffer
    //the current state can be different from the latest state if we're doing rewinding
    curr_gen_number: 0
}

//initialize all the world buffers to be 2d arrays, w x h in size
for(var i = 0; i < hist.size; ++i) {
    hist.buffer[i] = new Array(w);
    for (var j = 0; j < w; ++j) {
        hist.buffer[i][j] = new Array(h);
    }
}

var time_since_render = 9999;
function update() {
    dwarves = [];
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            if (letter == id["G"] || letter == id["D"]) {
                dwarves.push({"x": x, "y": y, "letter": letter});
            }
        }
    }

    hist.curr_idx = wrap(hist.curr_idx + 1, hist.size);


    hist.latest_idx = hist.curr_idx;
    if (hist.curr_idx == hist.earliest_idx) {
        hist.earliest_idx = wrap(hist.earliest_idx + 1, hist.size);
    }

    var new_world_buffer = hist.buffer[hist.curr_idx];
    current_world = makeNewWorld(dwarves, current_world, new_world_buffer, template_buffer);
    hist.buffer[hist.curr_idx] = current_world;

    if (time_since_render > frameskip) {
        drawWorld();
        time_since_render = 1;
    } else {
        ++time_since_render;
    }


    slider.max = wrap(hist.size - hist.earliest_idx, hist.size) + hist.curr_idx;
    slider.value = slider.max;

    if(!paused) {
        setTimeout(update, frame_delay)
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
        //force it to be rendered
        time_since_render = 9999;
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

function updateFrameskip() {
    frameskip = parseInt(document.getElementById('frameskip').value);
}

function updateFrameDelay() {
    frame_delay = parseInt(document.getElementById('framedelay').value);
}

function dumpWorld() {
    var textzone = document.getElementById("textzone");
    var world_json = JSON.stringify(current_world);
    var compressed = LZString.compressToBase64(world_json);
    textzone.value = compressed;
}

function loadWorld() {
    if(!paused) {
        return;
    }
    var textzone = document.getElementById("textzone");
    var compressed = textzone.value;
    var world_json = LZString.decompressFromBase64(compressed);
    current_world = JSON.parse(world_json);
    hist.latest_idx = hist.curr_idx;
    drawWorld();
}

function clearWorld() {
    if (!paused) {
        return;
    }
    for(var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            current_world[x][y] = id['_'];
        }
    }
    drawWorld();
}

function setUpDefaultWorld() {
    if (!paused) {
        return;
    }
    var world_from_hash = getHashValue("world");
    if (world_from_hash != null) {
        textzone.value = world_from_hash;
        loadWorld();
        return;
    }

    for(var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            current_world[x][y] = id['_'];
        }
    }

    for(var i =0; i < w; ++i) {
        current_world[i][h-1] = id['S'];
    }
    current_world[90][h-2] = id['G'];
    drawWorld();
}

//turn the rules into a list of which squares we care about and a list of which squares get changed
function preprocessRules(rule_definitions) {
    var new_rules = [];
    for (var i = 0; i < rule_definitions.length; ++i) {
        var defn = rule_definitions[i];
        var new_pattern = [];
        var new_outcome = [];
        for (var s = 0; s < 25; ++s) {
            if(defn.pattern[s] != "*" && defn.pattern[s] != "O") {
                new_pattern.push({x: s % 5 - 2, y:Math.floor(s / 5) - 2, val:id[defn.pattern[s]]});
            }
            if(defn.outcome[s] != "*") {
                new_outcome.push({x: s % 5 - 2, y:Math.floor(s / 5) - 2, val:id[defn.outcome[s]]});
            }
        }
        new_rules.push({name: defn.name, pattern: new_pattern, outcome: new_outcome});
    }
    return new_rules;
}

var rules = preprocessRules(original_definitions);
setUpDefaultWorld();
hist.buffer[0] = current_world;
drawWorld();