# gitlog-transducer

Basic node.js code for transducing git logs to elastic search, or JSON (to stdout).

Git logs can be big, so using a transducer is more efficient for processing them using a stream.

See test.sh for sample usage