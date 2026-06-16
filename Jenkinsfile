pipeline {
    // Build and test run on the registered SSH agent node, not on the
    // Jenkins controller (master).
    agent { label 'agent-vm' }

    environment {
        APP_PORT    = "8081"
        APP_JAR     = "target/spring-petclinic-*.jar"
        DEPLOY_HOST = "192.168.56.12"
        DEPLOY_DIR  = "/home/vagrant/app"
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/spring-projects/spring-petclinic.git',
                    branch: 'main'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
            post {
                success { echo 'Build succeeded.' }
                failure { error 'Build failed — check Maven output above.' }
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit testResults: 'target/surefire-reports/*.xml',
                          allowEmptyResults: true
                }
            }
        }

        stage('Deploy') {
            steps {
                // Copy the freshly built JAR to the dedicated deploy VM and
                // (re)start the application there over SSH.
                // Re-uses the already-verified agent-vm-ssh key: its public
                // half was added to the deploy VM's authorized_keys, so the
                // same credential works for both the agent connector and
                // this SSH/SCP deploy step.
                withCredentials([sshUserPrivateKey(
                        credentialsId: 'deploy-vm-ssh-clean',
                        keyFileVariable: 'DEPLOY_KEY',
                        usernameVariable: 'DEPLOY_USER')]) {
                    sh '''
                        chmod 600 "$DEPLOY_KEY"
                        JAR_FILE=$(ls ${APP_JAR})
                        SSH="ssh -o StrictHostKeyChecking=no -i $DEPLOY_KEY $DEPLOY_USER@$DEPLOY_HOST"

                        scp -o StrictHostKeyChecking=no -i $DEPLOY_KEY \
                            "$JAR_FILE" \
                            $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR/app.jar

                        # Stop any previous instance via its recorded PID file.
                        # (Deliberately NOT "pkill -f .../app.jar": pkill's own
                        # invocation argv contains that same search string, so
                        # it ends up matching and killing itself, which made
                        # the ssh channel exit by signal -> exit code 255.)
                        $SSH "if [ -f $DEPLOY_DIR/app.pid ]; then kill \$(cat $DEPLOY_DIR/app.pid) 2>/dev/null || true; rm -f $DEPLOY_DIR/app.pid; fi"
                        sleep 2

                        # Start the app in the background and record its PID.
                        $SSH "nohup java -jar $DEPLOY_DIR/app.jar --server.port=${APP_PORT} > $DEPLOY_DIR/app.log 2>&1 < /dev/null & echo \$! > $DEPLOY_DIR/app.pid"

                        echo "Waiting for application to start..."
                        sleep 20
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "Checking application health on $DEPLOY_HOST..."
                    curl --fail --silent --max-time 10 http://$DEPLOY_HOST:${APP_PORT}/actuator/health \
                        || curl --fail --silent --max-time 10 http://$DEPLOY_HOST:${APP_PORT}/
                    echo "Application is running at http://$DEPLOY_HOST:${APP_PORT}"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully. Access the app from the Windows host at http://localhost:8081 (forwarded from the deploy VM)."
        }
        failure {
            echo "Pipeline failed. Check the Console Output above for details."
        }
    }
}
