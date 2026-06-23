# Lab 3 — Configuration (Ansible) — Experiment Record

## 1. Basic Information

- Course: DevOps and Continuous Delivery
- Lab: Lab 3 - Configuration
- Repository: https://github.com/yinghui-ren/devops_and_continuous_delivery.git
- Working branch (personal commits): Yuhao-lab3
- Lab files path in repo: `lab3/` directory on the `Yuhao-lab3` branch

## 2. Task Tiers (from lab3.png)

### EASY
- Install Ansible
- Master VM1, Inventory
- VM2, Static container 1, Static container 2
- Create a playbook that:
  - Install a system package
  - Install or Remove a system package (based on an ansible tag)
  - Install or Remove an application (based on an ansible tag)

### MEDIUM (try some tricks)
- Use a downloaded playbook or roles from ansible galaxy
  - examples: nginx, grafana, postgresql, wordpress, nexus...

### HARD (going further)
- Configure a CI/CD pipeline that runs an ansible playbook

## 3. Architecture

```
Windows host
  │ :8095 (Jenkins, VM1)  │ :2212 (SSH VM1)  │ :2213 (SSH VM2)  │ :8085-8086 (static containers)
  ▼                       ▼                  ▼                  ▼
┌──────────────────────┐  ┌──────────────────────────────────────────┐
│ VM1 (192.168.58.10)  │  │ VM2 (192.168.58.11)                      │
│ Ansible Master       │  │ Managed Node                             │
│ Jenkins Controller   │──│ Docker + Static containers               │
│ (Jenkinsfile)        │  │   - static-nginx (port 8085)             │
└──────────────────────┘  │   - static-httpd (port 8086)             │
                          │   - nginx (Galaxy role, port 80)         │
                          │   - PostgreSQL (Galaxy role, port 5432)  │
                          │   - Grafana (Galaxy role, port 3000)     │
                          └──────────────────────────────────────────┘
```

- Private network: `192.168.58.0/24`
- VM1 SSH forwarded to host port 2212, Jenkins UI on 8095
- VM2 SSH forwarded to host port 2213

## 4. Technology Choices

| Component | Choice | Reason |
|---|---|---|
| CM tool | Ansible (apt package) | Lab requirement; agentless, SSH-based |
| Inventory | Static INI file | Simple, readable, sufficient for 2-node setup |
| Managed node OS | Ubuntu 22.04 (Jammy) | Same as previous labs |
| Ansible Galaxy roles | geerlingguy.nginx, geerlingguy.postgresql, cloudalchemy.grafana | Well-maintained, widely used community roles |
| CI/CD | Jenkins (Pipeline) | Reuses Lab 1/2 Jenkins; runs ansible-playbook via sudo |

## 5. EASY Tier

### 5.1 Bring up both VMs

```bash
cd lab3
vagrant up
```

- VM1: Ansible installed, SSH key generated, ansible-lab3 directory created
- VM2: Docker installed, static containers (nginx + httpd) running, SSH key imported from VM1

### 5.2 Sync SSH keys

```bash
vagrant ssh vm1 -c "cat /home/vagrant/.ssh/id_rsa.pub"
vagrant ssh vm2 -c "echo '<key>' >> /home/vagrant/.ssh/authorized_keys"
```

### 5.3 Run playbooks

```bash
vagrant ssh vm1
cd ~/ansible-lab3

# Task 1: Install a system package
ansible-playbook playbooks/install-package.yml

# Task 2: Install or Remove a system package (based on ansible tag)
ansible-playbook playbooks/manage-package.yml --tags install
ansible-playbook playbooks/manage-package.yml --tags remove

# Task 3: Install or Remove an application (based on ansible tag)
ansible-playbook playbooks/manage-app.yml --tags install
ansible-playbook playbooks/manage-app.yml --tags remove
```

### 5.4 Results

| Playbook | Tag | Result |
|---|---|---|
| `install-package.yml` | — | htop installed on VM2 |
| `manage-package.yml` | install | nginx installed on VM2 |
| `manage-package.yml` | remove | nginx removed from VM2 |
| `manage-app.yml` | install | WordPress deployed via Docker on VM2 (port 8087) |
| `manage-app.yml` | remove | WordPress container removed |

## 6. MEDIUM Tier — Ansible Galaxy Roles

### 6.1 Install Galaxy roles

```bash
cd ~/ansible-lab3
ansible-galaxy install -r playbooks/galaxy-requirements.yml
```

Roles installed:
- `geerlingguy.nginx` (v3.3.0)
- `geerlingguy.postgresql` (v4.1.0)
- `cloudalchemy.grafana` (v0.18.0)
- `geerlingguy.docker` (v8.0.0)

### 6.2 Run Galaxy playbooks

```bash
ansible-playbook playbooks/galaxy-nginx.yml
ansible-playbook playbooks/galaxy-postgresql.yml
ansible-playbook playbooks/galaxy-grafana.yml
```

### 6.3 Results

| Playbook | Galaxy Role | Result |
|---|---|---|
| `galaxy-nginx.yml` | `geerlingguy.nginx` | nginx running on VM2:80 → HTTP 200 |
| `galaxy-postgresql.yml` | `geerlingguy.postgresql` | PostgreSQL running, database `lab3_demo` created |
| `galaxy-grafana.yml` | `cloudalchemy.grafana` | Grafana v9.5.3 running on VM2:3000 |

## 7. HARD Tier — CI/CD Pipeline with Ansible

### 7.1 Jenkins setup

Jenkins installed on VM1 (Ansible master). The `jenkins` user is configured with:
- sudoers rule: `jenkins ALL=(vagrant) NOPASSWD:ALL`
- Pipeline runs `ansible-playbook` as the `vagrant` user (who owns SSH keys and Ansible config)

### 7.2 Jenkinsfile Pipeline Stages

```
Checkout → Sync Playbooks → Install System Package → Manage Package (Install) → Deploy App via Galaxy → Verify
```

### 7.3 Jenkins Job Configuration

- **New Item**: `lab3-ansible-pipeline` (Pipeline)
- **Definition**: Pipeline script from SCM
- **SCM**: Git — `https://github.com/yinghui-ren/devops_and_continuous_delivery.git`
- **Branch**: `*/Yuhao-lab3`
- **Script Path**: `lab3/Jenkinsfile`

### 7.4 Result

All 6 stages passed:
- Sync Playbooks: copies `ansible.cfg`, `inventory.ini`, playbooks to `/home/vagrant/ansible-lab3/`
- Install System Package: runs `install-package.yml`
- Manage Package (Install): runs `manage-package.yml --tags install`
- Deploy App via Galaxy: installs Galaxy roles, runs `galaxy-nginx.yml`
- Verify: `ansible managed_nodes -m ping` → SUCCESS

## 8. Problems and Solutions

| Date | Problem | Cause | Solution | Result |
| --- | --- | --- | --- | --- |
| 2026-06-23 | `ansible.cfg` ignored: "world writable directory" | `/vagrant` is a VirtualBox synced folder mounted with world-writable permissions; Ansible refuses to read config from such directories for security | Copied files to `/home/vagrant/ansible-lab3/` with `chmod 755` | Resolved |
| 2026-06-23 | `Permission denied (publickey)` when Ansible tried to connect to VM2 | VM1's SSH public key was generated but not copied to VM2's `authorized_keys` | Manually copied the key via `vagrant ssh vm2`, then updated Vagrantfile to save VM1's pubkey to `/vagrant/id_rsa_vm1.pub` so VM2's provision can auto-import it | Resolved |
| 2026-06-23 | `docker_container` module failed: "No module named 'docker'" | VM2 had Python3 but not `pip` or the Python Docker SDK | Installed `python3-pip` and `pip3 install docker` on VM2; added to Vagrantfile provisioning | Resolved |
| 2026-06-23 | `cloudalchemy.grafana` role failed to start Grafana | Grafana 13.0 removed legacy alerting; the role's config set `[alerting].enabled = true` which Grafana 13 rejects | Set `grafana_version: 9.5.3` in playbook vars to use a compatible Grafana LTS release | Resolved |
| 2026-06-23 | Jenkins pipeline: "Permission denied" when syncing playbooks | Jenkins runs as `jenkins` user, cannot write to `/home/vagrant/` | Added sudoers rule `jenkins ALL=(vagrant) NOPASSWD:ALL`; all ansible commands use `sudo -u vagrant bash -c '...'` | Resolved |
| 2026-06-23 | Jenkins pipeline: `ansible.cfg` not found in `$WORKSPACE` | Workspace checkout includes the `lab3/` subdirectory (since Jenkinsfile is at `lab3/Jenkinsfile`); paths needed `lab3/` prefix | Changed all `cp` paths to `$WORKSPACE/lab3/...` | Resolved |
| 2026-06-23 | Jenkins pipeline: `cd /home/vagrant/ansible-lab3` failed (jenkins user) | Shell commands in Jenkins run as `jenkins` user; `cd` then `ansible-playbook` in separate `sh` blocks lost the `sudo -u vagrant` context | Combined `cd` and `ansible-playbook` into a single `sudo -u vagrant bash -c '...'` invocation; fixed Groovy quoting (`sh "..."` for env var expansion) | Resolved |

## 9. Progress Log

| Date | Work Done | Commit ID |
| --- | --- | --- |
| 2026-06-23 | Created lab3 directory, Vagrantfile (VM1 Ansible + VM2 Docker/containers), ansible.cfg, inventory.ini, 3 EASY playbooks | 4ef53bf |
| 2026-06-23 | EASY tier verified: all 3 playbooks run successfully (htop install, nginx install/remove via tags, WordPress deploy/remove via tags) | — |
| 2026-06-23 | MEDIUM: created galaxy-requirements.yml and 3 Galaxy playbooks (nginx, postgresql, grafana) | c3f170a |
| 2026-06-23 | MEDIUM tier verified: all 3 Galaxy playbooks run successfully | — |
| 2026-06-23 | HARD: added Jenkins to VM1 Vagrantfile, created Jenkinsfile, committed and pushed | c3f170a |
| 2026-06-23 | HARD: fixed Jenkinsfile (sudo -u vagrant, workspace paths, Groovy quoting) | 3377d9f |
| 2026-06-23 | HARD tier verified: Jenkins pipeline runs all 6 stages successfully | — |
