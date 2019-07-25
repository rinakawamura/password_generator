// Website Functions

// CREATE new website
function newWebsite(user) {
    let mainDetails = document.getElementById('main-details')
    let subDetails = document.getElementById('sub-details')
    let webList = document.getElementById('website-list')

    mainDetails.innerHTML = "<h2>Enter New Website Details</h2>"

    // Form to register new website
    let websiteForm = document.createElement('form')
    websiteForm.innerHTML = `
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
    subDetails.innerHTML=''
    subDetails.appendChild(websiteForm)


    // Once website form is submitted
    websiteForm.addEventListener('submit', e => {
        e.preventDefault()
        
        const name = e.target[0].value
        const url = e.target[1].value
        const password_min = e.target[2].value
        const password_max = e.target[3].value
        
        // Fetch Request to POST new website data
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
                "user_id": user.id
            })
        }).then(resp => resp.json()).then(website => {
            webSubDetails(website)
            let uList = webList.firstElementChild
            uList.innerHTML += `<li class="list-item" data-id=${website.id}>${website.name}</li>`
        })
    })
}

// Helpers for creating new website (sliders)
function updateMinSlider(val) {
    document.getElementById('display-min').innerText=val;
}

function updateMaxSlider(val) {
    document.getElementById('display-max').innerText=val;
}


// Functions for Accounts
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
            key = generateRandoms(website.chars_not_permitted).key
            specialChar = generateRandoms(website.chars_not_permitted).specialChar
            charFrequency = generateRandoms(website.chars_not_permitted).charFrequency
            digit = generateRandoms(website.chars_not_permitted).digit
            digitFrequency = generateRandoms(website.chars_not_permitted).digitFrequency

            passwordDisplay.innerHTML = `<h3>Password: ${generatePassword(keyword, key, specialChar, charFrequency, digit, digitFrequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
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
                    website_id: website.id
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
                    display.innerHTML = `<h3>Password: ${generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
                })
            })

            // Re-fetch website with updated account
            fetch(`${BASE_URL}/websites/${website.id}`).then(resp => resp.json()).then(website => {
                backToWebsiteDetails(website)
            })
        })
    })
    
}