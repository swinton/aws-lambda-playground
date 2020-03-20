/* eslint-disable no-console */
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

const getAppCredentials = function getAppCredentials() {
  // Get GitHub App credentials from environment
  const privateKey = Buffer.from(process.env.GITHUB_APP_PRIVATE_KEY, 'base64').toString();
  const id = process.env.GITHUB_APP_ID;
  return { privateKey, id };
};

const getOctokitAppClient = function getOctokitAppClient() {
  // Create new Octokit instance that is authenticated as a GitHub App
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      type: 'app',
      ...getAppCredentials()
    }
  });
};

module.exports.getOctokitAppClient = getOctokitAppClient;

const getOctokitAppInstallationClient = function getOctokitAppInstallationClient(installationId) {
  // Create new Octokit instance that is authenticated as a GitHub App installation
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      type: 'installation',
      installationId,
      ...getAppCredentials()
    }
  });
};

module.exports.getOctokitAppInstallationClient = getOctokitAppInstallationClient;

if (require.main === module) {
  (async () => {
    // eslint-disable-next-line global-require
    const argv = require('minimist')(process.argv.slice(2));
    const repoWithOwner = argv.repo;
    const [owner, repo] = repoWithOwner.split('/');

    // Lookup installation as App client
    const appOctokit = getOctokitAppClient();
    const { data: installation } = await appOctokit.apps.getRepoInstallation({ repo, owner });

    // Lookup repos as Installatoin client
    const installationOctokit = getOctokitAppInstallationClient(installation.id);
    const { data: repos } = await installationOctokit.apps.listRepos();

    console.log(repos, '%j');
  })();
}
