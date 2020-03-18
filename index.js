/* eslint-disable no-console */
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

exports.handler = async (event, context) => {
  console.log(event, context);

  // Get GitHub App credentials from environment
  const privateKey = Buffer.from(process.env.GITHUB_APP_PRIVATE_KEY, 'base64').toString();
  const id = process.env.GITHUB_APP_ID;

  // Create new octokit instance that is authenticated as an installation
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      id,
      privateKey
    }
  });

  // Return the authenticated app
  const { data: viewer } = await octokit.apps.getAuthenticated();
  return viewer;
};

if (require.main === module) {
  (async () => {
    const event = 'event';
    const context = 'context';
    const viewer = await exports.handler({ event }, { context });
    console.log(`${JSON.stringify(viewer, null, 4)}`);
  })();
}
