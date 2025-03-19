# Twotime Developer Guide

This section has been added for the benefit of developers needing to do any work on the utility.

## Go-to people

Tom Hyde - repo administrator \
Ian French - latest developer to do any work on the utility

## Preparation

Clone the repo: `git clone https://github.com/NewOrbit/twotime.git`

Change directory to the cloned repo, install dependencies and sanity-check the build, e.g. from PowerShell:

```
PS> cd twotime
PS> npm install
PS> npm run prepublishOnly
```

## Developing the code

1. From the root of the repo, i.e. the same folder as this README:
1. Ensure the `package.json` file contains the correct name and version.
1. Delete the `bin` folder if you've made significant changes or deleted _any_ source file.
1. `npm run build`, then `npm run lint`, then `npm run test`.

## Running the code

There are several new scripts added to `package.json` to enable running the utility with one of the arguments, for example starting a timer:

    PS> npm run start

Other features can be tested by running `node` directly, for example:

    PS> node bin/src/index.js --help
    PS> node bin/src/index.js pause

## Publishing the code

This will be done manually when necessary, rather than tying it to a DevOps pipeline.

1. Ensure you have enough privileges to add a package to the NewOrbit registry.
2. The npm package `vsts-npm-auth` should already be installed as part of a general `npm install`.  Otherwise install it manually by using `npm install vsts-npm-auth`
3. Unless you already have this all set up, add a `.npmrc` file to the project in the same directory as package.json with the following contents:
    ```
    registry=https://registry.npmjs.org/
    @neworbit:registry=https://pkgs.dev.azure.com/neworbit/_packaging/NewOrbit/npm/registry/
    always-auth=true
    ```
    (This file must be ignored by git as it will contain an unencrypted authentication token.)
4. Run vsts-npm-auth to get an Azure Artifacts token added:  `npx vsts-npm-auth -config .npmrc`.  Note:
    - You don't need to do this every time. npm will give a 401 unauthorized error when you need to run it again.
    - You should get an email entitled "Azure DevOps personal access token added".
5. Publish the package with `npm publish`.  Check it exists in [NewOrbit internal artefacts](https://dev.azure.com/neworbit/NewOrbit%20Internal/_artifacts/feed/NewOrbit).

## Recent history

The codebase was very old and most library dependencies were hugely behind current versions.  In January 2025, a `npm audit` reported 85 vulnerabilities (1 low, 22 moderate, 50 high, 12 critical). Most were centred on the `harvest` package which looks like it's been abandoned.  Ian F updated everything to more modern versions as part of a piece of work to tighten up the reporting of task time-remaining.  Several old libraries such as moment were factored out.

There are currently no vulnerabilities reported by `npm audit`, or on packaging the utility.

_However_, not all of the dependent packages could be upgraded to the latest versions due to run-time problems, specifically ERR_REQUIRE_ESM errors.  There was not enough time in the project to see if this can be addressed - none of these has any security vulnerabilities.  A `npm outdated` command gave the following output as of end Jan 2025:

```
Package                              Current  Wanted  Latest  Location                                          Depended by
--------                             -------  ------  ------  ------------------------------------------------  -----------
@types/inquirer                        7.3.3   7.3.3   9.0.7  node_modules/@types/inquirer                      twotime
@types/inquirer-autocomplete-prompt    1.3.5   1.3.5   3.0.3  node_modules/@types/inquirer-autocomplete-prompt  twotime
chalk                                  4.1.2   4.1.2   5.4.1  node_modules/chalk                                twotime
configstore                            4.0.0   4.0.0   7.0.0  node_modules/configstore                          twotime
inquirer                               8.2.6   8.2.6  12.3.2  node_modules/inquirer                             twotime
inquirer-autocomplete-prompt           2.0.1   2.0.1   3.0.1  node_modules/inquirer-autocomplete-prompt         twotime
```

## To Do

Delete the public package!  At the moment this isn't possible as there are several owners who have left the company.

If possible, enable the use of the latest package versions as explained above.
