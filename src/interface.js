/**
*  Interface for communicating with zwave controller
*/
var globals = require('./globals');
var Q = require('q');
var moment = require('moment');

var currentCallbackId = 1;
var currentState = 'ready'; // ready || pendingAck || pendingResponse
var pendingRequests = []; // If current state is not ready, store pending requests here. First in first out.
var currentRequest = null; // The current request

var serialPort = null;
var messageHandler = {}; // Object to export
var SerialPort = require("serialport").SerialPort;

function createCallbackId() {
  currentCallbackId++;
  if(currentCallbackId > 255) {
    currentCallbackId = 1;
  }
  return currentCallbackId;
}

function generateChecksum(data) {
  var offset = 0; // Initialize this to 0xFF and no need to NOT result below
  ret = data[offset];
  for (var i = offset; i < data.length; i++) {
    // Xor bytes
    ret ^= data[i];
  }
  ret = ~ret;
  return ret;
}

function runPendingRequest() {
  //console.log('Running pending request...');
  //console.log(pendingRequests);
  if(pendingRequests.length) {
    var request = pendingRequests.shift();
    messageHandler.sendMessage(request.message, request.responseType, request.listener, request.deferred);
  }
}

messageHandler.connect = function(serialPortAddress, callback) {
  var deferred = Q.defer();
  if(typeof serialPortAddress === 'undefined') {
    serialPortAddress = "/dev/tty.SLAB_USBtoUART"
  }
  if(typeof serialPortAddress === 'function') {
    callback = serialPortAddress;
    serialPortAddress = "/dev/tty.SLAB_USBtoUART";
  }
  serialPort = new SerialPort(serialPortAddress, {
    baudrate: 115200
  });

  serialPort.on("open", function () {
    if(typeof callback == 'function') {
      callback(serialPort);
    }
    console.log('Connected to zwave stick...');

    serialPort.on('data', function(data) {
      listener(data);
    });
    deferred.resolve(serialPort);
  });
  return deferred.promise;
}

messageHandler.sendMessage = function(messageArray, responseType, listener, isPending, useCallback) {
  var deferred = Q.defer();
  
  if(typeof responseType === 'function') {
    listener = responseType;
    responseType = 'response';
  }
  if(currentState !== 'ready') {
    //console.log('Adding request to pending requests...');
    pendingRequests.push({
      message: messageArray,
      responseType: responseType,
      listener: listener,
      deferred: deferred // will need this when you call back later
    });
    return deferred.promise; // have to return the promise so we know which request to call back
  }
  currentState = 'pendingAck';
  
  if(useCallback) {
    messageArray.push(createCallbackId());
  }
  messageArray.push(generateChecksum(messageArray));
  messageArray[1] = messageArray.length - 2;
  
  var logmsg = 'Sending message to zwave controller';
  
  // pending requests have a different promise to worry about
  if(isPending){
      deferred = isPending;  
      logmsg = 'Sending queued messages to zwave controller';
  }
  
  currentRequest = {
        responseType: responseType,
        defer: deferred,
        time: moment(),
        listener: listener
  }
  
  console.log(logmsg);
  console.log(messageArray);
  
  var buffer = new Buffer(messageArray);
  serialPort.write(buffer);
  return deferred.promise;
}

messageHandler.sendAck = function() {
  serialPort.write(new Buffer([globals.ACK]));
}

function listener(data) {
  console.log('Receiving data from zwave controller');
  console.log(data);
  
  // TODO: sometimes the data will come bundled with a leading ack, if so we need to strip it
  if(data[0] == globals.NAK) {
    currentRequest.defer.resolve(false);
    currentState = 'ready';
    currentRequest = null;
    runPendingRequest()
  }
  else if(data[0] == globals.ACK) {
    console.log('Received ACK for request');
    if(currentRequest.responseType == 'none') {
      currentRequest.defer.resolve(true);
      currentState = 'ready';
      currentRequest = null;
      runPendingRequest()
      return;
    }
    else {
      currentState = 'pendingResponse';
    }
  }
  else if(currentState == 'pendingResponse') {
    console.log('Received response for request');
    messageHandler.sendAck();
    currentRequest.listener(data);
    currentRequest.defer.resolve(data);
    currentState = 'ready';
    currentRequest = null;
    runPendingRequest();
    return;
  }
  else {
    console.log('Catch broadcasted events here: '+moment().format('MMMM Do YYYY, h:mm:ss a'));
    messageHandler.sendAck();
    
    // lets parse out this packet and try and figure out what it is:
    
    // these are the door open/close for nodeid 3: 
    // <Buffer 01 09 00 04 00 03 03 20 01 ff 2c>
    // <Buffer 01 09 00 04 00 03 03 20 01 00 d3>
    if(data[3]==0x04 && data.length==11){
        var currentVal = (data[10] == 211 ? 0 : 255); // 0x00 == 211, which is closed, else the door is open
        var emitVal = {nodeid:parseInt(data[5],16),value:currentVal};
        console.log(emitVal);
    }
    
    // these are energy reports for the HEM nodeid 3:  / 
    // <Buffer 01 18 00 04 00 02 12 60 0d 02 00 32 02 21 64 00 00 00 00 02 d0 00 00 00 00 3b>
    // <Buffer 01 18 00 04 00 02 12 60 0d 02 00 32 02 21 74 00 04 a4 16 00 00 00 00 00 00 4f>
    // <Buffer 01 18 00 04 00 02 12 60 0d 01 00 32 02 21 64 00 00 00 00 02 d0 00 00 00 00 38>
    // <Buffer 01 18 00 04 00 02 12 60 0d 02 00 32 02 21 74 00 03 c3 5c 00 00 00 00 00 00 65>
    // <Buffer 01 14 00 04 00 04 0e 32 02 21 74 00 2b 47 7e 00 00 00 00 00 00 92>
    // <Buffer 01 14 00 04 00 04 0e 32 02 21 74 00 2b 57 64 00 00 00 00 00 00 98>
    // <Buffer 01 14 00 04 00 04 0e 32 02 21 74 00 2b 71 9a 00 00 00 00 00 00 40>
    
    if(data[7]==0x32 && data.length==22){
        console.log('looks like a meter reading');
        // data[10] has the precision(3bits)/scale(2bits)/size(3bits)
        var x = pad(toBinary(parseInt(data[10], 10)),8);
        //console.log(parseInt(data[10], 10)+' = '+x);
        var precision = Bin2Dec(x.substring(0, 3));
        var scale = Bin2Dec(x.substring(3, 5));
        var size = Bin2Dec(x.substring(5));
        console.log('precision:'+precision+' scale:'+scale+' size:'+size);
        
        // grab the next x hex to concat and find  our reading
        var reading = '';
        for(var i=11; i < 11+parseInt(size); i++){
            var thisReading = pad(toBinary(parseInt(data[i], 10)),8);
            //console.log(parseInt(data[i], 10)+' = '+x);
            reading = reading + thisReading;
        }
        //console.log(reading);
        var emitVal = Bin2Dec(reading);
        emitVal /= Math.pow(10, precision); // move the decimal over
        console.log(emitVal);
        
    }
    
    // Catch broadcasted events here...
  }
}

function toBinary(Decimal){
 var bnum = 0, bexp = 1, digit = 0, bsum = 0;
 while(Decimal > 0){
  digit = Decimal % 2;
  Decimal = Math.floor(Decimal / 2);
  bsum = bsum + digit * bexp;
  bexp = bexp * 10;
 }
 return(bsum);
}
function checkBin(n){return/^[01]{1,64}$/.test(n)}
function checkDec(n){return/^[0-9]{1,64}$/.test(n)}
function checkHex(n){return/^[0-9A-Fa-f]{1,64}$/.test(n)}

function pad(s,z){s=""+s;return s.length<z?pad("0"+s,z):s}

//Decimal operations
function Dec2Bin(n){if(!checkDec(n)||n<0)return 0;return n.toString(2)}
function Dec2Hex(n){if(!checkDec(n)||n<0)return 0;return n.toString(16)}

//Binary Operations
function Bin2Dec(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(10)}
function Bin2Hex(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(16)}

//Hexadecimal Operations
function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}
function Hex2Dec(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(10)}

module.exports = messageHandler;