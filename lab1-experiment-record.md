# Lab 1 CI/CD Pipeline Experiment Record

## 1. Basic Information

- Course: DevOps and Continuous Delivery
- Lab: Lab 1 - First CI/CD Pipeline
- Repository: https://github.com/yinghui-ren/devops_and_continuous_delivery.git
- Working branch (personal commits): Yuhao
- Main branch: main
- Lab files path in repo: repository root (on the `Yuhao` branch this
  `lab1-cicd-pipeline` folder IS the repo root — no `lab1/` prefix)

## 2. Team Work

- Team members:
- Responsibilities:
  - GitHub repository setup:
  - Web application selection:
  - Jenkins pipeline configuration:
  - Deployment and verification:
  - Documentation:

## 3. Technology Choices

| Component | Choice | Reason |
|---|---|---|
| Virtualisation | VirtualBox + Vagrant | Infrastructure-as-code, reproducible |
| CI/CD tool | Jenkins | Industry standard, flexible pipeline DSL |
| Web application | Spring PetClinic | Official Spring demo, Maven build, JUnit tests |
| OS (VM) | Ubuntu 22.04 (jammy64) | LTS, stable package ecosystem |

## 4. GitHub Repository Setup

### Commands

```bash
git init
git branch -M main
git remote add origin git@github.com:yinghui-ren/lab1-cicd-pipeline.git
git add .
git commit -m "Initial CI/CD lab setup"
git push -u origin main
```

### Repository Structure

```
lab1-cicd-pipeline/
├── Vagrantfile              # VM definition (Ubuntu + Jenkins)
├── Jenkinsfile              # Declarative pipeline (build/test/deploy/verify)
├── lab1-experiment-record.md
└── .gitignore
```

## 5. Environment Preparation

### Prerequisites (Windows host)

- VirtualBox: https://www.virtualbox.org/wiki/Downloads
- Vagrant: https://developer.hashicorp.com/vagrant/downloads

### Virtual Machine (auto-provisioned by Vagrant)

| Tool | Version |
|---|---|
| OS | Ubuntu 22.04 LTS |
| Java | OpenJDK 17 |
| Maven | 3.x (apt) |
| Jenkins | Latest stable (apt) |
| Git | Latest (apt) |

### VM Setup Commands

```bash
# On Windows host — inside lab1-cicd-pipeline/
vagrant up          # create VM, install all tools (~10 min first time)
vagrant ssh         # open shell inside the VM
vagrant halt        # stop VM
vagrant destroy -f  # delete VM completely
```

### Verify inside VM

```bash
java -version
mvn -version
git --version
systemctl status jenkins
```

## 6. Web Application — Spring PetClinic

- **Source**: https://github.com/spring-projects/spring-petclinic
- **Technology**: Java 17, Spring Boot, Maven, H2 in-memory DB
- **Build command**: `mvn clean package -DskipTests`
- **Test command**: `mvn test`
- **Run command**: `java -jar target/spring-petclinic-*.jar --server.port=8081`
- **Access URL (from Windows host)**: http://localhost:8081

### Manual Verification (inside VM)

```bash
# Clone the application
git clone https://github.com/spring-projects/spring-petclinic.git
cd spring-petclinic

# Build
mvn clean package -DskipTests

# Run tests
mvn test

# Start app (port 8081 to avoid conflict with Jenkins on 8080)
java -jar target/spring-petclinic-*.jar --server.port=8081

# In another terminal — verify it responds
curl http://localhost:8081
```

## 7. Jenkins Setup

### Access Jenkins

1. Open http://localhost:8080 in your Windows browser
2. Get the initial admin password:
   ```bash
   vagrant ssh -c "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
   ```
3. Install suggested plugins
4. Create admin user

### Configure Jenkins Pipeline

1. **New Item** → Pipeline → name it `petclinic-pipeline`
2. Under **Pipeline** section → Definition: **Pipeline script from SCM**
3. SCM: Git, Repository URL: `https://github.com/yinghui-ren/lab1-cicd-pipeline.git`
4. Branch: `*/main`
5. Script Path: `Jenkinsfile`
6. Save → **Build Now**

### Pipeline Stages

| Stage | What it does |
|---|---|
| Checkout | Clones Spring PetClinic from GitHub |
| Build | `mvn clean package -DskipTests` |
| Test | `mvn test`, publishes JUnit XML results |
| Deploy | Kills previous instance, starts JAR on port 8081 |
| Verify | `curl` health check confirms the app is up |

## 8. Port Forwarding Summary

| Service | VM port | Windows host port |
|---|---|---|
| Jenkins UI | 8080 | 8080 |
| PetClinic app | 8081 | 8081 |
| SSH | 22 | 2222 |

SSH from Windows: `ssh -i .vagrant\machines\default\virtualbox\private_key -p 2222 vagrant@127.0.0.1`
Or simply: `vagrant ssh`

Verified with `vagrant port`:
```
22 (guest) => 2222 (host)
8080 (guest) => 8080 (host)
8081 (guest) => 8081 (host)
```

### Synced Folder

Vagrant's default synced folder maps the project directory (where the
Vagrantfile lives) to `/vagrant` inside the VM automatically — no extra
config needed. Verified bidirectionally: a file created on the Windows
host with a plain redirect appeared instantly inside the VM at
`/vagrant/<file>`.

## 9. Problems and Solutions

| Date | Problem | Cause | Solution | Result |
| --- | --- | --- | --- | --- |
| 2026-06-02 | `vagrant up` failed: `Job for jenkins.service failed` | Jenkins LTS (>=2.426) requires Java 21+; Vagrantfile installed Java 17 | Installed `openjdk-21-jdk`, `systemctl reset-failed jenkins`, `systemctl start jenkins`; updated Vagrantfile to install Java 21 from the start | Resolved |
| 2026-06-16 | `vagrant ssh -c "..."` failed with "Identity file ... not accessible" / Permission denied | Project path contains Chinese characters and spaces, which the bundled Vagrant SSH client mis-parses on Windows | Call `ssh -i <private_key_path> -p 2222 vagrant@127.0.0.1 "<cmd>"` directly instead of `vagrant ssh -c` | Resolved |
| 2026-06-16 | Jenkins job: `Unable to find Jenkinsfile from git ...` | Script Path was guessed as `lab1/lab1-cicd-pipeline/Jenkinsfile`, assuming a monorepo layout; the actual repo root (on branch `Yuhao`) IS this folder | Set Script Path to plain `Jenkinsfile` | Resolved |
| 2026-06-16 | Deploy stage: `Could not find credentials entry with ID 'deploy-vm-ssh'` | Credential was never actually created in Jenkins (only `agent-vm-ssh` existed) | Created the missing credential | Resolved (but led to the next problem) |
| 2026-06-16 | Deploy stage: `Load key "****": error in libcrypto` / `Permission denied (publickey)` even though the same key worked for the agent SSH launcher | The private key got corrupted (400 → 416 bytes, 8 → 9 lines) when copy-pasted through the browser credential textarea on Windows | Created a brand-new credential (`deploy-vm-ssh-clean`) directly via Jenkins' Script Console (`/scriptText`), feeding it the exact bytes read straight from the `.vagrant` private key file — no clipboard involved | Resolved |
| 2026-06-16 | Deploy stage: ssh remote command exits with code 255 | `pkill -f $DEPLOY_DIR/app.jar` matches **its own invocation's argv** (which also contains that path string) and kills itself; the ssh channel then reports `exit-signal` instead of a normal exit code | Replaced `pkill -f` with a PID-file pattern: `echo $! > app.pid` on start, `kill $(cat app.pid)` on stop | Resolved |

## 10. Part 4 — Multi-VM Architecture

```
                 Windows host (browser / curl / PowerShell)
                       │ :8080 (Jenkins UI)   │ :8081 (App)
                       ▼                      ▼
   ┌──────────────────────────┐      ┌──────────────────────────┐
   │ master (192.168.56.10)   │      │ deploy (192.168.56.12)   │
   │ Jenkins controller       │◄────►│ runs the deployed JAR    │
   └────────────┬──────────────┘ SSH └──────────────▲────────────┘
                 │ SSH (agent connector)             │ SCP + SSH
                 ▼                                   │
   ┌──────────────────────────┐                      │
   │ agent (192.168.56.11)    │──────────────────────┘
   │ label: agent-vm          │   Build + Test (Maven), then
   │ runs Checkout/Build/Test │   deploys the JAR to "deploy"
   └──────────────────────────┘
```

All three VMs share a VirtualBox private network (`192.168.56.0/24`)
defined in the Vagrantfile via `config.vm.define`. Each machine also
gets the default `/vagrant` synced folder and its own forwarded SSH
port on the Windows host (`2222` master, `2200` agent, `2201` deploy).

### Steps completed

1. Added a private network + kept the existing Jenkins VM as the
   `"default"` machine (`vagrant reload`) so prior state was preserved.
2. Brought up a second VM (`agent`) with Java/Maven/Git; verified
   `ping` connectivity to master over the private network.
3. Triggered the pipeline with `curl`-equivalent calls (PowerShell
   `Invoke-WebRequest` with HTTP Basic auth using a Jenkins API token)
   from both the Windows host and from inside the `agent` VM —
   both returned `HTTP 201 Created`.
4. Registered `agent` as a permanent Jenkins SSH agent (label
   `agent-vm`), using an SSH credential bound to its Vagrant-generated
   key, with `authorized_keys` already set up by Vagrant.
5. Brought up a third VM (`deploy`) — Java runtime only — to host the
   running application, forwarding its port 8081 to the Windows host.
6. Authorized the agent's public key on the deploy VM, and rewrote the
   `Jenkinsfile` so:
   - `agent { label 'agent-vm' }` — Checkout/Build/Test run on the
     agent node, not the controller.
   - The `Deploy` stage uses `withCredentials([sshUserPrivateKey(...)])`
     to `scp` the built JAR to `deploy` and (re)start it there over
     `ssh`, using a PID file rather than `pkill` to manage the process.
   - `Verify` curls the deploy VM's `/actuator/health` endpoint.
7. Confirmed end-to-end success (Jenkins build #15): Build → 59 tests
   passed → JAR copied to `deploy` → app started → health check
   returned `{"status":"UP"}` — verified independently from the
   Windows host via `http://localhost:8081`.

## 11. Progress Log

| Date | Work Done | Commit ID |
| --- | --- | --- |
| 2026-06-02 | Created Git repository and prepared lab record document. | |
| 2026-06-02 | Added Vagrantfile, Jenkinsfile, updated experiment record. | |
| 2026-06-02 | Fixed Jenkins Java version issue; pipeline ran successfully end-to-end (Checkout/Build/Test/Deploy/Verify), app reachable at http://localhost:8081 | |
| 2026-06-16 | Verified synced folder (/vagrant) and port forwarding (8080/8081/2222); started Part 4 (network improvements, second VM as agent, third VM as deploy target) | 97cda47 |
| 2026-06-16 | Triggered pipeline via curl/API token from Windows host and from inside the agent VM (both HTTP 201) | |
| 2026-06-16 | Registered agent VM as a Jenkins SSH agent (label agent-vm); built deploy VM | |
| 2026-06-16 | Reworked Jenkinsfile for agent-based build/test + SSH deploy to the deploy VM; fixed Script Path, missing/corrupted credential, and pkill self-kill bug | f465764, 570152a |
| 2026-06-16 | Part 4 complete: pipeline #15 SUCCESS end-to-end across all three VMs | |
