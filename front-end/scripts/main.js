$( init);

function init(){
  $('#fullpage').fullpage({
    sectionsColor: ['#A5D8FF', '#758ECD', '#D5C6E0'],
    fixedElements: '#navbar',
    anchors: ['landingPage', 'about', 'madeBy']
  });
  $("form#register, form#login").on("submit", submitForm);
  $("form#cats-form").on("submit", updateUserCats);
  $("#cancelCats").on("click", hideCategories);
  $(".categories-link").on("click", getCategories);
  $(".profile-link").on("click", getProfile);
  $(".logout-link").on("click", logout);
  $(".login-link, .register-link").on("click", showPage);
  $('.modal-trigger').leanModal();
  $(".button-collapse").sideNav();
  hideErrors();
  checkLoginState();
}

function checkLoginState(){
  if (getToken()) {
    return loggedInState();
  } else {
    return loggedOutState();
  }
}

function showPage() {
  event.preventDefault();
  var linkClass = $(this).attr("class").split("-")[0]
  $("section").hide();
  hideErrors();
  return $("#" + linkClass).show();
}

function submitForm(event){
  event.preventDefault();
  var method = $(this).attr("method");
  var url    = "https://gentle-waters-2921.herokuapp.com/api" + $(this).attr("action");
  var data   = $(this).serialize();
  this.reset();

  return ajaxRequest(method, url, data, authenticationSuccessful);
}

function updateUserCats(event) {
  event.preventDefault();
  var method = $(this).attr("method");
  var url = "https://gentle-waters-2921.herokuapp.com/api"+$(this).attr("action")+"/"+localStorage.getItem("userId");
  var data = $(this).serialize();
  this.reset();

  return ajaxRequest(method, url, data, newUserCats);
}

function logout(){
  removeData();
  // return loggedOutState();
}


function hideErrors(){
  return $(".alert").removeClass("show").addClass("hide");
}

function displayErrors(data){
  return $(".alert").text(data).removeClass("hide").addClass("show");
}

function loggedInState(){
  $("section, .logged-out").hide();
  $("#users, .logged-in").show();
  $.fn.fullpage.destroy();
  $("#fullpage").hide();
  $("#newsfeed").show();
  $("#profileSection").show();
  titles();
  videos();
}


function loggedOutState(){
  $("section, .logged-in").hide();
  $("#register, .logged-out").show();
  $("#fullpage").show();
}

function titles() {
  event.preventDefault();
  return getTitles();
}

function videos() {
  event.preventDefault();
  return getVideos();
}

function getVideos() {
  $('html').removeClass('fp-enabled');
  return ajaxRequest("get", "https://gentle-waters-2921.herokuapp.com/api/videos", null, showVideos)
}

function showVideos(data) {
  $("#video-list").empty();
  _(data.videos).each(function(video){
    if ($.inArray(video.category, getFaveCats())>-1) {
      var underscoreTemplate = _.template($("#video-template").html());
      var compiledTemplate = underscoreTemplate(video);
      $("#video-list").append(compiledTemplate);
    }
  });
}

function getTitles() {
  $('html').removeClass('fp-enabled');
  return ajaxRequest("get", "https://gentle-waters-2921.herokuapp.com/api/articles", null, showTitles)
}

function showTitles(data) {
  $("#my-list").empty();
  var newsArray = [];
  _(data.articles).each(function(article){
    if ($.inArray(article.category, getFaveCats())>-1) {
      newsArray.push(article);
    }
  })
  newsArray = shuffle(newsArray);
  newsArray.forEach(function(article) {
    var underscoreTemplate = _.template($("#list-template").html());
    var compiledTemplate = underscoreTemplate(article);
    $("#my-list").append(compiledTemplate);
    $('.materialboxed').materialbox();
  });
  $('.modal-trigger').leanModal({dismissable: true, opacity: 0.5});
}

function authenticationSuccessful(data) {
  if (data.token) setData(data);
  checkLoginState();
}

function setData(data) {
  if (data.token) localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.user._id);
  localStorage.setItem("user-name", data.user.local.username);
  localStorage.setItem("user-email", data.user.local.email);
  localStorage.setItem("user-pic", data.user.local.picture_url);
  localStorage.setItem("user-cats", data.user.favourite_categories);
  localStorage.setItem("user-favs", data.user.favourite_jumbuls);
}

function newUserCats(data) {
  setData(data);
  setTimeout(getTitles,500);
  setTimeout(getVideos,500);
  hideCategories();
}

function getToken() {
  return localStorage.getItem("token");
}

function getFaveCats() {
  return localStorage.getItem("user-cats").split(",");
}

function removeData() {
  return localStorage.clear();
}

function setRequestHeader(xhr, settings) {
  var token = getToken();
  if (token) return xhr.setRequestHeader('Authorization','Bearer ' + token);
}

function getCategories(event) {
  if (event) event.preventDefault();
  return ajaxRequest("get", "https://gentle-waters-2921.herokuapp.com/api/categories", null, showCategories);
}

function showCategories(data) {
  $('#categoryChoice').fadeIn();
  $('#cats-form div.row').empty();
  console.log(data.categories.sort());
  data.categories.forEach(function(category, index){
    var checked = '';
    if ($.inArray(category.title, getFaveCats()) > -1) {
      checked = 'checked';
    }
    $('#cats-form div.row').append('<div class="col s3"><input type="checkbox" class="filled-in"'+checked+' id="cat'+index+'" name="favourite_categories" value="'+category.title+'" /><label for="cat'+index+'">'+category.title+'</label></div>')
  })
}

function hideCategories(event) {
  if (event) event.preventDefault();
  $('#categoryChoice').fadeOut();
}

function ajaxRequest(method, url, data, callback) {
  return $.ajax({
    method: method,
    url: url,
    data: data,
    beforeSend: setRequestHeader,
  }).done(function(data){
    callback(data);
  }).fail(function(data) {
    displayErrors(data.responseJSON.message);
  });
}

function getProfile(event){
  event.preventDefault();
  $('#newsfeed').hide();
  var userId = localStorage.getItem("userId");
  return ajaxRequest("get", "https://gentle-waters-2921.herokuapp.com/api/users/" + userId, null, showProfile)
}

function showProfile(data){
  event.preventDefault();
  $('#newsfeed').hide();
  $('#profileSection').show();
  var underscoreTemplate = _.template($("#profile-template").html());
  var compiledTemplate = underscoreTemplate(data);
  $("#my-info").html(compiledTemplate);
}

function hideProfile(){
  event.preventDefault();

}

function getJumbles(){
  event.preventDefault();
  $('#profileSection').hide();
  $('#newsfeed').show();
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}