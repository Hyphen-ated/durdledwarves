//durdle dwarves, a cellular automaton

var paused = true;
var frameskip = 0;
var frame_delay = 0;
var show_uses = true;

var population_history = [];

var canvas = document.getElementById('canvas');
canvas.width = w * cell_size;
canvas.height = h * cell_size;
var slider = document.getElementById('slider');
var ctx = canvas.getContext('2d');

var lastSettingX = null;
var lastSettingY = null;

function setSingleSquareFromCursor(x, y, val_id) {
    current_world[x][y] = val_id;
    drawCell(x, y, val_id);
}
function setAtCursor(event) {
    //clicking modifies the world, but only when paused.
    if(paused) {

        var pos = canvas.relMouseCoords(event);

        var x = Math.floor(pos.x / cell_size);
        var y = Math.floor(pos.y / cell_size);
        var val = $('input[name=clickAddition]:checked').val();
        var val_id = id[val];
        //draw a line between the previous location and this one, so there aren't gaps if you drag quickly when drawing
        if(lastSettingX != null) {
            bresenhamLine(x, y, lastSettingX, lastSettingY, val_id, setSingleSquareFromCursor)
        } else {
            setSingleSquareFromCursor(x, y, val_id);
        }

        hist.latest_idx = hist.curr_idx;
        lastSettingX = x;
        lastSettingY = y;
    }
}


canvas.addEventListener('click', setAtCursor, false);
canvas.onmousedown = function(event) {
    // this stops click-drag from making the browser try to do text selection (so it doesn't mess with our drawing)
    event.preventDefault();
    //and if we just had a mousedown, that means we're done with any previous drawing
    lastSettingX = null;
    lastSettingY = null;
};

//when they move the mouse, if they're holding click, then draw like they clicked
function mouseMove(event) {
    if (event.buttons == 1) {
        setAtCursor(event);
    }
}
canvas.onmousemove = mouseMove;

// little optimization, we look up into this table instead of doing a bunch of nested if checks
cell_matching_table = {};
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

// checks to see if what's actually present in the world matches what a rule is looking for
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

// when multiple rules try to draw to a new location, dwarves get priority, then stone
function priority(a, b) {
    if (a == id['G'] || b == id['G']) return id['G'];
    if (a == id['D'] || b == id['D']) return id['D'];
    if (a == id['S'] || b == id['S']) return id['S'];
    return id['_'];
}

// we've determined that this dwarf is performing this rule, so write what he's doing into the template
function applyOutcome(rule, dwarf, new_template) {
    //each rule has a list of outcomes to apply
    for (var i = 0; i < rule.outcome.length; ++i) {
        var new_cell = rule.outcome[i];
        var grid_x = wrap(dwarf.x + new_cell.x, w);
        var grid_y = wrap(dwarf.y + new_cell.y, h);
        var new_letter = new_cell.val;

        // O is a special symbol in rules that means "the dwarf performing the rule moves here"
        // that dwarf might have been a G or D (green or normal)
        if (new_letter == id['O']) {
            new_letter = dwarf.letter;
        }

        new_template[grid_x][grid_y] = priority(new_letter, new_template[grid_x][grid_y]);
    }
    rule.uses++;
}

//figure out what this dwarf is going to do
function advanceDwarf(dwarf, old_world, new_template) {
    for (var i = 0; i < rules.length; ++i) {
        var rule = rules[i];
        if (ruleTriggered(rule, dwarf, old_world)) {
            applyOutcome(rule, dwarf, new_template)
            return;
        }
    }
}

//once all the dwarves have written their actions into a template,
//we write it on top of the old worldstate to get the new worldstate
function applyTemplate(old_world, new_world, new_template) {
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var new_letter = new_template[x][y];
            if(new_letter != null) {
                new_world[x][y] = new_letter;
            } else {
                new_world[x][y] = old_world[x][y];
            }
            //to save a little time, we clear out the template now to re-use it again
            new_template[x][y] = null;
        }
    }
}

// find all the dwarves in the world and apply the rules for each one, returning a new world
// to avoid excessive allocations, also takes existing 2d arrays for the new world and for a template scratch space
function advanceWorld(old_world, new_world_buffer, new_template_buffer) {
    var population = 0;
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            if (letter == id["G"] || letter == id["D"]) {
                var dwarf = {x: x, y: y, letter: letter};
                advanceDwarf(dwarf, old_world, new_template_buffer);
                ++population;
            }
        }
    }

    applyTemplate(old_world, new_world_buffer, new_template_buffer);
    new_world_buffer.gen = old_world.gen + 1;

    population_history[new_world_buffer.gen] = population;

    return new_world_buffer;
}

var colorsByLetter = {};
colorsByLetter[id["G"]] = "#00FF99";
colorsByLetter[id["D"]] = "#FF9900";
colorsByLetter[id["_"]] = "#050505";
colorsByLetter[id["S"]] = "#999999";


function drawCell(x, y, letter) {
    ctx.fillStyle = colorsByLetter[letter];
    ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
}

function drawWorld() {
    ctx.fillStyle = colorsByLetter[id["_"]];
    ctx.fillRect(0, 0, w * cell_size, h * cell_size);
    for (var x = 0; x < w; ++x) {
        for (var y = 0; y < h; ++y) {
            var letter = current_world[x][y];
            if(letter != id["_"]) {
                drawCell(x, y, letter);
            }
        }
    }

    var generation_display = document.getElementById("generation-num");
    if(generation_display) {
        generation_display.innerHTML = current_world.gen;
    }

    if (show_uses) {
        for (var i = 0; i < rules.length; ++i ) {
            var rule = rules[i];
            var uses_counter = document.getElementById("uses-counter" + i);
            if(uses_counter) {
                uses_counter.innerHTML = rule.uses;
            }
        }
    }
}


var time_since_render = 9999;
function update() {
    //get buffer from history to store the world, figure out what the world is, then put it into the history
    var new_world_buffer = hist.getNextWorld();
    current_world = advanceWorld(current_world, new_world_buffer, template_buffer);
    hist.setCurrentWorld(current_world);

    if (time_since_render > frameskip) {
        drawWorld();
        time_since_render = 1;
    } else {
        ++time_since_render;
    }

    slider.max = hist.countHistoryStates()
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
    if(!paused) {
        return;
    }
    var world = hist.getPreviousWorld();
    if(!world) {
        return;
    }
    current_world = world;
    slider.value--;
    drawWorld();
}

function nextState() {
    if(!paused) {
        return;
    }
    //if we have no more precomputed history to advance, then compute a new state
    if(hist.currentlyOnLatestWorld()) {
        //force it to be rendered
        time_since_render = 9999;
        update();
        return;
    }

    current_world = hist.getNextWorld();
    slider.value++;
    drawWorld();
}

function sliderChange() {
    current_world = hist.makeWorldAtIndexCurrent(parseInt(slider.value))
    drawWorld();
}

function updateFrameskip() {
    frameskip = parseInt(document.getElementById('frameskip').value);
}

function updateFrameDelay() {
    frame_delay = parseInt(document.getElementById('framedelay').value);
}

function dumpWorld() {
    textzone.value = getCompressedWorldText();
}

function getCompressedWorldText() {
    var textzone = document.getElementById("textzone");
    var world_json = JSON.stringify(current_world);
    return LZString.compressToBase64(world_json);
}

function loadWorld() {
    if(!paused) {
        return;
    }
    var textzone = document.getElementById("textzone");
    var compressed = textzone.value;
    var world_json = LZString.decompressFromBase64(compressed);
    current_world = JSON.parse(world_json);
    if(!current_world.gen) {
        current_world.gen = 0;
    }
    hist.setCurrentWorld(current_world);
    drawWorld();
}

function makeLinkToWorldAndRules() {
    var baseurl = window.location.href.split('#')[0];
    var link = baseurl + "#world=" + getCompressedWorldText();
    if (current_rule_definitions !== original_definitions) {
        link = link + ",rules=" + getCompressedRuleText();
    }
    return link;
}

function doShareLink() {
    var sharezone = document.getElementById("sharezone");
    sharezone.value = makeLinkToWorldAndRules();
    sharezone.select();

}

function showPopulationHistory() {
    var historyzone = document.getElementById("historyzone");
    historyzone.value = population_history.join("\n");
    historyzone.rows = 3;
    historyzone.style.visibility = "visible";
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

function setUpInitialWorld() {
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

function setUpInitialRules() {
    if (!paused) {
        return;
    }
    var compressed_rules = getHashValue("rules");
    if (compressed_rules != null) {
        decompressedRules =  LZString.decompressFromBase64(compressed_rules);
        if ( decompressedRules != null) {
            var rulezone = document.getElementById("rulezone");
            rulezone.value = decompressedRules;
            loadRules();
            return;
        }
    }
}



var rules = preprocessRules(original_definitions);

populatePageWithRules(original_definitions);
$( "#rules-container" ).sortable();
$( "#rules-container" ).disableSelection();

setUpInitialWorld();
setUpInitialRules();
hist.buffer[0] = current_world;
drawWorld();