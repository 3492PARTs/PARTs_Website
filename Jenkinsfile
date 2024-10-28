node {
    def app
/*
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
*/
    stage('Deploy - UAT') {
        withCredentials(bindings: [sshUserPrivateKey(credentialsId: 'brandon', keyFileVariable: 'KEY_FILE')]) {
            sh '''
            more $KEY_FILE
            cat $KEY_FILE > ./key_key.key
            eval $(ssh-agent -s)
            chmod 600 ./key_key.key
            ssh-add ./key_key.key
            cd ~/.ssh
            echo "ssh-rsa ... (the string from the server's id_rsa.pub)" >> authorized_keys
            ssh -o StrictHostKeyChecking=no -v brandon@192.168.1.41 "cd /home/brandon/PARTs_Website && docker compose up -d"
            '''
        }
        
    }
}