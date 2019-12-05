


var exec = require('child_process').exec;
var ping = exec('ping 127.0.0.1');
/*var ping = exec('cmd /C ping 127.0.0.1');*/
ping.stdout.on('data', function (data) {
  console.log('' + data);
});
