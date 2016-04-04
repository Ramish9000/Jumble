var Category = require("../models/category");
var request = require('request-promise');

function categoriesIndex(req, res) {
  Category.find(function(err, categories) {
    if (err) return res.status(500).json({message: "Something went wrong!"});

    return res.status(200).json({categories: categories});
  })
}

function addCategories(req, res) {
  request({url: "http://content.guardianapis.com/sections?api-key="+process.env.GUARDIAN_API_KEY, json: true})
    .then(function(body) {
      body.response.results.forEach(function(category) {
        Category.findOne({"title":category.webTitle}, function(err, oldCategory) {
          if (err) return res.status(500).json({message: "Something went wrong!"});

          if (oldCategory) return false;

          var newCategory = new Category();
          newCategory.title = category.webTitle;

          newCategory.save(function(err, category) {
            if (err) return res.status(500).json({message: "Something went wrong!"});
          });
        });
      });
    });
  return res.status(200).json({message: "Categories saved"});
}

module.exports = {
  categoriesIndex: categoriesIndex,
  addCategories: addCategories
}