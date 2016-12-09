var LeanKitClient = require( "leankit-client" );  
var moment = require("moment");
var columnify = require('columnify');
sprintf = require('sprintf-js').sprintf;
getEveryBoard = require('./getEveryBoard.js').getEveryBoard;
printCards = require('./printCards.js').printCards;
enhanceBoard = require('./enhanceBoard.js').enhanceBoard;


var sync = require('synchronize');
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;

var FS=" ";

// Example of JSON structure for a board
//
// { Id: 412731036,
//   Title: 'Iris GPO Demand Planning',
//   Description: null,
//   IsArchived: false,
//   CreationDate: '11/16/2016',
//   IsBreakoutBoard: false,
//   ParentId: 0,
//   DrillThroughBoards: [],
//   BreakoutBoards: null,
//   IsPrivate: false,
//   DefaultDropLaneId: 413179851 },


// -----------------------------------------------------------------------------------

// Given a list of boards, loops through the boards, and prints key info
function printBoards(boards, pretty) {

    // Sort the boards
    boards.sort(function(a, b) { return a.cardCount - b.cardCount } );

    var printData = new Array();
    // Loop through Lanes and print Lane Title
    for (var i = 0; i < boards.length; i++) {

	printOptions="ABCDEFGT";

	var printLine = new Object();

	for (var j=0; j<printOptions.length; j++) {

            switch(printOptions[j]) {
            case 'A': {
		printLine.BoardNum = i;
		break; }
            case 'B': {
		printLine.ID = boards[i].Id;
		break; }
            case 'C': {
		printLine.CreationDate = boards[i].CreationDate;
		break; }
            case 'D': {
		printLine.laneCount = boards[i].laneCount;
		break; }
            case 'E': {
		printLine.cardCount = boards[i].cardCount;
		break; }
            case 'F': {
		printLine.ChadCount = boards[i].chadCount; 
		printLine.AliceCount = boards[i].aliceCount; 
		printLine.TaraCount = boards[i].taraCount; 
		printLine.AmyCount = boards[i].amyCount; 
		break; }
            case 'G': {
		printLine.isPrivate = boards[i].IsPrivate.toString(); 
		break; }
            case 'T': {
		printLine.Title = boards[i].Title; 
		break; }
		}
	}
	printData.push(printLine);


    }
    console.log();

    // Center-justify all the columns in the printout
    columnifyOptions= {config: {
	BoardNum: {align: 'center'},
	cardCount: {align: 'center'},
	laneCount: {align: 'center'},
	ChadCount: {align: 'center'},
	AliceCount: {align: 'center'},
	TaraCount: {align: 'center'}
    }};
    
    // Spit out the entire dataset, nicely arranged in columns
    if (pretty) {
	// Use columnify to print JSON object with column headers
	console.log(columnify(printData, columnifyOptions));
    }
    else {
	// Print out key-value pairs which is handy for grep filters
	for (var i=0; i<printData.length; i++) {
	    printLine=printData[i];
	    keys = Object.keys(printLine);
	    for (var j=0; j<keys.length; j++) {
		key=keys[j];
		process.stdout.write(sprintf("%s:%s ", key, printLine[key]));
	    }
	    console.log();
	}
    }
    console.log();
}



// ---------------------------------------------------------------------------------------------

getCards = function (boards) {

    // Create an empty array
    allCards = [];

    // Loop through all boards
    for (var i=0; i<boards.length; i++) {
	board = boards[i];

	// Enhance each board with new key data
	enhanceBoard(board);
	
	// loop through all lanes
	for (var j=0; j<board.Lanes.length; j++) {
	    lane=board.Lanes[j];

	    // loop through all cards
	    for (var k=0; k<lane.Cards.length; k++) {
		card = lane.Cards[k];
		// Keep pushing cards into one big array
		allCards.push(card);
	    }
	}
    }
    return allCards;

}

// ---------------------------------------------------------------------------------------------
// --------------------------------- Main ------------------------------------------------------
// ---------------------------------------------------------------------------------------------

// Setup yargs to capture command-line args

var argv = require('yargs')
    .usage('Usage: $0 options')
    .demand(['password', 'accountName', 'email'])
    .describe('accountName', 'URL to access board, for example https://<company-name>.leankit.com')
    .describe('password', 'Non-SSO password')
    .describe('email', 'Email address used to login')

    .option( "verbose", { describe: "Print lots of debugging info", type: "boolean" } )
    .option( "pretty", { describe: "Setup output in pretty columns", type: "boolean" } )
    .help()
    .argv;

// Give the given command-line args some sensible names
var accountName=argv.accountName;
var email=argv.email;
var password=argv.password;
var boardId=argv.boardId;

// Get a new object from the LeanKitClient API
var client = new LeanKitClient( accountName, email, password );

newBoards = []; 

// Need to wait for getEveryBoard to finish, then execute rest of calls
fiber(function() {
    await(getEveryBoard(client, argv.verbose, defer()));
    
    printBoards(newBoards, argv.pretty);
    
    allCards = getCards(newBoards);
    
    console.log("Number of Cards: ".concat(allCards.length));

//    printCards(allCards, "ABCDTX");
});
   


// --------------------------------------------------------------------------------------------
// ------------------------  End of File ------------------------------------------------------
// --------------------------------------------------------------------------------------------
