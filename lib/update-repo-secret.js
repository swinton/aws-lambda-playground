const sodium = require('tweetsodium');

const updateRepoSecret = async function updateRepoSecret(octokit, options = {}) {
  const { owner, repo, secretName, secretValue } = options;
  // Get public key
  // https://developer.github.com/v3/actions/secrets/#get-your-public-key
  const {
    data: { key_id: publicKeyId, key: publicKey }
  } = await octokit.actions.getPublicKey({
    owner,
    repo
  });

  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(publicKey, 'base64');

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encryptedSecretValue = Buffer.from(encryptedBytes).toString('base64');

  return octokit.actions.createOrUpdateSecretForRepo({
    owner,
    repo,
    name: secretName,
    encrypted_value: encryptedSecretValue,
    key_id: publicKeyId
  });
};

module.exports = updateRepoSecret;

if (require.main === module) {
  (async () => {
    // eslint-disable-next-line global-require
    const argv = require('minimist')(process.argv.slice(2));
    const repoWithOwner = argv.repo;
    const [owner, repo] = repoWithOwner.split('/');

    // eslint-disable-next-line global-require
    const { getOctokitAppClient, getOctokitAppInstallationClient } = require('./get-octokit-client');

    // Lookup installation as App client
    const appOctokit = getOctokitAppClient();
    const { data: installation } = await appOctokit.apps.getRepoInstallation({ repo, owner });

    // Lookup repos as Installatoin client
    const installationOctokit = getOctokitAppInstallationClient(installation.id);
    const response = await updateRepoSecret(installationOctokit, {
      owner,
      repo,
      secretName: 'FOO',
      secretValue: 'BAR'
    });

    console.log('%j', response);
  })();
}
