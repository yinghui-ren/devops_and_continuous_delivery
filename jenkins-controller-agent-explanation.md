# Jenkins Controller and Agent

In Jenkins, there are two main roles:

```text
Jenkins controller/master
= coordinates the pipeline

Jenkins agent
= actually runs the build/test/deploy commands
```

## 1. Controller and agent on the same machine

```text
One server/VM
  - Jenkins controller
  - Jenkins agent
```

This is possible. Jenkins can run pipeline commands directly on the controller machine.

This is simple, but not ideal because the controller becomes both the manager and the worker.

## 2. Controller and agent separately

```text
Jenkins VM
  - Jenkins controller

Docker container / another VM
  - Jenkins agent
```

This is better for DevOps because the controller stays clean, and the agent does the actual build/test/deploy work.

## For our assignment

The project says:

> When you trigger a CI/CD pipeline on the master, the execution of the pipeline is started on a dynamically created agent. The agent is destroyed after the end of the pipeline execution.

So they want this:

```text
Jenkins controller/master
        |
        | creates
        v
Temporary Jenkins agent
        |
        | runs pipeline
        v
Agent destroyed after pipeline ends
```

In our case, a good setup is:

```text
VM 1: Jenkins controller/master
VM 2: Docker host where temporary agent containers are created
VM 3: Production server where the app is deployed
```

So yes, the controller and agent can exist on the same machine, but for this project we should use a separate dynamic agent.
