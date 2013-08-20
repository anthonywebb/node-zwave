var iface = require('../interface');
var defs = require('./definitions');

function sendData(nodeId,cmd,cb) {
    console.log('Sending command data');

    var command = [
        0x01,
        0x00, // calculated after we get a command
        0x00,
        defs.DATA,
        nodeId, // nodeid
        2 // This was required to get the HEM get value call working, probably breaks other stuff
    ];
    
    command = command.concat(cmd);
    command.push(0x05);
    command.push(0x03);
    
    command[1] = parseInt(command.length-1);
    
    console.log(command);
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        cb(data);
    });

}

function sendRequestData(nodeId,cmd,cb) {
    console.log('Sending command data');

    var command = [
        0x01,
        0x00, // calculated after we get a command
        0x00,
        defs.DATA,
        nodeId, // nodeid
        3 // This was required to get the HEM get value call working
    ];
    
    command = command.concat(cmd);
    command.push(0x05);
    command.push(0x03);
    
    command[1] = parseInt(command.length-1);
    
    console.log(command);
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        cb(data);
    });

}

function sendConfigData(nodeId,cmd,cb) {
    console.log('Sending command data');

    var command = [
        0x01,
        0x00, // calculated after we get a command
        0x00,
        defs.DATA,
        nodeId, // nodeid
        4+cmd[3] // This was required to get the HEM configuration working, probably breaks other stuff
    ];
    
    command = command.concat(cmd);
    command.push(0x05);
    command.push(0x03);
    
    command[1] = parseInt(command.length-1);
    
    console.log(command);
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        cb(data);
    });

}

function getNodes(cb) {
    console.log('Getting list of nodes');

    var command = [
        0x01,
        0x04, // Length, including checksum which is added after
        0x00,
        defs.GET_NODES,
        0xFE
    ];
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){
        // Decode the nodes in the bitmask (byte 8 - 36)
        var nodesFound = [];
        if(data.length > 7){
            for(var i=7; i<36; i++){
                var base = ((i-7)*8)+1;
                
                for (var j = 0; j < 8; j++) {
                    if((data[i] >> j) & 1) {
                        nodesFound.push(base+j);
                    }
                }
            }
        }
        
        cb(nodesFound);
    });

}

function getNodeAbilities(nodeId, cb) {
  console.log('Getting node abilities for node ' + nodeId);

  var command = [
    0x01,
    0x04, // Length, including checksum which is added after
    0x00,
    defs.GET_NODE_ABILITIES,
    nodeId
  ];

  var promise = iface.sendMessage(command, listener);
  if(typeof callback === 'function') {
    promise.then(callback);
  }
  return promise;

}

function getNodeInfo(nodeId, cb) {
  console.log('Getting node info for node ' + nodeId);

  var command = [
    0x01,
    0x04, // Length, including checksum which is added after
    0x00,
    defs.GET_NODE_INFO,
    nodeId
  ];

  var promise = iface.sendMessage(command, listener);
  if(typeof callback === 'function') {
    promise.then(callback);
  }
  return promise;

}

function getNodeProtocol(nodeId, cb) {
    console.log('Getting node protocol for node ' + nodeId);
    
    var command = [
    0x01,
    0x04, // Length, including checksum which is added after
    0x00,
    defs.GET_NODE_PROTOCOL,
    nodeId
    ];
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){

        var returnInfo = defs.DEVICE_TYPE[data[8]];
        returnInfo.nodeid = nodeId;
        
        console.log(returnInfo);
        if(typeof cb === 'function') {
            cb(returnInfo);
        }
    }).catch(function (error) {
        console.log(error);
    });

}

function associateNode(nodeId, cb) {
    console.log('Adding node to network ' + nodeId);
    
    var command = [
        0x01, // SOC
        0x0B, // length (11), including the checksum which is added later
        0x00, // request
        defs.DATA, // sending data
        nodeId, // nodeid
        0x04, // ??
        0x85, // COMMAND_CLASS_ASSOCIATION
        0x01, // ASSOCIATION_SET
        0x01, // _groupIdx
        0x01, // _targetNodeId
        0x05, // ??
        0x03 // ??
    ];
    
    var promise = iface.sendMessage(command, 'request', listener);
    promise.then(function(data){

        var returnInfo = data;
        
        console.log(returnInfo);
        if(typeof cb === 'function') {
            cb(returnInfo);
        }
    }).catch(function (error) {
        console.log(error);
    });

}

function getNodeSupportedClasses(nodeId, cb) {
  console.log('Getting node supported classes for node ' + nodeId);

  var command = [
    0x01,
    0x04, // Length, including checksum which is added after
    0x00,
    defs.GET_NODE_SUPPORTED_CLASSES,
    nodeId
  ];

  var promise = iface.sendMessage(command, listener);
  if(typeof callback === 'function') {
    promise.then(callback);
  }
  return promise;

}

function listener(data) {
  console.log('Function response...');
  console.log(data);
}


module.exports = {
  getNodes: getNodes,
  getNodeAbilities: getNodeAbilities,
  getNodeInfo: getNodeInfo,
  getNodeProtocol: getNodeProtocol,
  getNodeSupportedClasses: getNodeSupportedClasses,
  associateNode: associateNode,
  sendData: sendData,
  sendConfigData: sendConfigData,
  sendRequestData: sendRequestData
}