/* eslint-disable no-console */
const AWS = require('aws-sdk');

const iam = new AWS.IAM();

// Looks up specified tag value for given user, recursively, until tag is found
// Throws if no tag with specified tagName is found
const getTagForUser = async function getTagForUser(userName, tagName, { marker } = { marker: undefined }) {
  const { Tags: tags, IsTruncated: truncated, Marker: nextMarker } = await iam
    .listUserTags({ UserName: userName, Marker: marker })
    .promise();

  // Look through tags for our tag
  const filtered = tags.filter(({ Key: key }) => {
    return key === tagName;
  });

  if (filtered.length > 0) {
    const [tag] = filtered;
    return tag.Value;
  }
  if (truncated) {
    // Look up the next page of results
    return getTagForUser(userName, tagName, { marker: nextMarker });
  }
  // Not found, throw
  throw new Error(`${tagName} not found for ${userName}.`);
};

module.exports = getTagForUser;

if (require.main === module) {
  (async () => {
    // eslint-disable-next-line global-require
    const argv = require('minimist')(process.argv.slice(2));
    const tag = await getTagForUser(argv.username, 'repo');
    console.log(JSON.stringify(tag, null, 4));
  })();
}
