const {User, Post} = require('../Model/user.js');
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const jwtSecret = "5ed43a353a156a24fe57bff5dbe24f024dc6debbc450a607593b8d027d1e00d76b7de2";
const bodyParser = require("body-parser");
const alert = require('alert');


exports.register = async (req, res, next) =>
{
  const username = req.body.username;
  const pass = req.body.password;

  console.log(req.body.password);

  if(pass.length < 6)
  {
    return res.status(400).json({message: "Password too short"});
  }

  bcryptjs.hash(pass, 10).then( async (hash) =>
  {
    await User.create({userName: username, password: hash}).then(user=>
      {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign({id: user.__id, username, role: user.role}, jwtSecret, {expiresIn : maxAge});
        res.cookie("jwt", token, {httpOnly: true, maxAge: maxAge * 1000});
        if(user.role == "admin")
        {
          res.redirect('/admin');
          console.log("Admin assigned");
        }
        else
        {
          res.redirect('/home'); //// TODO: CHANGE DIRECTORY TO HOME PAGE
          console.log("Basic assigned");
        }

        // res.status(200).json({message: "User successfully created"});
      }).catch(err=>
        {
          if(err.message.includes("E11000"))
          {
            // res.status(401).json({message: "User already present. Choose a different username", error: err.message})
           // res.render('register', {status: 401, data: "User already present. Choose a different username})
           res.send('<script> alert("User already present"); console.log("User already present"); window.location = "/register" </script>');
          }
          else
          {
            res.send("<script> alert('User not created. Try again'); window.location='/register' </script>")
            // res.render('register', {status: 401, data:'User not created. Try again'});
          // res.status(401).json({message: "User not created", error: err.message});
          }
        });
  })



};

exports.login = async (req, res) =>
{

  const {username , password } = req.body;

  if(username && password)
  {
    const user = await User.findOne({userName: username}).then((user)=> bcryptjs.compare(password, user.password)
                                                         .then(result=>
                                                         {
                                                           if(result)
                                                           {
                                                             const maxAge = 3 * 60 * 60;
                                                             const token = jwt.sign({id: user.__id, username, role: user.role}, jwtSecret, {expiresIn : maxAge});
                                                             res.cookie("jwt", token, {httpOnly: true, maxAge: maxAge * 1000});
                                                             // res.status(200).json({message: "Login successful",user});
                                                             console.log("HEREEEE!")
                                                             if(user.role == "admin")
                                                             {
                                                               res.redirect('/admin');
                                                               console.log("Admin assigned");
                                                             }
                                                             else
                                                             {
                                                               res.redirect('/home'); ////// TODO: CHANGE TO HOME PAGE
                                                               console.log("Basic assigned");
                                                             }

                                                           }
                                                          else
                                                          {
                                                            res.status(400).json({message: "Login not succesfull", error: "Wrong password entered"})
                                                          }
                                                         }))
                                                         .catch(err=>res.status(400).json({message: "User not found", error: err.message}))
  }
  else
  {
      res.status(400).json({message: "Username or Password not entered"});
  }


};

exports.update = async (req, res)=>
{
  const {role, id} = req.body;
  console.log(role);


  await User.findOne({userName: id})
                             .then((user)=>
                             {
                               if(user.role == "Basic")
                               {
                                 user.role = "admin";
                                 user.save()
                                            .then(()=>res.status(200).json({message: "Role changed to admin"}))
                                            .catch((err)=> res.status(400).json({message: "User role not changed, error: "+ err}));
                               }
                               else
                               {
                                 user.role = "Basic";
                                 user.save()
                                            .then(()=>res.status(200).json({message: "Role changed to basic"}))
                                            .catch((err)=> res.status(400).json({message: "User role not changed, error: "+ err}));
                               }
                             })
    }






exports.deleteUser = async (req, res, next)=>
{
  const id = req.body.id;
  console.log(id);
  //
  // var userA = await User.find({userName:id})
  // console.log(userA)

  await User.findOne({userName:id})
            .then((user)=>{User.deleteOne({userName: user.userName})
                                                        .then(res.status(200).json({message: "User deleted"}))
                                                        .catch(err=> res.status(200).json({message: "User not deleted", error: err.message}));
                          Post.deleteMany({userName:user.userName});
            })
            .catch(err=>res.status(400).json({message: "User not found"}));


}

exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then(users => {
      const userFunction = users.map(user => {
        const container = {}
        container.username = user.userName
        container.role = user.role
        return container
      })
      res.status(200).json({ user: userFunction })
    })
    .catch(err =>
      res.status(401).json({ message: "Not successful", error: err.message })
    )
}



exports.findPosts = async(req, res, next) => {
  const token = req.cookies.jwt;
  let username = "";
  let posts = [];
  if(token)
  {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      console.log("HERE AND " + decodedToken.username);
      username = decodedToken.username;
    })


    await Post.find({userName:username})
                                                    .then(temp => {
                                                      posts = temp
                                                    }).catch(err=>console.log(err));



  }
  return posts;
}

exports.createPost = async(req, res, next) => {
  const token = req.cookies.jwt;

  if(token)
  {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      const instance = new Post({
        Title: req.body.title,
        Text: req.body.post,
        userName: decodedToken.username
      });
      saveInstance(instance);


    })
  }
}

exports.findPost = async(req, res, next) => {
  const token = req.cookies.jwt;
  let username = "";
  let post = "";

  if(token)
  {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
    username = decodedToken.username
    })

    await Post.findOne({userName:username, Title: req.params.param1}).then(pos => {
                                                                          post = pos });

  return post;
  }
}

exports.deletePost = async(req, res, next) => {
    const token = req.cookies.jwt;
    let username = "";
    console.log("DELETE")

    if(token)
    {
      jwt.verify(token, jwtSecret, (err, decodedToken) => {
      username = decodedToken.username
      })
      // console.log(req.)

      await Post.deleteOne({userName:username, Title:req.body.delete}).then(()=>console.log("Record deleted")).catch(err=>console.log("Error :" + err));
    }


}












async function saveInstance(instance){
  await instance.save().then(()=>console.log("Instance saved")).catch(err=>console.log("Error in saving instance"));
};
