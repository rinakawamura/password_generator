// WEBSITE FUNCTIONS

// CREATE new website
function newWebsite(user) {
    // Hide elements
    clearListIcons()
    document.getElementById('edit-website-button').hidden = true
    document.getElementById('delete-website-div').hidden = true
    document.getElementById('back-website-button').hidden = true

    let mainDetails = document.getElementById('main-details')
    let webList = document.getElementById('website-list')
    let subDisplayTop = document.getElementById('sub-display-top')
    subDisplayTop.hidden = true

    mainDetails.innerHTML = `<h2 style="margin-bottom: 5%">Enter New Website Details</h2>`

    let errorMsg = document.createElement('div')
    mainDetails.append(errorMsg)

    // Form to register new website
    let subForm = document.getElementById('sub-form')
    let websiteForm = document.createElement('form')
    websiteForm.id = 'website-form'
    subForm.innerHTML = ""
    subForm.appendChild(websiteForm)
    subForm.hidden = false
    websiteForm.innerHTML = `
        Website Name<br><input type="text" name="name"/><br>
        Website URL<br><input type="text" name="url"/>
        <br>
        <h3> Password Details</h3>
        Minimum Password Length 
        <div class="slidecontainer">
        <input type="range" name="rangeInput" min="1" max="50" value="8" oninput="updateMinSlider(this.value);">
        <p id="display-min" style="display:inline;">8</p>
        </div>
        Maximum Password Length
        <div class="slidecontainer">
        <input type="range" name="rangeInput" min="1" max="128" value="128" oninput="updateMaxSlider(this.value);">
        <p id="display-max" style="display:inline;">128</p>
        </div>
        Unpermitted Special Characters
        <div id="char-grid">
        </div>
        <input type="submit"/>
    `
    createCharGrid()
    

    // Once website form is submitted
    websiteForm.addEventListener('submit', e => {
        errorMsg.innerHTML = ''
        e.preventDefault()
        const name = e.target[0].value
        const url = e.target[1].value
        const password_min = e.target[2].value
        const password_max = e.target[3].value

        let unpermittedChars = []
        const gridItems = e.target.children["char-grid"].children
        let i;
        for (i = 0; i < gridItems.length; i++) {
            if (gridItems[i].classList.contains('grid-clicked')) {
                unpermittedChars.push(gridItems[i].innerText)
            }
        }
        
        // debugger
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
                "user_id": user.id,
                "chars_not_permitted": unpermittedChars
            })
        }).then(resp => resp.json()).then(website => {
            if (website.error) {
                errorMsg.innerHTML = ""
                website.error.forEach(msg => {
                    errorMsg.innerHTML += `<p class="error">${msg}</p>`
            })
            } else {
                webList.innerHTML += `<li class="list-item" data-id=${website.id}>${website.name}<i class="fas fa-angle-double-right"></i></li>`
                displayWebsite(website)
            }
        })
    })
}

function createCharGrid() {
    let websiteForm = document.getElementById('website-form') 
    let charGrid = document.getElementById('char-grid')

    charGrid.innerHTML = `
    <div class="grid-item">!</div>
    <div class="grid-item">#</div>
    <div class="grid-item">$</div>
    <div class="grid-item">%</div>
    <div class="grid-item">&</div>
    <div class="grid-item">(</div>
    <div class="grid-item">)</div>
    <div class="grid-item">*</div>
    <div class="grid-item">+</div>
    <div class="grid-item">,</div>
    <div class="grid-item">-</div>
    <div class="grid-item">.</div>
    <div class="grid-item">/</div>
    <div class="grid-item">:</div>
    <div class="grid-item">;</div>
    <div class="grid-item"><</div>
    <div class="grid-item">=</div>
    <div class="grid-item">></div>
    <div class="grid-item">?</div>
    <div class="grid-item">@</div>
    <div class="grid-item">[</div>
    <div class="grid-item">\\</div>
    <div class="grid-item">]</div>
    <div class="grid-item">^</div>
    <div class="grid-item">_</div>
    <div class="grid-item">{</div>
    <div class="grid-item">{</div>
    <div class="grid-item">|</div>
    <div class="grid-item">}</div>
    <div class="grid-item">~</div>
    <div class="grid-item">'</div>
    <div class="grid-item">"</div>`
        
    websiteForm.addEventListener('click', e => {
        if (e.target.classList.contains("grid-item")) {
            if (e.target.classList.contains('grid-clicked')) {
                e.target.classList.remove('grid-clicked')
            } else {
                e.target.classList.add('grid-clicked')
            }
        }
    })
    
}

// Update Website Details
function updateWebsite(website) {
    let mainDetails = document.getElementById('main-details')
    let webList = document.getElementById('website-list')
    document.getElementById('sub-display-top').hidden = true
    document.getElementById('sub-display-bottom').hidden = true
    document.getElementById('edit-website-button').hidden = true
    document.getElementById('delete-website-div').hidden = true

    let subForm = document.getElementById('sub-form')
    subForm.innerHTML = ""

    backToWebsiteDetails(website)

    mainDetails.innerHTML = '<h2>Edit Website Details</h2>'
    let errorDiv = document.createElement('div')
    errorDiv.classList.add('error')
    mainDetails.append(errorDiv)

    let editForm = document.createElement('form')
    editForm.id = 'website-form'
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

        Unpermitted Special Characters
        <div id="char-grid"></div>
        <input type="submit"/>
    `

    createCharGrid();
    let chars = editForm.querySelectorAll('.grid-item')

    website.chars_not_permitted.forEach (char => {
        let i;
        for (i = 0; i < chars.length; i++) {
            if (chars[i].innerText === char) {
                chars[i].classList.add('grid-clicked')
            }
        }
    })

    editForm.addEventListener('submit', e => {
        e.preventDefault()
        
        const name = e.target[0].value
        const url = e.target[1].value
        const password_min = e.target[2].value
        const password_max = e.target[3].value

        let unpermittedChars = []
        const gridItems = e.target.children["char-grid"].children
        let i;
        for (i = 0; i < gridItems.length; i++) {
            if (gridItems[i].classList.contains('grid-clicked')) {
                unpermittedChars.push(gridItems[i].innerText)
            }
        }
        

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
                user_id: website.user_id,
                chars_not_permitted: unpermittedChars
            })
        }).then(resp => resp.json()).then(updated_website => {
            if (updated_website.error) {
                errorDiv.innerHTML = ""
                updated_website.error.forEach(msg => {
                    errorDiv.innerHTML += `<p class="error">${msg}</p>`
                })
            } else {
                let i
                for (i = 1; i < webList.children.length; i++) {
                    if (webList.children[i].dataset.id == updated_website.id){
                        webList.children[i].innerHTML = `${updated_website.name}<i class="fas fa-angle-double-right">`
                    }
                }
                displayWebsite(updated_website)
            }
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
    clearListIcons()
    // Fetch request to delete website
    fetch(`${BASE_URL}/websites/${website.id}`, {
        method: 'DELETE'
    }).then(resp => resp.json()).then(deleted => {
        let webList = document.getElementById('website-list')
        let i
        for (i = 0; i < webList.children.length; i++) {
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
    document.getElementById('delete-website-div').hidden = true
    backToWebsiteDetails(website)

    let subDisplayTop = document.getElementById('sub-display-top')
    subDisplayTop.innerHTML = "<h1>Registering New Account</h1>"

    let usernameForm = document.createElement('form')
    usernameForm.innerHTML = `
    Username: <input type="text" pattern=".*[^ ].*" oninvalid="this.setCustomValidity('Please enter a username.')"
    oninput="this.setCustomValidity('')" required><br>
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
        
        let errorDiv = document.createElement('div')
        subDisplayTop.append(errorDiv)
        let keys = newKeys(website);

        let saveButton = document.createElement('button')
        saveButton.innerText = "Save Encryption Keys"
        subDisplayBottom.appendChild(saveButton)
        
        saveButton.addEventListener('click', e => {
            errorDiv.innerHTML = ''
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
                if (account.error) {
                    account.error.forEach(msg => {
                        errorDiv.innerHTML += `<p class="error">${msg}</p>`
                    }) 
                } else {
                    afterKeySave(account, website)
                    document.getElementById('sub-display-header').innerHTML = `
                    <h1>New Account Details</h1>
                    <h2>Username: ${account.username}</h2>`

                    fetch(`${BASE_URL}/websites/${website.id}`).then(resp => resp.json()).then(website => {
                        backToWebsiteDetails(website)
                    })
                }
                
                // let form = document.getElementById('sub-form')
                // form.innerHTML = ""
                // form.hidden = true
                // subDisplayBottom.innerHTML = ""
                // subDisplayBottom.hidden = true

                // subDisplayTop.innerHTML = `
                // <h1>New Account Details</h1>
                // <h2>Username: ${account.username}</h2>
                // <h2>Key word/phrase used: ${keyword}</h2>
                // <p>Note: You will not be able to retrieve your password without this key word/phrase!</p>
                // `

                // let seePassword = document.createElement('button')
                // seePassword.innerText = "See Password"
                // subDisplayTop.appendChild(seePassword)

                // let display = document.createElement('div')
                // subDisplayTop.appendChild(display)

                // seePassword.addEventListener('click', e => {
                //     display.innerHTML = `<h3>Password: ${generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
                // })

                // Re-fetch website with updated accounts
                
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
    <input type="text" id="keyword" pattern=".*[^ ].*" oninvalid="this.setCustomValidity('Key word/phrase cannot be blank')"
    oninput="this.setCustomValidity('')" required> <p style="display:inline;">
    <input type="submit" id="password-submit" value="Go">
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
    document.getElementById('username').remove()
    document.getElementById('username-edit').remove()
    accountUsername.innerText = "Username: "

    let errorDiv = document.createElement('div')
    errorDiv.classList.add("error")
    accountUsername.append(errorDiv)

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

            if (account.error) {
                errorDiv.innerHTML = ""
                account.error.forEach(msg => {
                    errorDiv.innerHTML += `<p class="error">${msg}</p>`
                })
            } else {
                displayAccount(account, website)
            }
        })
    })
}

function updateAccountKeys(account, website) {
    document.getElementById('back-website-button').hidden = true;
    document.getElementById('back-account-button').hidden = false;
    backToAccountDetails(account,website)
    let subDisplayTop = document.getElementById('sub-display-top')
    let subDisplayBottom = document.getElementById('sub-display-bottom')
    subDisplayBottom.innerHTML = ""

    subDisplayTop.innerHTML = `<h3>Generating New Keys</h3>`
    let errorDiv = document.createElement('div')
    errorDiv.classList.add("error")
    subDisplayTop.append(errorDiv)

    let keys = newKeys(website)

    let saveButton = document.createElement('button')
    saveButton.innerText = "Save Encryption Keys"
    subDisplayBottom.appendChild(saveButton)
    
    saveButton.addEventListener('click', e => {

        if (document.getElementById('keyword').checkValidity() === true) {
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
                    afterKeySave(account, website)
                    document.getElementById("sub-display-header").innerHTML = `
                    <h1>New Key Details</h1>` 
                })
        } else {
            errorDiv.innerHTML = 'Enter key word/phrase to generate new keys'
        }    
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

function afterKeySave(account, website) {
    let form = document.getElementById('sub-form')
    let subDisplayTop = document.getElementById('sub-display-top')
    let subDisplayBottom = document.getElementById('sub-display-bottom')

    form.innerHTML = ""
    form.hidden = true
    subDisplayBottom.innerHTML = ""
    subDisplayBottom.hidden = true
    
    subDisplayTop.innerHTML = `

    <div id="sub-display-header"></div>
    <h2 >Key word/phrase used: ${keyword}</h2>
    <p>Note: You will not be able to retrieve your password without this key word/phrase!</p>
    `

    let seePassword = document.createElement('button')
    seePassword.innerText = "See Password"
    subDisplayTop.appendChild(seePassword)

    let display = document.createElement('div')
    display.id = "password-display"
    subDisplayTop.appendChild(display)

    seePassword.addEventListener('click', e => {
        displayEncrypted(account, website, keyword)
        // display.innerHTML = `<h3>Encrypted: ${generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)}</h3>`
    })

    // let button = document.getElementById('back-account-button')
    // let newButton = document.createElement('button')
    backToAccountDetails(account, website)
}

// USER 
function updateUserData(user) {
    let mainContent = document.getElementById('main-content')
    
}