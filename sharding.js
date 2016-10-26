/**
 * Created by julia on 19.09.2016.
 */
const Discord = require('discord.js');
const config = require('./config/main.json');
var winston = require('winston');
var request = require("request");
let guilds = 0;
let ShardManager = new Discord.ShardingManager('./index.js', config.shards, true);
ShardManager.spawn(config.shards, 5000).then(shards => {
    winston.info('Spawned Shards!');
    timerFetchGuilds();
}).catch(winston.error);
function timerFetchGuilds() {
    winston.info('Fetching Guilds - timer!');
    setTimeout(() => {
        fetchGuilds();
        setInterval(() => {
            fetchGuilds();
        }, 1000 * 60);
    }, 1000 * 10);
}
function fetchGuilds() {
    winston.info('Fetching Guilds!');
    ShardManager.fetchClientValues('guilds.size').then(results => {
        winston.info('loaded guilds!');
        let guilds = results.reduce((prev, val) => prev + val, 0);
        winston.info(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
    }).catch(err => {
        winston.error(err);
    });
}
function updateStats() {
    let id;
    if (config.beta) {
        id = config.client_id
    } else {
        id = config.bot_id
    }
    let requestOptions = {
        headers: {
            Authorization: config.discord_bots_token
        },
        url: `https://bots.discord.pw/api/bots/${id}/stats`,
        method: 'POST',
        json: {
            "server_count": guilds
        }
    };
    request(requestOptions, function (err, response, body) {
        if (err) {
            client.captureMessage(err);
            return winston.error(err);
        }
        winston.info('Stats Updated!');
        winston.info(body);
    });
    if (!config.beta) {
        let requestOptionsCarbon = {
            url: `https://www.carbonitex.net/discord/data/botdata.php`,
            method: 'POST',
            json: {
                "server_count": guilds,
                "key": config.carbon_token
            }
        };
        request(requestOptionsCarbon, function (err, response, body) {
            if (err) {
                client.captureMessage(err);
                return winston.error(err);
            }
            winston.info('Stats Updated Carbon!');
            winston.info(body);
        });
    }
}