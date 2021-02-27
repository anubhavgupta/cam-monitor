# Checks disk space stats in bytes
Supports **Windows** and **Linux** system. Check with the utility:
* **Windows** - `wmic logicaldisk get size,freespace,caption`
* **Linux** - `df`

------------------------------------

## Installation
### NPM
```sh
npm install fd-diskspace --save
```

------------------------------------

## Usage
```js
var ds = require('fd-diskspace');

// Async
ds.diskSpace(function(err, res){
    if(err) throw err;

    console.log(res);
});

// Sync
var statsSync = ds.diskSpaceSync();
console.log(statsSync);

// Linux output:
/*
{
  total: {
    free: 24074004,
    size: 31069279,
    used: 6995275,
    percent: 0.22515086365538126
  },
  disks: {
    '/': {
      free: 23647712,
      size: 30572556,
      used: 6924844,
      percent: 0.22650523561065683
    },
    '/dev/shm': {
      free: 251044,
      size: 251044,
      used: 0,
      percent: 0
    },
    '/boot': {
      free: 175248,
      size: 245679,
      used: 70431,
      percent: 0.28667895912959596
    }
  }
}
 */
```

------------------------------------

## API
### diskSpace(callback)
#### Params
* `Function` **callback**   - callback fucntion
    * `Error` **err**       - callback error
    * `Object` **res**      - callback result about disk space

### diskSpaceSync()
#### Return
* `Object` **res**  - result about disk space

------------------------------------

## Response structure
* `Object` **res**
    * `Object`  **total**           - sum of all disk space
        * `Integer` **free**        - free disk space
        * `Integer` **size**        - total size of disk
        * `Integer` **used**        - used disk space
        * `Integer` **percent**     - percent of used disk space
    * `Object` **disks**            - named disks. Contain full analogue disks.total Object

------------------------------------

## Test
### Run the mocha test
Current test runs for `12-16 ms`
```sh
npm test
```

------------------------------------

## Build form coffee source
### Build project
The source code in the folder **development**. They should be compiled in the **bin** folder

------------------------------------

## Changelog
### 1.0.0 [ `Stable` ]
* `Add` - first realise