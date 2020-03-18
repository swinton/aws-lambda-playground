/* eslint-disable no-console */
const AWS = require('aws-sdk');

const iam = new AWS.IAM();

const Statuses = Object.freeze({ active: 'Active', inactive: 'Inactive' });

const rotateKeys = async function rotateKeys(userName) {
  try {
    // List the access keys for the user
    const { AccessKeyMetadata: keys } = await iam.listAccessKeys({ UserName: userName }).promise();

    // If there are multiple active access keys on the account, raise an error (we don’t know which one to delete, and there can be only 2)
    const activeKeys = keys.filter(key => key.Status === Statuses.active);
    if (activeKeys.length > 1) {
      throw new Error(`Too many active keys for IAM user ${userName}.`);
    }

    // Delete the inactive access key
    await Promise.all(
      keys.map(key => {
        const { AccessKeyId, UserName, Status } = key;
        if (Status === Statuses.inactive) {
          // Inactive, delete this one
          return iam.deleteAccessKey({ AccessKeyId, UserName }).promise();
        }
        // Not inactive, keep this one
        return new Promise(resolve => resolve(key));
      })
    );

    // While current access key is still active, create a second access key, which is active by default
    const newActiveKey = await iam.createAccessKey({ UserName: userName }).promise();

    // Deactivate the old access key (it will be deleted the next time this runs)
    const { UserName, AccessKeyId } = activeKeys[0];
    await iam.updateAccessKey({ UserName, AccessKeyId, Status: Statuses.inactive }).promise();

    return newActiveKey;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

module.exports = rotateKeys;

if (require.main === module) {
  (async () => {
    // eslint-disable-next-line global-require
    const argv = require('minimist')(process.argv.slice(2));
    const newKey = await rotateKeys(argv.username);
    console.log(JSON.stringify(newKey, null, 4));
  })();
}
