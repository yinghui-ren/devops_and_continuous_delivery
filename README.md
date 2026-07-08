# AAP DevOps POC

Proof of concept for a CI/CD pipeline: a small Node.js/Express app, built, tested and
deployed automatically by Jenkins across 3 hosts.

## Architecture

```
GitHub (this repo, branch "project")
        |  webhook / poll
        v
Jenkins controller (VM #1)
        |  label: docker-agent
        v
Docker agent host (VM #2) --creates--> ephemeral container (node:22-bookworm)
                                              |
                                   Build -> Test -> Deploy (rsync)
                                              |
                                              v
                                Production server (VM #3, pm2)
```

This POC used these 3 hosts (adjust the IPs below to match your own environment):

| Role | IP used in this POC | Notes |
|---|---|---|
| Jenkins controller | `192.168.88.132` | Runs the `jenkins` service, orchestrates the pipeline |
| Docker agent | `192.168.88.134` | Registered as a permanent Jenkins SSH agent (label `docker-agent`); Docker on this host is used to spin up a fresh container per pipeline run |
| Production server | `192.168.88.130` | Runs only the deployed app under `pm2`. No Jenkins, no git, no dev tooling |

## Application endpoints

```text
GET /        -> Hello from AAP DevOps POC
GET /health  -> { "status": "OK" }
```

## Run the app locally

```bash
npm install
npm test
npm start
```

The app listens on port `3000` by default (override with the `PORT` env var).

## Setting up the 3 hosts

### 1. Jenkins controller

1. Install Jenkins (e.g. `apt install jenkins` on Debian/Ubuntu) and start the service.
2. Install the plugins: **Docker Pipeline**, **SSH Agents**, **Git**.
3. Add two credentials under **Manage Jenkins > Credentials**:
   - Kind **SSH Username with private key**, id `yinghui`, username `yinghui`, private key in **PEM format**
     (`ssh-keygen -t rsa -b 4096 -m PEM`) — this is used to reach both the docker agent and the production server.
     Old versions of Jenkins' `trilead-api` cannot parse the newer OpenSSH key format, so PEM is required.
   - Kind **Secret text**, id `discord-webhook-url`, value = your Discord webhook URL — used for pipeline notifications.
4. Create a pipeline job pointing at this repository, branch `project`, script path `Jenkinsfile`.

### 2. Docker agent host

1. Install Docker on this VM and add the `yinghui` user to the `docker` group.
2. Copy the **public** half of the `yinghui` SSH key (from step 1) into `~/.ssh/authorized_keys` on this host.
3. In Jenkins, add a permanent **SSH agent node**:
   - Name: `docker-agent`, label: `docker-agent`
   - Remote root directory: `/home/yinghui/jenkins-agent`
   - Launch method: **Launch agents via SSH**, host = this VM's IP, port `22`, credentials = `yinghui`

The Jenkinsfile's `agent { docker { label 'docker-agent' ... } }` block makes Jenkins run each
pipeline inside a fresh `node:22-bookworm` container on this host, removed again once the run finishes.

### 3. Production server

1. Install Node.js and `pm2` (`npm install -g pm2`).
2. Create the deploy directory: `/home/yinghui/aap-devops-poc/devops_and_continuous_delivery`.
3. Add the same `yinghui` public key to this host's `~/.ssh/authorized_keys` (the docker agent
   container needs to SSH/rsync into this box during the Deploy stage).
4. Make sure port `3000` is reachable from the Jenkins agent (for the health check) and open to whoever
   needs to use the app.

Nothing else needs to be installed here — the Deploy stage only ships `src/`, `package.json`,
`package-lock.json` and the resolved `node_modules`, so this host never runs `git pull` or `npm install`
and never holds the test suite, scripts, or project docs.

## Pipeline stages (`Jenkinsfile`)

1. **Agent Setup** — installs `openssh-client`, `curl`, `git`, `rsync` inside the fresh container.
2. **Build** — `npm install`.
3. **Test** — `npm test`.
4. **Deploy** — stages `src/`, `package.json`, `package-lock.json`, `node_modules` and `rsync --delete`s
   them to the production server, then restarts the app with `pm2`.
5. **Health Check** — polls `http://<production-ip>:3000/health` a few times to confirm the app is up.
6. **Notify** (`post` block) — sends a Discord message whether the pipeline succeeded or failed.

## Triggering and verifying a run

1. Push to the `project` branch (or click **Build Now** on the Jenkins job).
2. Watch the run in Jenkins; the `docker-agent` node should show a temporary executor busy while it runs.
3. After a successful run:
   - `curl http://192.168.88.130:3000/health` should return `{ "status": "OK" }`.
   - A Discord message should land in the configured channel.
   - The production directory should contain only `src/`, `package.json`, `package-lock.json`, `node_modules`.
