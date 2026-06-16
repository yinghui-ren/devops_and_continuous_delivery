#!/bin/bash
set -e
echo "--- before (host file) ---"
cat ~/shared/exchange.txt

echo "--- writing from inside a container ---"
docker run --rm -v /home/vagrant/shared:/data alpine sh -c "echo hello-from-container >> /data/exchange.txt"

echo "--- after (host file, should now have both lines) ---"
cat ~/shared/exchange.txt
