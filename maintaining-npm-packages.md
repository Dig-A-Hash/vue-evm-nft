# Maintaining NPM Packages
If you're developing this package and need to test it in another project without publishing it to npm, you can use npm link to create a symbolic link between your local package and the consuming project. This allows you to test changes in real-time.

### Steps to Link Locally
Navigate to the root directory of your package (this repository):

Run the following command to create a global link to your local package:

```
npm link
```
This registers the vue-evm-nft package globally on your machine. You only need to run this command once during your development setup.

In the project where you want to test vue-evm-nft:

Navigate to the root directory of the consuming project and run:

```
npm link vue-evm-nft
```
This creates a symbolic link in the node_modules folder of the consuming project, pointing to your local version of vue-evm-nft. Now, any changes made to the local package will be reflected immediately in the consuming project.

## Unlinking the Package
When you finish testing and want to return to using the published version of vue-evm-nft from npm, follow these steps:

### Unlink the package:

In the root directory of the consuming project, run:

```
npm unlink vue-evm-nft
```
This removes the symbolic link from node_modules.

### Reinstall the package from npm:

After unlinking, reinstall the package from the npm registry:

```
npm install vue-evm-nft
```
This ensures that the consuming project is now using the latest published version of vue-evm-nft from npm.

## Steps to Publish an NPM Package:

### Login to npm:
Before you can publish (or update) a package, you need to be logged in to your npm account from the terminal. If you're not already logged in, run:

```
npm login
```
This will prompt you for your npm credentials (username, password, and email). Once logged in, npm associates your account with the actions you perform (publishing, updating, etc.).

### Publish:
This command publishes your package to the npm registry. After successful publication, it will be available to everyone via npm.

```
npm publish
```


You can check who has publish permissions for a package with the following command:

```
npm owner ls <package-name>
```

You can check if you are logged in by running:
```
npm whoami
```

If you are the owner and want to give other users permission to update the package, you can add them as collaborators:

```
npm owner add <username> <package-name>
```

## Steps to Update an NPM Package:
Make Changes to Your Package:

Update your package code (fix bugs, add features, etc.).
Ensure that all the necessary changes are committed.
Update the Version Number: You need to update the version number in your package.json file according to Semantic Versioning (SemVer). The version format is MAJOR.MINOR.PATCH:

```json
{
  "name": "vue-evm-nft",
  "version": "1.1.0", // Updated version number
}
```

Test Your Changes: Before publishing the update, make sure everything works as expected by testing locally, possibly using npm link if needed.

Publish the Updated Package: Once your code is ready and the version number has been updated, you can publish the package to npm. Run:
```
npm publish
```
This will publish the updated version to the npm registry.

Add a Tag for the Release, You can do this with Git:

```
git tag v1.1.0
git push origin v1.1.0
```
This helps you keep track of which version is deployed at which point.

### Important Notes:
Versioning: npm requires that each published version has a unique version number. You cannot republish an already published version, which is why it's essential to update the version number before running npm publish.

Publishing Privileges: You must be the package owner or have publishing rights to update an existing npm package. If the package has multiple maintainers, make sure you have permission to publish updates.
Viewing Published Versions:
To see which versions of your package are already published, run:

```
npm view <package-name> versions
```

Summary:
- Make changes to your package.
- Update the version number in package.json.
- Test your changes.
- Run npm publish to deploy the new version.
- Tag the release with Git.