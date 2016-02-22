var w = 180;
var h = 180;
var cell_size = 5;

// numeric representations so our 2d grids store a bunch of numbers instead of a bunch of length-1 strings
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

var current_world = new Array(w);
for(var x = 0; x < w; ++x) {
    current_world[x] = new Array(h);
    for (var y = 0; y < h; ++y) {
        current_world[x][y] = id['_'];
    }
}
current_world.gen = 0;
var template_buffer = new Array(w);
for(var x = 0; x < w; ++x) {
    template_buffer[x] = new Array(h);
    template_buffer[x].fill(null);
}


// manually handle a circular buffer for history
var hist = {
    size: 1000,
    buffer: new Array(1000),
    curr_idx: 0, //the index into buffer where current_state goes
    earliest_idx: 0, // chronologically earliest of the states in buffer
    latest_idx: 0 // chronologically latest of the states in buffer
    //the current state can be different from the latest state if we're doing rewinding

}

hist.currentlyOnLatestWorld = function() {
    return this.curr_idx == this.latest_idx;
}

hist.getNextWorld = function() {
    this.curr_idx = wrap(this.curr_idx + 1, this.size);

    //we've wrapped around to use this entire circular buffer, so we're reusing the oldest state for the newest one
    if (this.curr_idx == this.earliest_idx) {
        this.earliest_idx = wrap(this.earliest_idx + 1, this.size);
    }

    return this.buffer[this.curr_idx];
}

hist.getPreviousWorld = function() {
    if (this.curr_idx == this.earliest_idx) {
        return null;
    }
    this.curr_idx = wrap(this.curr_idx - 1, this.size);
    return this.buffer[this.curr_idx];
}

hist.setCurrentWorld = function(current_world) {
    this.latest_idx = this.curr_idx;
    this.buffer[this.curr_idx] = current_world;
}

hist.countHistoryStates = function() {
    return wrap(this.size - this.earliest_idx, this.size) + this.curr_idx;
}

hist.makeWorldAtIndexCurrent = function(slider_index) {
  this.curr_idx = wrap(this.earliest_idx + slider_index, this.size);
  return this.buffer[this.curr_idx];
}


//initialize all the world buffers to be 2d arrays, w x h in size
for(var i = 0; i < hist.size; ++i) {
    hist.buffer[i] = new Array(w);
    for (var j = 0; j < w; ++j) {
        hist.buffer[i][j] = new Array(h);
    }
}
