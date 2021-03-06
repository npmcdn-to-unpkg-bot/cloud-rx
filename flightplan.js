// flightplan.js
var plan = require('flightplan');

// configuration ---------------------------------------------------------------
var appName   = 'node-app';
var username  = 'vlad';
var startFile = 'bin/www';

// Targets ---------------------------------------------------------------------
// plan.target('staging', {
//     host    : 'staging.example.com',
//     username: username,
//     agent   : process.env.SSH_AUTH_SOCK
// });
plan.target('production', [
    {
        host      : 'cloudrx.medapptech.com', //'cloudrx.medapptech.com',// 192.241.186.207
        username  : username,
        agent     : process.env.SSH_AUTH_SOCK,
        privateKey: process.env.HOME + '/.ssh/id_rsa'
    }
    //, more production servers can be added here
]);

var tmpDir = appName + '-' + new Date().getTime();

// run commands on localhost
plan.local(function(local) {
    // local.log('Run build');
    // local.exec('webpack');
    
    local.log('Copy files to remote hosts');
    var filesToCopy = local.exec('git ls-files', { silent: true });
    // rsync files to all the target's remote hosts
    local.transfer(filesToCopy, '/tmp/' + tmpDir);
});


// run commands on the target's remote hosts
plan.remote(function(remote) {//console.log(remote)
    remote.log('Move folder to web root');
    remote.sudo('cp -R /tmp/' + tmpDir + ' ~', { user: username });
    remote.rm('-rf /tmp/' + tmpDir);
    
    remote.log('Install dependencies');
    // remote.sudo('source ~/.nvm/nvm.sh', { user: username });
    // remote.sudo('nvm use default', { user: username });
    remote.sudo('npm --production --prefix ~/' + tmpDir
                            + ' install ~/' + tmpDir, { user: username });
    
    remote.log('Reload application');
    // remote.sudo('ln -snf ~/' + tmpDir + ' ~/' + appName, { user: username });
    // remote.sudo('pm2 reload ' + appName, { user: username });
});

// run more commands on localhost afterwards
// plan.local(function(local) { /* ... */ });

// ...or on remote hosts
//plan.remote(function(remote) { /* ... */ });
