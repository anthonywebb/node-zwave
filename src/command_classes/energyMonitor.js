
var fdefs = require('../functions/definitions');
var globals = require('../globals');
var iface = require('../interface');

var energyMonitor = {};

// Define constants

// HEM command classes
var COMMAND_CLASS_CONFIGURATION = 0x70;
var COMMAND_CLASS_SENSOR_MULTILEVEL = 0x31;
var COMMAND_CLASS_METER = 0x32;
var CONFIGURATION_SET = 0x04;
var CONFIGURATION_GET = 0x05;

var INTERVAL_GROUPS = [
  110,
  111,
  112,
  113
];

var REPORT_GROUPS = [
  100,
  101,
  102,
  103
];

var REPORT_TYPES = {
  watt: 0x04,
  kwh:  0x08
};

/*******************************************************************************
  Getters
*******************************************************************************/

/**
 * Get the multilevel report of the entire HEM
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.getMultilevelReport = function(nodeId, callback) {
    var command = [
        COMMAND_CLASS_SENSOR_MULTILEVEL,
        0x04 //SENSOR_MULTILEVEL_GET
    ];
    
    command = prepData(nodeId,command,'send');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        callback(data);
    });
    return promise; // not sure if this promise works?
}

/**
 * Get the meter report for the entire HEM
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.getMeterReport = function(nodeId, callback) {
    var command = [
        COMMAND_CLASS_METER,
        0x01 //METER_GET
    ];
    
    command = prepData(nodeId,command,'send');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        callback(data);
    });
    return promise; // not sure if this promise works?
}

/**
 * Get the voltage the HEM is currently set to
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.getVoltage = function(nodeId, callback) {
    //zwave.sendRequestData(4,[0x70,0x05,0x01],function(reply){
    //  console.log('BBBBBBBOOOOOOOOOOOOOOOOOOOMMMMMMMMM!!!!!!!!!!!');
    //  console.log(reply);
    //  
    //}); //get param 1 (voltage)
    
    
    var paramId = 1; // voltage param
    
    var command = [
        COMMAND_CLASS_CONFIGURATION,
        CONFIGURATION_GET,
        paramId
    ];
    
    command = prepData(nodeId,command,'request');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        //<Buffer 01 0c 00 04 00 04 06 70 06 01 02 00 6e ee> // 110 volts (6e)
        //<Buffer 01 0c 00 04 00 04 06 70 06 01 02 00 78 f8> // Aftter setting to 120
        callback(data);
    });
    return promise; // not sure if this promise works?
}


/*******************************************************************************
  Setters
*******************************************************************************/

/**
 * Set the voltage of the HEM
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Number} voltage    The voltage to set it to, note, this is usually 120 for USA, or 240 outside the USA
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.setVoltage = function(nodeId, voltage, callback) {
    var paramId = 1; // voltage param
    var paramLength = 2;
    
    var command = [
        COMMAND_CLASS_CONFIGURATION,
        CONFIGURATION_SET,
        paramId, 
        paramLength, 
        0x00,    // MSB
        voltage  // LSB
    ];
    
    command = prepData(nodeId,command,'config');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        callback(data);
    });
    return promise; // not sure if this promise works?
}

/**
 * Resets the configuration of the HEM
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.resetConfiguration = function(nodeId) {
    var paramId = 255; // reset param
    var paramLength = 1;
    
    var command = [
        COMMAND_CLASS_CONFIGURATION,
        CONFIGURATION_SET
        paramId, 
        paramLength, 
        0x00  // ??
    ];
    
    command = prepData(nodeId,command,'config');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        callback(data);
    });
    return promise; // not sure if this promise works?
}

/**
 * Resets the configuration of the HEM
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Number} group      The group you would like to set the interval for (1,2, or 3)
 * @param {Number} seconds    The number of seconds between auto reports, default is 720, ma you can set till I fix this up is 255
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.setReportingInterval = function(nodeId, group, seconds) {
    var paramId = INTERVAL_GROUPS[group];
    var paramLength = 4;
    
    var command = [
        COMMAND_CLASS_CONFIGURATION,
        CONFIGURATION_SET
        paramId, 
        paramLength, 
        0x00,   // MSB
        0x00,
        0x00,
        seconds // LSB TODO: fix this so you can use the full 4 bytes ansd go above 255 seconds
    ];
    
    command = prepData(nodeId,command,'config');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        callback(data);
    });
    return promise; // not sure if this promise works? 
}

/**
 * Resets the configuration of the HEM
 * @param {Number} nodeId     The node ID of the HEM
 * @param {Number} group      The group you would like to set the interval for (1,2, or 3)
 * @param {Number} report     Which report to send to that group (watt or kwh)
 * @param {Function} [callback] Callback is optional. A promise is returned
 */
energyMonitor.addReportToGroup = function(nodeId, group, report) {
    var paramId = REPORT_GROUPS[group];
    var paramLength = 4;

    var command = [
        COMMAND_CLASS_CONFIGURATION,
        CONFIGURATION_SET
        paramId, 
        paramLength, 
        0x00,   // MSB reserved
        0x00,   // reserved
        0x00,   // see page 6 of the engineering spec from aeon labs, this byte bit 0-5 allows for automatic individual clamp readings
        REPORT_TYPES[report] // see page 6 of the engineering spec from aeon labs, this byte bit 0-3 allows for automatic overall readings
    ];
    
    command = prepData(nodeId,command,'config');
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        callback(data);
    });
    return promise; // not sure if this promise works? 
}

energyMonitor.enableDeltaReporting = function(nodeId) {
    // TODO: zwave.sendRequestData(4,[0x70,0x04,0x03,0x00,0x00],function(reply){console.log(reply);}); // Turn on Delta function of the whole HEM

}

// helper method to prepare the command packets to send
function prepData(nodeId,cmd,type) {
    var mysteryVal = 0;
    if(type=='config'){
        mysteryVal = 4+cmd[3];
    } 
    else if(type=='send'){
        mysteryVal = 2;
    }
    else if(type=request){
        mysteryVal = 3;
    }
    
    var command = [
        0x01,
        0x00, // length, calculated after we get a command
        0x00, // I believe this signifies it is a request?
        defs.DATA,
        nodeId, // nodeid
        mysteryVal // This was required to get the HEM configuration working, probably breaks other stuff
    ];
    
    command = command.concat(cmd);
    command.push(0x05);
    command.push(0x03);
    
    command[1] = parseInt(command.length-1);
    
    return command;
}

/*******************************************************************************
  Listener - handles responses from zwave controller
*******************************************************************************/

function listener(data) {
  console.log('Energy monitor response received...');
  console.log(data);
}

module.exports = energyMonitor;

