const tr = require("transduce"); // https://github.com/transduce/transduce
const parseDiff = require("parse-diff")();

const parseGitNumstat = require("parse-git-numstat");
const tidyCommitObject = require("./tidyCommitObject");

transducer = ({ 
  repo=undefined 
}={}) => { 
  const state = {
    i: 0,
    commit: undefined,
  };
  const tco = tidyCommitObject({ dir: repo });
  const getCommit = (x) => tco(parseGitNumstat(x));
  const isCommit = (x, i) => i < 1 || /^\s?[0-9a-f]{40}/.test(x);
  return tr.compose(
    tr.string.split(/^(\n^commit |diff --git a\/)/m),
    tr.map((x) => {
      if (isCommit(x, state.i)) {
        state.i++;
        const commitText = state.i > 1 ? `commit ${x}` : x;
        try{
          state.commit = getCommit(commitText)[0];
        } catch (e){
          console.error("getCommit error",e);
          state.commit = {sha:`000000000000000000000000000000000000000000`, message:"error"}
        }
      } else {
        let diff = {};
        try {
          diff = parseDiff(`diff --git a/${x}`)[0];
        } catch(e){
          console.error("parseDiff error",state.commit && state.commit.sha);
          diff = {chunks:[]};
        }
        return {
          ...state.commit,
          ...diff,
        };
      }
    }),
    tr.filter((x) => x !== undefined),
    tr.map((x) => {
      try{
        x.content = x.chunks.map(c=>[
          c.content,
          ...(c.changes.map(ch=>ch.content))
        ].join("\n")).join("\n");
      } catch (e){
        console.error("error forming content",e);
      }
      delete x.chunks;
      /*x.chunks = x.chunks.map((chunk) => ({
        ...chunk,
        changes: undefined,
        oldLines: undefined,
        newLines: undefined,
        added: chunk.changes
          .filter((x) => x.add)
          .map((change) => change.content.substr(1)),
        removed: chunk.changes
          .filter((x) => x.del)
          .map((change) => change.content.substr(1)),
        //changes: chunk.changes.map((change) => change.content),
      }));*/
      try{
        [x.fromIndex, x.toIndex] = x.index[0].split("..");
        x.mode = x.index[1];
      }
      catch(e){
        console.error("missing index", x.sha)
      }
      
      delete x.index;
      //
      
      return x;
    }),
    tr.map((x) => {
      return JSON.stringify(x);
    })
  );
}

module.exports = transducer;
