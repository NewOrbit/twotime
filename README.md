# twotime

Sync timesheets between Harvest and Targetprocess

## Installation

    npm install -g twotime

## Setup

Once installed, you need to authenticate against Harvest and Targetprocess.

    twotime auth

You will need:

- Harvest [personal access token](https://id.getharvest.com/developers) and account ID
- Targetprocess username and password

### Windows and WSL

If you're using Windows and WSL, you may wish to be able to use twotime in either environment.  To avoid having two separate authentication configurations you can symlink the configuration files.

<details>
    <summary>Windows and WSL example</summary>
<br/>
    Assuming you've already installed and authenticated your Windows installation of twotime, then head to WSL:

1. Install `twotime` in WSL
    ```bash
    $ npm -g i twotime
    ```

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

Use `twotime list` to see a summary of a days timesheet.

### Past timers

Most commands can be used with past timesheets. You can provide a `--date` option (or `-d` for short):

    twotime start --date 2018-10-20

Also you can use an offset with `--offset` (or `-o` for short) for the number of days in the past. For example an offset of 1 is yesterday:

    twotime start -o 1

### Finish all

Provide the `--all` option to finish all of a day's timers at once.

### Targetprocess Shortcut

Use the `--tp` option to start a timer without prompting for a Targetprocess ID:

    twotime start --tp 12345

### Issue time entries

When a time entry for a TargetProcess `Issue` is finished, time is booked on the relevant TargetProcess entity based on the value of custom field `IssueTime to` on the TargetProcess project. Values for this custom field can be as below:

- `User story` - Issue time is booked on the user story. If the issue is not attached to a user story, no time is booked on TargetProcess.
- `Issue` - Issue time is booked to the issue.
- `none` - No issue time is booked on TargetProcess.

### Task time entries

When a time entry for a TargetProcess `Task` is finished, if the time remaining on the task is 0, then it is moved to `Done` state.

## License

Made with :sparkling_heart: by [NewOrbit](https://www.neworbit.co.uk/) in Oxfordshire, and licensed under the [MIT Licence](LICENCE)
