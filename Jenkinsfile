node {
    def app
    stage('Clone repository') {
        checkout scm
    }
/*
    stage('Build image') {  
        if (env.BRANCH_NAME == 'main') {
            app = docker.build("bduke97/parts_website")
        }
        else {
            app = docker.build("bduke97/parts_website", "-f ./Dockerfile.uat .")
        }
       
    }
*/
    /*
    stage('Test image') {
  

        app.inside {
            sh 'echo "Tests passed"'
        }
    }
    */

    stage('Push image') {
        if (env.BRANCH_NAME != 'main') {
            docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                app.push("${env.BUILD_NUMBER}")
                app.push("latest")
            }
        }  
    }
/*
    stage('Deploy') {
        if (env.BRANCH_NAME == 'main') {
            /*withCredentials([usernamePassword(credentialsId: 'parts-server', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                app.inside {
                    sh '''
                    sshpass -p "$PASS" sftp -o StrictHostKeyChecking=no "$USER"@vhost90-public.wvnet.edu:public_html/ <<EOF
                    ls
                    EOF
                    '''
                }
            }
            environment {
                ENV_HOST = "vhost90-public.wvnet.edu"
            }
            withCredentials([usernamePassword(credentialsId: 'parts-server', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                 app.inside {
                    sh '''
                    mkdir ~/.ssh && touch ~/.ssh/known_hosts && ssh-keyscan -H vhost90-public.wvnet.edu >> ~/.ssh/known_hosts
                    '''
                        
                    sh '''
                    python3 /scripts/delete_remote_files.py vhost90-public.wvnet.edu "$USER" "$PASS" /public_html
                    '''

                    sh '''
                    python3 /scripts/upload_directory.py vhost90-public.wvnet.edu "$USER" "$PASS" /usr/local/app/dist/parts-website/browser/ /public_html/
                    '''
                }
            }
        }
        else {
            sh '''
            ssh -o StrictHostKeyChecking=no brandon@192.168.1.41 "cd /home/brandon/PARTs_Website && docker stop parts_website_uat && docker rm parts_website_uat && docker compose up -d"
            '''
        } 
    }
*/
    stage('Post status') {
        withCredentials([string(credentialsId: 'github-status', variable: 'TOKEN')]) {
            sh '''
                curl -X POST https://api.github.com/repos/3492PARTs/PARTs_Website/statuses/$SHA \
                    -H "Authorization: token $TOKEN" \
                    -H "Content-Type: application/json" \
                    -d '{"state":"${currentBuild.result}", "description":"Build ${env.BUILD_NUMBER} ${currentBuild.result}", "context":"Jenkins Build"}'
            '''
        }
    }
}