/* eslint-disable no-console */
const getAllUsersInGroup = require('./lib/get-all-users-in-group');
const getTagForUser = require('./lib/get-tag-for-user');
const rotateKeys = require('./lib/rotate-keys');
const updateRepoSecret = require('./lib/update-repo-secret');

const { getOctokitAppClient, getOctokitAppInstallationClient } = require('./lib/get-octokit-client');

exports.handler = async () => {
  // Get octokit client
  const appOctokit = getOctokitAppClient();
  const groupName = process.env.GROUP_NAME;
  const tagName = process.env.TAG_NAME;

  // Iterate over all users in specified group
  const users = await getAllUsersInGroup(groupName);
  await Promise.all(
    users.map(async ({ UserName: userName }) => {
      try {
        // repoWithOwner is a string like ":owner/:repo", i.e. "octocat/Spoon-Knife"
        const repoWithOwner = await getTagForUser(userName, tagName);
        const [owner, repo] = repoWithOwner.split('/');

        // Make sure we have an installation for this repo
        // https://developer.github.com/v3/apps/#get-a-repository-installation
        const { data: installation } = await appOctokit.apps.getRepoInstallation({ owner, repo });
        const installationOctokit = getOctokitAppInstallationClient(installation.id);

        // Rotate this user's access keys
        await rotateKeys(userName, {
          newKeyHandler: async ({ accessKeyId, secretAccessKey }) => {
            // Preserve these keys in the repo as secrets, via installationOctokit
            await updateRepoSecret(installationOctokit, {
              owner,
              repo,
              secretName: 'AWS_ACCESS_KEY_ID',
              secretValue: accessKeyId
            });

            await updateRepoSecret(installationOctokit, {
              owner,
              repo,
              secretName: 'AWS_SECRET_ACCESS_KEY',
              secretValue: secretAccessKey
            });
            console.log(`New key activated for ${userName} in ${owner}/${repo}.`);

            // Fire off a repository dispatch event
            // https://github.com/swinton/trigger-repository-dispatch/blob/master/index.js
            return installationOctokit.repos.createDispatchEvent({
              owner,
              repo,
              event_type: 'aws_access_keys_regenerated',
              client_payload: {
                user_name: userName
              }
            });
          }
        });
      } catch (e) {
        console.error(`Repo not allocated for ${userName}.`);
      }
    })
  );
};

if (require.main === module) {
  (async () => {
    const event = 'event';
    const context = 'context';
    const viewer = await exports.handler({ event }, { context });
    console.log(`${JSON.stringify(viewer, null, 4)}`);
  })();
}
