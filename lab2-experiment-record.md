# Lab 2 — Containers Pool Agent — Experiment Record

## 1. Basic Information

- Course: DevOps and Continuous Delivery
- Lab: Lab 2 - Containers pool agent
- Repository: https://github.com/yinghui-ren/devops_and_continuous_delivery.git
- Working branch (personal commits): Yuhao-lab2
- Lab files path in repo: repository root on the `Yuhao-lab2` branch

## 2. Task Tiers (from lab2.png)

### EASY
- Run a second VM with Vagrant
- Install Docker (or Podman)
- Connect to DockerHub
- With a Dockerfile: install an application in an Ubuntu container
- Tag a new image
- Tag and push your container

### MEDIUM (try some tricks)
- Deploy an application (e.g. WordPress) with Docker Compose
- Use Podman instead of Docker (or another container runtime/LXC)
- Set up a port redirection or folder path redirection between VM2/container
- Build and push a new pipeline

### HARD (toward the final project)
- Run VM1 and VM2 simultaneously
- Configure Jenkins/GitLab-CI to register the Lab 2 VM as a Docker socket agent
- When the pipeline is triggered on VM1, a container must be created on VM2 to run the build job
- Deploy the application so the container moves from build to deploy
- Deploy the application on a 3rd container

## 3. Architecture

```
Windows host
  │ :8090 (Jenkins, vm1)     │ :8082 (containerized app, vm2)
  ▼                          ▼
┌─────────────────┐    ┌──────────────────────┐
│ vm1 (192.168.57.10)│    │ vm2 (192.168.57.11)  │
│ Jenkins controller │    │ Docker Engine host   │
└─────────────────┘    └──────────────────────┘
```

- Private network: `192.168.57.0/24` (deliberately different from
  Lab 1's `192.168.56.0/24` so both labs' VMs can run at the same time
  without IP/port clashes).
- vm1 SSH forwarded to host port 2210, vm2 SSH to 2211.

## 4. Technology Choices

| Component | Choice | Reason |
|---|---|---|
| Container runtime | Docker CE (official apt repo) | Industry standard, matches lab wording "Docker (or Podman)" |
| Containerized app | Spring PetClinic (same as Lab 1) | Continuity with Lab 1; well-documented, buildable, testable |
| Build strategy | Multi-stage Dockerfile (maven → ubuntu runtime) | Keeps final image to "Ubuntu + JRE + jar", no Maven/build tools shipped |

## 5. EASY Tier — Commands

### 5.1 Bring up VM2 (Docker host)

```bash
vagrant up vm2
```

### 5.2 Verify Docker

```bash
vagrant ssh vm2 -c "docker --version && docker run --rm hello-world"
```

### 5.3 Build and tag the image

```bash
# from /vagrant inside vm2 (synced folder), or copy Dockerfile there
docker build -t petclinic-ubuntu:1.0 .
docker tag petclinic-ubuntu:1.0 <dockerhub-username>/petclinic-ubuntu:1.0
```

### 5.4 Run locally to verify

```bash
docker run -d --name petclinic -p 8082:8082 petclinic-ubuntu:1.0
curl http://localhost:8082/actuator/health
```

### 5.5 Connect to DockerHub and push

```bash
docker login          # interactive, run by the student (not automated)
docker push huang199864/petclinic-ubuntu:1.0
```

### 5.6 Result

- DockerHub account: `huang199864`
- Image: `huang199864/petclinic-ubuntu:1.0`
- Push output: `1.0: digest: sha256:e4fac1750bfd9020a876ab01ca3f931aaaf980040333ac033b9670acd9110517 size: 1189`
- Verified reachable at https://hub.docker.com/r/huang199864/petclinic-ubuntu

## 6. MEDIUM Tier

### 6.1 WordPress via Docker Compose

- `docker-compose.yml`: `db` (mysql:8.0) + `wordpress` (wordpress:latest),
  named volumes for persistence, port `8083:80`.
- Commands:
  ```bash
  docker compose up -d
  docker compose ps
  curl http://localhost:8083/
  ```
- Result: `HTTP 200`, page title `WordPress › Installation`, verified
  from the Windows host through the forwarded port 8083.

### 6.2 Podman instead of Docker

- Installed `podman` (+`buildah`) alongside Docker on vm2 — both
  runtimes coexist fine.
- Built the **same** Dockerfile with Podman:
  ```bash
  podman build -t petclinic-ubuntu-podman:1.0 .
  podman run -d --name petclinic-podman -p 8084:8082 petclinic-ubuntu-podman:1.0
  ```
- Result: identical image works unmodified under Podman; health check
  `{"status":"UP"}` confirmed from the Windows host via port 8084.

### 6.3 Folder path redirection (bind mount)

- `~/shared` on the vm2 host bind-mounted into a throwaway `alpine`
  container at `/data`, in both directions:
  ```bash
  docker run --rm -v ~/shared:/data alpine cat /data/exchange.txt
  docker run --rm -v ~/shared:/data alpine sh -c "echo hello-from-container >> /data/exchange.txt"
  ```
- Result: file written on the host was visible inside the container,
  and a line appended *inside* the container appeared back on the
  host file afterward — confirms the bind mount is live in both
  directions, not a one-shot copy.

### 6.4 Build and push a new pipeline

- Brought up `vm1` (Jenkins controller, no Docker installed on it).
- `Jenkinsfile` stages: Checkout → copy `Dockerfile` to vm2 over SCP →
  `docker build`/`tag`/`push`, all executed remotely on vm2 via SSH
  (same SSH-credential-binding pattern as the Lab 1 Deploy stage).
  Push relies on the `docker login` session already cached on vm2 from
  the EASY tier.
- Job created via the Jenkins REST API (`createItem` with a Pipeline
  XML config pointing at `Yuhao-lab2` branch, script path
  `Jenkinsfile`), triggered via the same token-authenticated
  `build` endpoint used in Lab 1.
- Result: build #1 `SUCCESS` (≈7m45s, mostly Maven dependency
  download on a fresh build context); pushed
  `huang199864/petclinic-ubuntu:1` and `:latest` to DockerHub.

## 7. Problems and Solutions

| Date | Problem | Cause | Solution | Result |
| --- | --- | --- | --- | --- |
| 2026-06-16 | `vagrant up vm2` lost SSH connection mid-provision ("SSH connection was unexpectedly closed") | Installing `docker-ce` brings up the `docker0` bridge / rewrites iptables rules, which can momentarily disrupt the existing NAT'd SSH session | Re-ran `vagrant provision vm2`; once Docker's network setup settled, SSH reconnected normally | Resolved |
| 2026-06-16 | `vagrant provision vm2` then failed: `dpkg was interrupted, you must manually run 'sudo dpkg --configure -a'` | The earlier SSH disconnect happened mid-`apt-get install`, leaving dpkg in an inconsistent state | Ran `sudo dpkg --configure -a` over SSH to finish the half-installed packages, then re-provisioned | Resolved |
| 2026-06-16 | Re-running provision failed again: `gpg: cannot open '/dev/tty'` / `curl: (23) Failed writing body` | The Docker GPG-key step (`gpg --dearmor -o .../docker.gpg`) isn't idempotent — on a second run the destination file already exists and gpg prompts for overwrite confirmation on a tty that doesn't exist in non-interactive provisioning | Finished the remaining setup manually over SSH (`usermod -aG docker`, `systemctl enable/start docker`); fixed the Vagrantfile to `rm -f` the old key and pass `gpg --yes` so future re-provisions are idempotent | Resolved |
| 2026-06-16 | `docker push` reported `tag does not exist` | Ran `docker login`/`docker push` in the **Windows host's own Docker** (PowerShell), which is a completely separate Docker installation/image store from the one inside VM2 where the image was actually built | SSH into VM2 first, then run `docker login` + `docker push` there | Resolved |
| 2026-06-16 | `docker compose up -d`: `unknown command: docker compose` | `docker-compose-plugin` (and `docker-buildx-plugin`) silently failed to install earlier — the apt-get line was interrupted by the same SSH disconnect, but only the `docker-ce`/`docker-ce-cli` part had completed by the time it dropped | `sudo apt-get install -y docker-compose-plugin docker-buildx-plugin` | Resolved |
| 2026-06-16 | `podman build`: `short-name ... did not resolve to an alias and no unqualified-search registries are defined` | Podman, unlike Docker, requires an explicit unqualified-search registry list before it will resolve short image names like `ubuntu:22.04` | Added `unqualified-search-registries = ["docker.io"]` to `/etc/containers/registries.conf` | Resolved |
| 2026-06-16 | Podman container died ~20s after `podman run -d` (exit code 143 / SIGTERM), even though `podman ps` showed it running right after start | Rootless Podman ties container processes to the user's systemd login session; once the SSH session that launched it closed, `systemd-logind` reaped the session and killed the container | `sudo loginctl enable-linger vagrant` so the user's systemd instance (and its containers) persists with no active login session | Resolved |
| 2026-06-16 | Jenkins (vm1) `apt-get update` failed: `NO_PUBKEY 7198F4B714ABFC68` / repository not signed | The `jenkins.io-2023.key` used in the Vagrantfile had expired (2026-03-26); Jenkins had since rotated to `jenkins.io-2026.key`. Also affects Lab 1's Vagrantfile (same script) | Found the current key by listing `https://pkg.jenkins.io/debian-stable/`, verified its fingerprint matches the missing key ID, updated both Lab 1's and Lab 2's Vagrantfiles, and manually refreshed the keyring on the already-provisioned VM | Resolved |
| 2026-06-16 | Re-provisioning vm1 still hit the same `NO_PUBKEY` error after fixing the key URL | `/etc/apt/sources.list.d/jenkins.list` from the earlier failed run already existed, so the **first**, general `apt-get update -y` (before the script ever reaches the new key download step) already tried — and failed — against the still-old keyring; `set -e` aborted before the fix could apply | Manually re-wrote the keyring file via SSH with the correct key, then re-ran `vagrant provision` | Resolved |
| 2026-06-16 | Jenkins Script Console call (`/scriptText`) returned `403 No valid crumb was included in the request` even with a freshly fetched crumb | The crumb exemption for Basic-Auth requests applies to **API tokens**, not to the raw account password — using `usr`/`pwd` directly does not bypass CSRF the way an API token does | Generated a proper Jenkins API token and used it for Basic Auth instead of the raw password | Resolved |

## 8. Progress Log

| Date | Work Done | Commit ID |
| --- | --- | --- |
| 2026-06-16 | Created lab2 folder/branch, Vagrantfile (vm1 Jenkins + vm2 Docker), multi-stage Dockerfile for PetClinic | 8787928 |
| 2026-06-16 | Brought up vm2, fixed dpkg/gpg provisioning issues, verified Docker with hello-world | |
| 2026-06-16 | Built and ran `petclinic-ubuntu:1.0` on vm2, verified health endpoint from Windows host via port 8082 | |
| 2026-06-16 | EASY tier complete: tagged and pushed image to DockerHub (`huang199864/petclinic-ubuntu:1.0`) | 4b75783 |
| 2026-06-16 | MEDIUM: WordPress deployed via Docker Compose (port 8083), verified from Windows host | e7ac338 |
| 2026-06-16 | MEDIUM: installed Podman, rebuilt/ran the same Dockerfile, fixed registries.conf and systemd-linger issues | e7ac338 |
| 2026-06-16 | MEDIUM: demonstrated bidirectional bind-mount folder redirection between vm2 host and a container | e7ac338 |
| 2026-06-16 | MEDIUM: brought up vm1 (Jenkins), fixed expired Jenkins GPG key (also patched in Lab 1), created SSH credential via Script Console, wrote Jenkinsfile, created job via REST API | e7ac338 |
| 2026-06-16 | MEDIUM tier complete: pipeline build #1 SUCCESS — built/tagged/pushed `huang199864/petclinic-ubuntu:1` and `:latest` to DockerHub end-to-end | |
