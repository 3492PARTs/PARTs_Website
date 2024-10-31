node {
    try{
        def app


        stage('Clone repository') {
            checkout scm

            withEnv(['ENV_HOST=vhost90-public.wvnet.edu']){
                sh'''
                echo "my var is $ENV_HOST"
                '''

                sh'''
                echo "my var2 is $BUILD_DISPLAY_NAME"
                '''

                sh 'env'

                env.gitCommitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                sh '''
                echo "Git Commit Hash: $gitCommitHash"
                '''
            }

            withCredentials([string(credentialsId: 'github-status', variable: 'PASSWORD')]) {
                env.SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                sh '''
                    curl -X POST https://api.github.com/repos/3492PARTs/PARTs_Website/statuses/$SHA \
                        -H "Authorization: token $PASSWORD" \
                        -H "Content-Type: application/json" \
                        -d '{"state":"pending", "description":"Build ${BUILD_DISPLAY_NAME} pending", "context":"Jenkins Build"}'
                '''
            }

            currentBuild.result = 'SUCCESS' // or 'FAILURE', 'UNSTABLE', 'ABORTED'
        }
    }
    catch (e) {
        // error handling, if needed
        // throw the exception to jenkins
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
                        -d '{"state":"error", "description":"Build ${BUILD_DISPLAY_NAME} error", "context":"Jenkins Build"}'
                '''
            }
    }
    
}