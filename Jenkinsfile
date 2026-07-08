pipeline {
	agent {
		docker {
			image 'node:22-bookworm'
				args '-u root -v /var/lib/jenkins/.ssh:/root/.ssh:ro'
		}
	}

	environment {
		DISCORD_WEBHOOK_URL = credentials('discord-webhook-url')
	}

	stages {
		stage('Agent Setup') {
			steps {
				sh 'apt-get update && apt-get install -y openssh-client curl git'
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
					ssh yinghui@192.168.88.130 "
					cd /home/yinghui/aap-devops-poc/devops_and_continuous_delivery &&
					git pull origin yinghui-test &&
					npm install &&
					pm2 restart aap-devops-poc || pm2 start src/server.js --name aap-devops-poc
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
