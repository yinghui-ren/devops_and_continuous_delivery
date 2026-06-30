  pipeline {
      agent any

      environment {
          DISCORD_WEBHOOK_URL = credentials('discord-webhook-url')
      }

      stages {
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
