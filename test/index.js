function cesar(str, shift, action) {
    let alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    alphabet += alphabet.toUpperCase();

    let result = '';
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (alphabet.includes(char)) {
            let charIndex = alphabet.indexOf(char);
            if (action === 'encode') {
                charIndex = (charIndex + shift) % alphabet.length;
            } else if (action === 'decode') {
                charIndex = Math.abs((charIndex - shift)) % alphabet.length;
            }
            result += alphabet[charIndex];
        } else {
            result += str[i];
        }
    }
    return result;
}

let originalMessage = 'эзтыхз фзъзъз';
for (let i = 0; i < 100; i++) {
    let encryptedMessage = cesar(originalMessage, i, 'decode'); 
    console.log(encryptedMessage, i)
}

// хакуна матата shift = 8