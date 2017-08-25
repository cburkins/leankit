var LeanKitClient = require( "leankit-client" );  
var moment = require("moment");
sprintf = require('sprintf-js').sprintf;

var FS=" ";

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
// --------------------------------- Main ------------------------------------------------------
// ---------------------------------------------------------------------------------------------

// Setup yargs to capture command-line args

var argv = require('yargs')
    .usage('Usage: $0 options')
    .demand(['password', 'accountName', 'email'])
    .describe('accountName', 'URL to access board, for example https://<company-name>.leankit.com')
    .describe('password', 'Non-SSO password')
    .describe('email', 'Email address used to login')
    .describe('boardId', '9-digit number that id\'s a specific board')
    .option( "verbose", { describe: "Print lots of debugging info", type: "boolean" } )
    .help()
    .argv;

// Give the given command-line args some sensible names
var accountName=argv.accountName;
var email=argv.email;
var password=argv.password;
var boardId=argv.boardId;

// Get a new object from the LeanKitClient API
var client = new LeanKitClient( accountName, email, password );



// Get the Main board
client.getBoard( boardId, function( err, board ) {
    if ( err ) {
        // Error, we didn't get board correctly from API
        // Shows the error given (messy but informative)
        console.error("Error getting board:", err );
    }
    else {
        // Successfully retrieved board object from Leankit API

	// Print the board
	console.log(board);

    }
});












// --------------------------------------------------------------------------------------------
// ------------------------  End of File ------------------------------------------------------
// --------------------------------------------------------------------------------------------
