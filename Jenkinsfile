node {
    def now = new Date()

    // Format the date in YYYY-MM-DD format
    def formattedDate = now.format('yyyy.MM.dd')

    // Set the environment variable 
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

        // --- NEW STAGE FOR TEST EXECUTION (with npx fix) ---
        stage('Run Tests (with SHM fix)') {
            if (env.BRANCH_NAME != 'main') {
                // 1. Prepare environment variables
                sh'''
                sed -i "s/BRANCH/$FORMATTED_BRANCH_NAME/g" src/environments/environment.uat.ts \
                && sed -i "s/VERSION/$SHA/g" src/environments/environment.uat.ts
                '''
                
                // 2. Build the image up to the 'npm install' step
                // We use --target=build to stop BEFORE the final packaging
                def testImage = docker.build("parts-test-base", "-f ./Dockerfile.uat --target=build .") 

                // 3. Execute the tests inside a container with the memory fix
                // Note: The CHROME_BIN is already set in the Dockerfile, 
                // and we use 'npx' to run the local 'ng' command.
                testImage.inside("--shm-size=2gb") {
                    sh 'npx ng test --no-watch --code-coverage --browsers=ChromeNoSandbox' 
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
                // The UAT build just compiles the final image (tests are complete)
                sh'''
                sed -i "s/BRANCH/$FORMATTED_BRANCH_NAME/g" src/environments/environment.uat.ts \
                && sed -i "s/VERSION/$SHA/g" src/environments/environment.uat.ts
                '''
                // The original build command runs the final compile now
                app = docker.build("bduke97/parts_website", "-f ./Dockerfile.uat .")
            }
        
        }

        stage('Push image') {
            if (env.BRANCH_NAME != 'main') {
                docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                    app.push("${env.FORMATTED_BRANCH_NAME}")
                    //app.push("latest")
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

        env.RESULT = 'success'
    }
    catch (e) {
        // error handling, if needed
        // throw the exception to jenkins
        env.RESULT = 'error'
        throw e
    } 
    finally {
        // some common final reporting in all cases (success or failure)
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