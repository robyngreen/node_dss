#!/bin/bash
#
# This script will compile this application and then deploy it
# to AWS Elastic Beanstalk.
#
# Run like `./deploy/deploy_aws.sh my_eb_app my_eb_app-production`.
#
# to the `my_eb_app-production` environment of the `my_eb_app` EB application.

# Propagate errors
set -e

# Install/update Node modules.
npm install

# Compile Next.js for production.
npm run build

# Zip all files that need to be deployed.
zip -r deploy/build.zip .next components lib pages server.js package.json config/config.json cron.yaml htpasswd

# initialize the EB CLI tool. Use the parameters to select which Beanstalk application and environment to deploy to
# eb init $1 --platform node.js --region us-east-1
eb use $1
eb deploy --timeout 40
