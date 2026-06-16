pipeline {
    agent any

    environment {
        APP_DIR = "app"
        APP_PORT = "8081"
        APP_LOG = "/tmp/local-library.log"
        MONGOMS_VERSION = "4.4.29"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Node') {
            steps {
                sh '''
                    node --version
                    npm --version
                    node -e "const major = Number(process.versions.node.split('.')[0]); if (major < 22) { throw new Error('Node.js 22 or newer is required'); }"
                '''
            }
        }

        stage('Install') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm ci'
                }
            }
        }

        stage('Test') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm test'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir("${APP_DIR}") {
                    sh '''
                        pkill -f "node ./bin/www" || true
                        sleep 2

                        nohup env \
                            BUILD_ID=dontKillMe \
                            JENKINS_NODE_COOKIE=dontKillMe \
                            PORT=${APP_PORT} \
                            npm start > ${APP_LOG} 2>&1 &

                        echo "Waiting for application to start..."
                        sleep 10
                        pgrep -af "node ./bin/www"
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    curl --fail --silent --max-time 10 http://localhost:${APP_PORT}/catalog
                    echo "Application is running at http://localhost:${APP_PORT}/catalog"
                '''
            }
        }
    }

    post {
        failure {
            sh 'cat ${APP_LOG} || true'
        }
    }
}
