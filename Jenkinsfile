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
        }

        currentBuild.result = 'SUCCESS' // or 'FAILURE', 'UNSTABLE', 'ABORTED'
    }

    
}