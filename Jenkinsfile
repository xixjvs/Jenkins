pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = 'jnk-creds' // ID dans Jenkins Credentials
        DOCKERHUB_USER = 'pauljosephd' // à changer avec ton vrai identifiant Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Clonage du dépôt Git"
                checkout scm
            }
        }

        stage('Build & Test Backend (Django)') {
            steps {
                dir('Backend') {
                    echo "⚙️ Build & Test Django"
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install -r requirements.txt
                        python manage.py test
                    '''
                }
            }
        }

        stage('Build & Test Frontend (React)') {
            steps {
                dir('Frontend') {
                    echo "⚙️ Build & Test React"
                    sh '''
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
                    echo "🐳 Build image Docker pour le Backend"
                    sh "docker build -t $DOCKERHUB_USER/mon-backend:latest ./Backend"

                    echo "🐳 Build image Docker pour le Frontend"
                    sh "docker build -t $DOCKERHUB_USER/mon-frontend:latest ./Frontend"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo "🚀 Push des images Docker sur Docker Hub"
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
