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

## Running the code

There are several new scripts added to `package.json` to enable running the utility with one of the arguments, for example starting a timer:

    npm run start

However during the latest development work by Ian F, the utility would not run from the VS Code command window, using any of these added scripts.  The Harvest API was rejecting all requests with 400 bad-request errors.  The error was occurring in one of the harvest package dependencies,
a stack trace is provided at the bottom of this README.  An explanation remains elusive.  The only way to try out any changes was to pack the utility as if it were about to be published. If you hit the same issue, follow this procedure assuming the current directory is the twotime project folder:

1. Temporarily edit the `package.json` to put an alternative name in, e.g. ` "name": "twotime-x", ` and version, optionally.
1. Delete the `bin` folder if you've made significant changes or deleted _any_ source file.
1. `npm run build`
1. Create npm package locally: `npm pack --pack-destination <destinationFolder>` (e.g. your Downloads folder. The process writes a .tgz 'tarball')
1. Install the package globally, as per the real twotime, using the package just created e.g.: `npm install -g <destinationFolder>\twotime-x-2.0.1.tgz`
1. Run this version just like real twotime, e.g. `twotime-x start`.


This method, though straightforard, has the disadvantage of no debugging or application of any other code tools.  To resolve problems you'll just have to
keep adding console.log statements and republishing locally.

## !! Vulnerabilities !!


The codebase is very old and most library dependencies are hugely behind current versions.  At the time of writing, a `npm audit` reports 85 vulnerabilities (1 low, 22 moderate, 50 high, 12 critical). Several things here:

1. Ian F tried to update to more modern versions as a limited side-task to the user story time-remaining work, but too many things broke so it was abandoned.  It would need to be a longer, separate piece of work.
2. On analysing the vulnerabilities, most are centred on the `harvest` package. Twotime uses version 2.2.5, but the latest is only 2.2.6 which was issued 4 years ago. Therefore an exercise to upgrade Twotime's libraries will only have a limited impact.
3. Harvest package v2.2.6 was tried directly from the `master` branch, having deleted `node_modules` and reinstalling everything.
However the project would not build, giving syntax errors in `@types/minimatch` and other libraries, all beyond our control.

_The recommendation is a rewrite of the utility, factoring out this complex web of interdependencies on old and deprecated packages._

## Stack trace from npm run error

```
StatusCodeError: 400 - "\n<html><head>\n<meta http-equiv=\"content-type\" content=\"text/html;charset=utf-8\">\n<title>400 Bad Request</title>\n</head>\n<body text=#000000 bgcolor=#ffffff>\n<h1>Error: Bad Request</h1>\n<h2>Your client has issued a malformed or illegal request.</h2>\n<h2></h2>\n</body></html>\n"
    at new StatusCodeError (C:\Users\IanFrench\source\repos\twotime\node_modules\request-promise-core\lib\errors.js:32:15)
    at C:\Users\IanFrench\source\repos\twotime\node_modules\request-promise-core\lib\plumbing.js:97:41
    at tryCatcher (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\util.js:16:23)
    at Promise._settlePromiseFromHandler (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\promise.js:512:31)
    at Promise._settlePromise (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\promise.js:569:18)
    at Promise._settlePromiseCtx (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\promise.js:606:10)
    at _drainQueueStep (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\async.js:142:12)
    at _drainQueue (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\async.js:131:9)
    at Async._drainQueues (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\async.js:147:5)
    at Async.drainQueues [as _onImmediate] (C:\Users\IanFrench\source\repos\twotime\node_modules\bluebird\js\release\async.js:17:14)
    at process.processImmediate (node:internal/timers:478:21)
```
