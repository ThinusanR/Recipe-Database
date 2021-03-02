
var mongodb;
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var mongodbClient = require('mongodb').MongoClient;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

app.set('view engine', 'pug');

mongodbClient.connect('mongodb://localhost:27017/recipeDB', function(err, mdb){
	if(err)
		console.log('Not able to connect to database!');
	else
		mongodb = mdb;
});

app.listen(2406, function () {
  console.log('Server is listening on port 2406!')
})

app.get('/', function (req, res) {
  res.render('index', {
	  title: 'COMP2406 Recipe Viewer', 
	  message: 'Comp2406 Recipes Database!'
	})
})

app.get('/recipes', function (req, res) {
	mongodb.collection('recipes', function(err, table) {
		table
			.find()
			.toArray(function(err, recipes) {
				if(err) 
					throw err;
				
				var listOfRecipes = []; 
				recipes.forEach(function(recipe, index, arr) {
					if(recipe.name){
						listOfRecipes.push(recipe.name);
					}
				});

				res.contentType('application/json');
				res.send(JSON.stringify({names: listOfRecipes}));
		});
	});
})

app.post('/recipe', function(req, res) {				
	var reqName = req.body.name;
	if(reqName===''){
		res.status(400).send('bad request');
		
	}else{
		var table = mongodb.collection("recipes");
		table.findOne({name:reqName}, function(err, recipe) {
			if(err) 
				throw err;
		
			var recipeObj = {
				name:req.body.name, 
				duration:req.body.duration, 
				ingredients:req.body.ingredients, 
				directions:req.body.directions, 
				notes:req.body.notes
			};
		
			if(recipe==null){
				table.insertOne(recipeObj, function(err, result){
					if(err)
						res.status(500).send('server error');
					else
						res.status(200).send('OK');
				}); 
			}else{

				table.update({name:reqName}, recipeObj, function(err, result){
					if(err)
						res.status(500).send('server error');
					else
						res.status(200).send('OK');
				}); 
			}
		});	
	}
});

app.get('/recipe/:name', function (req, res) {
	var reqName = req.params.name;
	mongodb.collection('recipes', function(err, table) {
		table.findOne({name:reqName}, function(err, recipe) {
			if(err) 
				throw err;
			
			if(!recipe){
				res.status(404).send('Not found');
			}else{
				var item = {
					name:recipe.name, 
					duration:recipe.duration, 
					ingredients:recipe.ingredients, 
					directions:recipe.directions, 
					notes:recipe.notes
				};

				res.contentType('application/json');
				res.send(JSON.stringify(item));	
			}
		});
	});
})