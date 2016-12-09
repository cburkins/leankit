
// ---------------------------------------------------------------------------------------------
// Local use (in this file only)

function getCardsFromBoard(board) {

    var lanes = board.Lanes;
    var cards = [];

    // Loop through Lanes and print all cards
    for (var i = 0; i < lanes.length; i++) {
        for (var j=0; j<lanes[i].Cards.length; j++) {
            cards.push(lanes[i].Cards[j]);
        }
    }
    return(cards);
}


// ---------------------------------------------------------------------------------------------
// Local use (in this file only)

addBoardStats = function (boardSummary, boardComplete) {

    boardComplete.laneCount = boardComplete.Lanes.length;

    boardComplete.cardCount = 0;
    boardComplete.chadCount = 0;
    boardComplete.aliceCount = 0;
    boardComplete.taraCount = 0;
    boardComplete.amyCount = 0;
    
    cards = getCardsFromBoard(boardComplete);
    boardComplete.cardCount += cards.length;

    // Transfer a few key details from boardSummary to boardComplete
    boardComplete.CreationDate = boardSummary.CreationDate;
    boardComplete.IsPrivate    = boardSummary.IsPrivate;


    for (t=0; t<cards.length; t++) {
	c = cards[t];
	// Construct string containing "Assigned Users" for this card
	var names = "";
	for (var k=0; k<c.AssignedUsers.length; k++) {
	    names = names.concat(",", c.AssignedUsers[k].FullName);
	}
	// Check to see if Chad is in names
	if (names.includes("Chad Burkins")) boardComplete.chadCount++;
	if (names.includes("Alice Ludovici")) boardComplete.aliceCount++;
	if (names.includes("Tara O")) boardComplete.taraCount++;
	if (names.includes("Amy Ferris")) boardComplete.amyCount++;
	
    }

    return boardComplete;
}


// ---------------------------------------------------------------------------------------------
// Exported so that other files can use it

module.exports.getEveryBoard = function (client, verbose, callback) {


    // Single API call to get list of all boardss
    client.getBoards( function( err, boards ) {  
	if ( err ) console.error( "Error getting boards:", err );
	
	// Truncate array for debugging, limits the number of board we query, so quicker
	boards.length=10;
	
	var callbacks=0;
	for (var i = 0; i < boards.length; i++) {
	    
	    // Get a complete (single) board
	    callbacks++; 
	    client.getBoard(boards[i].Id, function addBacklog(err, boardComplete) {
		
		if ( err ) { console.error("Error getting board:".concat(this.boardNum), err ); }
		else {
		    // Successfully got board
		    
		    // Get the backlog lanes now, and then append them to the main board
		    client.getBoardBacklogLanes(boards[this.boardNum].Id, function parseBacklog(err, boardBacklogLanes) {


			if ( err ) { console.error("Error getting board:".concat(this.boardNum), err ); }
			else {
			    
			    // Append the backlog lanes to the board
			    boardComplete.Lanes = boardComplete.Lanes.concat(boardBacklogLanes);

			    // Parse the board, and gather a few key stats (e.g. card count, Chad Card Count, etc)
			    boardComplete = addBoardStats(boards[this.boardNum], boardComplete);
			    
			    // Add the newly acquired board to a list of boards 
			    //   (that we eventually return after all callbacks complete
			    newBoards.push(boardComplete);

			    if (verbose) 
				console.log(sprintf("Board Num: %03d     Completed: %03d    Callbacks: %03d", 
						    this.boardNum, newBoards.length, callbacks));
			    
			    // Have each callback check to see if they are the *last* callback
			    callbacks--;
			    if (callbacks == 0) { 
				console.log("Done with all async functions, last callback");
				callback();
			    }
			}
		    }.bind({boardNum:this.boardNum}));
		}
	    }.bind({boardNum:i}));
	}

    });
}


// --------------------------------------------------------------------------------------------
// ------------------------  End of File ------------------------------------------------------
// --------------------------------------------------------------------------------------------
