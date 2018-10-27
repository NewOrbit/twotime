# twotime

Sync timesheets between Harvest and Targetprocess

## Installation

    npm install -g twotime

## Usage

### Authentication

Before you can start tracking time properly, you first need to authenticate against Harvest and Targetprocess.

    twotime auth

You will need:

- Harvest [personal access token](https://id.getharvest.com/developers) and account ID
- Targetprocess username and password

### Time tracking

- Use `twotime start` to start a timer
- Use `twotime finish` to finish a timer
- Use `twotime pause` to pause the currently running timer
- Use `twotime resume` to resume a paused timer

### Listing timesheet

Use `twotime list` to see a summary of a days timesheet.

### Past timers

Most commands can be used with past timesheets. You can provide a `--date` option (or `-d` for short):

    twotime start --date 2018-10-20

Or an offset with `--offset` (or `-o` for short) - the number of days in the past e.g. offset of 1 is yesterday

    twotime start -o 1

### Finish all

Provide the `--all` option to finish all of a day's timers at once.

## License

Made with :sparkling_heart: by [NewOrbit](https://www.neworbit.co.uk/) in Oxfordshire, and licensed under the [MIT Licence](LICENCE)
