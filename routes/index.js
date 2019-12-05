const express = require('express');
const router = express.Router();

const cron = require('node-cron');
const cmd = require("node-cmd");

const mysql = require('mysql');

// let exec = require('child_process').exec;
let exec = require('sync-exec');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'service_monitor'
});

connection.connect(err => {
  if (err)
    throw err;
  else console.log("MySQL connected...");
});

const slackBot = require('slackbots');
const bot = new slackBot({
  token: 'xoxb-802339229714-847389333906-rp55lD2dMTg5rAJe5AxX6V5B',
  name: 'service_monitor_bot'
});


// bot.on('start', () => {
//     bot.postMessageToChannel('general', 'Service monitor started..', '', () => {
//     });
// });

bot.on('error', err => console.log(err));

router.post('/', (req, res, next) => {
  let service = req.body.service;
  bot.postMessageToChannel('general', service + " went down");
  console.log(req.body.service);
  res.send(req.body);
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('send');
});

let notifiedFailedServices = [""];
let counter = 0;


cron.schedule('* * * * * *', () => {


  connection.query(`SELECT name FROM services`, (error, results, fields) => {
    if (error) throw error;
    let service;
    results.forEach(async element => {
      service = element.name;

      let data = exec(`systemctl is-active ${service}.service`); /*var ping = exec('cmd /C ping 127.0.0.1');*/

      console.log(data.stdout.includes("active") && !notifiedFailedServices.includes(service))
      console.log(notifiedFailedServices)
      if (data.stdout.includes("active") && !notifiedFailedServices.includes(service)) {
        console.log(counter);
        bot.postMessageToChannel('general', `${service} has went up `);
        notifiedFailedServices.push(service);
        counter++;
      }

    });
  });
});


module.exports = router;