var express  = require('express');
var router   = express.Router();
var passport = require("passport");

var usersController = require('../controllers/usersController');
var authenticationsController = require('../controllers/authenticationsController');
var articlesController = require('../controllers/articlesController');
var imagesController = require('../controllers/imagesController');
var videosController = require('../controllers/videosController');
var categoriesController = require('../controllers/categoriesController');

var User = require('../models/user');

router.post('/login', authenticationsController.login);
router.post('/register', authenticationsController.register);

router.route('/users')
  .get(usersController.usersIndex)

router.route('/users/:id')
  .get(usersController.usersShow)
  .put(usersController.usersUpdate)
  .patch(usersController.usersUpdate)
  .delete(usersController.usersDelete)

router.route('/newarticles')
  .post(articlesController.addArticles);

router.route('/articles')
  .get(articlesController.articlesIndex);

router.route('/newimages')
  .post(imagesController.addImages);

router.route('/images')
  .get(imagesController.imagesIndex);

router.route('/newvideos')
  .post(videosController.addVideos);

router.route('/videos')
  .get(videosController.videosIndex);

router.route('/scraper')
  .get(articlesController.scrapeArticles);

router.route('/categories')
  .get(categoriesController.categoriesIndex);

router.route('/newcategories')
  .post(categoriesController.addCategories);

module.exports = router