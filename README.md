# Event Orchestration Demo

This node.js application is a demonstration of the capabilities of the Genesys Cloud Event Orchestration (also known as **Process Automation**) service.

## Get Started

- Download this repository: `git clone https://github.com/PierrickI3/EventOrchestrationDemo`
- Run `npm i` to install all dependencies
- Create a client credentials OAuth in Genesys Cloud with permissions to manage Process Automation
- Set the following environment variables:
  - GENESYS_CLOUD_CLIENT_ID: Your OAuth client ID
  - GENESYS_CLOUD_CLIENT_SECRET: Your OAuth client secret
  - GENESYS_CLOUD_ENVIRONMENT: Your Genesys Cloud environment (e.g. mypurecloud.com, mypurecloud.ie, etc.)
- Run `npm start` to start the application and choose an option
