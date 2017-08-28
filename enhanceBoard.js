
var async = require('async');


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

module.exports.enhanceCard = function  (board, card, cardFromAPI) {

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
    card.Lane1=sprintf("%s", card.laneName[0]);
    card.Lane2=sprintf("%s", card.laneName[1]);
    card.Lane3=sprintf("%s", card.laneName[2]);
    
    // Add board title to each card
    card.boardTitle = board.Title;
    
    // Construct string containing "Assigned Users" for this card
    var users = "";
    for (var k=0; k<card.AssignedUsers.length; k++) {
	users = users.concat(",", card.AssignedUsers[k].FullName)  }
    users=users.replace(/^,/, "");
    card.Users = users;

    // Add date (rather than date/time) for the day it was last moved
    var d = new Date(card.LastMove);
    card.lastMoveDay = sprintf("%02d/%02d/%d", d.getMonth()+1, d.getDate(), d.getFullYear());

    // Chad, test adding a created date
    var d = new Date(cardFromAPI.CreateDate);
    card.created = sprintf("%02d/%02d/%d", d.getMonth()+1, d.getDate(), d.getFullYear());
    //card.created = "08/01/2017"

}

// ---------------------------------------------------------------------------------------------

module.exports.enhanceBoard = function(testBoard, leankitClient, parentCallback) {
        var cardAPICount = 0;
        var lanes = testBoard.Lanes;

        allCards = [];
        console.log("Function 2.1");
        // callback(null, 1,2)
        for (var i = 0; i < lanes.length; i++) {
            // Loop through cards in a lane
            for (var j = 0; j < lanes[i].Cards.length; j++) {
                var card = lanes[i].Cards[j];
                allCards.push(lanes[i].Cards[j]);
                console.log(sprintf("%d %d  (%d %d)", i, j, testBoard.Id, card.Id))
                console.log("Bye");
            }
        }

        async.forEach(
            allCards,
            function(aCard, callback) {
                console.log("calling...")
                leankitClient.getCard(testBoard.Id, aCard.Id, function(err, cardFromAPI) {
                    console.log(sprintf("got card: %d %d %d", testBoard.Id, aCard.Id, cardFromAPI.Id));
                    enhanceCard(testBoard, aCard, cardFromAPI);
                    callback();
                });
            },
            function(err) {
                console.log("all calls have finished 42");
                parentCallback(null, "Done");
            })
    }

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
