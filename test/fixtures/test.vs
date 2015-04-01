#!/usr/bin/env node
/*eslint-disable no-process-exit*/
'use strict';
var fs = require('fs')
  , path = require('path')
  , yargs = require('yargs')
  , acorn = require('acorn')
  , escodegen = require('escodegen')
  , argv = yargs.count('verbose')
          .alias('v','verbose')
          .alias('c','compile')
          .argv
  , inputs = argv._.map(path.resolve.bind(path,__dirname))
  ;
if(argv.c){
    inputs.map(function(filepath){
        // replace vs extension with js
        var outpath = path.join(path.dirname(filepath),path.basename(filepath,'.vs')+'.js');
        if(path.extname(filepath) !== '.vs'){
            throw new Error('Error, please provide your vanillascript files with the extension .vs');
        }
        fs.readFile(filepath,function(readErr,contents){
            if(readErr){
                throw readErr;
            }
            var comments = [], tokens = [];
            var ast = acorn.parse(contents,{ranges:true,onComment:comments,onToken:tokens});
            escodegen.attachComments(ast,comments,tokens);
            var output = escodegen.generate(ast,{comment:true});
            fs.writeFile(outpath,output,function(writeErr){
                if(writeErr){
                    throw writeErr;
                }
            });
        });
    });
} else {
    if(inputs.length > 1){
        throw new Error('Error, vanillascript only allows execution of one script at a time');
    }
    var node = require('child_process').spawn('node',inputs,{stdio:'inherit'});
    node.on('exit',process.exit);
    node.on('error',function(){ process.exit(8); });
}
