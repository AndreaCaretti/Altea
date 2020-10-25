cf logs mtt-approuter | grep --line-buffered written_at | sed -u 's/^\s*//' | stdbuf -oL cut -d ' ' -f 4- | jq -r '.written_at + " " + .msg'
