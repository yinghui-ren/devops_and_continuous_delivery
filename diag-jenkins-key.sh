#!/bin/bash
echo "--- keyring file head ---"
head -c 200 /usr/share/keyrings/jenkins-keyring.asc
echo
echo "--- file size ---"
wc -c /usr/share/keyrings/jenkins-keyring.asc
echo "--- gpg --show-keys ---"
gpg --show-keys /usr/share/keyrings/jenkins-keyring.asc || echo "FAILED to parse as keyring"
