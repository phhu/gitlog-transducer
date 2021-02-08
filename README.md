# gitlog-transducer

Basic node.js code for transducing git logs to elastic search, or JSON (to stdout).

Git logs can be big, so using a transducer is more efficient for processing them using a stream.

The transducer includes details of the actual commits, along with tags and so on. With appropriate `git log` flags set, this essentially giving a dump of all the data in a git log repo, including all branches, without taking up too much memory in processing.

`npm install` to install dependencies, then see `test.sh` for sample usage. 