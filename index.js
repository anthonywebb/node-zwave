var zwave = require('./src/node-zwave');

var promise = zwave.connect();

promise.then(function(connection) {
  console.log("I connected! Sweet!");
  //console.log(zwave);
  
  /*
  var nodes = zwave.getNodes();
  nodes.then(function(data){
    console.log('woot! '+data);
  });
  

  zwave.getNodes(function(data){
    //console.log('Woot!! '+data);
    //console.log(data);
    //console.log(data.length);
    for(var i=0;i<data.length;i++){
        //console.log('looking for' +i+ ': '+data[i])
        zwave.getNodeProtocol(data[i],function(node){console.log(node);});
    }
  });
  */
  
  zwave.addNodeToNetwork(3,function(node){console.log(node);});
  //zwave.getNodeProtocol(2,function(node){console.log(node);});
  //zwave.getNodeProtocol(3,function(node){console.log(node);});
  //zwave.getNodeAbilities(2);
  //zwave.getNodeAbilities(3);
  //zwave.getNodeAbilities(4);
  //zwave.getNodeAbilities(5);
  //zwave.thermostat.setMode(5,'heat');
  //zwave.thermostat.setSetpoint(5, 62, 'heating');
  
}).catch(function (error) {console.log(error)});