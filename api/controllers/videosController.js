var Video = require('../models/video');
var request = require('request-promise');
var Promise = require('bluebird');

// (function poll(){
//    setTimeout(function() {
//     addImage();
//   }, 30000);
// })();

function videosIndex(req, res) {
  Video.find(function(err, videos) {
    if (err) return res.status(404).json({message: "Something went wrong"});

    return res.status(200).json({videos: videos});
  });
}

function getYoutubeVideos(categories) {
  var youtubeVidsArray = [];
  var i = 0;

  return new Promise(function(resolve, reject) {

    function makeRequest() {
      var title = categories[i].webTitle.replace('&', 'and');

      var options = {
        url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" +title+"&key="+process.env.YOUTUBE_API_KEY,
        json: true
      };

      return request(options, function(err, res, body){
        if(err) reject(err);

        youtubeVidsArray = youtubeVidsArray.concat(body.items.map(function(video) {
          video.category = categories[i].webTitle;

          return video;
        }));

        i++;

        if(i < categories.length) {
          console.log("working..", i);
          return makeRequest();
        }

        return resolve(youtubeVidsArray);

      });
    };

    makeRequest();
  });
}


function addVideos(req, res) {
  console.log("addVideos");

  return request({ url: "http://content.guardianapis.com/sections?api-key="+process.env.GUARDIAN_API_KEY, json: true })
    .then(function(body){
      return getYoutubeVideos(body.response.results);
    })
    .then(function(videos){
      return Promise.all(videos.map(function(video) {
        var newVideo = new Video();
        newVideo.title = video.snippet.title;
        newVideo.video_url = video.id.videoId;
        newVideo.category = video.category;
        newVideo.created_at = video.snippet.publishedAt;
        return newVideo.save();
      }));
    })
    .then(function(savedVideos) {
      res.status(200).json({ message: "Video Saved" });
    })
    .catch(function(err) {
      res.status(500).json({ message: err });
    });
}

module.exports = {
  videosIndex: videosIndex,
  addVideos: addVideos
}
