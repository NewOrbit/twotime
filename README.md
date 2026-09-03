# twotime

Sync timesheets between Harvest and Targetprocess

## Installation

twotime requires Node.js 24 or later, and is installed with [pnpm](https://pnpm.io/installation).

Note that the old, public package (v2.0.0) is deprecated and will be removed at some point. _Do not use this version_.

### Install from a GitHub release

Every release has the package attached to it as a tarball, and pnpm can install straight from its URL:

```bash
pnpm add -g https://github.com/NewOrbit/twotime/releases/download/v<version>/neworbit-twotime-<version>.tgz
```

Rather than filling in the version yourself, copy the exact command from the `Install or upgrade` section of the [latest release](https://github.com/NewOrbit/twotime/releases/latest). This is the simplest route: it needs no access to the NewOrbit feed and no `.npmrc`.

To upgrade, run the same command again with the URL of the newer version. It replaces the version you have installed.

### Install from the NewOrbit feed

twotime is also published to the NewOrbit Azure Artifacts feed, so you can install it by package name instead. This needs access to that feed and an `.npmrc` that points `@neworbit` at it.

If necessary, set up access to the NewOrbit DevOps artefacts by following the `Connect to a feed` procedure in [Get started with npm packages in Azure Artifacts](https://learn.microsoft.com/en-us/azure/devops/artifacts/get-started-npm?view=azure-devops). A few things in addition to that page:

1. Install the package `vsts-npm-auth` first, by using `pnpm add -g vsts-npm-auth`.
2. Your `.npmrc` file needs to have these entries. pnpm reads registry and authentication settings from `.npmrc`, the same as npm does:

    ```ini
    registry=https://registry.npmjs.org/
    @neworbit:registry=https://pkgs.dev.azure.com/neworbit/_packaging/NewOrbit/npm/registry/
    ```

3. If `vsts-npm-auth -config .npmrc` doesn't work, try `pnpm dlx vsts-npm-auth -config .npmrc`.
4. If that command fails with a "Couldn't get an authentication token" message, try adding `-F` to the end of the command to force it.
    - This can also happen if you already have an expired auth token in `.npmrc`. Clear the contents of the file down to just the two lines above, then run the `vsts-npm-auth` command again.

With that in place, install with:

```bash
pnpm add -g @neworbit/twotime
```

Upgrade later with `pnpm update -g @neworbit/twotime`.

### Coming from v2

v2.0.0 was installed globally by npm, so remove it with `npm uninstall -g twotime` before you install v3.

## Setup

Once installed, you need to authenticate against Harvest and Targetprocess.

```bash
twotime auth
```

You will need:

- Harvest [personal access token](https://id.getharvest.com/developers) and account ID
- Targetprocess [personal access token](https://neworbit.tpondemand.com/RestUI/Board.aspx#page=settings/authAndSecurity/personalAccessTokensTab)

### Windows and WSL

If you're using Windows and WSL, you may wish to be able to use twotime in either environment. To avoid having two separate authentication configurations you can symlink the configuration files.

<details>
    <summary>Windows and WSL example</summary>
<br/>
    Assuming you've already installed and authenticated your Windows installation of twotime, then head to WSL:

1. Install `twotime` in WSL, with the same command you used on Windows. Copy it from the `Install or upgrade` section of the [latest release](https://github.com/NewOrbit/twotime/releases/latest).

2. symlink the configs, substituting `USER_NAME` with the value from `%USERNAME%` in your Windows environment

    ```bash
    $ mkdir -p ~/.config/configstore
    $ ln -s /mnt/c/Users/USER_NAME/.config/configstore/twotime.json ~/.config/configstore/twotime.json
    $ twotime list
    [INFO] Getting config from /home/JohnDoe/.config/configstore/twotime.json
    ╔═══════════════╤══════════════════════════╤═════════════╤════════╗
    ║  Entity Type  │  Title                   │    Hours    │ Status ║
    ```

</details>

## Usage

Please ensure you've authenticated (see [Setup](#setup)) before using `twotime`.

### Time tracking

- Use `twotime start` to start a timer
- Use `twotime finish` to finish a timer
- Use `twotime pause` to pause the currently running timer
- Use `twotime resume` to resume a paused timer

### List your timesheet

Use `twotime list` to see a summary of a day's timesheet.

### Past timers

Most commands can be used with past timesheets. You can provide a `--date` option (or `-d` for short):

```bash
twotime start --date 2018-10-20
```

Also you can use an offset with `--offset` (or `-o` for short) for the number of days in the past. For example an offset of 1 is yesterday:

```bash
twotime start -o 1
```

### Finish all

Provide the `--all` option to finish all of a day's timers at once.

### Targetprocess Shortcut

Use the `--tp` option to start a timer without prompting for a Targetprocess ID:

```bash
twotime start --tp 12345
```

### Issue time entries

When a time entry for a TargetProcess `Issue` is finished, time is booked on the relevant TargetProcess entity based on the value of custom field `IssueTime to` on the TargetProcess project. Values for this custom field can be as below:

- `User story` - Issue time is booked on the user story. If the issue is not attached to a user story, no time is booked on TargetProcess.
- `Issue` - Issue time is booked to the issue.
- `none` - No issue time is booked on TargetProcess.

### Task time entries

When a time entry for a TargetProcess `Task` is finished, if the time remaining on the task is 0, then it is moved to `Done` state.

## License

(Original public package: Made with :sparkling_heart: by [NewOrbit](https://www.neworbit.co.uk/) in Oxfordshire, and licensed under the [MIT Licence](LICENSE))
