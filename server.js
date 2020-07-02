var Inliner = require('inliner');
var fs = require('fs');
const cors = require("cors");
const express = require('express');
const app = express();

const port = 3030;

app.use(cors());

app.use(express.static('public'));


app.listen(port, () => {
  console.log(`listening on port ${port}!`);

  new Inliner(`http://localhost:${port}`, { noImages: true }, function (error, html) {
    // compressed and inlined HTML page
    let filename = 'single' + Date.now() + ".html";

    fs.appendFile(filename, html, function (err) {
      if (err) throw err;
      console.log(`Combiled result Saved as ${filename}`);
    });
  });

});



