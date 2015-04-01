/*eslint-env mocha*/
'use strict';
var child_process = require('child_process');
var path = require('path');
var assert = require('assert');
var istanbul = require('istanbul');
var idx = 0;
var runWith = function(args,cb){
    var args = ['cover','--report','none','--print','none','--include-pid',path.resolve(__dirname,'..','index.js'),'--'].concat(args);
    child_process.execFile('istanbul',args,cb);
};

function assertExitCode(done,err,stdout){
    assert(err);
    done();
}
function assertWarn(done,err,stdout,stderr){
    assert(stderr);
    done(err);
}
function assertOut(done,err,stdout,stderr){
    assert(stdout);
    assert.equal(stderr,'');
    done(err);
}

describe('vanillascript',function(){

    describe('compiler',function(){

        it('should complain when given a non-existent file',function(done){
            runWith(['-c','test/fixtures/nonexistent.vs'],assertExitCode.bind(null,done));
        });

        it('should complain when it cannot write a file',function(done){
            runWith(['-c','test/fixtures/test3.vs'],assertExitCode.bind(null,done));
        });

        it('should compile a file',function(done){
            runWith(['-c','test/fixtures/test2.vs'],assertOut.bind(null,done));
        });

        it('should compile a file with a shebang',function(done){
            runWith(['-c','test/fixtures/test.vs'],assertOut.bind(null,done));
        });

        it('should complain when given a non .vs file',function(done){
            runWith(['-c','test/fixtures/test.js'],assertExitCode.bind(null,done));
        });

        it('should complain when given multiple .vs files to run',function(done){
            runWith(['test/fixtures/test.vs','test/fixtures/test2.vs'],assertExitCode.bind(null,done));
        });

        it('should run a .vs file',function(done){
            runWith(['test/fixtures/test2.vs'],assertOut.bind(null,done));
        });

        it('should complain when given a non-existent file to run',function(done){
            runWith(['test/fixtures/nonexistent.vs'],assertExitCode.bind(null,done));
        });

    });
});
