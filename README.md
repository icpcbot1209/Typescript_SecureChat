#  Secure chat using Typescript Mqtt Jsencrypt Inliner(single html)

## install
`npm install`<br/> 
`npm install -g typescript`<br/>

## run
`npm start`<br/>

## Generate Single HTML using Inliner<br/>

<html>
  <header>

    var Inliner = require('inliner');
    var fs = require('fs');
    const express = require('express');
    const app = express();
    const port = 3000;
    app.use(express.static('public'));
    app.listen(port, () => {
      console.log(`listening on port ${port}!`);

      new Inliner(`http://localhost:${port}`, function (error, html) {
        // compressed and inlined HTML page

        fs.appendFile('result.html', html, function (err) {
          if (err) throw err;
          console.log('Combiled result Saved as result.html!');
        });
      });

    });
    
  </header>
</html>

## issue
Typescript External Modules are not supported. When they are converted, they should be imported into html as `<script type="module" src="">`.<br/>
Because of this, it can't be opened using browser directly by clicking file, so please avoid using external module feature of typescript.



