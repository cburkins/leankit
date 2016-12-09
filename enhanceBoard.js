

// ---------------------------------------------------------------------------------------------
// Local
// Given an array of Leankit lanes and a single id, return the requested lane (using Id)

function getLaneById (lanes, id) {

    var match;
    for (var i=0; i<lanes.length; i++) {
	if (lanes[i].Id === id) return lanes[i]; 
    }
    
    // If we got to here, no match, so return undefined
    return undefined;
}

// ---------------------------------------------------------------------------------------------
// Local

function enhanceCardWithParentLanes (board, c) {

    // get current laneId and parentLaneId
    var currentLane = getLaneById(board.Lanes, c.LaneId);
    var parentLane = getLaneById(board.Lanes, currentLane.ParentLaneId);
    
    c.laneName = [currentLane.Title];
    
    while (parentLane != undefined) {
	
	// Add the parent lane to the *front* of array
	c.laneName.unshift(getLaneById(board.Lanes, currentLane.ParentLaneId).Title);

	// Get the Parent Lane for the next loop
	currentLane = parentLane;
	parentLane = getLaneById(board.Lanes, currentLane.ParentLaneId);
    }
}

// ---------------------------------------------------------------------------------------------
// Local

function enhanceCard (board, card) {

    var moment = require("moment");

    // Add AcceptanceFlag boolean to card
    card.hasAcceptCriteria = false;
    if (card.Description.indexOf("Acceptance Criteria") != -1) card.hasAcceptCriteria=true;

    // Compute and add LastMoved and LastActivityDurations to card
    var now = moment();
    card.movedDuration = now.diff(  Date.parse(card.LastMove)  , 'days');
    card.activityDuration = now.diff(  Date.parse(card.LastActivity)  , 'days');

    // Add parent lane names to each card
    enhanceCardWithParentLanes (board, card);

    // Add board title to each card
    card.boardTitle = board.Title;
}

// ---------------------------------------------------------------------------------------------
// Exported

module.exports.enhanceBoard = function (board) {

    var lanes = board.Lanes;

    // Loop through Lanes and print all cards
     for (var i = 0; i < lanes.length; i++) {
	 // Loop through cards in a lane
	 for (var j=0; j<lanes[i].Cards.length; j++) {

	     var card = lanes[i].Cards[j];
	     
	     enhanceCard(board, card);

	 }
     }
}

