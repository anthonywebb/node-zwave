var cc = require('./command_classes/');
// var funcs = require('./functions/');
var iface = require('./interface');
var functions = require('./functions/functions');

var zwave = {};

// Basic functions
zwave.getNodes = functions.getNodes;
zwave.getNodeAbilities = functions.getNodeAbilities;
zwave.getNodeInfo = functions.getNodeInfo;
zwave.getNodeProtocol = functions.getNodeProtocol;
zwave.getNodeSupportedClasses = functions.getNodeSupportedClasses;
zwave.associateNode = functions.associateNode;
zwave.sendData = functions.sendData;

zwave.connect = iface.connect;
zwave.thermostat = cc.thermostat;

module.exports = zwave;

