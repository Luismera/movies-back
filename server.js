const express = require('express');
const server = express();
let movies = require('./data/movies');

const body_parser = require('body-parser');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads' });
var path = require('path');
var fs = require('fs');

const port = 4000;

// parse JSON (application/json content-type)
server.use(body_parser.urlencoded({extended:false}));
server.use(body_parser.json());

// configurar cabeceras http
server.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

	next();
});

server.get("/", (req, res) => {
   res.sendFile(__dirname + '/index.html');
});

server.get("/movies", (req, res) => {
   res.json(movies);
});

server.get("/movies/:id", (req, res) => {
   const itemId = req.params.id;
   const item = movies.find(_item => _item.id === itemId);

   if (item) {
      res.json(item);
   } else {
      res.json({ message: `item ${itemId} doesn't exist` })
   }
});

server.post("/movies", (req, res) => {
   const item = req.body;
   console.log('Adding new item: ', item);

   // add new item to array
   movies.push(item);

   // return updated list
   res.json(movies);
});

// update an item
server.put("/movies/:id", (req, res) => {
   const itemId = req.params.id;
   const item = req.body;
   console.log("Editing item: ", itemId, " to be ", item);

   const updatedListItems = [];
   // loop through list to find and replace one item
   movies.forEach(oldItem => {
      if (oldItem.id === itemId) {
         updatedListItems.push(item);
      } else {
         updatedListItems.push(oldItem);
      }
   });

   // replace old list with new one
   movies = updatedListItems;

   res.json(movies);
});

// delete item from list
server.delete("/movies/:id", (req, res) => {
   const itemId = req.params.id;

   console.log("Delete item with id: ", itemId);

   // filter list copy, by excluding item to delete
   const filtered_list = movies.filter(item => item.id !== itemId);

   // replace old list with new one
   movies = filtered_list;

   res.json(movies);
});

// upload image item
server.post("/upload-image/:id", [md_upload], (req, res) => {
	const itemId = req.params.id;
   var file_name = 'No subido...';
   
   const updatedListItems = [];

	if(req.files){
      var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[1];
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){

         movies.forEach(oldItem => {
            if (oldItem.id === itemId) {
               oldItem.cover = file_name
               updatedListItems.push(oldItem);
            }else {
               updatedListItems.push(oldItem);
            }
         });

         // replace old list with new one
         movies = updatedListItems;

         res.json(movies);

		}else{
			res.status(200).send({message: 'Extensión del archivo no valida'});
		}
		
	}else{
		res.status(200).send({message: 'No has subido ninguna imagen...'});
	}
})

server.get("/get-image/:imageFile", (req, res) => {
	var imageFile = req.params.imageFile;
	var path_file = './uploads/'+imageFile;
	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'No existe la imagen...'});
		}
	});
})

server.post("/user/login", (req, res) => {
   const item = req.body;
   let resp = {}
   console.log('Adding new item: ', item);

   // add new item to array
   if (item.username == "test" && item.password == "test1234") {
      resp = {
         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNkZjMyNDV3c2YiLCJ1c2VybmFtZSI6InRlc3QiLCJwYXNzd29yZCI6InRlc3QxMjM0In0.cayPe76PQnkffb0lPl3nPiHCpZRx5eVmiM7-l4DltYw"
      };
   } else {
      resp = {
         error: "Usuario o contraseña incorrectos"
      };
   }

   // return updated list
   res.json(resp);
});

server.listen(port, () => {
   console.log(`Server listening at ${port}`);
});