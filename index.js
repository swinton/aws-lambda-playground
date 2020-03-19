/* eslint-disable no-console */
const getOctokitClient = require('./lib/get-octokit-client');

exports.handler = async (event, context) => {
  console.log(event, context);

  // Get octokit client
  const octokit = getOctokitClient();

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
