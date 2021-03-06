var fs = require('fs');
var mime = require('mime');
// Control the resources, control the people.
function ResourceController(){
    var self = this;
    
    self.index = function(req, res){
            res.send(404, "Not found");
            
            
    }
    
    self.cacheThis = function(req, res, filepath){
      fs.stat(filepath, function (err, stat) {
        if (err) {
          console.log(err.stack)
          res.send(500, 'Internal Server Error')
        }
        else {
          var etag = stat.size + '-' + Date.parse(stat.mtime);
          res.set('Last-Modified', stat.mtime);

          if (req.get('if-none-match') === etag) {
            res.send(304, 'Not Modified')
          }
          else {
            fs.readFile(filepath, function(err,data){
              if (err) {
                console.log(err.stack)
                res.send(500, 'Internal Server Error')
              }
              res.set('Cache-Control', 'max-age=0, must-revalidate');
              res.set('ETag', etag);
              res.send(data);
            });
          }
        }
      })
    }
    
    self.image = function(req, res){
       var filepath = "";
       var type = parseInt(req.params.type);
       var name = req.params.name;
       
       switch(type){
           case 0:
               filepath = global.APP_DIR + "/resources/Images/Tiles/" + name;
           break;
           case 1:
               filepath = global.APP_DIR + "/resources/Images/Sprites/" + name;
           break;
           case 2:
               filepath = global.APP_DIR + "/resources/Images/Interface/" + name;   
           break;
       }
       
       fs.exists(filepath, function(exists){
          if(exists){
              var mimeType = mime.lookup(filepath);
              res.set('Content-Type', mimeType);
              self.cacheThis(req, res, filepath);
          }else{
              res.send(404, "Not Found");
          }
       });
    }
    
    self.audio = function(req, res){
        var name = req.params.name;
        var filepath = global.APP_DIR + "/resources/Audio/" + name;
        
       fs.exists(filepath, function(exists){
          if(exists){
              var mimeType = mime.lookup(filepath);
              res.set('Content-Type', mimeType);
              self.cacheThis(req, res, filepath);
          }else{
              res.send(404, "Not found");
          }
       });
    }
}

var controller = new ResourceController();

// define routes we handle here
exports.verbs = {
    'get':  {

        '/resource/image/:type/:name' : controller.image,
        '/resource/audio/:name' : controller.audio
    },
    'post': {

    }


};
