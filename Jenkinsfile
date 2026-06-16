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
                        credentialsId: 'agent-vm-ssh',
                        keyFileVariable: 'DEPLOY_KEY',
                        usernameVariable: 'DEPLOY_USER')]) {
                    sh '''
                        JAR_FILE=$(ls ${APP_JAR})

                        # The credential's private key can pick up CRLF line
                        # endings when pasted through a browser textarea on
                        # Windows. The Java-based SSH launcher tolerates that,
                        # but the system OpenSSH client (used below) does
                        # not and fails with "error in libcrypto". Normalize
                        # to LF and tighten permissions before using it.
                        sed -i 's/\\r$//' "$DEPLOY_KEY"
                        chmod 600 "$DEPLOY_KEY"

                        echo "--- DEBUG: key diagnostics (no secret content) ---"
                        wc -l "$DEPLOY_KEY"
                        wc -c "$DEPLOY_KEY"
                        head -c 40 "$DEPLOY_KEY" | od -c | head -5
                        ssh-keygen -y -f "$DEPLOY_KEY" || echo "ssh-keygen FAILED to parse key"
                        echo "--- END DEBUG ---"

                        scp -o StrictHostKeyChecking=no -i $DEPLOY_KEY \
                            "$JAR_FILE" \
                            $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR/app.jar

                        ssh -o StrictHostKeyChecking=no -i $DEPLOY_KEY \
                            $DEPLOY_USER@$DEPLOY_HOST \
                            "pkill -f $DEPLOY_DIR/app.jar || true; \
                             sleep 2; \
                             nohup java -jar $DEPLOY_DIR/app.jar --server.port=${APP_PORT} \
                                 > $DEPLOY_DIR/app.log 2>&1 & disown"

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
