// this can be toggled on via a command-line flag
global.verbose = false;
// ---------------------------------------------------------------------------------------------
// this might be naughty, but I'm defining a global function so I can use it for debugging in all functions
global.vprint = function(message) {
        if (verbose) console.log(message); }
    // ---------------------------------------------------------------------------------------------


const async = require('async');

// const LeanKitClient = require("leankit-client");
const LeanKitClient = require( "leankit-client" );
process.exit();
sprintf = require('sprintf-js').sprintf;
printCards = require('./printCards.js').printCards;
enhanceCard = require('./enhanceBoard.js').enhanceCard;
enhanceBoard = require('./enhanceBoard.js').enhanceBoard;
readConfigFile = require('./readConfig.js').readConfigFile;
//var leankitConfigFilename = "./.leankit.config"
// Add the CWD to the config file name, allows us to run from other dirs
var leankitConfigFilename = __dirname + "/.leankit.config"

// ---------------------------------------------------------------------------------------------

// Given a board, loops through the lanes, and print the lanes
function printLanes(board) {

    // Get the active lanes from the given board
    var lanes = board.Lanes;

    // Loop through Lanes and print Lane Title
    console.log("All Lanes\n=====================");
    for (var i = 0; i < lanes.length; i++) {
        console.log("(%d) %s", i, lanes[i].Title);
        console.log("   Id = %s", lanes[i].Id);
        console.log("   ParentId = %d", lanes[i].ParentLaneId);
        console.log("   Number of Cards = ", lanes[i].Cards.length)
    }
}

// ---------------------------------------------------------------------------------------------

// Given a Leankit "board" object, print all the cards on that board
function printBoardCards(board, printOptions, pretty, jsonOutput) {

    var lanes = board.Lanes;
    var cards = [];

    // Loop through Lanes and print all cards
    for (var laneNumber = 0; laneNumber < lanes.length; laneNumber++) {
        for (var cardNumber = 0; cardNumber < lanes[laneNumber].Cards.length; cardNumber++) {
            cards.push(lanes[laneNumber].Cards[cardNumber]);
        }
    }

    printCards(cards, printOptions, pretty, jsonOutput);
}

// ---------------------------------------------------------------------------------------------

function printStatsAnalysis(subsetCards, outputString) {

    // Compute Average Days in Lane
    totalDays = 0;
    for (i = 0; i < subsetCards.length; i++) {
        totalDays += subsetCards[i].movedDuration;
    }
    averageDaysInLane = totalDays / subsetCards.length;

    // Compute Average Days since last card update
    totalDays = 0;
    for (i = 0; i < subsetCards.length; i++) {
        totalDays += subsetCards[i].activityDuration;
    }
    averageActivityInLane = totalDays / subsetCards.length;

    // For the X worst cards, Compute Average Days since last card update
    totalDays = 0;
    worstXAct = 5
    subsetCards.sort(function(a, b) {
        return b.activityDuration - a.activityDuration });
    for (i = 0; i < worstXAct; i++) {
        totalDays += subsetCards[i].activityDuration;
    }
    averageActivitySinnerInLane = totalDays / worstXAct;

    // For the X worst cards, Compute Average Days since last card move
    totalDays = 0;
    worstXMoved = 12
    subsetCards.sort(function(a, b) {
        return b.movedDuration - a.movedDuration });
    for (i = 0; i < worstXMoved; i++) { totalDays += subsetCards[i].movedDuration; }
    averageDaysSinnerInLane = totalDays / worstXMoved;

    // Compute pct of cards that have acceptance criteria
    // Chad this used to be 1 and 0, now it's true and false, need to fix this up
    var totalAC = 0;
    for (i = 0; i < subsetCards.length; i++) { totalAC += subsetCards[i].hasAcceptCriteria; }
    averageAC = totalAC / subsetCards.length;

    outputString = outputString.concat(sprintf("                  Card Count = %04d\n", subsetCards.length));
    outputString = outputString.concat(sprintf("             Days Since Move = %3.1f\n", averageDaysInLane));
    outputString = outputString.concat(sprintf("              Days Since Act = %3.1f\n", averageActivityInLane));
    outputString = outputString.concat(sprintf("    Days Since Act (Worst %d) = %3.1f\n", worstXAct, averageActivitySinnerInLane));
    outputString = outputString.concat(sprintf("   Days Since Move (Worst %d) = %3.1f\n", worstXMoved, averageDaysSinnerInLane));
    outputString = outputString.concat(sprintf("         Pct of Cards with AC = %3.1f%%\n", averageAC * 100));

    outputString = outputString.concat(sprintf("\n", subsetCards.length));
    return outputString;
}

// ---------------------------------------------------------------------------------------------

function printStats(board) {

    var lanes = board.Lanes;
    var totalNumCards = 0;
    var outputString = "";
    var allCards = [];

    // Create flat array of cards
    // Loop through Lanes and print all cards
    for (var laneNumber = 0; laneNumber < lanes.length; laneNumber++) {
        // Loop through cards in a lane
        for (var cardNumber = 0; cardNumber < lanes[laneNumber].Cards.length; cardNumber++) { allCards.push(lanes[laneNumber].Cards[cardNumber]); }
    }

    // filter out just the Planned cards
    var planCards = [];
    for (cardIndex = 0; cardIndex < allCards.length; cardIndex++) {
        var card = allCards[cardIndex];
        // TypeName: 'Planned',
        if (card.TypeName === "Planned") planCards.push(card);
    }

    outputString = outputString.concat(sprintf("All Cards\n"));
    outputString = printStatsAnalysis(allCards, outputString);

    if (planCards.length > 0) {
        outputString = outputString.concat(sprintf("Plan Cards\n"));
        outputString = printStatsAnalysis(planCards, outputString);
    } else { console.log("No Planned Cards") }

    if (doingCards.length > 0) {
        outputString = outputString.concat(sprintf("Doing Cards\n"));
        outputString = printStatsAnalysis(doingCards, outputString);
    } else { console.log("No Doing Cards") }

    console.log(outputString);
}

// ---------------------------------------------------------------------------------------------

// Given a Leankit "board" object and a cardId, return that specific card object
function getCardById(board, id) {

    var lanes = board.Lanes;

    // Loop through Lanes and print all cards
    for (var laneNumber = 0; laneNumber < lanes.length; laneNumber++) {
        var cards = lanes[laneNumber].Cards;
        // Loop through cards in a lane
        for (var cardNumber = 0; cardNumber < cards.length; cardNumber++) {
            if (cards[cardNumber].Id === id) return cards[cardNumber];
        }
    }
    throw new Error("Error getting card !!");
}

// ---------------------------------------------------------------------------------------------

function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

// ---------------------------------------------------------------------------------------------
// Given a Leankit "board" object and a cardId, return that specific card object
function addTagToCard(boardId, client, id, newTag) {

    // Need to get the card type and pre-existing tags
    client.getBoard(boardId, function(err, board) {

        if (err) {
            console.error("Error getting board:", err);
        } else {
            // Successfully got board

            // Get copy of card that we're going to udpate
            oldCard = getCardById(board, id);

            // Get copy of Tags
            if (oldCard.Tags.length === 0) {
                Tags = [];
            } else {
                Tags = oldCard.Tags.split(",");
            }
            Tags.push(newTag);
            Tags = uniq(Tags);
            newTags = Tags.join();

            oldTypeId = oldCard.TypeId;
            oldTitle = oldCard.Title;

            var newcard = {
                "Id": id,
                Title: oldTitle,
                TypeId: oldTypeId,
                Tags: newTags
            };

            console.log(newcard);

            // Update the actual card in Leankit
            client.updateCard(boardId, newcard, function(err, board) {
                if (err) { console.error("Error updating card:", err); }
            });

        }
    });
}
// ---------------------------------------------------------------------------------------------

function getCommandLineArgs(defaultOptions) {

    // Setup yargs to capture command-line args
    printOptions = "";
    printOptions = printOptions.concat("Series of capital letters describing columns to print\n");
    printOptions = printOptions.concat("A: lineCount\n");
    printOptions = printOptions.concat("B: movedDuration\n");
    printOptions = printOptions.concat("C: movedDate\n");
    printOptions = printOptions.concat("D: Activity Duration\n");
    printOptions = printOptions.concat("F: IsBlocked\n");
    printOptions = printOptions.concat("G: Tags\n");
    printOptions = printOptions.concat("P: Points (or Size)\n");
    printOptions = printOptions.concat("Y: Card Type ID\n");
    printOptions = printOptions.concat("Z: Card Type Name\n");
    printOptions = printOptions.concat("T: Title\n");
    printOptions = printOptions.concat("W: Title Length (Num Chars)\n");
    printOptions = printOptions.concat("E: Has Accept Criteria\n");
    printOptions = printOptions.concat("L: Parent Lanes\n");
    printOptions = printOptions.concat("I: cardId\n");
    printOptions = printOptions.concat("V: Num Users\n");
    printOptions = printOptions.concat("U: Assigned Users");

    var argv = require('yargs')
        .usage('Usage: $0 options\n\n   Print all card IDs on a board:\n   node ./get_cards_by_lane.js --boardId 412731036 --printCards --printOptions I')
        .demand(['password', 'accountName', 'email'])

    .describe('accountName', 'URL to access board, for example https://<company-name>.leankit.com')
        .describe('password', 'Non-SSO password')
        .describe('email', 'Email address used to login')
        .describe('boardId', '9-digit number that id\'s a specific board')
        .describe('cardId', '9-digit number that id\'s a specific board')
        .describe('printOptions', printOptions)
        .option("printRawCard", { describe: "Print raw card in JSON", type: "boolean" })
        .option("printRawBoard", { describe: "Print raw board in JSON", type: "boolean" })
        .option("printCards", { describe: "Print cards one per row", type: "boolean" })
        .option("printLanes", { describe: "Print lanes one per row", type: "boolean" })
        .option("printStats", { describe: "Show stats about the board", type: "boolean" })
        .option("showMethods", { describe: "Show all object methods for Leankit board", type: "boolean" })
        .option("addTag", { describe: "Update card with tag", type: "boolean" })
        .option("pretty", { describe: "Print output in pretty columns", type: "boolean" })
        .option("jsonify", { describe: "Print output in json structure", type: "boolean" })
        .option("verbose", { describe: "Print verbose output for troubleshooting", type: "boolean" })
        .default(defaultOptions)
        .help()
        .argv;


    // Verify that we've got some print options defined
    if (!argv.printOptions) {
        // User didn't set any print options, so we need to set minimal print options (columns)
        argv.printOptions = "IT";
    }

    return (argv);
}
// ---------------------------------------------------------------------------------------------
// --------------------------------- Main ------------------------------------------------------
// ---------------------------------------------------------------------------------------------


// Global variable to keep track of the board
theBoard = null;

var leankitClient = null;
var boardId = null; 

// Create an empty object where we can accumulate settings from the options file
defaultOptions = {}

// Two args
// (1) tasks(Array) : An array of async functions to run. Each function should complete with any number of result values. 
//                    The result values will be passed as arguments, in order, to the next task.
// (2) callback function <opt> : An optional callback to run once all the functions have completed. 
//                 This will be passed the results of the last task's callback. Invoked with (err, [results]).
// At the end of each function, you call "callback()" to trigger the waterfall cascade
//
// if any function encourters error, it short-circuits the waterfall, and calls that last optional callback with err
// For the intermediate callbacks, the 1st param is the error, if any
async.waterfall([
        function(callback) {
            vprint("Async Function 0 - Read config file (for username/password)");
            readConfigFile(leankitConfigFilename, function(data) {
                // Read through the key-value pairs from config file, and populate the settings object
                // This settings object will be used only if corresponding command-line args are not provided
                for (var key of data.keys()) {
                    // Push the key-value pair into a javascript object
                    defaultOptions[key] = data.get(key);
                }

                // Get command-line args
                // Command-line args will overwrite corresponding settings obtained from options file 
                argv = getCommandLineArgs(defaultOptions)

                // Give the given command-line args some sensible names
                var accountName = argv.accountName;
                var email = argv.email;
                var password = argv.password;
                boardId = argv.boardId;
                verbose = argv.verbose;

                // Get a new object from the LeanKitClient API
                leankitClient = new LeanKitClient(accountName, email, password);

                // Experiment to see if we can update (write) to a card
                if (argv.addTag) { addTagToCard(boardId, leankitClient, argv.cardId, "Sprint 9"); }

                callback(null)
            })
        },

        function(callback) {
            vprint("Async Function 1 - Get Board (v1)");
            // We're given a "callback" function (it's passed to us).   When we're done, we're supposed to call that
            //   so async can proceed to the next (waterfall) function.  Instead, we pass this "callback" function to
            //   our leankit leankitClient call. He'll then call the "callback" function for us when data is returned

            // Actually calls endpont /kanban/api/boards/<boardId>
            // New method to call legacy v1: .v1.board.get( boardId )
            leankitClient.getBoard(boardId, callback)
                // NOTE: alternative is (if we didn't have our asynchronous function to call) is we could have called our
                //    callback function manually.   For example, "callback(null, 1,2)"    First arg is the error code, and
                //    would typically be "null" when we simply want to proceed with next function
        },
        function(board, callback) {
            vprint("Async Function 2 - Get Backlog Lanes (v1)");
            // we've got the board now
            theBoard = board;
            // pass along the "callback" function provided to us, so getBoardBacklog can trigger end of this waterfall step
            // Actually calls /kanban/api/board/<boardId>/backlog
            // New method to call legacy v1: .v1.board.backlog( boardId )
            leankitClient.getBoardBacklogLanes(boardId, callback)
        },
        function(backlogLanes, callback) {
            try {
                // we've got the board now
                vprint("Async Function 3a - join lanes");
                // Add the backlog lanes to the board
                theBoard.Lanes = theBoard.Lanes.concat(backlogLanes);

                vprint("Async Function 3b - call enhanceBoard");
                // enchance the cards, then cascade to the next function in the waterfall
                enhanceBoard(theBoard, leankitClient, callback);

            } catch (err) {
                callback("Error in Async Function 3: " + err, "Done");
            }
        },
        function(arg1, callback) {
            // Function 4
            try {
                vprint("Async Final Function - Print requested data")
                if (argv.printCards) { printBoardCards(theBoard, argv.printOptions, argv.pretty, argv.jsonify); }
                if (argv.printLanes) { printLanes(theBoard); }
                if (argv.printRawCard) { console.log(getCardById(theBoard, argv.cardId)) };
                if (argv.printRawBoard) { console.log(theBoard); }
                if (argv.printStats) { printStats(theBoard); }
                if (argv.showMethods) { console.log(Object.getOwnPropertyNames(leankitClient)) };
            } catch (err) {
                callback("Error in Async Function 4: " + err, "Done");
            }
        },
    ],
    // Final callback
    function(err, result) {
        console.log(err, result);
    });

// --------------------------------------------------------------------------------------------
// ------------------------  End of File ------------------------------------------------------
// --------------------------------------------------------------------------------------------