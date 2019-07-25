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

// Display Login
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

// Display Home Page 
function displayHomePage(user) {
    let main = document.querySelector('main')
    main.innerHTML = `${user.name}
    <button id="logout">Logout</button>`

    // Div element to display all of the user's websites
    let webList = document.createElement('div')
    webList.id = "website-list"
    let uList = document.createElement('ul')

    // Fetch request to get all websites
    fetch(`${BASE_URL}/websites`).then(resp => resp.json()).then(data => {
        data.forEach(website => {
            if (website.user_id === user.id) {
                uList.innerHTML += `<li class="list-item" data-id=${website.id}>${website.name}</li>`
            }
        })
    })

    // Display websites within 'webList' div element
    webList.appendChild(uList)
    main.appendChild(webList)

    // Div element to display website details 
    let webDetails = document.createElement('div')
    webDetails.id = "web-details"

    uList.addEventListener('click', e => {
        if (e.target.classList.contains('list-item')) {
            // Fetch single website data
            fetch(`${BASE_URL}/websites/${e.target.dataset.id}`).then(resp => resp.json()).then(website => {

                // Website Name and Link
                let mainDetails = document.createElement('div')
                mainDetails.id = "main-details"
                mainDetails.innerHTML = `
                <h2>${website.name}</h2>
                <p><a href=${website.url}>${website.url}</a></p>
                <br>`
                webDetails.innerHTML = ""
                webDetails.appendChild(mainDetails)


                // Website Subdetails (Will change based on action)
                let subDetails = document.createElement('div')
                subDetails.id = "sub-details"

                webDetails.appendChild(subDetails) 
                main.appendChild(webDetails)

                webSubDetails(website)
            })  
        }
    })

    const logoutButton = document.getElementById('logout')
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user_id')
        displayLogin()
    })
}

// Function to get website subdetails
function webSubDetails(website) {

    if (document.getElementById('back-button')){
        document.getElementById('back-button').remove()
    }

    let subDetails = document.getElementById('sub-details')
    
    // Display Password Requirements of Website
    subDetails.innerHTML = `
    <h3>Password Requirements</h3>
    <p>Minimum Password Length: ${website.password_min}</p>
    <p>Maximum Password Length: ${website.password_max}</p>`

    let unpermittedChars = document.createElement('p')
    unpermittedChars.innerText = "Unpermitted Special Characters:"
    if (website.chars_not_permitted.length === 0){
        unpermittedChars.innerText += " none"
    } else {
        website.chars_not_permitted.forEach(char => {
            unpermittedChars.innerText += ` ${char}`
        })
    }  
    subDetails.appendChild(unpermittedChars)


     // Fetch accounts belonging to website
     subDetails.innerHTML += "<br><br><h3>Accounts</h3>"
     fetch(`${BASE_URL}/accounts`).then(resp => resp.json()).then(accounts=> {
        if (accounts.length === 0) {
            subDetails.innerHTML += "<p>No Accounts Created</p>"
        } else {
            subDetails.innerHTML += "<p>Select Account by Username</p>"

            // Form to select account and submit
            let accountForm = document.createElement('form')
            accountForm.id = "account-form"

            // Add account options to select
            let select = document.createElement('select')
            select.id = "account-select"

            accounts.forEach(account => {
                if (account.website_id === website.id){
                    select.innerHTML += `<option value=${account.username} data-id=${account.id}>${account.username}</option>`
                }
            })
            accountForm.appendChild(select)

            let submitButton = document.createElement('input')
            submitButton.id = "account-submit"
            submitButton.type="submit"
            submitButton.value="Get Account Password"
            accountForm.appendChild(submitButton)

            subDetails.appendChild(accountForm)

            accountForm.addEventListener('submit', e => {
                e.preventDefault();
                let selectedIndex = e.target[0].options["selectedIndex"]
                let accountId = e.target[0].options[selectedIndex].dataset.id
                // Fetch account
                fetch(`${BASE_URL}/accounts/${accountId}`).then(resp=> resp.json()).then(account => {
                    // Function to alter subDetails to display account stuff
                    displayAccount(account, website)
                })
            })

            let createButton = document.createElement('button')
            createButton.id = "create-button"
            createButton.innerText = "Register New Account"
            subDetails.appendChild(createButton)

            createButton.addEventListener('click', e => {
                newAccount(website);
            })

         }
     })
}

// Function to display account data and get password
function displayAccount(account, website) {
    backToWebsiteDetails(website)

    subDetails.innerHTML = `
    <h3> Account for: </h3>
    <p>Username: ${account.username}</p>
    `    
    let passwordForm = document.createElement('form')
    passwordForm.id = "password-form"
    passwordForm.innerHTML = `
    Enter Key Word/Phrase to Get Password<br><br>
    <input type="text"><br><br>
    <input type="submit" value="Go"><br>`

    let displayPassword = document.createElement('div')
    subDetails.appendChild(passwordForm)
    document.getElementById("password-form").addEventListener('submit', e => {
        e.preventDefault()
        let keyword = e.target[0].value
        let password = generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.password_min, website.password_max)
        
        displayPassword.innerHTML = `<h3>Password:</h3><h3 style="color:red;">${password}</h3>`
        subDetails.appendChild(displayPassword)
    })
}

// Function to create new account (regenerate password until user happy, save keys)
function newAccount(website) {
    let subDetails = document.getElementById('sub-details')
    backToWebsiteDetails(website)
    let usernameForm = document.createElement('form')
    usernameForm.id = "username-form"
    usernameForm.innerHTML = `
    Username: <input type="text"><br>
    <input type="submit" value="Go">
    `
    subDetails.innerHTML = ""
    subDetails.appendChild(usernameForm)

    let username;
    usernameForm.addEventListener('submit', e => {
        e.preventDefault()
        username = e.target[0].value

        subDetails.innerHTML = `
        <h3>Username: ${username}</h3>
        <br><h3>Enter a key word/phrase to get your password</h3>
        <input type="text" id="keyword"> <p style="display:inline;"> <-- Don't forget this key 
        <br><br>`

        // Button to Generate Password
        let passwordButton = document.createElement('button')
        passwordButton.classList.add("display-password")
        passwordButton.innerText = "Get Password"
        subDetails.appendChild(passwordButton)

        let keyword, key, specialChar, charFrequency, digit, digitFrequency;

        let passwordDisplay = document.createElement('div')
        subDetails.appendChild(passwordDisplay)

        passwordButton.addEventListener('click', e => {
            keyword = document.getElementById("keyword").value
            key = generateRandoms().key
            specialChar = generateRandoms().specialChar
            charFrequency = generateRandoms().charFrequency
            digit = generateRandoms().digit
            digitFrequency = generateRandoms().digitFrequency

            passwordDisplay.innerHTML = `<h3>Password: ${generatePassword(keyword, key, specialChar, charFrequency, digit, digitFrequency, website.password_min, website.password_max)}</h3>`
        })

        let saveButton = document.createElement('button')
        saveButton.innerText = "Save Encryption Keys"
        subDetails.appendChild(saveButton)

        saveButton.addEventListener('click', e => {
            fetch(`${BASE_URL}/accounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    key: key,
                    special_char: specialChar,
                    char_frequency: charFrequency,
                    digit: digit,
                    digit_frequency: digitFrequency,
                    website: website
                })
            }).then(resp => resp.json()).then(account => {
                subDetails.innerHTML = `
                <h1>New Account Details</h1>
                <h2>Username: ${account.username}</h2>
                <h2>Key word/phrase used: ${keyword}</h2>
                <p>Note: You will not be able to retrieve your password without this key word/phrase!</p>
                `

                let seePassword = document.createElement('button')
                seePassword.innerText = "See Password"
                subDetails.appendChild(seePassword)

                let display = document.createElement('div')
                subDetails.appendChild(display)

                seePassword.addEventListener('click', e => {
                    display.innerHTML = `<h3>Password: ${generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.password_min, website.password_max)}</h3>`
                })

                backToWebsiteDetails(website)

            })
        })
    })
    
}

// Back button to website details
function backToWebsiteDetails(website) {
    let webDetails = document.getElementById('web-details')
    let subDetails = document.getElementById('sub-details')
    
    // Back to Website Details Button
    let backButton = document.createElement('button')
    backButton.id = "back-button"
    backButton.innerText = 'Back to Website Details'
    webDetails.insertBefore(backButton, subDetails)

    // Event Listener for Back button
    backButton.addEventListener('click', e => {
        webSubDetails(website)
    })
}


// Form to register new website


// let websiteForm = document.createElement('form')
// websiteForm.innerHTML = `
//     <h3> Website Details</h3>
//     Website Name<input type="text" name="name"/>
//     Website URL<input type="text" name="url"/>
//     <br>
//     <h3> Password Details</h3>
//     Minimum Password Length 
//     <div class="slidecontainer">
//     <input type="range" name="rangeInput" min="1" max="50" value="8" onchange="updateMinSlider(this.value);">
//     <p id="display-min" style="display:inline;">8</p>
//      </div>
//     Maximum Password Length
//     <div class="slidecontainer">
//     <input type="range" name="rangeInput" min="1" max="128" value="128" onchange="updateMaxSlider(this.value);">
//     <p id="display-max" style="display:inline;">128</p>
//     </div>
//     <input type="submit"/>
// `

// websiteForm.addEventListener('submit', e => {
//     e.preventDefault()
    
//     const name = e.target[0].value
//     const url = e.target[1].value
//     const password_min = e.target[2].value
//     const password_max = e.target[3].value
    
//     fetch (`${BASE_URL}/websites`, {
//         method: 'POST',
//         headers: {
//             "Content-Type": 'application/json'
//         }, 
//         body: JSON.stringify({
//             "name": name,
//             "url": url,
//             "password_min": password_min,
//             "password_max": password_max,
//             "key": generateRandoms().key,
//             "special_char": generateRandoms().special_char,
//             "digit": generateRandoms().digit,
//             "char_frequency": generateRandoms().char_frequency,
//             "digit_frequency": generateRandoms().digit_frequency,
//             "user_id": user.id
//         })
//     }).then(resp => resp.json()).then(data => {
//         console.log(data)
//         let unpermittedChars = document.createElement('p')
//         unpermittedChars.innerText = "Unpermitted Special Characters:"
//         if (data.chars_not_permitted.length === 0){
//             unpermittedChars.innerText += " none"
//         } else {
//             data.chars_not_permitted.forEach(char => {
//                 unpermittedChars.innerText += ` ${char}`
//             })
//        }

//         main.innerHTML = `
//         <h1>${data.name}</h1>
//         <a href=${data.url}>Visit Website</a>
//         <br><br>
//         <h3>Password Details:</h3>
//         <p>Minimum Password Length: ${data.password_min}</p>
//         <p>Maximum Password Length: ${data.password_max}</p>
//         `
//         main.appendChild(unpermittedChars)

//         main.innerHTML += `
//         <br><h3>Enter a key word/phrase to get your password</h3>
//         <input type="text" id="keyword"> <p style="display:inline;"> <-- Don't forget this key 
//         <br><br>`

//         // Button to Generate Password
//         let passwordButton = document.createElement('button')
//         passwordButton.classList.add("display-password")
//         passwordButton.innerText = "Get Password"
//         main.appendChild(passwordButton)

//         passwordButton.addEventListener('click', e => {
//             main.innerHTML += `<h3>Password: ${generatePassword(document.getElementById("keyword").value, data.key, data.special_char, data.char_frequency, data.digit, data.digit_frequency, data.password_min, data.password_max)}</h3>`
//         })
//     })

    
// })

// main.appendChild(websiteForm)



// Algorithms for generating keys and passwords

// Generate Random Keys
function generateRandoms() {
    let randoms = new Object()
    randoms.key = Math.random().toString(36).slice(2) 
    let specialChars = ['!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~', '\'', '\"']
    randoms.specialChar = specialChars[Math.floor(Math.random()*specialChars.length)];
    randoms.digit = (Math.floor(Math.random() * 9) + 1).toString() ;
    
    let min = 2
    let max = 4
    randoms.charFrequency = Math.floor(Math.random()*(max-min+1)+min);
    randoms.digitFrequency = Math.floor(Math.random()*(max-min+1)+min);
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
