#!/bin/bash
set -e
sudo sed -i '/unqualified-search-registries/d' /etc/containers/registries.conf
sudo sed -i '1i unqualified-search-registries = ["docker.io"]' /etc/containers/registries.conf
echo "--- result ---"
grep -n "unqualified-search-registries" /etc/containers/registries.conf
