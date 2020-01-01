## Leankit API

This set of Node.js scripts uses the Leankit API to query and modify Leankit boards. If you own an active Leankit board, it gives you the ability to extract data in ways that the Web GUI does not provide. For example, you can list out all the cards in your board, along with how many people are assigned to each card. I prefer to have a single accountable owner for each card, but Leankit doesn't give me a way to report on that. These command-line tools give me that capability.

### Running it

node ./get_cards_by_lane.js --help

### Requirements: Node.js

You'll need install Node.js. The following directions assume a RedHat compatible OS (including AWS Linux)

-   curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
-   yum -y install nodejs

### Requirements: Node.js library requirements

The following Node.js libraries are required

-   async (via " npm install --save async")
-   columnify
-   config-ini-parser
-   leankit-client
-   moment
-   optimist
-   prompt
-   sprintf-js
-   synchronize
-   yargs

You can install all of them with this simple command

-   npm install <lib-name>

For example

-   npm install leankit-client

To install all needed modules

-   npm install async columnify config-ini-parser leankit-client moment
-   npm install optimist prompt sprintf-js synchronize yargs

### Running the API by hand

To get boardId: simply copy from the end of the URL for the board
To get the cardId: Put your board into API mode (via settings), then easily copy cardId by clicking on it

-   node ./get_cards_by_lane.js --boardId 412731036 --printRawCard
-   node ./get_cards_by_lane.js --boardId 412731036 --cardId 531430446 --printRawCard
