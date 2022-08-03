const connectDB = require('./db');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken")
const jwtSecret = "5ed43a353a156a24fe57bff5dbe24f024dc6debbc450a607593b8d027d1e00d76b7de2"


const {adminAuth, userAuth} = require("./middleware/auth");


const { register, login, update, deleteUser , getUsers, findPosts, createPost, findPost, deletePost} = require("./Auth/Auth")


const app = express();
app.set('view engine', 'ejs');

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", require("./Auth/Route"));

connectDB();

app.get("/", (req, res) => res.render("home"))
app.get("/register", (req, res) => res.render("register", {status: 200, data:""}))
app.get("/login", (req, res) => res.render("login", {status: 200, data: ""}))
app.get("/admin", adminAuth, (req, res) => res.render("admin"));

app.post('/')


app.get("/home", userAuth, (req, res)=>{
  findPosts(req,res).then((a)=>
                            res.render("home_user" ,{content: homeStartingContent, postArray:a}))
});

app.get("/compose", (req,res)=>{
  res.render("compose");
});

app.post('/compose', (req, res)=>{
  createPost(req, res);
  res.redirect('/home')
})

app.get('/posts/:param1', (req, res) => {

      findPost(req, res).then( post =>
                              res.render("message", {title:post.Title, content: post.Text})
                            )



// res.send("Try again");
});


app.get("/basic", userAuth, (req, res) => res.render("users"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" })
  res.redirect("/")
});

app.post('/delete', (req, res)=>{
  deletePost(req, res).then(()=>res.redirect('/home'))
})



const server = app.listen('3000', () => {
  console.log("Server started on port 3000");
});















const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
