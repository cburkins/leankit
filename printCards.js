var columnify = require('columnify');


// ---------------------------------------------------------------------------------------------

printCardRequestedFields = function (c, lineCount, printOptions) {
    // c: Leankit Card object
    // lineCount: integer that gets printed at beginning of output line
    // printOptions: string of capital letters that denotes which columns to print (e.g. ACDG)


    var FS=" ";
    var outputString="";

    var printLine = new Object();

    // else, only print the specific fields that the user requested
    for (var i=0; i<printOptions.length; i++) {

	switch(printOptions[i]) {
	case 'A': {
            printLine.CardNum = lineCount;
	    break; }
	case 'B': {
	    printLine.lastMoved = c.movedDuration;
	    break; }
	case 'C': {
	    // Chad, had to change this to lastMoveDay so it doesn't conflict with original variable lastMove
	    printLine.lastMoveDay = c.lastMoveDay;
	    break; }
	case 'D': {
	    printLine.ActivityDur=sprintf("%02d", c.activityDuration);
	    break; }
	case 'E': {
	    // has Acceptance Criteria
	    printLine.AC=sprintf("%s", c.hasAcceptCriteria);
	    printLine.AC=c.hasAcceptCriteria;
	    break; }
	case 'F': {
	    printLine.IsBlocked = sprintf("%s", c.IsBlocked);
	    break; }
	case 'G': {
	    printLine.Tags=sprintf("%s", c.Tags);
	    break; }
	case 'H': {
	    printLine.externalURLName=sprintf("%s", c.ExternalSystemName);
	    printLine.externalURLLink=sprintf("%s", c.ExternalSystemUrl);
	    break; }
	case 'I': {
	    printLine.CardID = sprintf("%s", c.Id);
	    break; }
	case 'L': {
	    // Print 3 lanes
	    printLine.Lane1=sprintf("%s", c.Lane1);
	    printLine.Lane2=sprintf("%s", c.Lane2);
	    printLine.Lane3=sprintf("%s", c.Lane3);
	    break; }
	case 'P': {
	    // Points (or Size)
	    printLine.Points=sprintf("%d", c.Size);
	    break; }
	case 'Y': {
	    printLine.TypeId=sprintf("%s", c.TypeId);
	    break; }
	case 'Z': {
	    printLine.TypeName=sprintf("%s", c.TypeName);
	    break; }
	case 'T': {
	    printLine.Title=sprintf("%s", c.Title.substr(0,39));
	    break; }
	case 'X': {
	    printLine.BoardTitle=sprintf("%s", c.boardTitle.substr(0,39));
	    break; }
	case 'W': {
	    printLine.TitleLength=sprintf("%d", c.Title.length);
	    break; }
	case 'V': {
	    printLine.NumUsers = sprintf("%d", c.AssignedUsers.length);
	    break; }
	case 'U': {
	    printLine.Users=sprintf("%s", c.Users.substr(0,29));;
    	    break; }
	default: {
	    throw("Bad print option!!");
	    break; }
	}
    }

    return (printLine);
}


// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------

printCardAllFields = function (c, lineCount, printOptions) {
    // c: Leankit Card object
    // lineCount: integer that gets printed at beginning of output line
    // printOptions: string of capital letters that denotes which columns to print (e.g. ACDG)

    var FS=" ";
    var outputString="";

    var printLine = new Object();


    for (var key in c) {
	if (c.hasOwnProperty(key)) {
            printLine[key] = c[key];
	}
    }


    return (printLine);
}


// ---------------------------------------------------------------------------------------------

module.exports.printCards = function (cards, printOptions, pretty, jsonOutput) {
    
    // Expecting a flat array of all the cards that you want to print

    // Sort the cars by Activity Duration (time since card last saw an update)
    //cards.sort(function(a, b) { return b.activityDuration - a.activityDuration } );

    // Sort the cars by Duration since Move (time since card last saw an update)
//    cards.sort(function(a, b) { return b.movedDuration - a.movedDuration } );

    // Sort the cars by the length of it's Title (Description) field
    //cards.sort(function(a, b) { return b.Title.length - a.Title.length } );

    var printData = new Array();

    // Loop through all the cards, and get an output line for each
    for (var i = 0; i < cards.length; i++) {
	if (jsonOutput) {
	    printLine = printCardAllFields(cards[i], i+1, printOptions);
	}
	else {
	    printLine = printCardRequestedFields(cards[i], i+1, printOptions);
	}	    

	// Push the newly-created line into the array of output
	printData.push(printLine);

    }


    if (pretty) {
	// Spit out the entire dataset, nicely arranged in columns
	// Center-justify all the columns in the printout
	columnifyOptions= {config: {
            BoardNum: {align: 'center'},
            lastMoved: {align: 'center'},
	    columnSplitter: ' | '
	}};
    
        // Use columnify to print JSON object with column headers
        console.log(columnify(printData, columnifyOptions));
    }
    else if (jsonOutput) {
	console.log(JSON.stringify(printData));
    }
    else {
        // Print out key-value pairs which is handy for grep filters
        for (var i=0; i<printData.length; i++) {
            printLine=printData[i];
            keys = Object.keys(printLine);
            for (var j=0; j<keys.length; j++) {
                key=keys[j];
                process.stdout.write(sprintf("%s:%s  ", key, printLine[key]));
            }
            console.log();
        }
    }

    console.log();

}

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
