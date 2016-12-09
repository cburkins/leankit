var LeanKitClient = require( "leankit-client" );  
sprintf = require('sprintf-js').sprintf;
printCards = require('./printCards.js').printCards;
enhanceBoard = require('./enhanceBoard.js').enhanceBoard;
readConfigFile = require('./readConfig.js').readConfigFile;

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
function printBoardCards(board, printOptions, pretty) {

    var lanes = board.Lanes;
    var cards = [];

    // Loop through Lanes and print all cards
    for (var i = 0; i < lanes.length; i++) {
	for (var j=0; j<lanes[i].Cards.length; j++) {
	    cards.push(lanes[i].Cards[j]);
	}
    }

    printCards(cards, printOptions, pretty);
}

// ---------------------------------------------------------------------------------------------

function  printStatsAnalysis (subsetCards, outputString) {

    // Compute Average Days in Lane
    totalDays=0;
    for (i=0; i<subsetCards.length; i++) {
	totalDays += subsetCards[i].movedDuration;
    }
    averageDaysInLane = totalDays / subsetCards.length;

    // Compute Average Days since last card update
    totalDays=0;
    for (i=0; i<subsetCards.length; i++) {
	totalDays += subsetCards[i].activityDuration;
    }
    averageActivityInLane = totalDays / subsetCards.length;

    // For the X worst cards, Compute Average Days since last card update
    totalDays=0;
    worstXAct=5
    subsetCards.sort(function(a, b) { return b.activityDuration - a.activityDuration } );
    for (i=0; i<worstXAct; i++) {
	totalDays += subsetCards[i].activityDuration;
    }
    averageActivitySinnerInLane = totalDays / worstXAct;

    // For the X worst cards, Compute Average Days since last card move
    totalDays=0;
    worstXMoved=12
    subsetCards.sort(function(a, b) { return b.movedDuration - a.movedDuration } );
    for (i=0; i<worstXMoved; i++) { totalDays += subsetCards[i].movedDuration; }
    averageDaysSinnerInLane = totalDays / worstXMoved;

    // Compute pct of cards that have acceptance criteria
    // Chad this used to be 1 and 0, now it's true and false, need to fix this up
    var totalAC=0;
    for (i=0; i<subsetCards.length; i++) { totalAC += subsetCards[i].hasAcceptCriteria; }
    averageAC = totalAC / subsetCards.length;

    outputString = outputString.concat(sprintf("                  Card Count = %04d\n", subsetCards.length));
    outputString = outputString.concat(sprintf("             Days Since Move = %3.1f\n", averageDaysInLane));
    outputString = outputString.concat(sprintf("              Days Since Act = %3.1f\n", averageActivityInLane));
    outputString = outputString.concat(sprintf("    Days Since Act (Worst %d) = %3.1f\n", worstXAct, averageActivitySinnerInLane));
    outputString = outputString.concat(sprintf("   Days Since Move (Worst %d) = %3.1f\n", worstXMoved, averageDaysSinnerInLane));
    outputString = outputString.concat(sprintf("         Pct of Cards with AC = %3.1f%%\n", averageAC*100));

    outputString = outputString.concat(sprintf("\n", subsetCards.length));
    return outputString;
}

// ---------------------------------------------------------------------------------------------

function printStats (board) {

    var lanes = board.Lanes;
    var totalNumCards = 0;
    var outputString = "";
    var allCards=[];

    // Create flat array of cards
    // Loop through Lanes and print all cards
    for (var i = 0; i < lanes.length; i++) {
	// Loop through cards in a lane
	for (var j=0; j<lanes[i].Cards.length; j++) {
	    allCards.push(lanes[i].Cards[j]);
	}
    }
    
    // filter out just the cards in the Doing lane
    var doingCards=[];
    for (i=0; i<allCards.length; i++) {
	var card = allCards[i];
	if (card.laneName[0] === "Doing") doingCards.push(card);
    }
    
    // filter out just the cards in the Plan lane
    var planCards=[];
    for (i=0; i<allCards.length; i++) {
	var card = allCards[i];
	if (card.laneName[0] === "Plan") planCards.push(card);
    }

    // filter out just the cards in the Iris Doing lanes
    var doingIrisCards=[];
    for (i=0; i<allCards.length; i++) {
	var card = allCards[i];
	if ((card.laneName[0] === "Doing") &&
	    ((card.laneName[1] === "Iris Dev") || (card.laneName[1] == "Iris Ops")))
	    doingIrisCards.push(card);
    }

    outputString = outputString.concat(sprintf("All Cards\n"));
    outputString = printStatsAnalysis (allCards, outputString);

    outputString = outputString.concat(sprintf("Plan Cards\n"));
    outputString = printStatsAnalysis (planCards, outputString);

    outputString = outputString.concat(sprintf("Doing Cards\n"));
    outputString = printStatsAnalysis (doingCards, outputString);

    outputString = outputString.concat(sprintf("Iris Doing Cards\n"));
    outputString = printStatsAnalysis (doingIrisCards, outputString);

    console.log(outputString);
}


// ---------------------------------------------------------------------------------------------

// Given a Leankit "board" object and a cardId, return that specific card object
function getCardById(board, id) {

    var lanes = board.Lanes;

    // Loop through Lanes and print all cards
     for (var i = 0; i < lanes.length; i++) {
	 var cards = lanes[i].Cards;
	 // Loop through cards in a lane
	 for (var j=0; j<cards.length; j++) {
	     if (cards[j].Id === id) return cards[j]; 
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
    client.getBoard(boardId, function (err, board) {

	if ( err ) {
	    console.error("Error getting board:", err );
	}
	else {
	    // Successfully got board

	    // Get copy of card that we're going to udpate
	    oldCard = getCardById (board, id);
	    
	    // Get copy of Tags
	    if (oldCard.Tags.length === 0) {
		Tags = [];
	    }
	    else {
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
    	    	if ( err ) {console.error("Error updating card:", err ); }
	    });
	    

	}
    });

}

// ---------------------------------------------------------------------------------------------

function getCommandLineArgs(defaultOptions) {

    // Setup yargs to capture command-line args
    printOptions="";
    printOptions = printOptions.concat("Series of capital letters describing columns to print\n");
    printOptions = printOptions.concat("A: lineCount\n");
    printOptions = printOptions.concat("B: movedDuration\n");
    printOptions = printOptions.concat("C: movedDate\n");
    printOptions = printOptions.concat("D: Activity Duration\n");
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
	.usage('Usage: $0 options')
	.demand(['password', 'accountName', 'email'])
    
	.describe('accountName', 'URL to access board, for example https://<company-name>.leankit.com')
	.describe('password', 'Non-SSO password')
	.describe('email', 'Email address used to login')
	.describe('boardId', '9-digit number that id\'s a specific board')
	.describe('cardId', '9-digit number that id\'s a specific board')
	.describe('printOptions', printOptions)
	.option( "printRawCard", { describe: "Print raw card in JSON", type: "boolean" } )
	.option( "printRawBoard", { describe: "Print raw board in JSON", type: "boolean" } )
	.option( "printCards", { describe: "Print cards one per row", type: "boolean" } )
	.option( "printLanes", { describe: "Print lanes one per row", type: "boolean" } )
	.option( "printStats", { describe: "Show stats about the board", type: "boolean" } )
	.option( "showMethods", { describe: "Show all object methods for Leankit board", type: "boolean" } )
	.option( "addTag", { describe: "Update card with tag", type: "boolean" } )
	.option( "pretty", { describe: "Print output in pretty columns", type: "boolean" } )
	.default(defaultOptions)
	.help()
	.argv;

    
    // Verify that we've got some print options defined
    if (! argv.printOptions) {
	// User didn't set any print options, so we need to set minimal print options (columns)
	argv.printOptions="IT";
    }
    
    return (argv);
}

// ---------------------------------------------------------------------------------------------
// --------------------------------- Main ------------------------------------------------------
// ---------------------------------------------------------------------------------------------


readConfigFile('./leankit.config', function (data) {

    // Create an empty object
    defaultOptions = {}
//    defaultOptions['email'] = data.get('email');
 //   defaultOptions.password = data.get('password');

    console.log(data);
    for (var key of data.keys()) {
	console.log(key)
	console.log(data.get(key))
	defaultOptions[key] = data.get(key);
    }


    // Get command-line args
    argv = getCommandLineArgs(defaultOptions)

    // Give the given command-line args some sensible names
    var accountName=argv.accountName;
    var email=argv.email;
    var password=argv.password;
    var boardId=argv.boardId;
    
    // Get a new object from the LeanKitClient API
    var client = new LeanKitClient( accountName, email, password );
    
    if (argv.addTag) {
	addTagToCard(boardId, client, argv.cardId, "Sprint 9");
    }
    
    // Get the Main board
    client.getBoard( boardId, function( err, board ) {  
	if ( err ) console.error("Error getting board:", err );
	else {
	    // Successfully retrieved board object from Leankit API
	    
	    // Get the Backlog Lanes
	    client.getBoardBacklogLanes( boardId, function (err, backlogLanes) {
		if (err) console.error("Error getting backlog lanes:", err);
		else {
		    // Successfully got backlog lanes
		    
		    // Add the backlog lanes to the board
		    board.Lanes = board.Lanes.concat(backlogLanes);
		    
		    // Add some useful data each card on the board 
		    enhanceBoard(board);
		    
		    // Use command-line arg to determine what functions to call
		    if (argv.printCards) {printBoardCards(board, argv.printOptions, argv.pretty);} 
		    if (argv.printLanes) printLanes(board);
		    if (argv.printRawCard) console.log(getCardById (board, argv.cardId));
		    if (argv.printRawBoard) console.log(board);
		    if (argv.printStats) printStats(board);
		    if (argv.showMethods) console.log(Object.getOwnPropertyNames(client));
		}
	    });
	}
    });

});

// --------------------------------------------------------------------------------------------
// ------------------------  End of File ------------------------------------------------------
// --------------------------------------------------------------------------------------------
