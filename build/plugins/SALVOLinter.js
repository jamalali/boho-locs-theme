var fs = require('fs');
var path = require('path');


function SALVOLinter(options) {
}

SALVOLinter.prototype.apply = function(compiler) {
    var self = this;

    compiler.plugin('emit', function(compilation, callback) {
        var rejected = [];

        fs.readdirSync(path.resolve('src/theme/assets')).forEach(function(file) {
            if (file.endsWith('.js') || file.endsWith('.js.liquid')) {
                rejected.push(file);
            }
        });

        if (rejected.length > 0) {
            console.error('\x1b[31m%s\x1b[0m');
            console.error('\x1b[31m%s\x1b[0m', 'SALVO found JS files in the theme assets folder (src/theme/assets). These should be incorporated into your main scripts or required via NPM.');
            console.error('\x1b[31m%s\x1b[0m', 'Offending files:');
            rejected.forEach(function(file) {
                console.error('\x1b[31m%s\x1b[0m', ' - ' + file);
            });
            throw new Error('Javascript files found in theme asset folder, refusing to compile. Please incorporate these into your scripts.');
        } else {
            callback();
        }
    });
}

module.exports = SALVOLinter;
