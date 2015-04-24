/*

This generates ../the-graph/font-awesome-unicode-map.js for use in our SVG

*/

fs = require('fs');

var generateFile = function (err, data) {
  if (err) {
    throw err;
  }

  var linePattern = /@foehn-var-[^;]*/g;
  var lines = data.match(linePattern);
  var icons = {};
  lines.forEach(function (line) {
    var namePattern = /@foehn-var-(.*): \"\\(.*)\"/;
    var match = namePattern.exec(line);
    if (match) {
      var key = match[1];
      var u = "%u" + match[2];
      u = unescape(u);
      icons[ key ] = u;
    }
  });

  var output = "/*\n  this file is generated via `grunt build` \n*/\n\n"+
    "(function (context) {\n"+
    "\"use strict\";\n\n"+
    "context.TheGraph.FONT_FOEHN = "+JSON.stringify(icons, null, 2)+";\n\n"+
    "})(this);";

  fs.writeFile(__dirname+'/../the-graph/font-foehn-unicode-map.js', output, function (err) {
    if (err) {
      throw err;
    }
    console.log('Font Foehn icons map saved with ' + Object.keys(icons).length + ' icons and aliases.');
  });
};

fs.readFile( __dirname+'/../custom_components/font-foehn/less/variables.less', 'utf8', generateFile );
