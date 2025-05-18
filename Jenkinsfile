pipeline {
    agent any

    environment {
        // Configuration Docker
        DOCKER_HUB_CREDENTIALS = 'jnk-creds' // ID Jenkins Credentials
        DOCKERHUB_USER = 'pauljosephd'       // ton nom d’utilisateur Docker Hub
        // Configuration SonarQube
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_PROJECT_KEY = 'mon-projet'
        
        // Configuration Chemins
        BACKEND_DIR = 'Backend/odc'
        FRONTEND_DIR = 'Frontend'

    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Clonage du dépôt Git"
                checkout scm
            }
        }

             stage('Analyse SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'toker-server', variable: 'SONAR_TOKEN')]) {
                        echo '🔍 Exécution de l\'analyse SonarQube'
                        sh """
                            export PATH=$PATH:/var/lib/jenkins/sonar-scanner-5.0.1.3006-linux/bin
                            sonar-scanner \
                            -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_TOKEN \
                            -Dsonar.exclusions=**/venv/**,**/node_modules/** \
                            -Dsonar.sources=. \
                            -X
                        """
                    }
                }
            }
        }

        stage('Build & Test Backend (Django)') {
            steps {
                dir('Backend/odc') {
                    echo "⚙️ Création de l'environnement virtuel et test de Django"
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt
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
                        export PATH=$PATH:/var/lib/jenkins/.nvm/versions/node/v22.15.0/bin/
                        npm install
                        npm run build
                       # npm test -- --watchAll=false
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "🐳 Construction de l'image Docker Backend"
                    sh "docker build -t ${DOCKERHUB_USER}/mon-backend:latest -f ./Backend/odc/Dockerfile ./Backend/odc"

                    echo "🐳 Construction de l'image Docker Frontend"
                    sh "docker build -t ${DOCKERHUB_USER}/mon-frontend:latest ./Frontend"
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
        stage('run'){
            steps{
                dir('cd ..'){
                sh '''
                docker-compose build
                docker-compose up -d
                #docker run --rm -d -p 8081:8081 ${DOCKERHUB_USER}/mon-frontend:latest
                '''
                }
            }
        }
        stage('Déploiement Kubernetes') {
            steps {
                script {
                    echo "🚀 Déploiement dans Kubernetes"
                    sh '''

                     # mkdir -p $HOME/.kube
                    # cp -r /var/lib/jenkins/.kube $HOME/ || true
                     #chmod 600 $HOME/.kube/config

                     export KUBECONFIG=/var/lib/jenkins/.minikube/profiles/minikube/config
                    
                    # Assurez-vous que kubectl est installé et configuré (kubeconfig disponible sur Jenkins)
                    kubectl apply -f K8s/backend-deployment.yaml
                    kubectl apply -f K8s/postgres-deployment.yaml
                    kubectl apply -f K8s/postgres-service.yaml
                    kubectl apply -f K8s/backend-service.yaml
                    kubectl apply -f K8s/frontend-deployment.yaml
                    kubectl apply -f K8s/frontend-service.yaml
                    '''
                }
            }
        }
        stage('Init') {
          steps {
                sh 'terraform init'
              }
        }
        stage('Apply') {
          steps {
            sh 'terraform apply -auto-approve'
          }
        }

    }

    post {
        success {
            mail to: 'doguepauljoseph@gmail.com',
                 subject:"deploiement reussi",
                  body: "l'application a ete deploye avec succes"
        }
        failure {
            mail to: 'doguepauljoseph@gmail.com',
                 subject:"echec du deploiement",
                  body: "veuillez corriger vos erreurs"
        }
    }
}
