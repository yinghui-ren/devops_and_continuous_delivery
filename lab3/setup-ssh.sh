#!/bin/bash
# Lab 3 — SSH Key Sync Script
# Copies the Ansible master's public key to the managed node's authorized_keys
# so that ansible can connect without password prompts.
#
# Run from the Windows host (using vagrant ssh or direct SSH):
#   bash setup-ssh.sh
#
# Or run the commands manually:
#   vagrant ssh vm1 -c "cat /home/vagrant/.ssh/id_rsa.pub"
#   vagrant ssh vm2 -c "echo '<key>' >> /home/vagrant/.ssh/authorized_keys"

set -e

echo "=== Lab 3: Setting up SSH keys between VM1 (Ansible Master) and VM2 (Managed Node) ==="

# Step 1: Read the public key from VM1
echo "[1/3] Reading public key from VM1..."
VM1_KEY=$(vagrant ssh vm1 -c "cat /home/vagrant/.ssh/id_rsa.pub" 2>/dev/null || \
  ssh -i .vagrant/machines/vm1/virtualbox/private_key -p 2212 -o StrictHostKeyChecking=no vagrant@127.0.0.1 "cat /home/vagrant/.ssh/id_rsa.pub")

if [ -z "$VM1_KEY" ]; then
    echo "ERROR: Could not read public key from VM1. Is VM1 running?"
    exit 1
fi
echo "  Key obtained successfully."

# Step 2: Copy the key to VM2's authorized_keys
echo "[2/3] Copying public key to VM2..."
ssh -i .vagrant/machines/vm2/virtualbox/private_key -p 2213 -o StrictHostKeyChecking=no vagrant@127.0.0.1 \
  "grep -qF '$VM1_KEY' /home/vagrant/.ssh/authorized_keys 2>/dev/null || echo '$VM1_KEY' >> /home/vagrant/.ssh/authorized_keys"

echo "  Key copied successfully."

# Step 3: Verify SSH connectivity from VM1 to VM2
echo "[3/3] Testing SSH from VM1 to VM2..."
vagrant ssh vm1 -c "ssh -o StrictHostKeyChecking=no 192.168.58.11 'echo SSH connection OK'" 2>/dev/null || \
  ssh -i .vagrant/machines/vm1/virtualbox/private_key -p 2212 -o StrictHostKeyChecking=no vagrant@127.0.0.1 \
    "ssh -o StrictHostKeyChecking=no 192.168.58.11 'echo SSH connection OK'"

echo ""
echo "=== SSH key sync complete! Ansible master can now connect to the managed node. ==="
echo ""
echo "Next: Run the playbooks from VM1:"
echo "  vagrant ssh vm1"
echo "  cd /vagrant"
echo "  ansible-playbook playbooks/install-package.yml"
echo "  ansible-playbook playbooks/manage-package.yml --tags install"
echo "  ansible-playbook playbooks/manage-package.yml --tags remove"
echo "  ansible-playbook playbooks/manage-app.yml --tags install"
echo "  ansible-playbook playbooks/manage-app.yml --tags remove"
