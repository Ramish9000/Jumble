var express         = require('express'),
    cors            = require('cors'),
    path            = require('path'),
    morgan          = require('morgan'),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    cookieParser    = require('cookie-parser'),
    methodOverride  = require('method-override'),
    jwt             = require('jsonwebtoken'),
    expressJWT      = require('express-jwt'),
    app             = express();

var config          = require(path.join(__dirname,'config','config'));
var secret          = config.secret;
var User            = require('./models/user');

mongoose.connect(config.database);

// require(path.join(__dirname,'config','passport'))(passport);
require('./config/passport')(passport);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride(function(req, res) {
  if (req.body & typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  };
}));

app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());
app.use(passport.initialize());

// app.use('/api', expressJWT({ secret: secret })
//   .unless({
//     path: [
//       { url: '/api/login', methods: ['POST'] },
//       { url: '/api/register', methods: ['POST'] }
//     ]
//   }));

//app.use('/api', expressJWT({secret: secret}) .unless({ path: [ { url: '/api/login', methods: ['POST'] }, { url: '/api/register', methods: ['POST'] } ] }));
app.use('/api/users/:id', expressJWT({ secret: secret }));
app.use('/api/users', expressJWT({ secret: secret }));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({message: 'Unauthorized request.'});
  }
  next();
});

var routes = require(path.join(__dirname,'config','routes'));
app.use('/api', routes);

app.listen(process.env.PORT || 3000);

