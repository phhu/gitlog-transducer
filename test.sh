
# git --git-dir ${gitDir}  log --parents --max-count=${maxResults} --skip=${startAt} --numstat --ignore-space-at-eol --decorate --reflog`,
#git log -U0 --reflog --parents --decorate --ignore-space-at-eol -m >out/test.log
#git log -U0 --reflog --parents --decorate --ignore-space-at-eol -m| node index.js testRepo >out/test.json #2>out/test.err
for REPO in gitlog-transducer #repo2  
do
  echo $REPO >>out/repo.log
  #git --git-dir ../$REPO/.git pull --tags
  git --git-dir ../$REPO/.git log -U0 --reflog --parents --decorate --ignore-space-at-eol -m | node gitLogToStdOut.js $REPO    # gitLogToEs.js
done