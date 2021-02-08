#mkdir out
for REPO in gitlog-transducer #repo2  
do
  echo $REPO >>out/repo.log
  #git --git-dir ../$REPO/.git pull --tags
  git --git-dir ../$REPO/.git log -U0 --reflog --parents --decorate --ignore-space-at-eol -m | node gitLogToStdOut.js $REPO    # gitLogToEs.js
done