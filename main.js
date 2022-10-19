const express = require('express')
const session = require("express-session");
const app = express()
const fs = require("fs");
const port = process.env.PORT||5000;
// const port = 3000;  //TODO Change before Deployement


app.use(express.static("public"));
app.use(express.json()); //middleware used to parse json data
app.use(express.urlencoded({extended:true})); //middleware used to parse form data
app.use(session({
	secret:'keyboard cat',
	resave:false,
	saveUninitialized:true,
	cookie:{secure:false}
}))
//setting middleware for templating
app.set("view engine","ejs");
app.set("views","./views");

app.get('/', Home);
app.get("/about",About);
app.route("/todo").get(GetTodo).post(PostTodo);
app.route("/delete").get(DeleteTodo).post(DeleteTodo);
app.post("/edit",EditTodo);
app.post("/complete",CompleteTodo);


app.route("/login").get(function(req,res){
	res.sendFile(__dirname+"/public/html/login.html")
}).post(function(req,res){
	// console.log(req.body);
	getUser(function(users){
		const user = users.filter(function(user){
			if(user.username===req.body.username && user.password===req.body.password){
				return true
			}
		})
		if(user.length){
			req.session.isLoggedIn = true;
			console.log("user looks like ",user);
			req.session.username = user[0].username;
			res.redirect('/');
		}
		else{
			res.redirect('/login');
		}
	})
	// res.sendFile(__dirname+"/public/html/index.html");
});

app.route("/signup").get(function(req,res){
	res.sendFile(__dirname+"/public/html/signup.html")
}).post(function(req,res){
	console.log(req.body);

	saveUser(req.body,function(err){
		if(err){
			res.end("Something Went Horribly Wrong!");
		}
		else{
			res.redirect('/login');
		}
	})
});

app.route("/logout").get(function(req,res){
	req.session.destroy();
	res.redirect("/login");
})


app.listen(port, () => {
	console.log(`Server is Live running at http://localhost:${port}`);
})

function Home(req,res){
	if(req.session.isLoggedIn){
		// res.sendFile(__dirname+"/public/html/index.html");
		getTodos(function(err,todos){
			const userTodo = todos.filter(function(todo){
				return todo.createdBy === req.session.username;
			});
			// res.render("partials/header",{data:req.session.username});
			res.render("home",{data:userTodo,usname:req.session.username}); //home.ejs
		})
	}
	else{
		res.redirect("/login");
	}
}

function About(req,res){
	res.sendFile(__dirname+"/public/html/about.html");
}

function GetTodo(req,res){
	console.log("In GetTodo");      //1
	getTodos(function(err,data){
		console.log("in getTodos");    //4
		//console.log(res.json(data));
		res.json(data);
	})
}

function PostTodo(req,res){
	console.log("In Post Todo");    //5
	const todo = {
		text: req.body.text,
		createdBy: req.session.username,
		strike:false
	}
	saveTodos(todo,function(){
		console.log("in saveTodos");   //10
		res.redirect("/");
	})
}

function DeleteTodo(req,res){
	console.log("In Delete Todo");
	console.log("req body: ",req.body);
	delTodos(req.body,function(){
		console.log("in delTodos");
		res.redirect("/");
	})
}

function EditTodo(req,res){
	console.log("In Edit Todo");
	console.log("req body: ",req.body);
	editTodos(req.body,function(){
		console.log("in editTodos");
		res.end();
	})
}

function CompleteTodo(req,res){
	console.log("In Complete Todo");
	console.log("req body: ",req.body);
	compTodos(req.body,function(){
		console.log("in compTodos");
		res.redirect('/');
	})
}


function getTodos(callback){
	console.log("reading file");   //2 //6
	fs.readFile("./dbfile.txt","utf-8",function(err,data){
		if (err){
			callback(err,null);
			return;
		}
		console.log("data read",data);   //3  //7
		console.log("sending this ",JSON.parse(data));
		callback(null,JSON.parse(data));
	})
}


function saveTodos(todo,callback){
	getTodos(function(err,todos){
		//console.log("pushing todo and writing todo"); //8
		todos.push(todo);
		//console.log("todo , todos:",todo,todos); //9
		fs.writeFile("./dbfile.txt",JSON.stringify(todos),function(err){
			if(err){
				callback(err,null);
				return;
			}
			callback(null);
		})
	})
}

function delTodos(todo,callback){
	getTodos(function(err,todos){
		console.log("getting todos");
		console.log("B4 todo, todos: ",todo,todos);
		todos.splice(todos.findIndex(a => a.text === todo.delete) , 1);
		console.log("After todo,todos:",todo,todos);
		//console.log("removed "+todo+" from db");
		fs.writeFile("./dbfile.txt",JSON.stringify(todos),function(err){
			if(err){
				callback(err,null);
				return;
			}
			callback(null);
		})
	})
}

function editTodos(todo,callback){
	getTodos(function(err,todos){
		console.log("editingg..");	
		console.log("B4 todo, todos: ",todo,todos);
		var index = todos.findIndex(a=>a.text===todo.text);
		todos[index].text = todo.ntext;
		console.log("after todos: ",todos);
		fs.writeFile("./dbfile.txt",JSON.stringify(todos),function(err){
			if(err){
				callback(err,null);
				return;
			}
			callback(null);
		})
	})
	// callback(null);
}

function compTodos(todo,callback){
	getTodos(function(err,todos){
		console.log("completing..");
		console.log("B4 todo,todos: ",todo,todos);
		var index = todos.findIndex(a=>a.text==todo.strike);
		try{

		todos[index].strike = true;
		}catch(err){
			console.log(err);
			// alert("invalid action");
		}
		console.log("after compl: ",todos);
		fs.writeFile("./dbfile.txt",JSON.stringify(todos),function(err){
			if(err){
				callback(err,null);
				return;
			}
			callback(null);
		})
	})
}

function getUser(callback){
	fs.readFile("./users.txt","utf-8",function(err,data){
		if(data){
			callback(JSON.parse(data));
		}
	})
}

function saveUser(user,callback){
	getUser(function(users){
		users.push(user);
		fs.writeFile("./users.txt",JSON.stringify(users),function(){
			callback();
		})
	})
}	

//Built By Shubham Vora
