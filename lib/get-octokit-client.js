/* eslint-disable no-console */
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

const getOctokitClient = function getOctokitClient() {
  // Get GitHub App credentials from environment
  const privateKey = Buffer.from(process.env.GITHUB_APP_PRIVATE_KEY, 'base64').toString();
  const id = process.env.GITHUB_APP_ID;

  // Create new octokit instance that is authenticated as a GitHub App
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      id,
      privateKey
    }
  });
};

module.exports = getOctokitClient;
