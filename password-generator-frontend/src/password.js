// Algorithms for generating keys and passwords

// Generate Random Keys
function generateRandoms(unpermitted) {
    let randoms = new Object()
    randoms.key = Math.random().toString(36).slice(2) 
    let specialChars = ['!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '{', '|', '}', '~', '\'', '\"']
    unpermitted.forEach(element => {
        let index = specialChars.indexOf(element)
        if (index > -1) {
        specialChars.splice(index, 1)
        }
    })
    randoms.specialChar = specialChars[Math.floor(Math.random()*specialChars.length)];
    randoms.digit = (Math.floor(Math.random() * 9) + 1).toString() ;
    
    let min = 2
    let max = 4
    randoms.charFrequency = Math.floor(Math.random()*(max-min+1)+min);
    randoms.digitFrequency = Math.floor(Math.random()*(max-min+1)+min);
    return randoms
}

function generatePassword(keyword, key, specialChar, charFrequency, digit, digitFrequency, unpermitted, passwordMin, passwordMax) {
    const bf = new Blowfish(key);
    const encrypted = bf.base64Encode(bf.encrypt(keyword))
    let charAdded = splitString(encrypted, charFrequency).join(specialChar)
    let digitAdded = splitString(charAdded, digitFrequency).join(digit)
    let final = digitAdded;
    if (digitAdded.length < passwordMin) {
        let filler = specialChar.repeat(passwordMin - digitAdded.length)
        final += filler
    } else if (digitAdded.length > passwordMax) {
        final = digitAdded.slice(0, passwordMax)
    }
    final = final.split("")
    unpermitted.forEach(element => {
        let index = final.indexOf(element)
        while (index > -1){
            final.splice(index, 1)
            index = final.indexOf(element)
        }
    })
    final = final.join("")
    return final
}

// Helper function for generatePasswords()
function splitString(str, n) {
    let parts = [];
    let i;
    let len;
    for(i = 0, len = str.length; i < len; i += n) {
       parts.push(str.substr(i, n))
    }
    return parts
}
