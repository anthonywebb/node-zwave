var iface = require('../interface');
var defs = require('./definitions');

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

function addNodeToNetwork(nodeId, cb) {
  console.log('Adding node to network ' + nodeId);

  var command = [
    0x01,
    0x04, // Length, including checksum which is added after
    0x00,
    defs.ADD_NODE_TO_NETWORK,
    nodeId
  ];

  var promise = iface.sendMessage(command, listener);
  if(typeof callback === 'function') {
    promise.then(callback);
  }
  return promise;

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
        returnInfo.id = nodeId;
        
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
  getNodeSupportedClasses: getNodeSupportedClasses
}