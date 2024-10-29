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
                
                sh '''
                sshpass -p "$PASS" sftp -o StrictHostKeyChecking=no brandon@192.168.1.43:tmp/ <<EOF
                cd albumCovers/BuildSeason
                rm *
                cd ../CommunityOutreach
                rm *
                cd ../Competition
                rm *
                cd ../Wallpapers
                rm *
                cd ../
                rmdir BuildSeason
                rmdir CommunityOutreach
                rmdir Competition
                rmdir Wallpapers
                cd ../
                rmdir albumCovers
                cd appIcons
                rm *
                cd ../
                rmdir appIcons
                cd fonts/Black
                rm *
                cd ../Bold
                rm *
                cd ../ExtraBold
                rm *
                cd ../ExtraLight
                rm *
                cd ../Light
                rm *
                cd ../Regular
                rm *
                cd ../SemiBold
                rm *
                cd ../
                mdir Black
                rmdir Bold
                rmdir ExtraBold
                rmdir ExtraLight
                rmdir Light
                rmdir Regular
                rmdir SemiBold
                rm *
                cd ../
                rmdir fonts
                EOF
                '''

                sh '''
                sshpass -p "$PASS" sftp -o StrictHostKeyChecking=no brandon@192.168.1.43 <<EOF
                cd /home/brandon/tmp
                put -r /usr/local/app/dist/parts-website/browser/*
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