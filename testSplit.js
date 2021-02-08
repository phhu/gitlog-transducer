const split = require('split2');
const map = require('through2-map');

process.stdin
  .pipe(split(/^(?=commit [a-f0-9]{40}|diff --git a\/)/gm))
  .pipe(map(x=>`!*** ${x}****\n`))
  .pipe(process.stdout)
;