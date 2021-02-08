const {compose,pipe,map,lensProp,over,concat,set,tap} = require('ramda');
const mapOverProp = (prop,f)=>compose(map,over)(lensProp(prop),f);

const getCherryPickSha = msg => {
  const re = /\(cherry picked from commit (?<sha>[0-9a-z]{40})\)\s*$/i;
  return ((typeof msg === 'string') && re.test(msg) && [msg.match(re).groups.sha]) || [];
};

const proc = ({dir}) => pipe(
  map(set(lensProp('repo'),dir)),
  //tap(x=>console.log("tidyCommitObject",x)),
  //mapOverProp('stat', mapOverProp('filepath',concat(dir +'/'))),
  //mapOverProp('diff', mapOverProp('from',concat(dir +'/'))),
  //mapOverProp('diff', mapOverProp('to',concat(dir +'/'))),
  map(x=>{     //standardise and calculate fields
    x.decoration = x.decoration || null;
    x.date = x.date.toISOString();
    x.tags = x.tags || [];
    x.branches = x.branches || [];
    x.parents = x.parents || [];
    x.cherryPickParents = getCherryPickSha(x.message) ;
    x.dateUploaded = (new Date()).toISOString();
    return x;
  })
);

module.exports = proc;