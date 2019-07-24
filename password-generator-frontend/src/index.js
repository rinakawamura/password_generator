

const BASE_URL = "http://localhost:3000"

document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem('user_id')){
        const user_id = localStorage.getItem('user_id')
        fetch(`${BASE_URL}/users/${user_id}`).then(res=> res.json()).then(user => {
            displayHomePage(user)
        })
     } else {
        displayLogin()
    }
    
})

function displayLogin() {
    let main = document.querySelector('main')
    main.innerHTML = `
    <form>
        <input type="email" name="email"/>
        <input type="submit"/>
    </form>`

    const loginForm = document.querySelector('form')
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const email = e.target[0].value
        fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": 'application/json'
            },
            body: JSON.stringify({
              "email": email
            })
        }).then(res => res.json()).then(data => {
            if (data.id) {
                localStorage.setItem("user_id", data.id)
                displayHomePage(data)
            } else {
                console.log(data.error)
                if (!document.getElementById('error-msg')) {
                    let errorMsg = document.createElement('h4')
                    errorMsg.id = 'error-msg'
                    errorMsg.innerText = data.error
                    main.appendChild(errorMsg)
                }
            }   
        })
    })
}

function displayHomePage(user) {
    let main = document.querySelector('main')
    main.innerHTML = `${user.name}
    <button id="logout">Logout</button>`

    let websiteForm = document.createElement('form')
    websiteForm.innerHTML = `
        <h3> Website Details</h3>
        Website Name<input type="text" name="name"/>
        Website URL<input type="text" name="url"/>
        <br>
        <h3> Password Details</h3>
        Minimum Password Length 
        <div class="slidecontainer">
        <input type="range" name="rangeInput" min="1" max="50" value="8" onchange="updateMinSlider(this.value);">
        <p id="display-min" style="display:inline;">8</p>
         </div>
        Maximum Password Length
        <div class="slidecontainer">
        <input type="range" name="rangeInput" min="1" max="128" value="128" onchange="updateMaxSlider(this.value);">
        <p id="display-max" style="display:inline;">128</p>
        </div>
        <input type="submit"/>
    `

    websiteForm.addEventListener('submit', e => {
        e.preventDefault()
        
        const name = e.target[0].value
        const url = e.target[1].value
        const password_min = e.target[2].value
        const password_max = e.target[3].value
        
        fetch (`${BASE_URL}/websites`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            }, 
            body: JSON.stringify({
                "name": name,
                "url": url,
                "password_min": password_min,
                "password_max": password_max,
                "key": generateRandoms().key,
                "special_char": generateRandoms().special_char,
                "digit": generateRandoms().digit,
                "char_frequency": generateRandoms().char_frequency,
                "digit_frequency": generateRandoms().digit_frequency,
                "user_id": user.id
            })
        }).then(resp => resp.json()).then(data => {
            console.log(data)
            let unpermittedChars = document.createElement('p')
            unpermittedChars.innerText = "Unpermitted Special Characters:"
            if (data.chars_not_permitted.length === 0){
                unpermittedChars.innerText += " none"
            } else {
                data.chars_not_permitted.forEach(char => {
                    unpermittedChars.innerText += ` ${char}`
                })
           }

            main.innerHTML = `
            <h1>${data.name}</h1>
            <a href=${data.url}>Visit Website</a>
            <br><br>
            <h3>Password Details:</h3>
            <p>Minimum Password Length: ${data.password_min}</p>
            <p>Maximum Password Length: ${data.password_max}</p>
            `
            main.appendChild(unpermittedChars)

            main.innerHTML += `
            <br><h3>Enter a key word/phrase to get your password</h3>
            <input type="text" id="keyword"> <p style="display:inline;"> <-- Don't forget this key 
            <br><br>`

            // Button to Generate Password
            let passwordButton = document.createElement('button')
            passwordButton.classList.add("display-password")
            passwordButton.innerText = "Get Password"
            main.appendChild(passwordButton)

            passwordButton.addEventListener('click', e => {
                main.innerHTML += `<h3>Password: ${generatePassword(document.getElementById("keyword").value, data.key, data.special_char, data.char_frequency, data.digit, data.digit_frequency, data.password_min, data.password_max)}</h3>`
            })
        })

        
    })

    main.appendChild(websiteForm)



    const logoutButton = document.getElementById('logout')
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user_id')
        displayLogin()
    })
}

function generateRandoms() {
    let randoms = new Object()
    randoms.key = Math.random().toString(36).slice(2) 
    let special_chars = ['!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~', '\'', '\"']
    randoms.special_char = special_chars[Math.floor(Math.random()*special_chars.length)];
    randoms.digit = (Math.floor(Math.random() * 9) + 1).toString() ;
    
    let min = 2
    let max = 4
    randoms.char_frequency = Math.floor(Math.random()*(max-min+1)+min);
    randoms.digit_frequency = Math.floor(Math.random()*(max-min+1)+min);
    return randoms
}

function updateMinSlider(val) {
    document.getElementById('display-min').innerText=val;
}

function updateMaxSlider(val) {
    document.getElementById('display-max').innerText=val;
}

function generatePassword(keyword, key, specialChar, charFrequency, digit, digitFrequency, passwordMin, passwordMax) {
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

    return final
}

function splitString(str, n) {

    let parts = [];
    let i;
    let len;

    for(i = 0, len = str.length; i < len; i += n) {
       parts.push(str.substr(i, n))
    }

    return parts
}