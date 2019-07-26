// WEBSITE FUNCTIONS

// CREATE new website
function newWebsite(user) {
    // Hide buttons
    document.getElementById('edit-website-button').hidden = true
    document.getElementById('delete-website').hidden = true

    let mainDetails = document.getElementById('main-details')
    let webList = document.getElementById('website-list')
    let subDisplayTop = document.getElementById('sub-display-top')
    subDisplayTop.hidden = true

    mainDetails.innerHTML = "<h2>Enter New Website Details</h2>"

    // Form to register new website
    let subForm = document.getElementById('sub-form')
    let websiteForm = document.createElement('form')
    subForm.innerHTML = ""
    subForm.appendChild(websiteForm)
    subForm.hidden = false
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
            webList.innerHTML += `<li class="list-item" data-id=${website.id}>${website.name}</li>`
            displayWebsite(website)
        })
    })
}

// Update Website Details
function updateWebsite(website) {
    let mainDetails = document.getElementById('main-details')
    let webList = document.getElementById('website-list')
    document.getElementById('sub-display-top').hidden = true
    document.getElementById('sub-display-bottom').hidden = true
    document.getElementById('edit-website-button').hidden = true

    let subForm = document.getElementById('sub-form')
    subForm.innerHTML = ""

    backToWebsiteDetails(website)

    mainDetails.innerHTML = '<h2>Edit Website Details</h2>'

    let editForm = document.createElement('form')
    subForm.hidden = false
    subForm.append(editForm)
    editForm.innerHTML = `
    <p>Website Name: <input type="text" value="${website.name}"></p>
    <p>Website URL: <input type="text" value="${website.url}"></p>
    <h3> Password Details</h3>
        Minimum Password Length 
        <div class="slidecontainer">
        <input type="range" name="rangeInput" min="1" max="50" value=${website.password_min} onchange="updateMinSlider(this.value);">
        <p id="display-min" style="display:inline;">${website.password_min}</p>
        </div>
        Maximum Password Length
        <div class="slidecontainer">
        <input type="range" name="rangeInput" min="1" max="128" value=${website.password_max} onchange="updateMaxSlider(this.value);">
        <p id="display-max" style="display:inline;">${website.password_max}</p>
        </div>
        <input type="submit"/>
    `

    editForm.addEventListener('submit', e => {
        e.preventDefault()
        
        const name = e.target[0].value
        const url = e.target[1].value
        const password_min = e.target[2].value
        const password_max = e.target[3].value

        // Fetch request to PATCH website
        fetch(`${BASE_URL}/websites/${website.id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                url: url,
                password_min: password_min,
                password_max: password_max, 
                user_id: website.user_id
            })
        }).then(resp => resp.json()).then(updated_website => {
            let i
            for (i = 1; i < webList.children.length; i++) {
                if (webList.children[i].dataset.id == updated_website.id){
                    webList.children[i].innerText = updated_website.name
                }
            }
            
            displayWebsite(updated_website)
        })
    })
}

// Helpers for creating and updating new website (sliders)
function updateMinSlider(val) {
    document.getElementById('display-min').innerText=val;
}

function updateMaxSlider(val) {
    document.getElementById('display-max').innerText=val;
}

// DELETE website
function deleteWebsite(website){
    // Fetch request to delete website
    fetch(`${BASE_URL}/websites/${website.id}`, {
        method: 'DELETE'
    }).then(resp => resp.json()).then(deleted => {
        let webList = document.getElementById('website-list')
        let i
        for (i = 1; i < webList.children.length; i++) {
            if (webList.children[i].dataset.id == deleted.id){
                webList.children[i].remove()
            }
        }
        displayWebsite('none')
    })
}

// ACCOUNT FUNCTIONS

// Function to create new account (regenerate password until user happy, save keys)
function newAccount(website) {
    // Hide Elements
    document.getElementById('edit-website-button').hidden = true
    document.getElementById('delete-website').hidden = true
    backToWebsiteDetails(website)

    let subDisplayTop = document.getElementById('sub-display-top')
    subDisplayTop.innerHTML = "<h1>Registering New Account</h1>"

    let usernameForm = document.createElement('form')
    usernameForm.innerHTML = `
    Username: <input type="text"><br>
    <input type="submit" value="Go">
    `
    subDisplayTop.appendChild(usernameForm)

    let subDisplayBottom = document.getElementById('sub-display-bottom')
    subDisplayBottom.innerHTML = ""
    subDisplayBottom.hidden = false

    let username;
    usernameForm.addEventListener('submit', e => {
        e.preventDefault()
        username = e.target[0].value
        subDisplayTop.innerHTML = `
        <h3>Username: ${username}</h3>`

        let keys = newKeys(website);

        let saveButton = document.createElement('button')
        saveButton.innerText = "Save Encryption Keys"
        subDisplayBottom.appendChild(saveButton)
        
        saveButton.addEventListener('click', e => {
            fetch(`${BASE_URL}/accounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    key: keys.key,
                    special_char: keys.specialChar,
                    char_frequency: keys.charFrequency,
                    digit: keys.digit,
                    digit_frequency: keys.digitFrequency,
                    website_id: website.id
                })
            }).then(resp => resp.json()).then(account => {
                let form = document.getElementById('sub-form')
                form.innerHTML = ""
                form.hidden = true
                subDisplayBottom.innerHTML = ""
                subDisplayBottom.hidden = true

                subDisplayTop.innerHTML = `
                <h1>New Account Details</h1>
                <h2>Username: ${account.username}</h2>
                <h2>Key word/phrase used: ${keyword}</h2>
                <p>Note: You will not be able to retrieve your password without this key word/phrase!</p>
                `

                let seePassword = document.createElement('button')
                seePassword.innerText = "See Password"
                subDisplayTop.appendChild(seePassword)

                let display = document.createElement('div')
                subDisplayTop.appendChild(display)

                seePassword.addEventListener('click', e => {
                    display.innerHTML = `<h3>Password: ${generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
                })

                // Re-fetch website with updated accounts
                fetch(`${BASE_URL}/websites/${website.id}`).then(resp => resp.json()).then(website => {
                    backToWebsiteDetails(website)
                })
            })
        })
    })
    
}

// Form to generate encryption keys until user satisfied
function newKeys(website) {
    let subDisplayBottom = document.getElementById('sub-display-bottom')
    subDisplayBottom.innerHTML = ""

    let subForm = document.getElementById('sub-form')
    subForm.innerHTML = ""
    subForm.hidden = false 

    let keysForm = document.createElement('form')
    keysForm.innerHTML = `
    <br><h3>Enter a key word/phrase to get your password</h3>
    <input type="text" id="keyword"> <p style="display:inline;"> <-- Don't forget this key <br>
    <input type="submit" id="password-submit" value="Get Password">
    <br><br>`
    subForm.append(keysForm)

    let passwordDisplay = document.createElement('div')
    subDisplayBottom.appendChild(passwordDisplay)
    
    let keys = new Object()

    keysForm.addEventListener('submit', e => {
        e.preventDefault()
        keyword = document.getElementById("keyword").value
        keys.key = generateRandoms(website.chars_not_permitted).key
        keys.specialChar = generateRandoms(website.chars_not_permitted).specialChar
        keys.charFrequency = generateRandoms(website.chars_not_permitted).charFrequency
        keys.digit = generateRandoms(website.chars_not_permitted).digit
        keys.digitFrequency = generateRandoms(website.chars_not_permitted).digitFrequency

        passwordDisplay.innerHTML = `<h3>Password: ${generatePassword(keyword, keys.key, keys.specialChar, keys.charFrequency, keys.digit, keys.digitFrequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
    })

    return keys
}

// Update Account Username
function updateAccountUsername(account, website) {
    let accountUsername = document.getElementById('account-username')
    let usernameForm = document.createElement('form')
    usernameForm.id = "username-form"
    usernameForm.innerHTML = `
    <input type="text" value=${account.username}>
    <input type="submit" value="Update">
    `

    accountUsername.innerText = "Username: "
    accountUsername.appendChild(usernameForm)

    usernameForm.addEventListener('submit', e => {
        e.preventDefault()
        let newUsername = e.target[0].value
        
        fetch (`${BASE_URL}/accounts/username/${account.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                username: newUsername
            })
        }).then(resp => resp.json()).then(account => {
            displayAccount(account, website)
        })
    })
}

function updateAccountKeys(account, website) {
    let subDisplayTop = document.getElementById('sub-display-top')
    let subDisplayBottom = document.getElementById('sub-display-bottom')
    subDisplayBottom.innerHTML = ""

    subDisplayTop.innerHTML = "<h3>Generating New Keys</h3>"

    let keys = newKeys(website)

    let saveButton = document.createElement('button')
    saveButton.innerText = "Save Encryption Keys"
    subDisplayBottom.appendChild(saveButton)
    
    saveButton.addEventListener('click', e => {
        fetch(`${BASE_URL}/accounts/keys/${account.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: keys.key,
                special_char: keys.specialChar,
                char_frequency: keys.charFrequency,
                digit: keys.digit,
                digit_frequency: keys.digitFrequency,
            })
        }).then(resp => resp.json()).then(account => {
            let form = document.getElementById('sub-form')
            form.innerHTML = ""
            form.hidden = true
            subDisplayBottom.innerHTML = ""
            subDisplayBottom.hidden = true
            
            subDisplayTop.innerHTML = `
            <h1>New Key Details</h1>
            <h2>Key word/phrase used: ${keyword}</h2>
            <p>Note: You will not be able to retrieve your password without this key word/phrase!</p>
            `

            let seePassword = document.createElement('button')
            seePassword.innerText = "See Password"
            subDisplayTop.appendChild(seePassword)

            let display = document.createElement('div')
            subDisplayTop.appendChild(display)

            seePassword.addEventListener('click', e => {
                display.innerHTML = `<h3>Password: ${generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
            })

            // Re-fetch website with updated accounts
            fetch(`${BASE_URL}/websites/${website.id}`).then(resp => resp.json()).then(website => {
                document.getElementById('back-website-button').hidden = true
                backToAccountDetails(account, website)
            })
        })
    })

}

// DELETE account
function deleteAccount(account) {
    // Fetch request to DELETE account
    fetch(`${BASE_URL}/accounts/${account.id}`, {
        method: "DELETE"
    }).then(data => {
        // Re-fetch website after account destroyed
        fetch(`${BASE_URL}/websites/${account.website_id}`).then(resp => resp.json()).then(website => {
            displayWebsite(website)
        })
    })

}

