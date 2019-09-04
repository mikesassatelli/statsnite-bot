//This bot uses the fortnite API created by qlaffont and the Discord API
//in order to return stats/leaderboards from Fortnite.

//Made by Mike Sassatelli
const Fortnite = require('fortnite-api');
var fs = require('fs');

let fortniteAPI = new Fortnite([
    "EMAIL",
    "PASS",
    "FORTNITE KEY #1",
    "FORTNITE KEY #2"
  ], {
    debug: true
  });

//ISSUE SPOT
fortniteAPI.login()
.then(() => {
  const Discord = require("discord.js");
  const client = new Discord.Client();
  var startup = ["no"]
  const config = require("./config.json");
  
  //Console startup message with servers/users information
  client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} servers.`);
	client.user.setActivity("!statshelp");
  });

  //Console message for when joining a server
  client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	
	guild.channels.sort(function(chan1,chan2){
		if(chan1.type!==`text`) return 1;
		if(!chan1.permissionsFor(guild.me).has(`SEND_MESSAGES`)) return -1;
		return chan1.position < chan2.position ? -1 : 1;
	}).first().send("Use !statshelp or !help to see a list of commands and their usage.");
  });

  //Console message for when deleted from a server
  client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  });

  //Every message sent will trigger a series of checks for commands/stuff to ignore
  client.on("message", async message => {

    //Make sure our activity stays set
	client.user.setActivity("!statshelp");

    //Don't talk to other bots in order to prevent an uprising
    if(message.author.bot || (message.content.indexOf(config.prefix) !== 0)) return;


    //Separate command and its arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    //--------------------\\
    //-- BEGIN COMMANDS --\\
    //--------------------\\

    //Lists all current commands
    if(command === "statshelp" || command === "help") {
      message.channel.send({embed: {
      color: 6995176,
      author: {
        name: client.user.username,
        icon_url: client.user.avatarURL
      },
        title: "Please consider donating to keep statsnite-bot running!",
        description: "IMPORTANT: Usernames with spaces must use a comma instead of a space. (Ex: 'User Name' becomes 'User,Name')",
        url: 'http://paypal.me/statsnitebot',
        fields: [{
            name: "General Command Format",
            value: "!command player pc/xb1/ps4  (Ex: '!solo Ninja pc')"
          },
          {
            name: "Bot Status",
            value: "!ping",
            inline: true
          },
          {
            name: "Battle Pass Challenges",
            value: "!challenges",
            inline: true
          },
          {
            name: "Commands List",
            value: "!statshelp",
            inline: true
          },
          {
            name: "Lifetime Stats",
            value: "!ftnstats player platform"
          },
          {
            name: "Solo Stats",
            value: "!solo player platform",
            inline: true
          },
          {
            name: "Duos Stats",
            value: "!duos player platform",
            inline: true
          },
          {
            name: "Squads Stats",
            value: "!squads player platform",
            inline: true
          },
          {
            name: "Player Exists",
            value: "!exists player platform",
            inline: true
          },
          {
            name: "Drop Chooser",
            value: "!randomdrop",
            inline: true
          },
          {
            name: "Fortnite Server Status",
            value: "!online",
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: "Please consider donating to keep statsnite-bot running!"
          }
        }
      });
    };

    //Quick little ping test
    if(command === "ping") {
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    //Check if a player exists via FortniteAPI
    if (command === "exists") {
      let name = args[0];
      name = name.replace(",", " ");
      let sys = args[1];
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.checkPlayer(name, sys)
        .then((stats) => {
          message.channel.send(`${name} exists! Use "!ftnstats ${name} ${sys}" to check their stats!`);
        })
        .catch((err) => {
          console.log(err);
          message.channel.send("Whoops! User doesn't exist or something went wrong.");
        });
      });
      }

    //Check solo stats via FortniteAPI
    if (command === "solo") {
      let name = args[0]
      name = name.replace(",", " ");
      let sys = args[1];
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.getStatsBR(name, sys)
        .then((stats) => {
          soloWins = stats.group.solo.wins
          topThree = stats.group.solo.top3
          topSix = stats.group.solo.top6
          kdRatio = String((stats.group.solo.kills / (stats.group.solo.matches - stats.group.solo.wins)).toFixed(2))
          winPercent = String(((stats.group.solo.wins / stats.group.solo.matches) * 100).toFixed(2))
          totalMatches = stats.group.solo.matches
          timePlayed = stats.group.solo.timePlayed
          killsPerMatch = stats.group.solo.killsPerMatch
          totalKills = stats.group.solo.kills

          message.channel.send({embed: {
          color: 6995176,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
            title: `__**Solo Stats for ${name}**__`,
            fields: [{
                name: "Wins",
                value: soloWins,
                inline: true
              },
              {
                name: "Top 3",
                value: topThree,
                inline: true
              },
              {
                name: "Top 6",
                value: topSix,
                inline: true
              },
              {
                name: "K/D Ratio",
                value: kdRatio,
                inline: true
              },
              {
                name: "Win %",
                value: winPercent + "%",
                inline: true
              },
              {
                name: "Total Matches Played",
                value: totalMatches,
                inline: true
              },
              {
                name: "Time Played",
                value: timePlayed,
                inline: true
              },
              {
                name: "Kills Per Match",
                value: killsPerMatch,
                inline: true
              },
              {
                name: "Total Kills",
                value: totalKills,
                inline: true
              }
            ],
            timestamp: new Date(),
            footer: {
              text: "Generated by statsnite-bot using Fortnite-API"
            }
          }
        });
      })
      .catch((err) => {
        console.log(err);
        message.channel.send("User not found. Format: '!solo user pc/xb1/ps4' - Use commas instead of spaces in names!")
        });
      });
    }

    //Check duo stats via FortniteAPI
    if (command === "duos") {
      let name = args[0];
      name = name.replace(",", " ");
      let sys = args[1];
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.getStatsBR(name, sys)
        .then((stats) => {
          duoWins = stats.group.duo.wins
          topThree = stats.group.duo.top3
          topSix = stats.group.duo.top6
          kdRatio = String((stats.group.duo.kills / (stats.group.duo.matches - stats.group.duo.wins)).toFixed(2))
          winPercent = String(((stats.group.duo.wins / stats.group.duo.matches) * 100).toFixed(2))
          totalMatches = stats.group.duo.matches
          timePlayed = stats.group.duo.timePlayed
          killsPerMatch = stats.group.duo.killsPerMatch
          totalKills = stats.group.duo.kills

          message.channel.send({embed: {
            color: 6995176,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: `__**Duo Stats for ${name}**__`,
            fields: [{
                name: "Wins",
                value: duoWins,
                inline: true
              },
              {
                name: "Top 3",
                value: topThree,
                inline: true
              },
              {
                name: "Top 6",
                value: topSix,
                inline: true
              },
              {
                name: "K/D Ratio",
                value: kdRatio,
                inline: true
              },
              {
                name: "Win %",
                value: winPercent + "%",
                inline: true
              },
              {
                name: "Total Matches Played",
                value: totalMatches,
                inline: true
              },
              {
                name: "Time Played",
                value: timePlayed,
                inline: true
              },
              {
                name: "Kills Per Match",
                value: killsPerMatch,
                inline: true
              },
              {
                name: "Total Kills",
                value: totalKills,
                inline: true
              }
            ],
            timestamp: new Date(),
            footer: {
              text: "Generated by statsnite-bot using Fortnite-API"
            }
          }
          });
        })
        .catch((err) => {
          console.log(err);
          message.channel.send("User not found. Format: '!duos user pc/xb1/ps4' - Use commas instead of spaces in names!")
        });
      });
    }

    //Check squad stats via FortniteAPI
    if (command === "squads") {
      let name = args[0];
      name = name.replace(",", " ");
      let sys = args[1];
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.getStatsBR(name, sys)
        .then((stats) => {
          squadWins = stats.group.squad.wins
          topThree = stats.group.squad.top3
          topSix = stats.group.squad.top6
          kdRatio = String((stats.group.squad.kills / (stats.group.squad.matches - stats.group.squad.wins)).toFixed(2))
          winPercent = String(((stats.group.squad.wins / stats.group.squad.matches) * 100).toFixed(2))
          totalMatches = stats.group.squad.matches
          timePlayed = stats.group.squad.timePlayed
          killsPerMatch = stats.group.squad.killsPerMatch
          totalKills = stats.group.squad.kills

          message.channel.send({embed: {
            color: 6995176,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: `__**Squad Stats for ${name}**__`,
            fields: [{
                name: "Wins",
                value: squadWins,
                inline: true
              },
              {
                name: "Top 3",
                value: topThree,
                inline: true
              },
              {
                name: "Top 6",
                value: topSix,
                inline: true
              },
              {
                name: "K/D Ratio",
                value: kdRatio,
                inline: true
              },
              {
                name: "Win %",
                value: winPercent + "%",
                inline: true
              },
              {
                name: "Total Matches Played",
                value: totalMatches,
                inline: true
              },
              {
                name: "Time Played",
                value: timePlayed,
                inline: true
              },
              {
                name: "Kills Per Match",
                value: killsPerMatch,
                inline: true
              },
              {
                name: "Total Kills",
                value: totalKills,
                inline: true
              }
            ],
            timestamp: new Date(),
            footer: {
              text: "Generated by statsnite-bot using Fortnite-API"
            }
          }
          });
        })
        .catch((err) => {
          console.log(err);
          message.channel.send("User not found. Format: '!squads user pc/xb1/ps4' - Use commas instead of spaces in names!")
        });
      }); 
    }

    //Weekly challenges
    if (command === "challenges") {
      message.channel.send("Season 7, Week 2 Challenges", {files: ["images/s7w2.jpg"]});
    }

    //Random drop location
    if (command === "randomdrop") {
      var locations = Array("Junk Junction", "Haunted Hills", "Pleasant Park", "Hotel", "Anarchy Acres", "Risky Reels",
                            "Wailing Woods", "Tomato Town", "Lonely Lodge", "Retail Row", "Moisty Mire", "Prison", "Fatal Fields", "Lucky Landing",
                            "Flush Factory", "Shifty Shafts", "Greasy Grove", "Tilted Towers", "Snobby Shores", "Pleasant Park", "Loot Lake", "Dusty Divot", "Salty Springs");
      var random = locations[Math.floor(Math.random()*locations.length)];
      message.channel.send({embed: {
        color: 6995176,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        fields: [{
          name: "Suggested Random Location:",
          value: random,
          inline: true
        }],
        timestamp: new Date(),
        footer: {
          text: "Generated by statsnite-bot using Fortnite-API"
        }
      }});
    }

    //Check lifetime stats via FortniteAPI
    if (command === "lifetimestats" || command === "ftnstats") {
      let name = args[0];
      name = name.replace(",", " ");
      let sys = args[1];
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.getStatsBR(name, sys)
        .then((stats) => {
          lifetimeWins = stats.lifetimeStats.wins
          topThree = stats.lifetimeStats.top3s
          topSix = stats.lifetimeStats.top6s
          kdRatio = String((stats.lifetimeStats.kills / (stats.lifetimeStats.matches - stats.lifetimeStats.wins)).toFixed(2))
          winPercent = String(((stats.lifetimeStats.wins / stats.lifetimeStats.matches) * 100).toFixed(2))
          totalMatches = stats.lifetimeStats.matches
          timePlayed = stats.lifetimeStats.timePlayed
          killsPerMatch = stats.lifetimeStats.killsPerMatch
          totalKills = stats.lifetimeStats.kills

          message.channel.send({embed: {
            color: 6995176,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: `__**Lifetime Stats for ${name}**__`,
            fields: [{
                name: "Wins",
                value: lifetimeWins,
                inline: true
              },
              {
                name: "Top 3",
                value: topThree,
                inline: true
              },
              {
                name: "Top 6",
                value: topSix,
                inline: true
              },
              {
                name: "K/D Ratio",
                value: kdRatio,
                inline: true
              },
              {
                name: "Win %",
                value: winPercent + "%",
                inline: true
              },
              {
                name: "Total Matches Played",
                value: totalMatches,
                inline: true
              },
              {
                name: "Time Played",
                value: timePlayed,
                inline: true
              },
              {
                name: "Kills Per Match",
                value: killsPerMatch,
                inline: true
              },
              {
                name: "Total Kills",
                value: totalKills,
                inline: true
              }
            ],
            timestamp: new Date(),
            footer: {
              text: "Generated by statsnite-bot using Fortnite-API"
            }
          }
          });
        })
        .catch((err) => {
          console.log(err);
          message.channel.send("User not found. Format: '!ftnstats user pc/xb1/ps4' - Use commas instead of spaces in names!")
        });
      });
    }

    //Returns latest Fortnite news via FortniteAPI
    if (command === "news") {
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.getFortniteNews("en")
        .then((news) => {
          message.channel.send("News is temporarily disabled! Please try again later.");
        })
        .catch((err) => {
          console.log(err);
        });
      });
    }

    //Return true if Fortnite servers are online
    if (command === "online") {
      fortniteAPI.login()
      .then(()=> {
        fortniteAPI.checkFortniteStatus()
        .then((status) => {
          message.channel.send("Fortnite appears to be online.");
        })
        .catch((err) => {
          console.log(err);
          message.channel.send("Fortnite is either offline, or an error has occurred.");
          });
        });
      }
  });
  
  client.login(config.token);
});
