# Part 3 - CI/CD Proof of Concept

The goal of the POC is to show that AAP can replace manual deployment with an automated CI/CD pipeline.

The POC does not need a complex application. A small demo app is enough. The important part is to prove that the pipeline works.

## Architecture

The project requires at least 3 hosts:

```text
GitHub repository
    |
    v
Jenkins controller VM
    |
    v
Temporary Docker agent
    |
    v
Production server VM
```

## Host 1: Jenkins controller

The Jenkins controller is the main Jenkins server.

It is responsible for:

- reading the `Jenkinsfile`
- starting the pipeline
- creating the temporary agent
- collecting logs and results
- showing if the pipeline succeeded or failed

## Host 2: Temporary Docker agent

The Jenkins agent is where the pipeline commands actually run.

For this project, the agent should be dynamic:

```text
Pipeline starts
    |
    v
Jenkins creates a Docker agent
    |
    v
Agent runs the pipeline
    |
    v
Agent is destroyed
```

This matches the project requirement:

> The execution of the pipeline is started on a dynamically created agent. The agent is destroyed after the end of the pipeline execution.

## Host 3: Production server

The production server contains only the deployed application and its configuration.

It should not contain Jenkins.

It should not be used to build or test the application.

It only receives the final deployed application.

## Required pipeline steps

The pipeline must include at least 4 steps:

```text
Build
Test
Deployment
Notify
```

## Example pipeline flow

```text
1. Jenkins gets the code from GitHub
2. Jenkins creates a temporary Docker agent
3. The agent installs dependencies
4. The agent runs unit tests
5. The agent deploys the app to the production server
6. Jenkins sends a notification to Slack or Discord
7. The temporary agent is destroyed
```

## Demo application

For the POC, we can use a simple Node.js Express application.

Example endpoints:

```text
GET /        -> Hello from AAP DevOps POC
GET /health  -> { "status": "OK" }
```

This is enough to test:

- build
- unit tests
- deployment
- health check
- notification

Later, the demo app can be replaced by a more official application.

The pipeline structure will stay mostly the same:

```text
checkout code -> build -> test -> deploy -> notify
```

Only the commands inside the stages may change.

## What we need to provide

For this part, we need to provide:

- the application code
- the `Jenkinsfile`
- deployment scripts if needed
- a public GitHub repository
- screenshots of the pipeline
- proof that the app is deployed
- proof that notification works
- a tutorial explaining how to install and run everything

## Simple summary

The POC proves that AAP can move from manual deployment to automated delivery.

Instead of developers sending zip files and release managers deploying manually, Jenkins will automatically:

```text
get the code -> build it -> test it -> deploy it -> notify the team
```

This reduces manual work, deployment time, and human errors.
