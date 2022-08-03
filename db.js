const mongoose = require('mongoose');


const connectDB = async () =>{
  mongoose.connect("mongodb://127.0.0.1:27017/role_auth",
    {
      ssl:false,
      useNewUrlParser: true
    }).then(()=>
    {
      console.log("Database connected!")
    }).catch(err=>{
      console.log("Error in connecting database : " + err)
    });
};

module.exports = connectDB;
