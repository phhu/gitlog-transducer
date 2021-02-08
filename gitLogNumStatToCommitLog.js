
const stream = require('transduce-stream');
const transducer = require('./transduceGitLog');
const map2 = require('through2-map').obj;
const split2 = require('split2');
const parseGitNumstat = require("parse-git-numstat");
const tidyCommitObject = require("./tidyCommitObject");

const repo = process.argv[2] || 'fakeRepo';
const tco = tidyCommitObject({ dir: repo });
const getCommit = (x) => tco(parseGitNumstat(x));

const esConfig = {
  host: process.env.ELASTIC_SEARCH_HOST || "localhost:9200",
  log: "info", //  'trace'
}

var WritableBulk = require("elasticsearch-streams").WritableBulk;
var TransformToBulk = require("elasticsearch-streams").TransformToBulk;
var client = new require("elasticsearch").Client(esConfig);

let count = 0;let total=0;

//const repo = process.argv[2];

var bulkExec = function (bulkCmds, callback) {
  console.log("pausing");
  //console.log(bulkCmds);
  process.stdin.pause();
  count++;total++
  toBulk.pause();
  client
    .bulk({
      index: "commits",
      type: "doc",
      body: bulkCmds,
      timeout: "5m",
      requestTimeout: 5 * 60 * 1000,
    })
    .then((res) => {
      console.log(total, res.items && res.items.length, repo);
      //callback();
    })
    .catch((e) => {
      console.error("bulkExec error", e);
    })
    .finally(() => {
      callback();
      count--;
      if (count < 1) {
        process.stdout.write("resuming");
        toBulk.resume();
        process.stdin.resume();
      }
    });
};
var ws = new WritableBulk(bulkExec,20);
var toBulk = new TransformToBulk(function getIndexTypeId(doc) {
  //console.log("z");
  return { _id: `${doc.sha}` };
});
ws.on("close", function () {
  client.close();
});

toBulk.on("data", () => {
  process.stdout.write(".");
  //console.log("toBulk.onData");
});

process.stdin.resume()
process.stdin
  .pipe(split2(/^(?=commit )/gm))
  //.pipe(stream(transducer({ repo })))
  //.pipe(map2((x) => "xxxxx" + x))
  .pipe(map2((x) => getCommit(x)[0]))
  //.pipe(map2((x) => JSON.stringify(x,null,2)))
  //.pipe(process.stdout)
  .pipe(toBulk)
  .pipe(ws)
  .on("finish", (x) => console.log("done", x));
//.pipe(process.stdout)
