const stream = require('transduce-stream');
const transducer = require('./transduceGitLog');
const map2 = require('through2-map').obj;

const repo = process.argv[2];

process.stdin.resume()
process.stdin
  .pipe(stream(transducer({repo})))
  //.pipe(map2(x=>"*********" + x))
  .pipe(process.stdout)
