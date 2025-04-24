pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = 'jnk-creds'
        DOCKERHUB_USER = 'pauljosephd'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Clonage du dépôt Git"
                checkout scm
            }
        }

        stage('Check Django Project') {
            steps {
                dir('Backend/odc') {
                    echo "🔍 Vérifications initiales du projet Django"
                    sh '''
                        set -e
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt

                        python manage.py check
                        python manage.py makemigrations --check
                        python manage.py migrate --plan
                    '''
                }
            }
        }

        stage('Build & Test Backend (Django)') {
            steps {
                dir('Backend/odc') {
                    echo "⚙️ Tests Django"
                    sh '''
                        set -e
                        . venv/bin/activate
                        python manage.py test
                    '''
                }
            }
        }

        stage('Build & Test Frontend (React)') {
            steps {
                dir('Frontend') {
                    echo "⚙️ Installation et test du frontend React"
                    sh '''
                        set -e
                        npm install
                        npm run build
                        npm test -- --watchAll=false
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "🐳 Construction des images Docker"
                    sh "docker build -t $DOCKERHUB_USER/mon-backend:latest ./Backend"
                    sh "docker build -t $DOCKERHUB_USER/mon-frontend:latest ./Frontend"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo "🚀 Envoi des images Docker sur Docker Hub"
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_USER/mon-backend:latest
                        docker push $DOCKER_USER/mon-frontend:latest
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD terminé avec succès"
        }
        failure {
            echo "❌ Échec du pipeline"
        }
    }
}
