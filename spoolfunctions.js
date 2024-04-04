const sd = require("./spooldb.js");

async function reset (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await sd.getGuildData(db, gid); 
    
    if (guildData.length > 0) {



    }

    message.guild.roles.create({
      name: "Players",
      hoist: true
    }).then((playerRole) => {

    message.guild.roles.create({
      name: "GMs",
      hoist: true
    }).then((gmRole) => {

    message.guild.roles.create({
      name: "Campaigns",
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
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var playerId = params[1].substring(2, params[1].length - 1);
    var playerUser = message.guild.members.cache.get(playerId);
    var playerName = params[2].split("_").join(" ");
  
    if (!(await dcheckPlayerId(message, db, gid, playerId, true))) return;
    if (!(await dcheckPlayerName(message, db, gid, playerName, true))) return;
    
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
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;

    var playerUser = message.guild.members.cache.get(playerData.duser_id);
    playerUser.roles.remove(message.guild.roles.cache.find(role => role.id === guildData.players_role));
    message.guild.roles.delete(message.guild.roles.cache.find(role => role.id === playerData.player_role));
    await sd.deletePlayer(db, gid, playerData.duser_id);
    
    message.channel.send("Unregistered **" + playerName + "**.");

  } catch (error) {
    console.error('ERROR IN ~unregister:', error);
  }
  
}

async function rnp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;
    
    var newPlayerName = params[2].split("_").join(" ");
    await sd.renamePlayer(db, gid, playerData.duser_id, newPlayerName); 
    var playersRole = message.guild.roles.cache.find(role => role.id === playerData.player_role);
    playersRole.edit({ name: newPlayerName });
    
    message.channel.send("Renamed player to **" + newPlayerName + "**.");

  } catch (error) {
    console.error('ERROR IN ~rnp:', error);
  }
  
}

async function rcp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;
  
    var playersRole = message.guild.roles.cache.find(role => role.id === playerData.player_role);
    playersRole.edit({ color: params[2] });
    
    message.channel.send("Recolored " + playerName + " to **" + params[2] + "**.");

  } catch (error) {
    console.error('ERROR IN ~rcp:', error);
  }
  
}

async function lp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    const playersData = await sd.getPlayers(db, gid);
    if (playersData.length === 0) {
      message.channel.send("There are no players.");
    } else {
      var playerListMessage = "The players are:";
      playersData.forEach((playerRow) => {
        var playerUser = message.guild.members.cache.get(playerRow.duser_id);
        playerListMessage = playerListMessage + "\n> " + playerUser.user.username + " (" + playerRow.reg_name + ")";
      });
      message.channel.send(playerListMessage);
    }

  } catch (error) {
    console.error('ERROR IN ~lp:', error);
  }
  
}

async function addcamp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var campName = params[1].split("_").join(" ");
    var campAbbr = params[2].toLowerCase();
    if (!(await dcheckCampAbbr(message, db, gid, campAbbr, true))) return;

    var gmName = params[4].split("_").join(" ");
    const gmData = await dcheckPlayerName(message, db, gid, gmName, false); if (!gmData) return;

    message.guild.roles.create({
      name: "GM (" + campName + ")",
      color: params[5],
      hoist: false
    }).then((gmsRole) => {
      var gmUser = message.guild.members.cache.get(gmData.duser_id);
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

        sd.createCamp(db, gid, campAbbr, campName, gmData.duser_id, campsRole.id, gmsRole.id);

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
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;
    
    if (!checkGmOrOwner(message, campData)) return;

    message.guild.roles.delete(message.guild.roles.cache.find(role => role.id === campData.camp_role));
    message.guild.roles.delete(message.guild.roles.cache.find(role => role.id === campData.gm_role));

    await sd.deleteCamp(db, gid, campAbbr);

    message.channel.send("Deleted **" + campData.camp_name + " (" + campAbbr + ")**.");

  } catch (error) {
    console.error('ERROR IN ~delcamp:', error);
  }
  
}

async function lcamps (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    const campsData = await sd.getCamps(db, gid);
    if (campsData.length === 0) {
      message.channel.send("There are no campaigns.");
    } else {
      var campListMessage = "The campaigns are:";
      for (var c = 0; c < campsData.length; c++) {
        var campRow = campsData[c];
        var gmName = (await sd.getPlayerWithId(campRow.gm_duser_id))[0].reg_name;
        campListMessage = campListMessage + "\n> " + campRow.camp_name + " (" + campRow.abbr + ", ran by " + gmName + ")";
      }
      message.channel.send(campListMessage);
    }

  } catch (error) {
    console.error('ERROR IN ~lcamps:', error);
  }
  
}

async function addchar (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    var playerName = params[2].split("_").join(" ");
    var charName = params[3].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;

    if (!checkGm(message, campData, true)) return;
    if (!(await dcheckCharId(message, db, gid, campAbbr, playerData.duser_id, true))) return;
    if (!(await dcheckCharName(message, db, gid, campAbbr, charName, true))) return;

    message.guild.roles.create({
      name: charName,
      color: params[4],
      hoist: false
    }).then((charsRole) => {
      
      var playerUser = message.guild.members.cache.get(playerData.duser_id);
      playerUser.roles.add(charsRole);
      var gmRole = message.guild.roles.cache.find(role => role.id === guildData.gms_role);
      charsRole.edit({ position: gmRole.position+1 });

      sd.createChar(db, gid, campData.abbr, pid, charName, charsRole.id);

      message.channel.send("Created **" + charName + "**.");
      
    });
    
  } catch (error) {
    console.error('ERROR IN ~addchar:', error);
  }
  
}

async function delchar (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;
    
    var charName = params[2].split("_").join(" ");
    const charData = await dcheckCharName(message, db, gid, campAbbr, charName, false); if (!charData) return;

    if (!checkCharRights(message, campData, charData)) return;

    message.guild.roles.delete(message.guild.roles.cache.find(role => role.id === charData.char_role));

    await sd.deleteChar(db, gid, campAbbr, charName);

    message.channel.send("Deleted **" + charName + "**.");

  } catch (error) {
    console.error('ERROR IN ~delchar:', error);
  }
  
}

async function lchars (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    const charsData = await sd.getChars(db, gid, campAbbr);
    if (charsData.length === 0) {
      message.channel.send("There are no characters in **" + campData.camp_name + "**.");
    } else {
      var charListMessage = "The characters in **" + campData.camp_name + "** are:";
      for (var c = 0; c < charsData.length; c++) {
        var charRow = charsData[c];
        var playerName = (await sd.getPlayerWithId(charRow.duser_id))[0].reg_name;
        charListMessage = charListMessage + "\n> " + charRow.char_name + " (played by " + playerName + ")";
      }
      message.channel.send(charListMessage);
    }
    

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

async function dcheckPlayerName (message, db, gid, playerName, failIfFound) {

  const playerData = await sd.getPlayerWithName(db, gid, playerName); 

  if ((playerData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That name is already being used." : "No one has that name.");
    return false;
  }
  return playerData[0];

}

async function dcheckPlayerId (message, db, gid, playerId, failIfFound) {

  const playerData = await sd.getPlayerWithId(db, gid, playerId); 

  if ((playerData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That user is already registered." : "That user is not registered.");
    return false;
  }
  return playerData[0];

}

async function dcheckCampAbbr (message, db, gid, abbr, failIfFound) {

  const campData = await sd.getCampWithAbbr(db, gid, abbr); 

  if ((campData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That campaign abbreviation is already being used." : "That campaign does not exist.");
    return false;
  }
  return campData[0];

}

async function dcheckCharName (message, db, gid, abbr, charName, failIfFound) {

  const charData = await sd.getCharWithName(db, gid, abbr, charName); 

  if ((charData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That character name is already being used." : "No one has that character name.");
    return false;
  }
  return charData[0];

}

async function dcheckCharId (message, db, gid, abbr, pid, failIfFound) {

  const charData = await sd.getCharWithId(db, gid, abbr, pid); 

  if ((charData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That player already has a character in this campaign." : "That player is not in this campaign.");
    return false;
  }
  return charData[0];

}

function checkCharRights (message, campData, charData) {

  if (charData.duser_id === message.author.id || campData.gm_duser_id === message.author.id || message.guild.ownerId === message.author.id) {
    message.channel.send("You do not have access to modify that character.");
    return false;
  }
  return true;

}

function checkGmOrOwner (message, campData) {

  if (campData.gm_duser_id === message.author.id || message.guild.ownerId === message.author.id) {
    message.channel.send("You are not the GM of that campaign.");
    return false;
  }
  return true;

}

function checkGm (message, campData, failIfFound) {

  if ((campData.gm_duser_id === message.author.id) === failIfFound) {
    message.channel.send(failIfFound ? "You are already the GM of that campaign." : "You are not the GM of that campaign.");
    return false;
  }
  return true;

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