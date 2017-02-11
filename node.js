var fetch = require('node-fetch');

var express = require('express')
var app = express()

app.get('/api/', function (req, res) {
  var get = (text) => fetch('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + text)
    .then((response) => response.json())
    .then(handleResponse)
    .catch(err => console.log(err)
    );
  get(req.query.query);

  function handleResponse(response) {
    res.send(response.query.pages[Object.keys(response.query.pages)[0]].extract);
  };
});

app.use('/', express.static('dist'));

app.listen(8888, function () {
  console.log('Example app listening on port 3000!')
})


