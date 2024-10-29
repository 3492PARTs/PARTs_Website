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
/*
    stage('Push image') {
        
        docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }
*/
    stage('Deploy - UAT') {
        withCredentials([usernamePassword(credentialsId: 'omv', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
            app.inside {
                sh 'echo "hello"'
                
                sh '''
                lftp -u "$USER","$PASS" sftp -v brandon@192.168.1.43:home/brandon/tmp/ <<EOF
                rmdir sftp-client_dir
                EOF
                '''

                sh '''
                lftp -u "$USER","$PASS" sftp brandon@192.168.1.43 <<EOF
                cd dest_dir
                mkdir sftp-client_dir
                put -r /tmp/sftp-client_dir <-- SFTP put command to upload /tmp/sftp-client_dir to sftp-server
                quit
                EOF
                '''
            }
        }
        
        /*
        sh '''
        ssh -o StrictHostKeyChecking=no brandon@192.168.1.41 "cd /home/brandon/PARTs_Website && docker stop parts_website_uat && docker rm parts_website_uat && docker compose up -d"
        '''
        */
    }
}