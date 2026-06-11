pipeline {
    agent {
        docker {
            label 'name-node'
            image 'mcr.microsoft.com/playwright:v1.58.1-noble'
            args '--ipc=host --init'
        }
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

      environment {
    AUTOTESTS_CONFIG_ENV = credentials('.env-autotests-config')
  }


    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Configure & Install') {
            steps {
                  script {
                // Pull env/secret files from Jenkins credentials into the workspace.
                // withCredentials([file(credentialsId: 'pw-env', variable: 'ENV_FILE')]) {
                //     sh 'cp "$ENV_FILE" .env'
                // }
                        sh 'cp "$AUTOTESTS_CONFIG_ENV" .env'
                        sh 'npm install'
                        sh 'npx playwright install --with-deps chromium'
                    }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    def project = 'e2e'
                    if (env.JOB_NAME?.contains('Prod'))            { project = 'externalservers' }
                    else if (env.JOB_NAME?.contains('Api'))        { project = 'api' }
                    else if (env.JOB_NAME?.contains('Sequential')) { project = 'sequential' }
                    // `|| true` so the report is still collected on test failures.
                    sh "npx playwright test --project=${project} || true"
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'reports/junit-report.xml'
            publishHTML(target: [
                reportDir: 'reports/html-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true,
            ])
            // Clean up secret env files
            sh 'rm -f .env || true'
        }
        // failure { /* Teams notification */ }
    }
}
