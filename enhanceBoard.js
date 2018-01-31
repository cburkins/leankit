
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

module.exports.enhanceCard = function  (board, card, cardDetailed, cardComments) {

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
    var d = new Date(cardDetailed.CreateDate);
    card.created = sprintf("%02d/%02d/%d", d.getMonth()+1, d.getDate(), d.getFullYear());
    //card.created = "08/01/2017"

    // Add card comments
    card.allComments = cardComments
}

// ---------------------------------------------------------------------------------------------

module.exports.enhanceBoard = function(theBoard, leankitClient, parentCallback) {
        var cardAPICount = 0;
        var lanes = theBoard.Lanes;

        // Convert the cards from a 2-dimensional array to 1-dimensional array
        allCards = [];
        for (var laneNumber = 0; laneNumber < lanes.length; laneNumber++) {
            // Loop through cards in a lane
            for (var j = 0; j < lanes[laneNumber].Cards.length; j++) {
                var card = lanes[laneNumber].Cards[j];
                allCards.push(lanes[laneNumber].Cards[j]);
            }
        }

        // async.forEach takes three arguments
        // Arg1: the array to loop through
        // Arg2: the async function to run for each member of array (these all run concurrently)
        // Arg3: the function to call when *all* async functions retrun
        async.forEach(
            allCards,
            function(singleCard, callback) {
                // async lib passes us a callback, which we need to call when we're done
                leankitClient.getCard(theBoard.Id, singleCard.Id, function(err, singleCardDetailed) {
                    // this anonymous function is called when async getCard gives us a card

                    leankitClient.getComments(theBoard.Id, singleCard.Id, function (err, commentsFromAPI) {
                        // second API call (to get gomments) is now finished

                        // Now that we have two key pieces (detailedCard and Comments), add those to the card
                        enhanceCard(theBoard, singleCard, singleCardDetailed, commentsFromAPI);

                        // Signal async library that this card is complete.
                        // Once ALL cards are complete, the function below gets called
                        callback();
                    });
                });
            },
            function(err) {
                vprint ("All API calls (to get cards) have finished");
                parentCallback(null, "Done");
            })
    }

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
