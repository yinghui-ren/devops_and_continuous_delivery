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
docker push <dockerhub-username>/petclinic-ubuntu:1.0
```

## 6. Problems and Solutions

| Date | Problem | Cause | Solution | Result |
| --- | --- | --- | --- | --- |
| 2026-06-16 | `vagrant up vm2` lost SSH connection mid-provision ("SSH connection was unexpectedly closed") | Installing `docker-ce` brings up the `docker0` bridge / rewrites iptables rules, which can momentarily disrupt the existing NAT'd SSH session | Re-ran `vagrant provision vm2`; once Docker's network setup settled, SSH reconnected normally | Resolved |

## 7. Progress Log

| Date | Work Done | Commit ID |
| --- | --- | --- |
| 2026-06-16 | Created lab2 folder/branch, Vagrantfile (vm1 Jenkins + vm2 Docker), multi-stage Dockerfile for PetClinic | |
