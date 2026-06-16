// Lab 2 (MEDIUM) — "Build and push a new pipeline".
//
// The Jenkins controller (vm1) has no Docker installed: it checks out
// the Dockerfile, copies it to the Docker host (vm2) over SCP, and
// runs `docker build/tag/push` there over SSH — the same SSH-based
// remote-execution pattern used for the Lab 1 Deploy stage.

pipeline {
    agent any

    environment {
        VM2_HOST       = "192.168.57.11"
        VM2_BUILD_DIR  = "/home/vagrant/pipeline-build"
        DOCKERHUB_USER = "huang199864"
        IMAGE_NAME     = "petclinic-ubuntu"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Copy build context to VM2') {
            steps {
                withCredentials([sshUserPrivateKey(
                        credentialsId: 'vm2-docker-ssh',
                        keyFileVariable: 'VM2_KEY',
                        usernameVariable: 'VM2_USER')]) {
                    sh '''
                        chmod 600 "$VM2_KEY"
                        SSH="ssh -o StrictHostKeyChecking=no -i $VM2_KEY $VM2_USER@$VM2_HOST"

                        $SSH "mkdir -p $VM2_BUILD_DIR"
                        scp -o StrictHostKeyChecking=no -i $VM2_KEY \
                            Dockerfile \
                            $VM2_USER@$VM2_HOST:$VM2_BUILD_DIR/Dockerfile
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                withCredentials([sshUserPrivateKey(
                        credentialsId: 'vm2-docker-ssh',
                        keyFileVariable: 'VM2_KEY',
                        usernameVariable: 'VM2_USER')]) {
                    sh '''
                        chmod 600 "$VM2_KEY"
                        SSH="ssh -o StrictHostKeyChecking=no -i $VM2_KEY $VM2_USER@$VM2_HOST"
                        $SSH "cd $VM2_BUILD_DIR && docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                    '''
                }
            }
        }

        stage('Tag') {
            steps {
                withCredentials([sshUserPrivateKey(
                        credentialsId: 'vm2-docker-ssh',
                        keyFileVariable: 'VM2_KEY',
                        usernameVariable: 'VM2_USER')]) {
                    sh '''
                        chmod 600 "$VM2_KEY"
                        SSH="ssh -o StrictHostKeyChecking=no -i $VM2_KEY $VM2_USER@$VM2_HOST"
                        $SSH "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        $SSH "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKERHUB_USER}/${IMAGE_NAME}:latest"
                    '''
                }
            }
        }

        stage('Push') {
            steps {
                withCredentials([sshUserPrivateKey(
                        credentialsId: 'vm2-docker-ssh',
                        keyFileVariable: 'VM2_KEY',
                        usernameVariable: 'VM2_USER')]) {
                    // Relies on `docker login` already cached on vm2
                    // (~/.docker/config.json) from the EASY tier.
                    sh '''
                        chmod 600 "$VM2_KEY"
                        SSH="ssh -o StrictHostKeyChecking=no -i $VM2_KEY $VM2_USER@$VM2_HOST"
                        $SSH "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        $SSH "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pushed ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} and :latest to DockerHub."
        }
        failure {
            echo "Pipeline failed. Check the Console Output above for details."
        }
    }
}
