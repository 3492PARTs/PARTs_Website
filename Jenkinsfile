node {
    def app


    stage('Clone repository') {
        withEnv(['ENV_HOST=vhost90-public.wvnet.edu']){
            sh'''
            echo "my var is $ENV_HOST"
            '''

            sh'''
            echo "my var2 is $CHANGE_ID"
            '''

            sh 'env'

            def gitCommitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
            sh '''
            echo "Git Commit Hash: $gitCommitHash"
            '''
        }

        currentBuild.result = 'SUCCESS' // or 'FAILURE', 'UNSTABLE', 'ABORTED'
    }

    
}