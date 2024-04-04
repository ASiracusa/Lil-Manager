const sf = require("./spoolfunctions.js");

const commandInfo = {
  "~help": {
    "syntax": "~help",
    "count": 0,
    "checks": [],
    "function": help,
    "description": "Prints out all of the commands, their syntaxes, and what exactly they do."
  },
  "~reset": {
    "syntax": "~reset",
    "count": 0,
    "checks": [],
    "function": sf.reset,
    "description": "Creates basic roles if needed and resets the database. This command can only be executed by the server owner. Do **NOT** run this command unless you specifically want to wipe everything."
  },
  "~register": {
    "syntax": "~register [PING USER] [NAME TO REGISTER] [HEX CODE]",
    "count": 3,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [2, 12]
      },
      {
        "function": pcheckHex,
        "params": [3]
      }
    ],
    "function": sf.register,
    "description": "Registers a person in the database with a real name and the color their name will be outside of a session."
  },
  "~unregister": {
    "syntax": "~unregister [REGISTERED NAME]",
    "count": 1,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 12]
      }
    ],
    "function": sf.unregister,
    "description": "Unregisters a person from the database."
  },
  "~rnp": {
    "syntax": "~rnp [REGISTERED NAME] [NEW NAME]",
    "count": 2,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 12]
      },
      {
        "function": pcheckMaxlen,
        "params": [2, 12]
      }
    ],
    "function": sf.rnp,
    "description": "Renames a registered person."
  },
  "~rcp": {
    "syntax": "~rcp [REGISTERED NAME] [NEW HEX CODE]",
    "count": 2,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 12]
      },
      {
        "function": pcheckHex,
        "params": [2]
      }
    ],
    "function": sf.rcp,
    "description": "Assigns a new color for a registered person to be used outside of a session."
  },
  "~lp": {
    "syntax": "~lp",
    "count": 0,
    "checks": [],
    "function": sf.lp,
    "description": "Lists everyone and their registered names."
  },
  "~addcamp": {
    "syntax": "~addcamp [CAMPAIGN NAME] [CAMPAIGN ABBR] [CAMPAIGN'S HEX CODE] [GM'S REGISTERED NAME] [GM'S HEX CODE]",
    "count": 5,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 64]
      },
      {
        "function": pcheckMaxlen,
        "params": [2, 10]
      },
      {
        "function": pcheckHex,
        "params": [3]
      },
      {
        "function": pcheckMaxlen,
        "params": [4, 12]
      },
      {
        "function": pcheckHex,
        "params": [5]
      }
    ],
    "function": sf.addcamp,
    "description": "Creates a campaign."
  },
  "~delcamp": {
    "syntax": "~delcamp [CAMPAIGN ABBR]",
    "count": 1,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 10]
      }
    ],
    "function": sf.delcamp,
    "description": "Deletes a campaign and all of its characters. This command can only be executed by its GM or the server owner."
  },
  "~lcamps": {
    "syntax": "~lcamps",
    "count": 0,
    "checks": [],
    "function": sf.lcamps,
    "description": "Lists all campaigns."
  },
  "~addchar": {
    "syntax": "~addchar [CAMPAIGN ABBR] [PLAYER'S REGISTERED NAME] [CHARACTER NAME] [HEX CODE]",
    "count": 4,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 10]
      },
      {
        "function": pcheckMaxlen,
        "params": [2, 12]
      },
      {
        "function": pcheckMaxlen,
        "params": [3, 17]
      },
      {
        "function": pcheckHex,
        "params": [4]
      }
    ],
    "function": sf.addchar,
    "description": "Creates a character for a specified campaign, as well as assigns its player and color."
  },
  "~delchar": {
    "syntax": "~delchar [CAMPAIGN ABBR] [CHARACTER'S NAME]",
    "count": 2,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 10]
      },
      {
        "function": pcheckMaxlen,
        "params": [2, 17]
      }
    ],
    "function": sf.delchar,
    "description": "Deletes a character from a campaign."
  },
  "~lchars": {
    "syntax": "~lchars [CAMPAIGN ABBR]",
    "count": 1,
    "checks": [
      {
        "function": pcheckMaxlen,
        "params": [1, 10]
      }
    ],
    "function": sf.lchars,
    "description": "Lists all characters and their players for a campaign."
  },
};

function help (message, params, db) {

  var helpText = "**The commands are:**";
  Object.keys(commandInfo).forEach((command) => {
    helpText = helpText + "\n\n**" + command + "**\n> `" + commandInfo[command]["syntax"] + "`\n> " + commandInfo[command]["description"];
  });
  message.channel.send(helpText);

}

function pcheckCount (message, params) {
  var count = commandInfo[params[0]]["count"]
  if (params.length-1 !== count) {
    message.channel.send("Expected " + count + " arguments but received " + (params.length-1) + ".\n`" + commandInfo[params[0]]["syntax"] + "`");
    return true;
  }
  return false;
}

function pcheckHex (message, params, cparams) {
  if (!/^#([a-fA-F0-9]{6})$/.test(params[cparams[0]])) {
    message.channel.send("Argument " + cparams[0] + " is not a valid hex code.\n`" + commandInfo[params[0]]["syntax"] + "`");
    return true;
  }
  return false;
}

function pcheckMaxlen (message, params, cparams) {
  if (params[cparams[0]].length > cparams[1]) {
    message.channel.send("Argument " + cparams[0] + " must be " + cparams[1] + " characters or less.\n`" + commandInfo[params[0]]["syntax"] + "`");
    return true;
  }
  return false;
}

module.exports = {
  commandInfo,
  help,
  pcheckCount,
  pcheckHex,
  pcheckMaxlen
};