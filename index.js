module.exports = function (pem) {
    if (typeof pem !== 'string') pem = String(pem);
    var m = /^-----BEGIN RSA (PRIVATE|PUBLIC) KEY-----/.exec(pem);
    if (!m) return undefined;
    var type = m[1].toLowerCase();
    
    if (pem.split('\n').slice(-2)[0] !== '-----END RSA ' + m[1] + ' KEY-----') {
        return undefined;
    }
    
    var buf = Buffer(pem.split('\n').slice(1,-2).join(''), 'base64');
    var field = {};
    var size = {};
    var offset = {
        private : 7,
        public : 3,
    }[type];
    
    function read () {
        var s = buf.readUInt8(offset + 1);
        
        if (s & 0x80) {
            offset ++;
            s = buf.readUInt8(offset + 1);
        }
        
        offset += 2;
        
        var b = buf.slice(offset, offset + s);
        offset += s;
        return b;
    }
    
    field.modulus = read();
    
    field.bits = (field.modulus.length - 1) * 8 + Math.ceil(
        Math.log(field.modulus[0] + 1) / Math.log(2)
    );
    field.publicExponent = parseInt(read().toString('hex'), 16);
    
    if (type === 'private') {
        field.privateExponent = read();
        field.prime1 = read();
        field.prime2 = read();
        field.exponent1 = read();
        field.exponent2 = read();
        field.coefficient = read();
    }
    
    return field;
};
