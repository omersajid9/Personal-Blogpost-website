const Mongoose = require('mongoose');

const UserSchema = Mongoose.Schema({
  userName :
  {
    type: String,
    unique: true,
    required: true
  },

  password :
  {
    type: String,
    minlength: 6,
    required: true
  },
  role :
  {
    type: String,
    default: "Basic",
    required: true
  }

});

const PostSchema = new Mongoose.Schema({
  Title: String,
  Text: String,
  userName: String
});

const Post = Mongoose.model("Post", PostSchema);

const User = Mongoose.model("User", UserSchema);
module.exports.User = User;
module.exports.Post = Post;
