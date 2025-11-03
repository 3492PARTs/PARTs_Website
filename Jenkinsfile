node {
    def now = new Date()
    def formattedDate = now.format('yyyy.MM.dd')
    env.BUILD_DATE = formattedDate
    env.BUILD_NO = env.BUILD_DISPLAY_NAME
    env.FORMATTED_BRANCH_NAME = env.BRANCH_NAME.replaceAll("/", "-")
    
    // Enable Docker BuildKit for faster builds
    env.DOCKER_BUILDKIT = '1'
    env.BUILDKIT_PROGRESS = 'plain'

    try {
        def app
        def buildImage
        
        stage('Clone repository') {
            timeout(time: 5, unit: 'MINUTES') {
                checkout scm
            }
        }
        
        // Set build status on github
        withCredentials([string(credentialsId: 'github-status', variable: 'PASSWORD')]) {
            env.SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
            sh '''
                curl -X POST https://api.github.com/repos/3492PARTs/PARTs_Website/statuses/$SHA \
                    -H "Authorization: token $PASSWORD" \
                    -H "Content-Type: application/json" \
                    -d '{"state":"pending", "description":"Build '\$BUILD_NO' pending", "context":"Jenkins Build"}'
            '''
        }
/*
        stage('Set Variables') {
            if (env.BRANCH_NAME == 'main') {
                sh'''
                sed -i "s/VERSION/$SHA/g" src/environments/environment.ts
                '''
                env.BUILD_CONFIGURATION = 'production'
                env.RUNTIME_TARGET = 'runtime-production'
            }
            else {
                sh'''
                sed -i "s/BRANCH/$FORMATTED_BRANCH_NAME/g" src/environments/environment.uat.ts \
                && sed -i "s/VERSION/$SHA/g" src/environments/environment.uat.ts
                '''

                env.BUILD_CONFIGURATION = 'uat'
                env.RUNTIME_TARGET = 'runtime-uat'
            }
        }

        stage('Build Image') {
            timeout(time: 15, unit: 'MINUTES') {
                // Use BuildKit cache mounts for faster builds
                // Pull cache image if it exists, ignore errors
                sh "docker pull parts-website-build-${env.FORMATTED_BRANCH_NAME}:latest || true"
                
                buildImage = docker.build("parts-website-build-${env.FORMATTED_BRANCH_NAME}", 
                    "--cache-from parts-website-build-${env.FORMATTED_BRANCH_NAME}:latest " +
                    "--build-arg BUILD_CONFIGURATION=${env.BUILD_CONFIGURATION} " +
                    "-f ./Dockerfile --target=build .")
                    
            }
        }

        stage('Run Tests') {
            buildImage.inside("--shm-size=2gb -u 0") {
                sh '''
                    cd /usr/local/app && 
                    CHROME_BIN=/usr/bin/google-chrome-stable ./node_modules/.bin/ng test --karma-config=karma.conf.js --no-watch --code-coverage --browsers=ChromeNoSandbox
                '''
            }
        }

        stage('Build Runtime Image') {
            timeout(time: 5, unit: 'MINUTES') {
                if (env.BRANCH_NAME == 'main') {
                    // Pull cache image if it exists, ignore errors
                    sh 'docker pull bduke97/parts_website:latest || true'
                    
                    // Use BuildKit cache for faster builds
                    app = docker.build("bduke97/parts_website", 
                        "--cache-from bduke97/parts_website:latest " +
                        "--build-arg BUILD_CONFIGURATION=${env.BUILD_CONFIGURATION} " +
                        "-f ./Dockerfile --target=${env.RUNTIME_TARGET} .")
                }
                else {
                    // Pull cache image if it exists, ignore errors
                    sh "docker pull bduke97/parts_website:${env.FORMATTED_BRANCH_NAME} || true"
                    
                    // Use BuildKit cache for faster builds
                    app = docker.build("bduke97/parts_website", 
                        "--cache-from bduke97/parts_website:${env.FORMATTED_BRANCH_NAME} " +
                        "--build-arg BUILD_CONFIGURATION=${env.BUILD_CONFIGURATION} " +
                        "-f ./Dockerfile --target=${env.RUNTIME_TARGET} .")
                }
            }
        }

        if (env.BRANCH_NAME != 'main') {
            stage('Push image') {
                
                    timeout(time: 10, unit: 'MINUTES') {
                        docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                            app.push("${env.FORMATTED_BRANCH_NAME}")
                        }
                    }
                
            }
        }*/

        stage('Deploy') {
            timeout(time: 15, unit: 'MINUTES') {
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

                    sh '''ssh -o StrictHostKeyChecking=no brandon@192.168.1.41 "cd /home/brandon/PARTs_Website && git fetch --prune && git branch --delete $(git for-each-ref --format '%(if:equals=gone)%(upstream:track,nobracket)%(then)%(refname:short)%(end)' refs/heads/)"
                    '''
                }
            }
        }

        stage('Cleanup Docker Images') {
            sh '''
                echo "Starting Docker image cleanup..."
                
                # 1. Force remove the intermediate image used for testing
                docker rmi -f parts-test-base || true
                
                # 2. Remove all dangling images (untagged)
                docker image prune -f
                
                # 3. Remove build cache older than 7 days to save disk space
                docker builder prune -f --filter "until=168h" || true
                
                echo "Docker images cleaned up."
            '''
        }
        env.RESULT = 'success'
    }
    catch (e) {
        env.RESULT = 'error'
        currentBuild.result = 'FAILURE'
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