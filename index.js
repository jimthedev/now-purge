#!/usr/bin/env node

const libVersion = require('./package.json').version

const argv = require('yargs')
      .usage('Usage: $0 <command> [options]')
      .command('t', 'now token')
      .command('n', 'name in package.json or now.json to filter your deployments')
      .option('team', {
        alias: 'm',
        describe: 'team id'
      })
      .help('h')
      .alias('h', 'help')
      .version(() => libVersion)
      .alias('v', 'version')
      .argv

const NowClient = require('now-client')

let now

const getDeploymentsWithoutAlias = filter => Promise.all([
  now.getAliases(),
  now.getDeployments()
])
.then(([aliases, deployments]) => deployments
.filter(deploy => !aliases.find(alias => alias.deploymentId === deploy.uid) && (!filter || filter === deploy.name)))

const removeDeployments = (deployments) => {
  if (deployments.length === 0) {
    console.log('No deployments to remove')
    return
  }
  deployments.forEach((deployment) => {
    now.deleteDeployment(deployment.uid)
      .then(() => console.log(`${deployment.url || deployment.uid} removed ✅`))
      .catch(() => console.log(`${deployment.url || deployment.uid} error ❌`))
  })
}

// you can pass your `package.json` or `now.json` `name` to filter your deployments
const main = (config = {}) => {
  now = new NowClient(argv.t || config.token, argv.team || config.team)
  getDeploymentsWithoutAlias(argv.n || config.deploymentName)
  .then(deployments => removeDeployments(deployments))
  .catch(err => console.log(`${err} ❌`))
}

module.exports = main

if (!module.parent) {
  main()
}
