# Lab 2 Containers Pool Agent Experiment Record

## 1. Basic Information

- Course: DevOps and Continuous Delivery
- Lab: Lab 2 - Containers pool agent
- Repository: https://github.com/yinghui-ren/devops_and_continuous_delivery.git
- Working branch: yinghui
- Application: Node.js Express Local Library
- Lab 2 VM folder: `lab2/`
- Docker image name: `local-library:1.0`
- DockerHub image: `yinghui2026/local-library:1.0`
- Container access URL: http://localhost:8083/catalog

## 2. Lab Objectives

The goal of Lab 2 is to introduce a container host into the CI/CD environment.

The selected scope is the EASY tier from the lab instructions:

- Run a second VM with Vagrant.
- Install Docker on the second VM.
- Build an application image using a Dockerfile.
- Tag the Docker image.
- Log in to DockerHub.
- Push the image to DockerHub.
- Run the container and verify that the application responds.

The implementation also includes a MEDIUM-level improvement: `compose.yaml` runs the
application together with a local MongoDB container, avoiding dependency on MongoDB
Atlas network access during local container verification.

## 3. Architecture

```text
Windows host
  |
  |-- http://localhost:8888          -> Lab 1 Jenkins VM
  |-- http://localhost:8081/catalog  -> Lab 1 deployed app
  |-- http://localhost:8083/catalog  -> Lab 2 Docker container on VM2

Lab 2 VM2
  - Ubuntu 22.04
  - Docker Engine
  - Project folder mounted at /vagrant
  - Container port mapping: host 8082 -> container 3000
```

Lab 2 uses a separate Vagrantfile in `lab2/Vagrantfile` so that the existing Lab 1 Jenkins VM is not changed.

## 4. Technology Choices

| Component | Choice | Reason |
|---|---|---|
| VM provisioning | Vagrant | Keeps the Docker host reproducible |
| Container runtime | Docker Engine | Matches the lab requirement to install Docker or Podman |
| Base image | `node:22-bookworm-slim` | The application requires Node.js 22 or newer |
| Application | Existing `app/` Express Local Library | Reuses the Lab 1 application |
| Container port | 3000 | Default Express app port |
| VM port | 8082 | Exposes the Docker container from inside VM2 |
| Windows host port | 8083 | Avoids conflict with Jenkins 8888, Lab 1 app 8081, and an existing process on 8082 |

## 5. Files Added for Lab 2

```text
Dockerfile
.dockerignore
compose.yaml
lab2/Vagrantfile
lab2-experiment-record.md
lab2-data/
```

## 6. Dockerfile Summary

The Dockerfile:

1. Uses Node.js 22.
2. Copies `app/package.json` and `app/package-lock.json`.
3. Runs `npm ci --omit=dev`.
4. Copies the application source from `app/`.
5. Exposes port 3000.
6. Starts the application with `npm start`.

The application startup script `app/bin/www` was also adjusted so the HTTP server
starts only after MongoDB connection succeeds. This makes the container fail fast if
the database is unavailable and makes local Compose verification easier to debug.

## 7. Step-by-Step Commands

### 7.1 Start the Lab 2 Docker VM

Run from the Windows project folder:

```bash
cd C:\devops_and_continuous_delivery\lab1-cicd-pipeline\lab2
vagrant up
```

If the VM already exists:

```bash
vagrant reload --provision
```

### 7.2 Verify Docker in VM2

```bash
vagrant ssh -c "docker --version"
vagrant ssh -c "docker run --rm hello-world"
```

### 7.3 Build the Application Image

```bash
vagrant ssh -c "cd /vagrant && docker build -t local-library:1.0 ."
```

### 7.4 Run the Container

Preferred Lab 2 verification command, with a local MongoDB container:

```bash
vagrant ssh -c "cd /vagrant && docker compose up -d --build"
```

This starts:

- `local-library-mongodb`
- `local-library`

The app uses `MONGODB_URI=mongodb://mongodb:27017/local_library` so the `/catalog`
page does not depend on MongoDB Atlas network access.

Manual single-container command, if MongoDB Atlas access is available:

```bash
vagrant ssh -c "docker rm -f local-library || true"
vagrant ssh -c "docker run -d --name local-library -p 8082:3000 local-library:1.0"
```

### 7.5 Verify the Container Inside VM2

```bash
vagrant ssh -c "curl -i http://localhost:8082/catalog"
vagrant ssh -c "docker ps"
vagrant ssh -c "docker logs --tail=80 local-library"
```

### 7.6 Verify from Windows Browser

Open:

```text
http://localhost:8083/catalog
```

### 7.7 Tag and Push to DockerHub

Replace `<dockerhub-username>` with the real DockerHub username:

```bash
vagrant ssh
cd /vagrant
docker login
docker tag local-library:1.0 yinghui2026/local-library:1.0
docker tag local-library:1.0 yinghui2026/local-library:latest
docker push yinghui2026/local-library:1.0
docker push yinghui2026/local-library:latest
```

DockerHub image URL:

```text
https://hub.docker.com/r/yinghui2026/local-library
```

Push result:

```text
yinghui2026/local-library:1.0
digest: sha256:32158fbce34679b2a14072c51d225a9b6e7de952d629098c1dc1de78e59a6f6f

yinghui2026/local-library:latest
digest: sha256:32158fbce34679b2a14072c51d225a9b6e7de952d629098c1dc1de78e59a6f6f
```

## 8. Verification Evidence

Evidence to collect in `lab2-data/`:

| Evidence | Status |
|---|---|
| Lab 2 instruction image | Added |
| `vagrant up` or VM running evidence | Completed |
| `docker --version` output | Completed |
| `docker run hello-world` output | Completed |
| `docker build -t local-library:1.0 .` output | Completed |
| `docker ps` showing running container | Completed |
| Browser screenshot for `http://localhost:8083/catalog` | Completed |
| DockerHub pushed image screenshot | Completed |

## 9. Problems and Solutions

| Date | Problem | Cause | Solution | Result |
|---|---|---|---|---|
| 2026-06-16 | Need Lab 2 to remain independent from Lab 1 | Lab 1 VM and Jenkins are already working and should not be broken | Created a separate `lab2/Vagrantfile` for the Docker VM | Lab 1 configuration remains unchanged |
| 2026-06-16 | Node version compatibility | The application requires Node.js 22 | Used `node:22-bookworm-slim` as Docker base image | Docker image uses the correct runtime |
| 2026-06-16 | Browser could not open `http://localhost:8082/catalog` | The app may fail or hang if the container cannot reach MongoDB Atlas | Added `compose.yaml` to run a local MongoDB container and point the app to it | Use `docker compose up -d --build` for stable local verification |
| 2026-06-16 | `vagrant up` failed because host port 8082 was already in use | Another Windows process was listening on port 8082 | Changed Lab 2 Vagrant host port to 8083 while keeping VM guest port 8082 | Browser URL is now `http://localhost:8083/catalog` |
| 2026-06-17 | MongoDB container repeatedly restarted in the Lab 2 VM | The `mongo:7` image can fail on some VirtualBox/CPU combinations | Changed Compose to use `mongo:4.4` for better VM compatibility | Recreate containers with `docker compose down -v` and `docker compose up -d --build` |
| 2026-06-17 | Docker command was not found after SSH | The shell was connected to the Lab 1 VM instead of the Lab 2 Docker VM | Entered the VM from the `lab2/` directory with `vagrant ssh` | Docker commands were available on `lab2-docker` |

## 10. Progress Log

| Date | Work Done | Commit ID |
|---|---|---|
| 2026-06-16 | Copied Lab 2 instruction image into `lab2-data/` | |
| 2026-06-16 | Added Dockerfile, `.dockerignore`, and Lab 2 Docker VM Vagrantfile | |
| 2026-06-16 | Created Lab 2 experiment record draft | |
| 2026-06-17 | Built and pushed `yinghui2026/local-library:1.0` and `:latest` to DockerHub | |
