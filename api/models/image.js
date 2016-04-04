var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
  title: String,
  image_url: String,
  category: String,
  created_at: Date
});

module.exports = mongoose.model('Image', imageSchema);
