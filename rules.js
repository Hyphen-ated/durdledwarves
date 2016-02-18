var original_definitions = {
ruleset_name: "Durdle Dwarves v1",
rules: [
{
    name: "Spawn on platform",

    pattern:"_____"+
            "_____"+
            "__O__"+
            "SSSSS"+
            "*****",

    outcome:"*****"+
            "*****"+
            "D*SO*"+
            "*****"+
            "*****"
},
{
    name: "Castle",

    pattern:"*****"+
            "*****"+
            "*SO**"+
            "*SS**"+
            "_SSS*",

    outcome:"*****"+
            "*****"+
            "*****"+
            "*****"+
            "D****"
},
{
    name: "Stifled burrow",

    pattern:"*****"+
            "*****"+
            "*DO**"+
            "*****"+
            "*****",

    outcome:"*****"+
            "**_**"+
            "**__*"+
            "**O**"+
            "*****"
},
{
    name: "Stifled wall",

    pattern:"*****"+
            "***_*"+
            "**O_D"+
            "*****"+
            "*****",

    outcome:"*****"+
            "***S*"+
            "***S*"+
            "*****"+
            "*****"
},
{
    name: "Too tall wall",

    pattern:"*S_**"+
            "*S_**"+
            "*SO**"+
            "*****"+
            "*****",

    outcome:"*_***"+
            "*_***"+
            "*****"+
            "*****"+
            "*****"
},
{
    name: "Climb left step",

    pattern:"*****"+
            "*__**"+
            "*SO**"+
            "*****"+
            "*****",

    outcome:"*****"+
            "*O***"+
            "**_**"+
            "*****"+
            "*****"
},
{
    name: "Climb left wall",

    pattern:"*****"+
            "**_**"+
            "*SO**"+
            "*****"+
            "*****",

    outcome:"*****"+
            "**O**"+
            "**_**"+
            "*****"+
            "*****"
},
{
    name: "Scale down",

    pattern:"*****"+
            "*_S_*"+
            "*_O_*"+
            "*_S_*"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_**"+
            "*O***"+
            "*****"
},
//{
//    name: "Left-going curl-downs",
//    pattern:"*****"+
//            "*_S_*"+
//            "*_O_*"+
//            "*_S_*"+
//            "*****",
//
//    outcome:"*****"+
//            "*****"+
//            "**_**"+
//            "*O***"+
//            "*****"
//},
{
    name: "Build left bridge",

    pattern:"*****"+
            "*****"+
            "*_O**"+
            "*sS**"+
            "*****",

    outcome:"*****"+
            "*****"+
            "*****"+
            "*S***"+
            "*****"
},
{
    name: "Plummet",

    pattern:"****_"+
            "*SSS_"+
            "*_OS_"+
            "*____"+
            "*____",

    outcome:"*****"+
            "*****"+
            "**_**"+
            "*****"+
            "**O**"
},
//{
//    name: "Plummet",
//
//    pattern:"**__*"+
//            "**S_*"+
//            "*_O_*"+
//            "*___*"+
//            "*****",
//
//    outcome:"*****"+
//            "***S*"+
//            "**_**"+
//            "**O**"+
//            "*****"
//},
//{
//    name: "Debridge",
//
//    pattern:"*___*"+
//            "*SSS*"+
//            "*_O_*"+
//            "*___*"+
//            "*****",
//
//    outcome:"*****"+
//            "*_***"+
//            "**_O*"+
//            "*****"+
//            "*****"
//},
{
    name: "No-roof cave down",

    pattern:"*****"+
            "***S*"+
            "**O**"+
            "**S**"+
            "*****" ,

    outcome:"*****"+
            "*****"+
            "**_**"+
            "**O**"+
            "*****"
},
{
    name: "No-floor cave right",

    pattern:"*****"+
            "**S**"+
            "**O**"+
            "***S*"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_O*"+
            "*****"+
            "*****"
},
{
    name: "Tight cave right",

    pattern:"*****"+
            "**S**"+
            "**O**"+
            "**S**"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_O*"+
            "*****"+
            "*****"
},
{
    name: "Grapple right",

    pattern:"*****"+
            "**_S*"+
            "**O_*"+
            "*****"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_O*"+
            "*****"+
            "*****"
},
{
    name: "Grapple down-right",

    pattern:"*****"+
            "**S**"+
            "*SOS*"+
            "***_*"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_**"+
            "***O*"+
            "*****"
},
{
    name: "Grapple up",

    pattern:"*****"+
            "*S_**"+
            "*_O**"+
            "*****"+
            "*****",

    outcome:"*****"+
            "**O**"+
            "**_**"+
            "*****"+
            "*****"
},
{
    name: "Move left",

    pattern:"*****"+
            "*****"+
            "*_O**"+
            "*SS**"+
            "*****",

    outcome:"*****"+
            "*****"+
            "*O_**"+
            "*****"+
            "*****"
},
{
    name: "Descend",

    pattern:"*****"+
            "*****"+
            "**OS*"+
            "*****"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_**"+
            "**O**"+
            "*****"
},
{
    name:"Burrow right",

    pattern:"*****"+
            "**S**"+
            "**O**"+
            "*****"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_O*"+
            "*****"+
            "*****"
},
{
    name: "Fall",

    pattern:"*****"+
            "*****"+
            "**O**"+
            "**_**"+
            "*****",

    outcome:"*****"+
            "*****"+
            "**_**"+
            "**O**"+
            "*****"
}
]
}

var rule_definitions = original_definitions;

//turn the rules into a list of which squares we care about and a list of which squares get changed
function preprocessRules(rule_definitions) {
    var new_rules = [];
    for (var i = 0; i < rule_definitions.rules.length; ++i) {
        var defn = rule_definitions.rules[i];
        var new_pattern = [];
        var new_outcome = [];
        defn.pattern = defn.pattern.replace(/(\r\n|\n|\r)/gm,"");
        if (defn.pattern.length != 25) {
            setRuleErrorMsg("Rule '" + defn.name + "' must have exactly 25 symbols in its pattern")
            return null;
        }
        if (defn.pattern[12] != "O") {
           setRuleErrorMsg("Rule '" + defn.name + "' must have an 'O' in the middle of its pattern")
           return null;
        }
        var Ocount = (defn.pattern.match(/O/g) || []).length;
        if (Ocount != 1) {
           setRuleErrorMsg("Rule '" + defn.name + "' must have exactly 1 'O' in its pattern, in the middle. It has " + Ocount);
           return null;
        }


        defn.outcome = defn.outcome.replace(/(\r\n|\n|\r)/gm,"");
        if (defn.outcome.length != 25) {
            setRuleErrorMsg("Rule '" + defn.name + "' must have exactly 25 symbols in its outcome")
            return null;
        }

        var validPatternChars = "ODS_dsX*";
        var validOutcomeChars = "ODS_*";

        for (var s = 0; s < 25; ++s) {
            if (validPatternChars.indexOf(defn.pattern[s]) === -1) {
                setRuleErrorMsg("Rule '" + defn.name + "' has the invalid character '" + defn.pattern[s] + "' in its pattern. Allowed characters are: *, O, D, S, _, d, s, and X");
                return null;
            }

            if (validOutcomeChars.indexOf(defn.outcome[s]) === -1) {
                setRuleErrorMsg("Rule '" + defn.name + "' has the invalid character '" + defn.outcome[s] + "' in its outcome. Allowed characters are: *, O, D, S, and _");
                return null;
            }

            if(defn.pattern[s] != "*" && defn.pattern[s] != "O") {
                new_pattern.push({x: s % 5 - 2, y:Math.floor(s / 5) - 2, val:id[defn.pattern[s]]});
            }
            if(defn.outcome[s] != "*") {
                new_outcome.push({x: s % 5 - 2, y:Math.floor(s / 5) - 2, val:id[defn.outcome[s]]});
            }
        }
        new_rules.push({name: defn.name, pattern: new_pattern, outcome: new_outcome, uses: 0});
    }
    return new_rules;
}

function deleteRule(rule_id) {
    var element = document.getElementById(rule_id);
    element.parentNode.removeChild(element);
}

function populatePageWithRules(rule_definitions) {
    var rule_container = document.getElementById("rules-container");
    rule_container.innerHTML = ""

    for(var i = 0; i < rule_definitions.rules.length; ++i) {
        var rule_defn = rule_definitions.rules[i];

        var rule_div = document.createElement("div");
        rule_div.className = "rule-square";
        var this_id = "rule_div" + i;
        rule_div.setAttribute("id", this_id);

        var rule_name = document.createElement("input");
        rule_name.className = "rule-name";
        rule_name.value = rule_defn.name;
        rule_div.appendChild(rule_name);

        var rule_delete = document.createElement("button");
        rule_delete.className = "rule-delete";
        //this abomination is a generator function because js has horrible scoping rules.
        // see: http://stackoverflow.com/questions/1451009/javascript-infamous-loop-issue
        rule_delete.onclick = function(some_id) {
            return function() {
                deleteRule(some_id);
            }
        }(this_id);

        rule_delete.innerHTML = "X";
        rule_div.appendChild(rule_delete);

        var uses_div = document.createElement("div");
        uses_div.className = "uses-div";

        var uses_label = document.createElement("p");
        uses_label.className = "uses-label";
        uses_label.innerHTML = "uses:";
        uses_div.appendChild(uses_label);

        var uses_counter = document.createElement("p");
        uses_counter.className = "uses-counter";
        uses_counter.id = "uses-counter"+i;
        uses_counter.innerHTML = "0";
        uses_div.appendChild(uses_counter);
        rule_div.appendChild(uses_div);

        var pattern_label = document.createElement("p");
        pattern_label.className = "rule-type-label";
        pattern_label.innerHTML = "Pattern:";
        rule_div.appendChild(pattern_label);

        var pattern_textarea = document.createElement("textarea");
        pattern_textarea.className = "rule-textarea pattern-textarea";
        pattern_textarea.name = "pattern";
        pattern_textarea.rows = "5";
        pattern_textarea.cols = "4";
        pattern_textarea.innerHTML = rule_defn.pattern;
        rule_div.appendChild(pattern_textarea);

        var outcome_label = document.createElement("p");
        outcome_label.className = "rule-type-label";
        outcome_label.innerHTML = "Outcome:";
        rule_div.appendChild(outcome_label);

        var outcome_textarea = document.createElement("textarea");
        outcome_textarea.className = "rule-textarea outcome-textarea";
        outcome_textarea.name = "outcome";
        outcome_textarea.rows = "5";
        outcome_textarea.cols = "4";
        outcome_textarea.innerHTML = rule_defn.outcome;
        rule_div.appendChild(outcome_textarea);

        rule_container.appendChild(rule_div);
    }

    var ruleset_name = document.getElementById("ruleset-name");
    ruleset_name.value = rule_definitions.ruleset_name;
    var x=0;
}


function applyRuleChangesButton() {
    var ruleset_name_display = document.getElementById("ruleset-name");
    if (ruleset_name_display.value === original_definitions.ruleset_name) {
        ruleset_name_display.value = "Custom rules";
    }
    applyRuleChanges();
}

function applyRuleChanges() {
    if (!paused) {
        return;
    }
    var rule_container = document.getElementById("rules-container");
    var rule_divs = rule_container.getElementsByClassName("rule-square");
    var ruleset_name = document.getElementById("ruleset-name").value;
    var new_definitions = {ruleset_name: ruleset_name, rules: []};
    for (var i = 0; i < rule_divs.length; ++i) {
        var rule_div = rule_divs[i];
        var new_definition = {};
        new_definition.name = rule_div.getElementsByClassName("rule-name")[0].value;
        new_definition.pattern = rule_div.getElementsByClassName("pattern-textarea")[0].value;

        new_definition.outcome = rule_div.getElementsByClassName("outcome-textarea")[0].value;
        new_definitions.rules.push(new_definition);
    }

    var new_rules = preprocessRules(new_definitions);
    if (new_rules != null) {
        rules = new_rules;
        rule_definitions = new_definitions;
        hist.latest_idx = hist.curr_idx;
        setRuleErrorMsg("");
        renumberRules();
    }
}

function renumberRules() {
    var rule_container = document.getElementById("rules-container");
    var rule_divs = rule_container.getElementsByTagClassname("rule-square");
    for (var i = 0; i < rule_divs.length; ++i) {
        var rule_div = rule_divs[i];
        var uses_div = rule_div.getElementsByClassName("uses-div")[0];
        var uses_counter = uses_div.getElementsByClassName("uses-counter")[0];
        uses_counter.id = "uses_counter" + i;
    }
}

function setRuleErrorMsg(msg) {
    $( "#rules-error" ).text(msg);
}

function dumpRules() {
    var rulezone = document.getElementById("rulezone");
    var rule_json = JSON.stringify(rule_definitions);
    rulezone.value = rule_json;
}

function getCompressedRuleText() {
    var rule_json = JSON.stringify(rule_definitions);
    return LZString.compressToBase64(rule_json);
}

function loadRules() {
    if(!paused) {
        return;
    }
    var rulezone = document.getElementById("rulezone");
    var new_rule_definitions = JSON.parse(rulezone.value);
    populatePageWithRules(new_rule_definitions);
    applyRuleChanges();
}
