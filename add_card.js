var LeanKitClient = require( "leankit-client" );  
var moment = require("moment");
sprintf = require('sprintf-js').sprintf;

var FS=" ";

// ---------------------------------------------------------------------------------------------

function addCard(boardId, client, cardTitle, cardDescription, cardTags) {


    // Properties of the new card to add
    var card = {  
	Id: 0,
	Title: cardTitle,
	Description: cardDescription, 
	TypeId: 0,
	Priority: 1,
	Size: 0,
	DueDate: "",
	Tags: "nodejs",
	AssignedUserIds: []
    };
    
    if (cardTags) {
	card.Tags = cardTags
	console.log ("Updated Tags");
    }



    // This will be the relative position of the card
    // in the lane. 0 means the card will be added
    // to the top of the lane ahead of any other cards.
    var position = 0;
    
    
    // We need some information about the board,
    // such as the default card type and drop lane,
    // so we'll get that information first
    client.getBoardIdentifiers( boardId, function( err, boardIdentifiers ) {  
	if ( err ) {
            console.error( "Error getting board identifiers:", err );
            return;
	}
	
	// Find the default drop lane
	var defaultDropLane = null;
	for (var i = 0; i < boardIdentifiers.Lanes.length; i++) {
            var currentLane = boardIdentifiers.Lanes[ i ];
            if ( currentLane.IsDefaultDropLane === true ) {
		defaultDropLane = currentLane;
		break;
            }
	}
	if (! defaultDropLane) {
	    throw("Whoa !  Couldn't find a default droplane for that board");
	}

	
	// Find the default card type
	var defaultCardType = null;
	for (var j = 0; j < boardIdentifiers.CardTypes.length; i++) {
            var currentType = boardIdentifiers.CardTypes[ j ];
            if ( currentType.IsDefault === true ) {
		defaultCardType = currentType;
		break;
            }
	}
	
	// Set the card type
	card.TypeId = defaultCardType.Id;

	// Add the card
	client.addCard( boardId, defaultDropLane.Id, position, card, function( err, response ) {
            if ( err ) console.error( "Error adding card:", err );
//            console.log( response );
	} );
	
    } );
}


// ---------------------------------------------------------------------------------------------
// --------------------------------- Main ------------------------------------------------------
// ---------------------------------------------------------------------------------------------

// Setup yargs to capture command-line args

var argv = require('yargs')
    .usage('Usage: $0 options')
    .demand(['password', 'accountName', 'email', 'T', 'D'])
    .describe('accountName', 'URL to access board, for example https://<company-name>.leankit.com')
    .describe('password', 'Non-SSO password')
    .describe('email', 'Email address used to login')
    .describe('boardId', '9-digit number that id\'s a specific board')
    .describe('T', 'Title for your new card')
    .describe('D', 'Description for your new card')
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

addCard(boardId, client, argv.T, argv.D, "ISM Change");

// --------------------------------------------------------------------------------------------
// ------------------------  End of File ------------------------------------------------------
// --------------------------------------------------------------------------------------------
