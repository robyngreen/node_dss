# node_dss

## Getting Started 🛠

Use the specified version of Node via NVM.

`nvm use`

If you haven't, add the local config, server config and htpasswd files not in the repo.

Anything within `config.local.json` will only apply to your local environment. Anything within `config.json` will be deployed to develop or production environments.

`config.local.json` -> `./config/config.local.json`

`config.json` -> `./config/config.json`

`htpasswd` -> `./htpasswd`

Start up the server.

`npm watch`

## Deploying ✈️

Check out the [docs](https://codeandtheory.atlassian.net/wiki/display/RIN/DSS) for more information.
