var Article = require('../models/article');
var request = require('request-promise');
var cheerio = require('cheerio');

// (function poll(){
//    setTimeout(function() {
//     addArticle();
//   }, 30000);
// })();

function articlesIndex(req, res) {
  Article.find(function(err, articles) {
    if (err) return res.status(404).json({message: "Something went wrong"});

    return res.status(200).json({articles: articles});
  });
}

function addArticles(req, res) {
  request("http://content.guardianapis.com/search?order-by=newest&page-size=200&api-key="+process.env.GUARDIAN_API_KEY, function(error, response, body) {
    if (!error && response.statusCode===200) {
      JSON.parse(body).response.results.forEach(function(article) {
        Article.findOne({"title":article.webTitle}, function(err, oldArticle) {
          if (err) return res.status(500).json({message: "Something went wrong!"});

          if (oldArticle) return false;

          var newArticle = new Article();
          request(article.webUrl)
            .then(function(body, response) {
              var results = selectScrape(body, response);
              newArticle.content = results[0];
              newArticle.image = results[1];
            })
          newArticle.title = article.webTitle;
          newArticle.article_url = article.webUrl;
          newArticle.created_at = article.webPublicationDate;
          newArticle.category = article.sectionName;

          newArticle.save(function(err, article) {
            if (err) return res.status(500).json({message: "Something went wrong!"});
          })
        })
      });
    }
  })
  return res.status(200).json({message: "Done"});
}

function scrapeArticles(req, res) {
  Article.find(function(err, articles) {
    if (err) return res.status(500).json({message: "Something went wrong"});

    articles.forEach(function(article, i){
     var url = article.article_url
     console.log(url);
     request(url)
      .then(function(body, response) {
        var results = selectScrape(body, response);
        article.content = results[0];
        article.image = results[1];
        article.save(function(err, article) {
          if (err) return res.status(500).json({message: "Something went wrong"});
        });
      });
    })
  });
  return res.status(200).json({message: "Finished scraping"});
}

function selectScrape(body, response) {
  console.log("scraping...");
  var $ = cheerio.load(body);

  var articleArray = [];

  $("div.js-article__body > p").each(function(i, element){
    articleArray.push($(element).text())
  });
  
  var title   = $("h1.content__headline").text();
  var articleContent = articleArray.join("\n");
  console.log($(".media-primary a div img").attr("srcset").split(" ")[0]);
  var image = $(".media-primary a div img").attr("srcset").split(" ")[0];
  return [articleContent,image];
}

module.exports = {
  articlesIndex: articlesIndex,
  addArticles: addArticles,
  scrapeArticles: scrapeArticles
}