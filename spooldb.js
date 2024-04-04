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

async function getChars (db, gid, abbr) {

  const query = 'SELECT * FROM Characters WHERE guild_id=? AND abbr=?';
  return await queryDB(db, query, [gid, abbr]);

}

async function removeGuild (db, gid) {

  const query = 'DELETE FROM GuildData WHERE guild_id=?';
  return await queryDB(db, query, [gid]);

}

async function addGuild (db, gid, pRole, gRole, cRole) {

  const query = 'INSERT INTO GuildData VALUES (?, ?, ?, ?, NULL)';
  return await queryDB(db, query, [gid, pRole, gRole, cRole]);

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

  const query = 'DELETE FROM Players WHERE guild_id=? AND duser_id=?';
  return await queryDB(db, query, [gid, pid]);

}

async function renamePlayer (db, gid, pid, newName) {

  const query = 'UPDATE Players SET reg_name=? WHERE guild_id=? AND duser_id=?';
  return await queryDB(db, query, [newName, gid, pid]);

}

async function createCamp (db, gid, abbr, campName, gmid, cRole, gRole) {

  const query = 'INSERT INTO Campaigns VALUES (?, ?, ?, ?, ?, ?)';
  return await queryDB(db, query, [gid, abbr, campName, gmid, cRole, gRole]);

}

module.exports = {
  getGuildData,
  getPlayers,
  getCamps,
  getChars,
  removeGuild,
  addGuild,
  getPlayerWithName,
  getPlayerWithId,
  createPlayer,
  deletePlayer,
  renamePlayer,
  createCamp
};