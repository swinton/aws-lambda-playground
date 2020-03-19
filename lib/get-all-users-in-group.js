/* eslint-disable no-console */
const AWS = require('aws-sdk');

const iam = new AWS.IAM();

// Gets users in group, recursively, until all users are fetched
const getAllUsersInGroup = async function getAllUsersInGroup(
  groupName = 'GitHubActions',
  { current, marker } = { current: [], marker: undefined }
) {
  const { Users: users, IsTruncated: truncated, Marker: nextMarker } = await iam
    .getGroup({ GroupName: groupName, Marker: marker })
    .promise();

  current.push(...users);

  if (truncated) {
    return getAllUsersInGroup(groupName, { current, marker: nextMarker });
  }
  return current;
};

module.exports = getAllUsersInGroup;

if (require.main === module) {
  (async () => {
    // eslint-disable-next-line global-require
    const argv = require('minimist')(process.argv.slice(2));
    const users = await getAllUsersInGroup(argv.group);
    console.log(JSON.stringify(users, null, 4));
  })();
}
