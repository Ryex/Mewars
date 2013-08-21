var fs = require('fs');
var mime = require('mime');//This gets the mime type for files, as node.js doesn't normally have this functionality.

//This controller handles returning the game.html to the user.
function GameController(){
  
    var self = this; //Setting up scope
    
    self.cache = { 'game.html': '' };
    self.cache['game.html'] = fs.readFileSync(global.APP_DIR + '/game.html');

    // define utility functions
    self.cache_get = function(key) { return self.cache[key]; }; //Gets the file from cache
    
    //Gets the game.html file and returns it to the caller.
    self.index = function (req, res) {
        res.set('Content-Type', 'text/html');
        res.send(self.cache_get('game.html') ); //Retrives game.html from the cache
    }
  
    
}

//creates the Controller we will use.
var controller = new GameController();

//Sets up the routes we want to be connected to what
exports.verbs = {
  'get': {//For get requests
     '/game' : controller.index,
  }
}