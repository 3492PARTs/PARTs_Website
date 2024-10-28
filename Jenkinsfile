node {
    def app

    stage('Clone repository') {
      

        checkout scm
    }

    stage('Build image') {
  
       app = docker.build("bduke97/parts_website")
    }

    stage('Test image') {
  

        app.inside {
            sh 'echo "Tests passed"'
        }
    }

    stage('Push image') {
        
        docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }

    stage('Deploy - UAT') {
        withCredentials(bindings: [sshUserPrivateKey(credentialsId: 'brandon', keyFileVariable: 'SSH_KEY')]) {
            sh '''
            ssh -i $SSH_KEY brandon@192.168.1.41 "cd /home/brandon/PARTs_Website && docker compose up -d"
            '''
        }
        
    }
}