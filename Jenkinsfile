pipeline {
	agent {
		docker {
			label 'docker-agent'
				image 'node:22-bookworm'
				args '-u root -v /home/yinghui/.ssh:/root/.ssh:ro'
		}
	}

	environment {
		DISCORD_WEBHOOK_URL = credentials('discord-webhook-url')
	}

	stages {
		stage('Agent Setup') {
			steps {
				sh 'apt-get update && apt-get install -y openssh-client curl git rsync'
			}
		}
		stage('Build') {
			steps {
				sh 'npm install'
			}
		}

		stage('Test') {
			steps {
				sh 'npm test'
			}
		}

		stage('Deploy') {
			steps {
				sh '''
					DEPLOY_DIR=/home/yinghui/aap-devops-poc/devops_and_continuous_delivery
					rm -rf /tmp/release && mkdir -p /tmp/release
					cp -r src package.json package-lock.json node_modules /tmp/release/

					rsync -avz --delete -e ssh /tmp/release/ yinghui@192.168.88.130:"$DEPLOY_DIR"/

					ssh yinghui@192.168.88.130 "
					pm2 restart aap-devops-poc || pm2 start $DEPLOY_DIR/src/server.js --name aap-devops-poc
					"
					'''
			}
		}
		stage('Health Check') {
			steps {
				sh '''
					sleep 5
					for i in 1 2 3 4 5; do
						curl -f http://192.168.88.130:3000/health && exit 0
							sleep 3
							done
							exit 1
							'''
			}
		}

	}

	post {
		success {
			sh '''
				curl -H "Content-Type: application/json" \
				-d '{"content":"AAP DevOps POC pipeline succeeded: Build, Test and Deploy completed."}' \
				"$DISCORD_WEBHOOK_URL"
				'''
		}

		failure {
			sh '''
				curl -H "Content-Type: application/json" \
				-d '{"content":"AAP DevOps POC pipeline failed. Please check Jenkins logs."}' \
				"$DISCORD_WEBHOOK_URL"
				'''
		}
	}
}
