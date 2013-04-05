var fs = require('fs');
var pkginfo = require('pkginfo')(module);
var identifyindent = require('identify-indent');
var S = require('string')

var program = require('commander');
program
	.version(module.exports.version)
	.usage('\List module versions in your project in format easy to copy and paste to your package.json.\nUsage: $0')
	.option('-a, --any', 'User any version specifier "*", instead of exact version.')
	.option('-n, --newer', 'User equal or newer version specifier ">=", instead of exact version.')
	.option('-t, --tilde', 'Use tilde "~" for floating patch versions.')
  .option('-u, --update', 'Update package.json dependencies field')
	.parse(process.argv);

var res = {};
var base = process.cwd() + '/node_modules';
var dirs = fs.readdirSync(base)
    .filter(function (dir) { return !/^\./.test(dir) });

for(var i = 0; i < dirs.length; i++) {
	var module = dirs[i];
	var bdir = base + '/' + module;
	var cfg = bdir + '/package.json';
	var ok;
	try { ok = fs.lstatSync(cfg).isFile(); } catch(e) {}
	if(!ok) {
		console.log('skipping: ' + bdir);
		continue;
	}
	try {
		var config = JSON.parse(fs.readFileSync(cfg));
		if(config.version)
			res[module] = (program.any ? "*" :
                program.newer ? ">=" :
                program.tilde ? "~" :
                ""
            ) + config.version;
		else
			console.log('No version information for module ' + module);
	}
	catch(e) {
		console.log('error during parsing: ' + cfg, e.stack);
		process.exit(1);
	}
}
console.log(JSON.stringify(res, null, '    '));
if (program.update) {
  var packageDotjson = pkginfo.find(module)
  if (!packageDotjson) {
    console.error('Coulnd not find package.json for this module')
  } else {
    fs.readFile(packageDotjson, function(err, data) {
      if (!err) {
        var indentInfo = identifyindent.string(data.toString());
        var indentChar = '  '
        if (indentInfo.character && indentInfo.size) {
          indentChar = S(indentInfo.character).repeat(indentInfo.size).s
        }
        data = JSON.parse(data)
        data['dependencies'] = res
        fs.writeFile(packageDotjson, JSON.stringify(data, null, indentChar), function(err) {
          if (!err) {
            console.log('your dependencies have been updated')
          }
        })
      }
    })
  }
}
