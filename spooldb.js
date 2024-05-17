async function queryDB (db, queryString, params) {

  if (params.length === 0) {
    return await new Promise((resolve, reject) => {
      db.query(queryString, (error, results, fields) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  } else {
    return await new Promise((resolve, reject) => {
      db.query(queryString, params, (error, results, fields) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  }
  
}

async function getGuildData (db, gid) {

  const query = 'SELECT * FROM GuildData WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function getPlayers (db, gid) {

  const query = 'SELECT * FROM Players WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function getCamps (db, gid) {

  const query = 'SELECT * FROM Campaigns WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function getCampsByGm (db, gid, gmid) {

  const query = 'SELECT * FROM Campaigns WHERE guild_id=? AND gm_duser_id=?';
  return await queryDB(db, query, [gid, gmid]);

}

async function getAllChars (db, gid) {

  const query = 'SELECT * FROM Characters WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function getChars (db, gid, abbr) {

  const query = 'SELECT * FROM Characters WHERE guild_id=? AND abbr=?';
  return await queryDB(db, query, [gid, abbr]);

}

async function getCharsOfPlayer (db, gid, pid) {

  const query = 'SELECT * FROM Characters WHERE guild_id=? AND duser_id=?';
  return await queryDB(db, query, [gid, pid]);

}

async function removeGuild (db, gid) {

  var query = 'DELETE FROM Characters WHERE guild_id=?';
  await queryDB(db, query, [gid]);
  query = 'DELETE FROM Campaigns WHERE guild_id=?';
  await queryDB(db, query, [gid]);
  query = 'DELETE FROM Players WHERE guild_id=?';
  await queryDB(db, query, [gid]);
  query = 'DELETE FROM GuildData WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function addGuild (db, gid, tRole, pRole, gRole, cRole) {

  const query = 'INSERT INTO GuildData VALUES (?, ?, ?, ?, ?, NULL)';
  return await queryDB(db, query, [gid, tRole, pRole, gRole, cRole]);

}

async function startSession (db, gid, campAbbr) {

  const query = 'UPDATE GuildData SET camp_abbr=? WHERE guild_id=?';
  return await queryDB(db, query, [campAbbr, gid]);

}

async function endSession (db, gid) {

  const query = 'UPDATE GuildData SET camp_abbr=NULL WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function getPlayerWithName (db, gid, playerName) {

  const query = 'SELECT * FROM Players WHERE guild_id=? AND reg_name=?';
  return await queryDB(db, query, [gid, playerName]);

}

async function getPlayerWithId (db, gid, pid) {

  const query = 'SELECT * FROM Players WHERE guild_id=? AND duser_id=?';
  return await queryDB(db, query, [gid, pid]);

}

async function createPlayer (db, gid, pid, playerName, pRole) {

  const query = 'INSERT INTO Players VALUES (?, ?, ?, ?)';
  return await queryDB(db, query, [gid, pid, playerName, pRole]);

}

async function deletePlayer (db, gid, pid) {

  var query = 'DELETE FROM Characters WHERE guild_id=? AND duser_id=?';
  await queryDB(db, query, [gid, pid]);
  query = 'DELETE FROM Players WHERE guild_id=? AND duser_id=?';
  return await queryDB(db, query, [gid, pid]);

}

async function renamePlayer (db, gid, pid, newName) {

  const query = 'UPDATE Players SET reg_name=? WHERE guild_id=? AND duser_id=?';
  return await queryDB(db, query, [newName, gid, pid]);

}

async function getCampWithAbbr (db, gid, abbr) {

  const query = 'SELECT * FROM Campaigns WHERE guild_id=? AND abbr=?';
  return await queryDB(db, query, [gid, abbr]);

}

async function createCamp (db, gid, abbr, campName, gmid, cRole, gRole) {

  const query = 'INSERT INTO Campaigns VALUES (?, ?, ?, ?, ?, ?)';
  return await queryDB(db, query, [gid, abbr, campName, gmid, cRole, gRole]);

}

async function deleteCamp (db, gid, abbr) {

  var query = 'DELETE FROM Characters WHERE guild_id=? AND abbr=?';
  await queryDB(db, query, [gid, abbr]);
  query = 'DELETE FROM Campaigns WHERE guild_id=? AND abbr=?';
  return await queryDB(db, query, [gid, abbr]);

}

async function renameCamp (db, gid, abbr, newName) {

  const query = 'UPDATE Campaigns SET camp_name=? WHERE guild_id=? AND abbr=?';
  return await queryDB(db, query, [newName, gid, abbr]);

}

async function createChar (db, gid, abbr, pid, charName, hRole) {

  const query = 'INSERT INTO Characters VALUES (?, ?, ?, ?, ?)';
  return await queryDB(db, query, [gid, abbr, pid, charName, hRole]);

}

async function deleteChar (db, gid, abbr, charName) {

  const query = 'DELETE FROM Characters WHERE guild_id=? AND abbr=? AND char_name=?';
  return await queryDB(db, query, [gid, abbr, charName]);

}

async function getCharWithName (db, gid, abbr, charName) {

  const query = 'SELECT * FROM Characters WHERE guild_id=? AND abbr=? AND char_name=?';
  return await queryDB(db, query, [gid, abbr, charName]);

}

async function getCharWithId (db, gid, abbr, pid) {

  const query = 'SELECT * FROM Characters WHERE guild_id=? AND abbr=? AND duser_id=?';
  return await queryDB(db, query, [gid, abbr, pid]);

}

module.exports = {
  getGuildData,
  getPlayers,
  getCamps,
  getCampsByGm,
  getAllChars,
  getChars,
  getCharsOfPlayer,
  startSession,
  endSession,
  removeGuild,
  addGuild,
  getPlayerWithName,
  getPlayerWithId,
  createPlayer,
  deletePlayer,
  renamePlayer,
  getCampWithAbbr,
  createCamp,
  deleteCamp,
  renameCamp,
  createChar,
  deleteChar,
  getCharWithName,
  getCharWithId
};