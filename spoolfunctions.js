const sd = require("./spooldb.js");

async function reset (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await sd.getGuildData(db, gid); 
    
    if (guildData.length > 0) {



    }

    message.guild.roles.create({
      name: "Player",
      color: "#cccccc",
      hoist: true
    }).then((playerRole) => {

    message.guild.roles.create({
      name: "GM",
      color: "#f0f0f0",
      hoist: true
    }).then((gmRole) => {

    message.guild.roles.create({
      name: "Campaigns",
      color: "#999999",
      hoist: false
    }).then((campRole) => {

      gmRole.edit({ position: playerRole.position-1 });
      campRole.edit({ position: playerRole.position-2 });

      sd.addGuild(db, gid, playerRole.id, gmRole.id, campRole.id); 

      message.channel.send("Server reset completed.");

    }); }); });

  } catch (error) {
    console.error('ERROR IN ~reset:', error);
  }
  
}

async function register (message, params, db) {

  try {

    var gid = message.guild.id;
    var guildData;
    if (!(guildData = await dcheckGuild(message, db, gid))) return;

    var playerId = params[1].substring(2, params[1].length - 1);
    var playerUser = message.guild.members.cache.get(playerId);
    var playerName = params[2].split("_").join(" ");
  
    if (await dcheckRegistration(message, db, gid, playerId, true)) return;
    if (await dcheckUniquename(message, db, gid, playerName, true)) return;
    
    var playerRole = message.guild.roles.cache.find(role => role.id === guildData.players_role);
    playerUser.roles.add(playerRole);
    message.guild.roles.create({
      name: playerName,
      color: params[3],
      hoist: false
    }).then((playersRole) => {
      playerUser.roles.add(playersRole);
      playersRole.edit({ position: playerRole.position-1 });
      
      sd.createPlayer(db, gid, playerId, playerName, playersRole.id);

      message.channel.send("Registered **" + playerName + "**.");
    });

  } catch (error) {
    console.error('ERROR IN ~register:', error);
  }
  
}

async function unregister (message, params, db) {

  try {

    var gid = message.guild.id;
    var guildData;
    if (!(guildData = await dcheckGuild(message, db, gid))) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await sd.getPlayerWithName(db, gid, playerName); 
    if (playerData.length === 0) return;

    var playerUser = message.guild.members.cache.get(playerData[0].duser_id);
    playerUser.roles.remove(message.guild.roles.cache.find(role => role.id === guildData.players_role));
    message.guild.roles.delete(message.guild.roles.cache.find(role => role.id === playerData[0].player_role));
    await sd.deletePlayer(db, gid, playerData[0].duser_id);
    
    message.channel.send("Unregistered **" + playerName + "**.");

  } catch (error) {
    console.error('ERROR IN ~unregister:', error);
  }
  
}

async function rnp (message, params, db) {

  try {

    var gid = message.guild.id;
    var guildData;
    if (!(guildData = await dcheckGuild(message, db, gid))) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await sd.getPlayerWithName(db, gid, playerName); 
    if (playerData.length === 0) return;
    
    var newPlayerName = params[2].split("_").join(" ");
    await sd.renamePlayer(db, gid, playerData[0].duser_id, newPlayerName); 
    var playersRole = message.guild.roles.cache.find(role => role.id === playerData[0].player_role);
    playersRole.edit({ name: newPlayerName });
    
    message.channel.send("Renamed player to **" + newPlayerName + "**.");

  } catch (error) {
    console.error('ERROR IN ~rnp:', error);
  }
  
}

async function rcp (message, params, db) {

  try {

    var gid = message.guild.id;
    var guildData;
    if (!(guildData = await dcheckGuild(message, db, gid))) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await sd.getPlayerWithName(db, gid, playerName); 
    if (playerData.length === 0) return;
  
    var playersRole = message.guild.roles.cache.find(role => role.id === playerData[0].player_role);
    playersRole.edit({ color: params[2] });
    
    message.channel.send("Recolored " + playerName + " to **" + params[2] + "**.");

  } catch (error) {
    console.error('ERROR IN ~rcp:', error);
  }
  
}

async function lp (message, params, db) {

  try {

    var gid = message.guild.id;
    

  } catch (error) {
    console.error('ERROR IN ~lp:', error);
  }
  
}

async function addcamp (message, params, db) {

  try {

    var gid = message.guild.id;
    var guildData;
    if (!(guildData = await dcheckGuild(message, db, gid))) return;

    var campName = params[1].split("_").join(" ");
    var campAbbr = params[2].toLowerCase();
    var gmName = params[4].split("_").join(" ");
    const gmData = await sd.getPlayerWithName(db, gid, gmName); 
    if (gmData.length === 0) return;

    message.guild.roles.create({
      name: "GM (" + campName + ")",
      color: params[5],
      hoist: false
    }).then((gmsRole) => {
      var gmUser = message.guild.members.cache.get(gmData[0].duser_id);
      gmUser.roles.add(gmsRole);
      var gmRole = message.guild.roles.cache.find(role => role.id === guildData.gms_role);
      gmsRole.edit({ position: gmRole.position-1 });
      
      message.guild.roles.create({
        name: campName,
        color: params[3],
        hoist: false
      }).then((campsRole) => {
        gmUser.roles.add(campsRole);
        var campRole = message.guild.roles.cache.find(role => role.id === guildData.camps_role);
        campsRole.edit({ position: campRole.position-1 });

        sd.createCamp(db, gid, campAbbr, campName, gmData[0].duser_id, campsRole.id, gmsRole.id);

        message.channel.send("Created **" + campName + " (" + campAbbr + ")**.");
      });
    });

  } catch (error) {
    console.error('ERROR IN ~addcamp:', error);
  }
  
}

async function delcamp (message, params, db) {

  try {

    var gid = message.guild.id;
    

  } catch (error) {
    console.error('ERROR IN ~delcamp:', error);
  }
  
}

async function lcamps (message, params, db) {

  try {

    var gid = message.guild.id;
    

  } catch (error) {
    console.error('ERROR IN ~lcamps:', error);
  }
  
}

async function addchar (message, params, db) {

  try {

    var gid = message.guild.id;
    

  } catch (error) {
    console.error('ERROR IN ~addchar:', error);
  }
  
}

async function delchar (message, params, db) {

  try {

    var gid = message.guild.id;
    

  } catch (error) {
    console.error('ERROR IN ~delchar:', error);
  }
  
}

async function lchars (message, params, db) {

  try {

    var gid = message.guild.id;
    

  } catch (error) {
    console.error('ERROR IN ~lchars:', error);
  }
  
}

async function dcheckGuild (message, db, gid) {

  const guildData = await sd.getGuildData(db, gid); 

  if (guildData.length === 0) {
    message.channel.send("This server hasn't been setup. Tell the owner to use **~reset** to being using this bot!");
    return false;
  }
  return guildData[0];

}

async function dcheckRegistration (message, db, gid, playerId, failIfFound) {

  const playerData = await sd.getPlayerWithId(db, gid, playerId); 

  if ((playerData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That user is already registered." : "That user is not registered.");
    return true;
  }
  return false;

}

async function dcheckUniquename (message, db, gid, playerName, failIfFound) {

  const playerData = await sd.getPlayerWithName(db, gid, playerName); 

  if ((playerData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That name is already being used." : "No one has that name.");
    return true;
  }
  return false;

}

module.exports = {
  reset,
  register,
  unregister,
  rnp,
  rcp,
  lp,
  addcamp,
  delcamp,
  lcamps,
  addchar,
  delchar,
  lchars
};