var rule_definitions = [
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
            "**O**"+
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
            "**OS*"+
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
            "**O**"+
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
            "**O**"+
            "*S***"+
            "*****"
},
{
    name: "Plummet",

    pattern:"**__*"+
            "**S_*"+
            "*_O_*"+
            "*___*"+
            "*****",

    outcome:"*****"+
            "***S*"+
            "**_**"+
            "**O**"+
            "*****"
},
{
    name: "Debridge",

    pattern:"*___*"+
            "*SSS*"+
            "*_O_*"+
            "*___*"+
            "*****",

    outcome:"*****"+
            "*_***"+
            "**_O*"+
            "*****"+
            "*****"
},
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

//preprocess rule definitions so we have a list of which squares we care about
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