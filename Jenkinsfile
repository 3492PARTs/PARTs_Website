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
                /*
                sh '''
                sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no brandon@192.168.1.43
                '''
                */

                sh '''
                sshpass -p "$PASS" sftp -o StrictHostKeyChecking=no brandon@192.168.1.43:tmp/ <<EOF
                rm ./*
                EOF
                '''
/*
                sh '''
                sshpass -p "$PASS" sftp -o StrictHostKeyChecking=no brandon@192.168.1.43 <<EOF
                cd /home/brandon/tmp
                put -r /usr/local/app/dist/parts-website/browser/*
                quit
                EOF
                '''*/
            }
        }
        
        /*
        sh '''
        ssh -o StrictHostKeyChecking=no brandon@192.168.1.41 "cd /home/brandon/PARTs_Website && docker stop parts_website_uat && docker rm parts_website_uat && docker compose up -d"
        '''
        */
    }
}