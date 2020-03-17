/* eslint-disable no-console */
const { Octokit } = require('@octokit/rest');
const decrypt = require('./lib/decrypt');

exports.handler = async (event, context) => {
  console.log(event, context);

  // Decrypt token
  const token = await decrypt(process.env.ENCRYPTED_GITHUB_TOKEN, { trim: true });
  const octokit = new Octokit({
    auth: token
  });

  // Return the authenticated user
  const { data: viewer } = await octokit.users.getAuthenticated();
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
