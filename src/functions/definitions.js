var d = {};

d.GET_NODES = 0x02;
d.APP_DATA = 0x04; // this does not look to be correct?
d.DATA = 0x13;
d.GET_NETWORK_ID = 0x20; // this does not look to be correct?
d.GET_NODE_PROTOCOL = 0x41;
d.GET_NODE_ABILITIES = 0x49; // this does not look to be correct?
d.GET_NODE_SUPPORTED_CLASSES = 0x49; // this does not look to be correct?
d.GET_NODE_INFO = 0x60;
d.ADD_NODE_TO_NETWORK = 0x4a;
d.REMOVE_NODE_FROM_NETWORK = 0x4a;

d.DEVICE_TYPE = {0x01:{type:'basic controller'},
                0x02:{type:'static controller'},
                0x03:{type:'basic slave'},
                0x04:{type:'routing slave'},
                0x08:{type:'thermostat'},
                0x10:{type:'switch'},
                0x11:{type:'dimmer'},
                0x12:{type:'basic switch remote'},
                0x13:{type:'basic switch toggle'},
                0x17:{type:'generic security panel'},
                0x20:{type:'binary sensor'},
                0x21:{type:'multilevel sensor'},
                0x31:{type:'meter'}
                };

module.exports = d;