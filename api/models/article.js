var mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
  title: String,
  article_url: String,
  created_at: Date, 
  category: String,
  content: String,
  image: String
});

module.exports = mongoose.model('Article', articleSchema);
