# Lab 1 CI/CD Pipeline Experiment Record

## 1. Basic Information

- Course: DevOps and Continuous Delivery
- Lab: Lab 1 - First CI/CD Pipeline
- Repository: https://github.com/yinghui-ren/devops_and_continuous_delivery.git
- Working branch: yinghui
- CI/CD tool: Jenkins
- Final application URL: http://localhost:8081/catalog

## 2. Team Work

- Team members:
- Responsibilities:
  - GitHub repository setup:
  - Web application selection:
  - Vagrant and Jenkins environment configuration:
  - Jenkins pipeline configuration:
  - Deployment and verification:
  - Documentation:

## 3. Technology Choices

| Component | Choice | Reason |
|---|---|---|
| Virtualisation | VirtualBox + Vagrant | Provides a reproducible Jenkins VM environment |
| CI/CD tool | Jenkins | Supports Pipeline as Code through `Jenkinsfile` |
| Web application | Express Local Library | Existing Node.js web application with automated tests |
| Runtime | Node.js 22 | Required by the application's `package.json` |
| Database for tests | MongoMemoryServer with MongoDB 4.4.29 | Avoids AVX requirement in the VM CPU |
| OS (VM) | Ubuntu 22.04 (jammy64) | LTS release with stable package support |

## 4. GitHub Repository Setup

### Commands

```bash
git add Vagrantfile Jenkinsfile app lab1-experiment-record.md
git commit -m "Configure Node Jenkins pipeline"
git push
```

### Repository Structure

```text
devops_and_continuous_delivery/
├── Vagrantfile                 # VM definition and provisioning
├── Jenkinsfile                 # Jenkins declarative pipeline
├── app/                        # Node.js Express Local Library application
│   ├── package.json
│   ├── package-lock.json
│   ├── app.js
│   ├── bin/www
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── views/
│   └── test/
├── lab1-experiment-record.md
└── .gitignore
```

## 5. Environment Preparation

### Prerequisites on Windows Host

- VirtualBox
- Vagrant
- Git
- Browser for Jenkins and application verification

### Virtual Machine Provisioned by Vagrant

| Tool | Version / Source |
|---|---|
| OS | Ubuntu 22.04 LTS |
| Jenkins | Jenkins stable apt repository |
| Git | Ubuntu apt repository |
| Java | OpenJDK, required by Jenkins |
| Node.js | NodeSource Node.js 22.x |
| npm | Installed with Node.js |
| OpenSSL compatibility | `libssl1.1`, required by MongoDB 4.4 test binary |

### VM Setup Commands

```bash
vagrant up
vagrant reload --provision
vagrant ssh
```

### Verification Commands

```bash
node --version
npm --version
git --version
systemctl status jenkins
ldconfig -p | grep libcrypto.so.1.1
```

## 6. Web Application - Express Local Library

- Source location in repository: `app/`
- Technology: Node.js, Express, Pug, Mongoose
- Dependency install command: `npm ci`
- Test command: `npm test`
- Run command: `PORT=8081 npm start`
- Access URL from Windows host: http://localhost:8081/catalog

### Manual Verification Inside VM

```bash
cd /var/lib/jenkins/workspace/app-pipeline/app
npm ci
npm test
PORT=8081 npm start
curl http://localhost:8081/catalog
```

## 7. Jenkins Setup

### Access Jenkins

1. Open http://localhost:8888 in the Windows browser.
2. Get the initial admin password:

```bash
vagrant ssh -c "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
```

3. Install suggested plugins.
4. Create the Jenkins admin user.

### Configure Jenkins Pipeline

1. New Item -> Pipeline -> name it `app-pipeline`.
2. Pipeline Definition: `Pipeline script from SCM`.
3. SCM: Git.
4. Repository URL: `https://github.com/yinghui-ren/devops_and_continuous_delivery.git`.
5. Branch Specifier: `*/yinghui`.
6. Script Path: `Jenkinsfile`.
7. Save -> Build Now.

### Pipeline Stages

| Stage | What it does |
|---|---|
| Checkout | Checks out the repository from GitHub |
| Verify Node | Prints Node/npm versions and fails if Node.js is older than 22 |
| Install | Runs `npm ci` inside `app/` |
| Test | Runs `npm test` inside `app/` |
| Deploy | Stops the previous Node process and starts the app on port 8081 |
| Verify | Uses `curl` to confirm `http://localhost:8081/catalog` is reachable |

### Deployment Detail

The app is started with Jenkins-safe environment variables so that Jenkins does not kill the background Node process after the build ends:

```bash
BUILD_ID=dontKillMe
JENKINS_NODE_COOKIE=dontKillMe
PORT=8081 npm start
```

## 8. Port Forwarding Summary

| Service | VM port | Windows host port |
|---|---:|---:|
| Jenkins UI | 8080 | 8888 |
| Express Local Library app | 8081 | 8081 |
| SSH | 22 | 2222 |

Access from Windows:

```text
Jenkins: http://localhost:8888
Application: http://localhost:8081/catalog
```

## 9. Problems and Solutions

| Date | Problem | Cause | Solution | Result |
|---|---|---|---|---|
| 2026-06-16 | Jenkins failed at `Verify Node` | VM had Node.js 20, but the app requires Node.js 22 or newer | Installed Node.js 22 through NodeSource in `Vagrantfile` | Node version check passed |
| 2026-06-16 | Tests failed with MongoDB `SIGILL` | Default MongoMemoryServer binary used MongoDB 7.x, which requires AVX CPU instructions | Pinned MongoMemoryServer binary to MongoDB 4.4.29 | AVX error resolved |
| 2026-06-16 | Tests failed with missing `libcrypto.so.1.1` | MongoDB 4.4 binary requires OpenSSL 1.1, not installed by default on Ubuntu 22.04 | Installed `libssl1.1` in the VM | MongoDB test binary could start |
| 2026-06-16 | Browser could not open the app after a successful build | Jenkins cleaned up the background app process after the build finished | Added `BUILD_ID=dontKillMe` and `JENKINS_NODE_COOKIE=dontKillMe` when starting the app | App remained available at port 8081 |

## 10. Final Verification

### Jenkins Build Result

- Repository checkout: successful
- Checked out branch: `origin/yinghui`
- Node.js version: 22.x
- Dependency installation: successful
- Automated tests: successful
- Deployment: successful
- Health check: successful

### Application Verification

Inside VM:

```bash
curl -i http://localhost:8081/catalog
```

From Windows browser:

```text
http://localhost:8081/catalog
```

Result: the Local Library application page opened successfully.

## 11. Progress Log

| Date | Work Done | Commit ID |
|---|---|---|
| 2026-06-16 | Configured Jenkins pipeline for the Node.js Express app | 90a7550 |
| 2026-06-16 | Pinned MongoMemoryServer test binary version | b5b324d |
| 2026-06-16 | Installed MongoDB test compatibility library in Vagrant VM | 468cef0 |
| 2026-06-16 | Kept deployed Node app running after Jenkins build | 74d5a00 |
| 2026-06-16 | Updated Lab 1 experiment record | |
