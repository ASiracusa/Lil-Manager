DROP SCHEMA IF EXISTS lilmanager;
CREATE SCHEMA lilmanager;
USE lilmanager;

CREATE TABLE Players (
	guild_id VARCHAR(20) NOT NULL,
    duser_id VARCHAR(20) NOT NULL,
    reg_name VARCHAR(12) NOT NULL,
    player_role VARCHAR(20) NOT NULL,

    PRIMARY KEY (guild_id, duser_id)
); 

CREATE TABLE GuildData (
	guild_id VARCHAR(20) NOT NULL,
    players_role VARCHAR(20) NOT NULL,
    gms_role VARCHAR(20) NOT NULL,
    camps_role VARCHAR(20) NOT NULL,
    camp_abbr VARCHAR(10),
    
    PRIMARY KEY (guild_id)
);

CREATE TABLE Campaigns (
	guild_id VARCHAR(20) NOT NULL,
    abbr VARCHAR(10) NOT NULL,
    camp_name VARCHAR(64) NOT NULL,
    gm_duser_id VARCHAR(20) NOT NULL,
    camp_role VARCHAR(20) NOT NULL,
    gm_role VARCHAR(20) NOT NULL,

    PRIMARY KEY (guild_id, abbr)
); 

CREATE TABLE Characters (
	guild_id VARCHAR(20) NOT NULL,
    abbr VARCHAR(10) NOT NULL,
    duser_id VARCHAR(20) NOT NULL,
    camp_name VARCHAR(64) NOT NULL,
    char_role VARCHAR(20) NOT NULL,

    PRIMARY KEY (guild_id, abbr, duser_id)
); 
