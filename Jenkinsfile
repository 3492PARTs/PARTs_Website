node {
    def app


    stage('Clone repository') {
        checkout scm

        withEnv(['ENV_HOST=vhost90-public.wvnet.edu']){
            sh'''
            echo "my var is $ENV_HOST"
            '''

            sh'''
            echo "my var2 is $CHANGE_ID"
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
                curl -X POST https://api.github.com/repos/owner/repo/statuses/$SHA \
                    -H "Authorization: token $PASSWORD" \
                    -H "Content-Type: application/json" \
                    -d '{"state":"${currentBuild.result}", "description":"Build $BUILD_NUMBER ${currentBuild.result}", "context":"Jenkins Build"}'
            '''
        }

        currentBuild.result = 'SUCCESS' // or 'FAILURE', 'UNSTABLE', 'ABORTED'
    }

    
}