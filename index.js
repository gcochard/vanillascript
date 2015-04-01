#!/usr/bin/env node
/*eslint-disable no-process-exit*/
'use strict';
var fs = require('fs')
  , path = require('path')
  , acorn = require('acorn')
  , async = require('async')
  , escodegen = require('escodegen')
  , winston = require('winston')
  , loglevels = ['info','verbose','debug','silly']
  , yargs = require('yargs')
  , argv = yargs.count('v')
          .alias('v','verbose')
          .alias('c','compile')
          .boolean('c')
          .argv
  , inputs = argv._.map(function(input){return path.resolve(__dirname,input);})
  , logger = new winston.Logger({ transports: [ new winston.transports.Console({level:loglevels[Math.min(loglevels.length-1,Math.max(0,argv.v))]})]})
  ;
if(argv.c){
    async.map(inputs,function(filepath,done){
        // replace vs extension with js
        var outpath = path.join(path.dirname(filepath),path.basename(filepath,'.vs')+'.js');
        if(path.extname(filepath) !== '.vs'){
            return done(new Error('Error, please provide your vanillascript files with the extension .vs'));
        }
        logger.verbose('compiling %s to %s',filepath,outpath);
        fs.readFile(filepath,'utf8',function(readErr,contents){
            if(readErr){
                return done(readErr);
            }
            var contentsArr = contents.split('\n'), shebang;
            if(/^#!/.test(contentsArr[0])){
                shebang = contentsArr[0];
                contents = contentsArr.slice(1).join('\n');
            }
            var comments = [], tokens = [];
            var ast = acorn.parse(contents,{ranges:true,onComment:comments,onToken:tokens});
            escodegen.attachComments(ast,comments,tokens);
            var output = escodegen.generate(ast,{comment:true});
            if(shebang){
                output = [shebang,output].join('\n');
            }
            fs.writeFile(outpath,output,function(writeErr){
                if(writeErr){
                    return done(writeErr);
                }
                logger.verbose('compiled %s to %s',filepath,outpath);
                done();
            });
        });
    },function(err){
        if(err){
            logger.error(err);
            process.exit(1);
        }
        logger.info('complete');
    });
} else {
    if(inputs.length > 1){
        throw new Error('Error, vanillascript only allows execution of one script at a time');
    }
    logger.verbose('spawning node interpreter with compiled file %s',inputs[0]);
    var node = require('child_process').spawn('node',inputs,{stdio:'inherit'});
    node.on('exit',process.exit);
}
