const util = require('util');
var ds = require('fd-diskspace');
const path  = require('path');
const fs = require('fs');

const diskspace = util.promisify(ds.diskSpace);
const recordingDirectory = path.join(__dirname, 'public', 'recordings');

// Async
async function getFreeDiskSpace() {
    const { total:{ free }}  = await diskspace();
    let remainingSpaceInGB = free/Math.pow(1024, 3);
    return remainingSpaceInGB;
}

async function performCleanup(interval, MIN_BUFFER_DISK_SPACE_IN_GB) {
    console.log("CleanUp started:");
    let remainingSpaceInGB = await getFreeDiskSpace();
    const files = await fs.promises.readdir(recordingDirectory);
    const filesStatsPromises = files
                            .map(file => fs.promises.stat(path.join(recordingDirectory, file)));
        
    let filesStatsResults = await Promise.all(filesStatsPromises);
    
    filesStatsResults = Array.from(filesStatsResults
        .map((stats, index) => [stats.ctimeMs, files[index]])
        .sort((a,b) => b[0] - a[0]));
        console.log("Remaining Disk space:", remainingSpaceInGB);
    while(remainingSpaceInGB <= MIN_BUFFER_DISK_SPACE_IN_GB && (filesStatsResults.length >= 2)) {
        const [_, fileName] = filesStatsResults.pop();
        fs.unlinkSync(path.join(recordingDirectory, fileName));
        remainingSpaceInGB = await getFreeDiskSpace();
        console.log('deleted...', remainingSpaceInGB);
    }
    console.log("CleanUp completed:");
    setTimeout(()=>performCleanup(interval), interval);
}

module.exports = {
    performCleanup
}
