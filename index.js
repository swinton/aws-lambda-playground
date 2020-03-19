/* eslint-disable no-console */
const getAllUsersInGroup = require('./lib/get-all-users-in-group');
const getTagForUser = require('./lib/get-tag-for-user');
const rotateKeys = require('./lib/rotate-keys');

const getOctokitClient = require('./lib/get-octokit-client');

exports.handler = async (event, context) => {
  console.log(event, context);

  // Get octokit client
  const octokit = getOctokitClient();
  const groupName = process.env.GROUP_NAME;
  const tagName = process.env.TAG_NAME;

  // Iterate over all users in specified group
  const users = await getAllUsersInGroup(groupName);
  await Promise.all(
    users.map(async ({ UserName: userName }) => {
      try {
        const repo = await getTagForUser(userName, tagName);

        // TODO
        // Make sure we have an installation for this repo

        // Rotate this user's access keys
        await rotateKeys(userName, {
          newKeyHandler: async ({ accessKeyId, secretAccessKey }) => {
            // TODO
            // Preserve these keys in the repo as secrets
            console.log(`New key activated for ${userName} in ${repo}: ${accessKeyId}, ${secretAccessKey}.`);
          }
        });
      } catch (e) {
        console.error(`Repo not allocated for ${userName}.`);
      }
    })
  );

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
