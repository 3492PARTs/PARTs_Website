node {
    def now = new Date()
    def formattedDate = now.format('yyyy.MM.dd')
    env.BUILD_DATE = formattedDate
    env.BUILD_NO = env.BUILD_DISPLAY_NAME
    env.FORMATTED_BRANCH_NAME = env.BRANCH_NAME.replaceAll("/", "-")

    try {
        def app
        
        stage('Clone repository') {
            checkout scm
        }
        
        withCredentials([string(credentialsId: 'github-status', variable: 'PASSWORD')]) {
            env.SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
            sh '''
                curl -X POST https://api.github.com/repos/3492PARTs/PARTs_Website/statuses/$SHA \
                    -H "Authorization: token $PASSWORD" \
                    -H "Content-Type: application/json" \
                    -d '{"state":"pending", "description":"Build '\$BUILD_NO' pending", "context":"Jenkins Build"}'
            '''
        }

        stage('Run Tests') {
            if (env.BRANCH_NAME != 'main') {
                sh'''
                sed -i "s/BRANCH/$FORMATTED_BRANCH_NAME/g" src/environments/environment.uat.ts \
                && sed -i "s/VERSION/$SHA/g" src/environments/environment.uat.ts
                '''
                
                def testImage = docker.build("parts-test-base", "-f ./Dockerfile.uat --target=build .")

                testImage.inside("--shm-size=2gb -u 0") {
                    sh '''
                        cd /usr/local/app && 
                        CHROME_BIN=/usr/bin/google-chrome-stable ./node_modules/.bin/ng test --karma-config=karma.conf.js --no-watch --code-coverage --browsers=ChromeNoSandbox
                    '''
                }
            }
        }
        
        // --- END NEW STAGE ---


        stage('Build image') {
            if (env.BRANCH_NAME == 'main') {
                sh'''
                sed -i "s/VERSION/$SHA/g" src/environments/environment.ts
                '''
                
                app = docker.build("bduke97/parts_website", "-f ./Dockerfile --target=runtime .")
            }
            else {
                sh'''
                sed -i "s/BRANCH/$FORMATTED_BRANCH_NAME/g" src/environments/environment.uat.ts \
                && sed -i "s/VERSION/$SHA/g" src/environments/environment.uat.ts
                '''
                
                app = docker.build("bduke97/parts_website", "-f ./Dockerfile.uat .")
            }
        }

        stage('Push image') {
            if (env.BRANCH_NAME != 'main') {
                docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                    app.push("${env.FORMATTED_BRANCH_NAME}")
                }
            }
        }

        stage('Deploy') {
            if (env.BRANCH_NAME == 'main') {
                env.ENV_HOST = "vhost90-public.wvnet.edu"
                withCredentials([usernamePassword(credentialsId: 'parts-server', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    app.inside {
                        sh '''
                        mkdir ~/.ssh && touch ~/.ssh/known_hosts && ssh-keyscan -H $ENV_HOST >> ~/.ssh/known_hosts
                        '''
                            
                        sh '''
                        python3 /scripts/delete_remote_files.py $ENV_HOST "$USER" "$PASS" /public_html --exclude_dirs stats
                        '''

                        sh '''
                        python3 /scripts/upload_directory.py $ENV_HOST "$USER" "$PASS" /usr/local/app/dist/parts-website/browser/ /public_html/
                        '''
                    }
                }
            }
            else {
                sh '''
                ssh -o StrictHostKeyChecking=no brandon@192.168.1.41 "cd /home/brandon/PARTs_Website \
                && git fetch \
                && git switch $BRANCH_NAME \
                && git pull \
                && TAG=$FORMATTED_BRANCH_NAME docker compose pull \
                && TAG=$FORMATTED_BRANCH_NAME docker compose up -d --force-recreate"
                '''
            }
        }

        stage('Cleanup Docker Images') {
            sh '''
                echo "Starting Docker image cleanup..."
                
                # 1. Force remove the intermediate image used for testing
                docker rmi -f parts-test-base || true
                
                # 2. Remove all dangling and unused layers/images
                docker image prune -f
                
                echo "Docker images cleaned up."
            '''
        }
        env.RESULT = 'success'
    }
    catch (e) {
        env.RESULT = 'error'
        throw e
    }
    finally {
        withCredentials([string(credentialsId: 'github-status', variable: 'PASSWORD')]) {
            env.SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
            sh '''
                curl -X POST https://api.github.com/repos/3492PARTs/PARTs_Website/statuses/$SHA \
                    -H "Authorization: token $PASSWORD" \
                    -H "Content-Type: application/json" \
                    -d '{"state":"'\$RESULT'", "description":"Build '\$BUILD_NO' '\$RESULT'", "context":"Jenkins Build"}'
            '''
        }
    }
}