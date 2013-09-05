var cc = require('./command_classes/');
var iface = require('./interface');
var functions = require('./functions/functions');

var EventEmitter = require('events').EventEmitter;
EVENTS = new EventEmitter();

var zwave = {};

// Basic functions
zwave.getNodes = functions.getNodes;
zwave.getNodeAbilities = functions.getNodeAbilities;
zwave.getNodeInfo = functions.getNodeInfo;
zwave.getNodeProtocol = functions.getNodeProtocol;
zwave.getNodeSupportedClasses = functions.getNodeSupportedClasses;
zwave.associateNode = functions.associateNode;

zwave.connect = iface.connect;
zwave.thermostat = cc.thermostat;
zwave.energyMonitor = cc.energyMonitor;

module.exports = zwave;

