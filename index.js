/* eslint-disable no-console */
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const decrypt = require('./lib/decrypt');

exports.handler = async (event, context) => {
  console.log(event, context);

  // Decrypt token
  const privateKey = await decrypt(process.env.ENCRYPTED_PRIVATE_KEY, { trim: true });
  const id = await decrypt(process.env.ENCRYPTED_APP_ID, { trim: true });

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
