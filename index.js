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
  
  // CONFIGURE THE HEM TO REPORT EVERY 30 SECONDS AS PER THE TECH PDF
  //zwave.sendConfigData(2,[0x70,0x04,0x65,0x04,0x00,0x00,0x00,0x04],function(reply){console.log(reply);}); //have group 1 report watts automatically 
  //zwave.sendConfigData(2,[0x70,0x04,0x6f,0x04,0x00,0x00,0x00,0x05],function(reply){console.log(reply);}); //set the reporting interval
  //zwave.sendConfigData(2,[0x70,0x04,0xFF,0x01,0x00],function(reply){console.log(reply);}); //reset to default values
  
  // PULL POWER DATA
  //zwave.sendData(2,[0x31,0x04],function(reply){console.log(reply);}); // SENSOR_MULTILEVEL_REPORT for the entire unit // <Buffer 01 0e 00 04 00 02 08 31 05 04 64 00 0b 72 78 aa>
  zwave.sendData(2,[0x32,0x01],function(reply){console.log(reply);}); // METER_REPORT for the entire unit // <Buffer 01 14 00 04 00 02 0e 32 02 21 74 00 0b 58 b0 00 00 00 00 00 00 65>
  
  //zwave.associateNode(2,function(node){console.log(node);});
  //zwave.getNodeProtocol(2,function(node){console.log(node);});
  //zwave.getNodeProtocol(3,function(node){console.log(node);});
  //zwave.getNodeAbilities(2);
  //zwave.getNodeAbilities(3);
  //zwave.getNodeAbilities(4);
  //zwave.getNodeAbilities(5);
  //zwave.thermostat.setMode(5,'heat');
  //zwave.thermostat.setSetpoint(5, 62, 'heating');
  
}).catch(function (error) {console.log(error)});