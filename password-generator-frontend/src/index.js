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
    main.innerHTML=""
    const loginContainer = document.createElement('div')
    loginContainer.id = 'login-form'
    main.append(loginContainer)
    loginContainer.classList.add("center")

    let loginContent = document.createElement('div')
    loginContainer.append(loginContent)

    loginContent.innerHTML = `
    <h2>Log In</h2>
    <form>
        <input type="email" name="email" placeholder="Email" required>
        <input type="submit" value="Login">
    </form>
    <br><br>
    <span id="new-user-line">Are you a new user? </span>`

    const loginForm = loginContainer.querySelector('form')
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

    let signupLink = document.createElement('p')
    signupLink.id = "signup-link"
    signupLink.innerText = "Register Here"
    signupLink.style.display = "inline"
    signupLink.style.color = 'pink'
    signupLink.style.cursor = 'pointer'
    document.getElementById('new-user-line').appendChild(signupLink)

    let signupModal = document.createElement('div')
    main.append(signupModal)
    signupModal.id = "signupModal"
    signupModal.classList.add("modal")
    signupModal.hidden = true
    signupModal.innerHTML =  `
        <div id="modal-content">
            <span class="close">&times;</span>
            <p>Registration Form</p>
        </div>
    `
    let signupForm = document.createElement('form')
    signupForm.innerHTML = `
        <input type="text" placeholder="Name">
        <input type="email" placeholder="Email">
        <input type="submit" value="Register">
    `
    let errorMsg = document.createElement('div')
    signupForm.append(errorMsg)

    document.getElementById('modal-content').append(signupForm)
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        // Fetch request to post new user
        fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: e.target[0].value,
                email: e.target[1].value
            })
        }).then(resp => resp.json()).then(user => {
            if (user.error) {
                errorMsg.innerHTML = ""
                user.error.forEach(msg => {
                    errorMsg.innerHTML += `<p style="color:red;">${msg}</p>`
                })
            } else {
                // Reload Page
                location.reload()
            }
           
        })
    })
    signupModal.querySelector('span').addEventListener('click', () => {
        document.getElementById('signupModal').hidden = true
    })

    signupLink.addEventListener('click', e => {
        document.getElementById('signupModal').hidden = false
    })
}

// Display Home Page 
function displayHomePage(user) {
    let main = document.querySelector('main')
    main.innerHTML = `${user.name}
    <button id="logout">Logout</button>`

    // UL element to display all of the user's websites
    let uList = document.createElement('ul')
    uList.id = "website-list"

    let newLi = document.createElement('li')
    newLi.id = "new-website-list"
    newLi.innerText = "Register New Website"
    uList.appendChild(newLi)
    
    // Fetch request to get all websites
    fetch(`${BASE_URL}/websites`).then(resp => resp.json()).then(data => {
        data.forEach(website => {
            if (website.user_id === user.id) {
                uList.innerHTML += `<li class="list-item" data-id=${website.id}>${website.name}</li>`
            }
        })
    })

    // Display websites within UL element
    main.appendChild(uList)

    // Div element to display website details 
    let webDetails = document.createElement('div')
    webDetails.id = "web-details"
    main.appendChild(webDetails)

    // Div element for website main details (name, url)
    let mainDetails = document.createElement('div')
    mainDetails.id = "main-details"
    webDetails.appendChild(mainDetails)

    // Back Buttons

    let backWebsite = document.createElement('button')
    backWebsite.id = 'back-website-button'
    backWebsite.innerText = "Back to Website Details"
    backWebsite.hidden = true
    webDetails.appendChild(backWebsite)

    let backAccount = document.createElement('button')
    backAccount.id = 'back-account-button'
    backAccount.innerText = "Back to Account Details"
    backAccount.hidden = true
    webDetails.appendChild(backAccount)

    let editWebsite = document.createElement('button')
    editWebsite.id = 'edit-website-button'
    editWebsite.innerText = "Edit Website"
    editWebsite.hidden = true
    webDetails.appendChild(editWebsite)

    let deleteWebsite = document.createElement('div')
    deleteWebsite.id = 'delete-website'
    deleteWebsite.hidden = true
    webDetails.appendChild(deleteWebsite)

    // Website Subdetails (Will change based on action)
    let subDetails = document.createElement('div')
    subDetails.id = "sub-details"
    webDetails.appendChild(subDetails) 

    // Top div element within subdetails for anything that needs to be displayed
    let subDisplayTop = document.createElement('div')
    subDisplayTop.id = "sub-display-top"
    subDisplayTop.hidden = true
    subDetails.appendChild(subDisplayTop)

    // Div element to store form 
    let subForm = document.createElement('div')
    subForm.id = "sub-form"
    subForm.hidden = true
    subDetails.appendChild(subForm)

    // Top div element within subdetails for anything that needs to be displayed
    let subDisplayBottom = document.createElement('div')
    subDisplayBottom.id = "sub-display-bottom"
    subDisplayBottom.hidden = true
    subDetails.appendChild(subDisplayBottom)

    uList.addEventListener('click', e => {
        if (e.target.id === "new-website-list"){
            newWebsite(user)
        } else if (e.target.classList.contains('list-item')) {
            // Fetch single website data
            fetch(`${BASE_URL}/websites/${e.target.dataset.id}`).then(resp => resp.json()).then(website => {
                displayWebsite(website)
            })  
        }
    })

    const logoutButton = document.getElementById('logout')
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user_id')
        displayLogin()
    })

    displayWebsite("none")
}

// Function to get website details
function displayWebsite(website) {
    // Hide unneccessary elements
    document.getElementById('sub-form').hidden = true  
    document.getElementById('sub-display-bottom').hidden = true
    document.getElementById('back-website-button').hidden = true  
    document.getElementById('back-account-button').hidden = true  

    // Website Name and Link
    let webDetails = document.getElementById('web-details')
    let mainDetails = document.getElementById('main-details')
    let subDisplayTop = document.getElementById('sub-display-top')

    // Default: If no website given
    if (website === "none") {
        document.getElementById('edit-website-button').hidden = true
        document.getElementById('delete-website').hidden = true

        mainDetails.innerHTML = `<h2>Select Website to See Details<h2>`
        subDisplayTop.innerHTML = ""
    } else {
        mainDetails.innerHTML = `
        <h2>${website.name}</h2>
        <p><a href=${website.url}>${website.url}</a></p>
        <br>`

        let editButton = document.getElementById('edit-website-button')
        editButton.hidden = false

        editButton.addEventListener('click', e => {
            updateWebsite(website)
        })

        let deleteWebsiteDiv = document.getElementById('delete-website')
        deleteWebsiteDiv.innerHTML = ""
        deleteWebsiteDiv.hidden = false

        let deleteWebsiteButton = document.createElement('button')
        deleteWebsiteButton.id = 'delete-website-button'
        deleteWebsiteButton.innerText = "Delete Website"
        deleteWebsiteDiv.append(deleteWebsiteButton)

        deleteWebsiteButton.addEventListener('click', e => {
            deleteWebsite(website)
        })
    
        // Display Password Requirements of Website
        subDisplayTop.hidden = false
        subDisplayTop.innerHTML = `
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
        subDisplayTop.appendChild(unpermittedChars)

        let accountContainer = document.createElement('div')
        accountContainer.id = 'account-container'
        subDisplayTop.appendChild(accountContainer)

        // Fetch accounts belonging to website
        accountContainer.innerHTML += "<br><br><h3>Accounts</h3>"

        if (website.accounts.length === 0) {
            accountContainer.innerHTML += "<p>No Accounts Created</p>"
        } else {
            accountContainer.innerHTML += "<p>Select Account by Username</p>"

            // Form to select account and submit
            let accountForm = document.createElement('form')
            accountForm.id = "account-form"

            // Add account options to select
            let select = document.createElement('select')
            select.id = "account-select"

            website.accounts.forEach(account => {
                if (account.website_id === website.id){
                    select.innerHTML += `<option value=${account.username} data-id=${account.id}>${account.username}</option>`
                }
            })
            accountForm.appendChild(select)
            accountContainer.appendChild(accountForm)

            let submitButton = document.createElement('input')
            submitButton.id = "account-submit"
            submitButton.type="submit"
            submitButton.value="Account Details"
            accountForm.appendChild(submitButton)

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
        }

        // Button to create new account for website
        let createButton = document.createElement('button')
        createButton.id = "create-button"
        createButton.innerText = "Register New Account"
        accountContainer.appendChild(createButton)

        createButton.addEventListener('click', e => {
            newAccount(website);
        })
    }

}
    
// Function to display account data and get password
function displayAccount(account, website) {
    // Hide Buttons
    document.getElementById('edit-website-button').hidden = true
    document.getElementById('delete-website').hidden = true
    document.getElementById('back-account-button').hidden = true

    let subDisplayTop = document.getElementById('sub-display-top')
    subDisplayTop.hidden = false
    let subDisplayBottom = document.getElementById('sub-display-bottom')
    subDisplayBottom.hidden = false

    backToWebsiteDetails(website)

    subDisplayTop.innerHTML = `
    <h3> Account for: </h3>
    <p id="account-username">Username: ${account.username} <button id="username-edit" style="display:inline;">Edit Username</button></p>
    `    
    document.getElementById('username-edit').addEventListener('click', e => {
        updateAccountUsername(account, website)
    })

    let subForm = document.getElementById('sub-form')
    subForm.innerHTML = ""
    subForm.hidden = false

    let passwordForm = document.createElement('form')
    passwordForm.innerHTML = `
    Enter Key Word/Phrase to Get Password<br><br>
    <input type="text">
    <input type="submit" value="Go"><br><br><br>`
    subForm.append(passwordForm)

    let displayPassword = document.createElement('div')
    subDisplayBottom.innerHTML = ''
    subDisplayBottom.appendChild(displayPassword)

    passwordForm.addEventListener('submit', e => {
        e.preventDefault()
        let keyword = e.target[0].value
        let password = generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)   
        displayPassword.innerHTML = `<h3>Password:</h3><h3 style="color:red;">${password}</h3>`
    })

    let newKeysButton = document.createElement('button')
    newKeysButton.id = "new-keys-button"
    newKeysButton.innerText = "Generate New Keys"
    subDisplayBottom.appendChild(newKeysButton)

    newKeysButton.addEventListener('click', e => {
        updateAccountKeys(account, website)
    })

    let deleteAccountButton = document.createElement('button')
    deleteAccountButton.id = "delete-account-button"
    deleteAccountButton.innerText = "Delete Account"
    subDisplayBottom.appendChild(deleteAccountButton)

    deleteAccountButton.addEventListener('click', e => {
        deleteAccount(account)
    })
}



// Back button to website details
function backToWebsiteDetails(website) {
    let button = document.getElementById('back-website-button')
    button.hidden = false

    // Event Listener for Back button
    button.addEventListener('click', e => {
        displayWebsite(website)
    })
}

// Back button to account details
function backToAccountDetails(account, website) {
    let button = document.getElementById('back-account-button')
    button.hidden = false

    button.addEventListener('click', e => {
        displayAccount(account, website)
    })
}



