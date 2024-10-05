const sd = require("./spooldb.js");

async function reset (message, params, db) {

  try {

    var gid = message.guild.id;
    var guildData = await sd.getGuildData(db, gid); 

    if (!checkOwnerRights(message)) return;
    if (!checkRunning(message, guildData, true)) return;

    var rolesToModify = [];

    if (guildData.length > 0) {

      guildData = guildData[0];

      const charsData = await sd.getAllChars(db, gid);
      for (var i = 0; i < charsData.length; i++) {
        rolesToModify.push( ["delete", charsData[i].char_role] );
      }

      const campsData = await sd.getCamps(db, gid);
      for (var i = 0; i < campsData.length; i++) {
        rolesToModify.push( ["delete", campsData[i].camp_role] );
        rolesToModify.push( ["delete", campsData[i].gm_role] );
      }

      const playersData = await sd.getPlayers(db, gid);
      for (var i = 0; i < playersData.length; i++) {
        rolesToModify.push( ["delete", playersData[i].player_role] );
      }

      rolesToModify.push( ["delete", guildData.costume_role] );
      rolesToModify.push( ["delete", guildData.players_role] );
      rolesToModify.push( ["delete", guildData.camps_role] );
      rolesToModify.push( ["delete", guildData.gms_role] );

      await sd.removeGuild(db, gid);

    }

    message.guild.roles.create({
      name: "Costumes",
      hoist: false
    }).then((costumeRole) => {

    message.guild.roles.create({
      name: "Campaigns",
      hoist: false
    }).then((campRole) => {

    message.guild.roles.create({
      name: "GMs",
      hoist: true
    }).then((gmRole) => {

    message.guild.roles.create({
      name: "Players",
      hoist: true
    }).then((playerRole) => {

      rolesToModify.push( ["redit", campRole.id, { position: costumeRole.position-1 } ] );
      rolesToModify.push( ["redit", gmRole.id, { position: costumeRole.position-2 } ] );
      rolesToModify.push( ["redit", playerRole.id, { position: costumeRole.position-3 } ] );

      sd.addGuild(db, gid, costumeRole.id, playerRole.id, gmRole.id, campRole.id); 

      congaLine(message, rolesToModify, 0);

      message.channel.send("Server reset completed.");

    }); }); }); });

  } catch (error) {
    console.error('ERROR IN ~reset:', error);
  }
  
}

async function startSession (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    const charsData = await sd.getChars(db, gid, campAbbr);

    await sd.startSession(db, gid, campAbbr);

    var rolesToModify = [];

    rolesToModify.push( ["redit", campData.camp_role, {hoist: true} ] );

    var playerData = await sd.getPlayerWithId(db, gid, campData.gm_duser_id);
    rolesToModify.push( ["dedit", campData.gm_duser_id, {nick: "(GM) " + playerData[0].reg_name} ] );
    rolesToModify.push( ["redit", playerData[0].player_role, {color: campData.gm_color} ] );
    for (var i = 0; i < charsData.length; i++) {
      playerData = await sd.getPlayerWithId(db, gid, charsData[i].duser_id);
      rolesToModify.push( ["dedit", charsData[i].duser_id, {nick: charsData[i].char_name + " (" + playerData[0].reg_name + ")"} ] );
      rolesToModify.push( ["redit", playerData[0].player_role, {color: charsData[i].char_color} ] );
    }

    congaLine(message, rolesToModify, 0);

    message.channel.send("Started **" + campAbbr + "**.");

  } catch (error) {
    console.error('ERROR IN ~start:', error);
  }
  
}

async function endSession (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, false)) return;

    var campAbbr = guildData.camp_abbr;
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    const charsData = await sd.getChars(db, gid, campAbbr);

    await sd.endSession(db, gid);

    var rolesToModify = [];

    rolesToModify.push( ["redit", campData.camp_role, {hoist: false} ] );

    var playerData = await sd.getPlayerWithId(db, gid, campData.gm_duser_id);
    rolesToModify.push( ["dedit", campData.gm_duser_id, {nick: playerData[0].reg_name} ] );
    rolesToModify.push( ["redit", playerData[0].player_role, {color: playerData[0].player_color} ] );
    for (var i = 0; i < charsData.length; i++) {
      playerData = await sd.getPlayerWithId(db, gid, charsData[i].duser_id);
      rolesToModify.push( ["dedit", charsData[i].duser_id, {nick: playerData[0].reg_name} ] );
      rolesToModify.push( ["redit", playerData[0].player_role, {color: playerData[0].player_color} ] );
    }
    
    congaLine(message, rolesToModify, 0);

    message.channel.send("Ended the session.");

  } catch (error) {
    console.error('ERROR IN ~end:', error);
  }
  
}

async function register (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var playerId = params[1].substring(2, params[1].length - 1);
    var playerName = params[2].split("_").join(" ");
  
    if (!(await dcheckPlayerId(message, db, gid, playerId, true))) return;
    if (!(await dcheckPlayerName(message, db, gid, playerName, true))) return;
    
    var rolesToModify = [];

    message.guild.members.fetch(playerId).then((playerUser) => {

      message.guild.roles.create({
        name: playerName,
        color: params[3],
        hoist: false
      }).then((playersRole) => {
        
        message.guild.roles.fetch(guildData.costume_role).then((costumeRole) => {
          rolesToModify.push( ["redit", playersRole.id, { position: costumeRole.position-1 } ] );
          rolesToModify.push( ["dedit", playerId, {nick: playerName} ] );
          rolesToModify.push( ["add", guildData.players_role, playerId ] );
          rolesToModify.push( ["add", playersRole.id, playerId ] );

          sd.createPlayer(db, gid, playerId, playerName, params[3], playersRole.id);

          congaLine(message, rolesToModify, 0);

          message.channel.send("Registered **" + playerName + "**.");
        });
        
        
      });

    }).catch(() => {
      message.channel.send("That Discord user is not a member of this server.");
      return;
    });

  } catch (error) {
    console.error('ERROR IN ~register:', error);
  }
  
}

async function unregister (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkOwnerRights(message)) return;
    if (!checkRunning(message, guildData, true)) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;

    if (!(await dcheckGmOfAny(message, db, gid, playerData.duser_id, true))) return;

    var rolesToModify = [];

    rolesToModify.push( ["delete", playerData.player_role] );

    const charsData = await sd.getCharsOfPlayer(db, gid, playerData.duser_id);
    for (var i = 0; i < charsData.length; i++) {
      rolesToModify.push( ["delete", charsData[i].char_role] );
      const campData = await sd.getCampWithAbbr(db, gid, charsData[i].abbr);
      rolesToModify.push( ["remove", campData[0].camp_role, playerData.duser_id] );
    }

    rolesToModify.push( ["remove", guildData.players_role, playerData.duser_id] );

    sd.deletePlayer(db, gid, playerData.duser_id);

    congaLine(message, rolesToModify, 0);

    message.channel.send("Unregistered **" + playerName + "**.");

  } catch (error) {
    console.error('ERROR IN ~unregister:', error);
  }
  
}

async function rnp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;
    
    var newPlayerName = params[2].split("_").join(" ");
    await sd.renamePlayer(db, gid, playerData.duser_id, newPlayerName); 
    message.guild.roles.fetch(playerData.player_role).then((playersRole) => {
      playersRole.edit({ name: newPlayerName }).then(() => {
        message.guild.members.fetch(playerData.duser_id).then((playerUser) => {
          playerUser.edit( {nick: newPlayerName} );
          message.channel.send("Renamed player to **" + newPlayerName + "**.");
        });
      });
    });

  } catch (error) {
    console.error('ERROR IN ~rnp:', error);
  }
  
}

async function rcp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var playerName = params[1].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;
  
    await sd.recolorPlayer(db, gid, playerData.duser_id, params[2]); 
    message.guild.roles.fetch(playerData.player_role).then((playersRole) => {
      playersRole.edit({ color: params[2] });
    });
    
    message.channel.send("Recolored " + playerName + " to **" + params[2] + "**.");

  } catch (error) {
    console.error('ERROR IN ~rcp:', error);
  }
  
}

async function lp (message, params, db) {

  try {

    // message.guild.roles.fetch().then((rolesList) => {
    //   // rolesList = rolesList.toJSON();
    //   // console.log(rolesList.length);
    //   // console.log(rolesList);
    //   message.guild.roles.delete("1228468669403762798").then().catch(console.error);
    // });

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkOwnerRights(message)) return;

    const playersData = await sd.getPlayers(db, gid);
    if (playersData.length === 0) {
      message.channel.send("There are no players.");
    } else {
      var playerListMessage = "The players are:";
      var pids = [];
      var regNames = [];
      playersData.forEach((playerRow) => {
        pids.push(playerRow.duser_id);
        regNames.push(playerRow.reg_name);
      });
      message.guild.members.fetch( { user: pids, force: true } ).then((playerUsers) => {
        playerUsers = playerUsers.toJSON();
        for (var p = 0; p < pids.length; p++) {
          playerListMessage = playerListMessage + "\n> " + regNames[p] + " (" + playerUsers[p].user.username + ")";
        }
        message.channel.send(playerListMessage);
      }).catch(console.error);
    }

  } catch (error) {
    console.error('ERROR IN ~lp:', error);
  }
  
}

async function addcamp (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var campName = params[1].split("_").join(" ");
    var campAbbr = params[2].toLowerCase();
    if (!(await dcheckCampAbbr(message, db, gid, campAbbr, true))) return;

    var gmName = params[4].split("_").join(" ");
    const gmData = await dcheckPlayerName(message, db, gid, gmName, false); if (!gmData) return;

    var rolesToModify = [];

    message.guild.roles.create({
      name: "GM (" + campName + ")",
      color: params[5],
      hoist: false
    }).then((gmsRole) => {

      message.guild.roles.fetch(guildData.gms_role).then((gmRole) => {

        gmsRole.setPosition(gmRole.position-1).then(() => {

        message.guild.roles.create({
          name: campName,
          color: params[3],
          hoist: false
        }).then((campsRole) => {

          message.guild.roles.fetch(guildData.camps_role).then((campRole) => {

            campsRole.setPosition(campRole.position-1).then(() => {

            rolesToModify.push( ["add", gmsRole.id, gmData.duser_id ] );
            // rolesToModify.push( ["rpos", gmsRole.id, gmRole.position-1] );
            rolesToModify.push( ["add", campsRole.id, gmData.duser_id ] );
            // rolesToModify.push( ["rpos", campsRole.id, campRole.position-1] );
            
            // rolesToModify.push( ["redit", campsRole.id, { position: campRole.position-1 } ] );
            // rolesToModify.push( ["redit", gmsRole.id, { position: gmRole.position } ] );
            

            sd.createCamp(db, gid, campAbbr, campName, gmData.duser_id, campsRole.id, params[5], gmsRole.id);

            congaLine(message, rolesToModify, 0);

            message.channel.send("Created **" + campName + " (" + campAbbr + ")**.");

            });

          });
        });

        });
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

    if (!checkOwnerRights(message)) return;
    if (!checkRunning(message, guildData, true)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;
    
    if (!checkGmOrOwnerRights(message, campData)) return;

    var rolesToModify = [];
    
    rolesToModify.push( ["delete", campData.camp_role] );
    rolesToModify.push( ["delete", campData.gm_role] );

    const charsData = await sd.getChars(db, gid, campAbbr);
    for (var i = 0; i < charsData.length; i++) {
      rolesToModify.push( ["delete", charsData[i].char_role] );
    }

    await sd.deleteCamp(db, gid, campAbbr);
    
    await congaLine(message, rolesToModify, 0);

    message.channel.send("Deleted **" + campData.camp_name + " (" + campAbbr + ")**.");

  } catch (error) {
    console.error('ERROR IN ~delcamp:', error);
  }
  
}

async function lcamps (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkOwnerRights(message)) return;

    const campsData = await sd.getCamps(db, gid);
    if (campsData.length === 0) {
      message.channel.send("There are no campaigns.");
    } else {
      var campListMessage = "The campaigns are:";
      for (var c = 0; c < campsData.length; c++) {
        var campRow = campsData[c];
        var gmName = (await sd.getPlayerWithId(db, gid, campRow.gm_duser_id))[0].reg_name;
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

    if (!checkRunning(message, guildData, true)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    var playerName = params[2].split("_").join(" ");
    var charName = params[3].split("_").join(" ");
    const playerData = await dcheckPlayerName(message, db, gid, playerName, false); if (!playerData) return;

    if (!checkGmOfCamp(message, campData, playerData.duser_id, true)) return;
    if (!(await dcheckCharId(message, db, gid, campAbbr, playerData.duser_id, true))) return;
    if (!(await dcheckCharName(message, db, gid, campAbbr, charName, true))) return;

    message.guild.roles.create({
      name: charName,
      color: params[4],
      hoist: false
    }).then((charsRole) => {
      
      message.guild.members.fetch(playerData.duser_id).then((playerUser) => {
        message.guild.roles.fetch(campData.camp_role).then((campRole) => {
          playerUser.roles.add(charsRole).then(() => {
            playerUser.roles.add(campRole).then(() => {
              message.guild.roles.fetch(guildData.players_role).then((playerRole) => {
                charsRole.edit({ position: playerRole.position-1 });

                sd.createChar(db, gid, campData.abbr, playerData.duser_id, charName, params[4], charsRole.id);

                message.channel.send("Created **" + charName + "**.");

              });
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('ERROR IN ~addchar:', error);
  }
  
}

async function delchar (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkOwnerRights(message)) return;
    if (!checkRunning(message, guildData, true)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;
    
    var charName = params[2].split("_").join(" ");
    const charData = await dcheckCharName(message, db, gid, campAbbr, charName, false); if (!charData) return;

    if (!checkCharRights(message, campData, charData)) return;

    message.guild.roles.fetch(charData.char_role).then((charRole) => {
      message.guild.roles.delete(charRole);
    });

    await sd.deleteChar(db, gid, campAbbr, charName);

    message.channel.send("Deleted **" + charName + "**.");

  } catch (error) {
    console.error('ERROR IN ~delchar:', error);
  }
  
}

async function rnchar (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    var charName = params[2].split("_").join(" ");
    const charData = await dcheckCharName(message, db, gid, campAbbr, charName, false); if (!charData) return;

    if (!checkCharRights(message, campData, charData)) return;
    
    var newCharName = params[3].split("_").join(" ");
    await sd.renameChar(db, gid, campAbbr, charData.duser_id, newCharName); 
    message.guild.roles.fetch(charData.char_role).then((charsRole) => {
      charsRole.edit({ name: newCharName });
      message.channel.send("Renamed character to **" + newCharName + "**.");
    });

  } catch (error) {
    console.error('ERROR IN ~rnchar:', error);
  }
  
}

async function rcchar (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkRunning(message, guildData, true)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    var charName = params[2].split("_").join(" ");
    const charData = await dcheckCharName(message, db, gid, campAbbr, charName, false); if (!charData) return;

    if (!checkCharRights(message, campData, charData)) return;
  
    await sd.recolorChar(db, gid, campAbbr, charData.duser_id, params[3]); 
    message.guild.roles.fetch(charData.char_role).then((charsRole) => {
      charsRole.edit({ color: params[3] });
    });
    
    message.channel.send("Recolored " + charName + " to **" + params[3] + "**.");

  } catch (error) {
    console.error('ERROR IN ~rcchar:', error);
  }
  
}

async function lchars (message, params, db) {

  try {

    var gid = message.guild.id;
    const guildData = await dcheckGuild(message, db, gid); if (!guildData) return;

    if (!checkOwnerRights(message)) return;

    var campAbbr = params[1].toLowerCase();
    const campData = await dcheckCampAbbr(message, db, gid, campAbbr, false); if (!campData) return;

    const charsData = await sd.getChars(db, gid, campAbbr);
    if (charsData.length === 0) {
      message.channel.send("There are no characters in **" + campData.camp_name + "**.");
    } else {
      var charListMessage = "The characters in **" + campData.camp_name + "** are:";
      for (var c = 0; c < charsData.length; c++) {
        var charRow = charsData[c];
        var playerName = (await sd.getPlayerWithId(db, gid, charRow.duser_id))[0].reg_name;
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
  return failIfFound ? true : playerData[0];

}

async function dcheckPlayerId (message, db, gid, playerId, failIfFound) {

  const playerData = await sd.getPlayerWithId(db, gid, playerId); 

  if ((playerData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That user is already registered." : "That user is not registered.");
    return false;
  }
  return failIfFound ? true : playerData[0];

}

async function dcheckCampAbbr (message, db, gid, abbr, failIfFound) {

  const campData = await sd.getCampWithAbbr(db, gid, abbr); 

  if ((campData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That campaign abbreviation is already being used." : "That campaign does not exist.");
    return false;
  }
  return failIfFound ? true : campData[0];

}

async function dcheckCharName (message, db, gid, abbr, charName, failIfFound) {

  const charData = await sd.getCharWithName(db, gid, abbr, charName); 

  if ((charData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That character name is already being used." : "No one has that character name.");
    return false;
  }
  return failIfFound ? true : charData[0];

}

async function dcheckCharId (message, db, gid, abbr, pid, failIfFound) {

  const charData = await sd.getCharWithId(db, gid, abbr, pid); 

  if ((charData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That player already has a character in this campaign." : "That player is not in this campaign.");
    return false;
  }
  return failIfFound ? true : charData[0];

}

async function dcheckGmOfAny (message, db, gid, gmid, failIfFound) {

  const campData = await sd.getCampsByGm(db, gid, gmid); 

  if ((campData.length > 0) === failIfFound) {
    message.channel.send(failIfFound ? "That player is a GM." : "That player is not a GM.");
    return false;
  }
  return failIfFound ? true : campData;

}

async function congaLine (message, modList, i) {

  console.log(i);

  var nextFunction = (i === modList.length - 1)
    ? () => { }
    : () => { congaLine(message, modList, i+1); } ;

  if (modList[i][0] === "delete") {

    message.guild.roles.fetch(modList[i][1]).then((role) => {
      message.guild.roles.delete(role).then(nextFunction()).catch(console.error);
    }).catch(console.error);

  } else if (modList[i][0] === "remove") {

    message.guild.roles.fetch(modList[i][1]).then((role) => {
      message.guild.members.fetch( {user: modList[i][2], force: true} ).then((duser) => {
        duser.roles.remove(role).then(nextFunction()).catch(console.error);
      }).catch(console.error);
    }).catch(console.error);
    
  } else if (modList[i][0] === "add") {

    message.guild.roles.fetch(modList[i][1]).then((role) => {
      message.guild.members.fetch( {user: modList[i][2], force: true} ).then((duser) => {
        duser.roles.add(role).then(nextFunction()).catch(console.error);
      }).catch(console.error);
    }).catch(console.error);

  } else if (modList[i][0] === "dedit") {

    message.guild.members.fetch( {user: modList[i][1], force: true} ).then((duser) => {
      duser.edit(modList[i][2]).then(nextFunction()).catch(console.error);
    }).catch(console.error);
    
  } else if (modList[i][0] === "redit") {

    message.guild.roles.fetch(modList[i][1]).then((role) => {
      role.edit(modList[i][2]).then(nextFunction()).catch(console.error);
    }).catch(console.error);
    
  } else if (modList[i][0] === "rpos") {

    // message.guild.roles.setPosition(modList[i][1], modList[i][2]).then(nextFunction()).catch(console.error);
    message.guild.roles.fetch(modList[i][1]).then((role) => {
      role.setPosition(modList[i][2]).then(nextFunction()).catch(console.error);
    }).catch(console.error);
    
  } else {

    nextFunction();

  }

}

function checkRunning (message, guildData, failIfFound) {

  if ((guildData.camp_abbr !== null && guildData.camp_abbr !== undefined) === failIfFound) {
    message.channel.send(failIfFound ? "There's a session running right now." : "There isn't a session running right now.");
    return false;
  }
  return true;

}

function checkCharRights (message, campData, charData) {

  if (!(charData.duser_id === message.author.id || campData.gm_duser_id === message.author.id || message.guild.ownerId === message.author.id)) {
    message.channel.send("You do not have access to modify that character.");
    return false;
  }
  return true;

}

function checkGmOrOwnerRights (message, campData) {

  if (!(campData.gm_duser_id === message.author.id || message.guild.ownerId === message.author.id)) {
    message.channel.send("You are not the GM of that campaign.");
    return false;
  }
  return true;

}

function checkGmRights (message, campData, failIfFound) {

  if ((campData.gm_duser_id === message.author.id) === failIfFound) {
    message.channel.send(failIfFound ? "You are already the GM of that campaign." : "You are not the GM of that campaign.");
    return false;
  }
  return true;

}

function checkGmOfCamp (message, campData, playerId, failIfFound) {

  if ((campData.gm_duser_id === playerId) === failIfFound) {
    message.channel.send(failIfFound ? "That user is already the GM of that campaign." : "That user is not the GM of that campaign.");
    return false;
  }
  return true;

}

function checkOwnerRights (message) {

  if (message.guild.ownerId !== message.author.id) {
    message.channel.send("You are not the owner of this server.");
    return false;
  }
  return true;

}

module.exports = {
  reset,
  startSession,
  endSession,
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
  rnchar,
  rcchar,
  lchars
};