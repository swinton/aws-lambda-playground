const AWS = require('aws-sdk');

const kms = new AWS.KMS();

module.exports = async function decrypt(encrypted, options) {
  try {
    const req = { CiphertextBlob: Buffer.from(encrypted, 'base64'), KeyId: process.env.KMS_KEY_ID };
    const data = await kms.decrypt(req).promise();
    const plain = data.Plaintext.toString('ascii');
    return options.trim ? plain.trim() : plain;
  } catch (err) {
    console.log('Decrypt error:', err);
    throw err;
  }
};
