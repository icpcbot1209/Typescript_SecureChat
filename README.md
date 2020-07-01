#  Secure chat using Typescript Mqtt Jsencrypt Inliner(single html)

## install
`npm install`<br/> 
`npm install -g typescript`<br/>

### trick
Use this VS Code extension. This compiles ts file into js after each save automatically. Cool! <br/>
`Sass/Less/Scss/Typescript/Javascript/Jade/Pug Compile Hero Prowscats.eno`


## run
`npm start`<br/>

## development
`npm run dev`<br/>
- Use `tsc` for every compile update from ts to js.<br/>
package.json contains details.

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

      new Inliner(`http://localhost:${port}`, {noImages:true}, function (error, html) {
        // compressed and inlined HTML page
        let filename = 'single' + Date.now() + ".html";

        fs.appendFile(filename, html, function (err) {
          if (err) throw err;
          console.log('Combiled result Saved as single.html!');
        });
      });

    });
    
  </header>
</html>

## issue
Typescript External Modules are not supported. When they are converted, they should be imported into html as `<script type="module" src="">`.<br/>
Because of this, it can't be opened using browser directly by clicking file, so please avoid using external module feature of typescript.



