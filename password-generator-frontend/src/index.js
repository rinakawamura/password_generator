const BASE_URL = "http://localhost:3000"

document.addEventListener("DOMContentLoaded", () => {
    let main = document.querySelector('main')
    main.innerHTML = '<i id="key-icon" class="fas fa-key fa-3x"></i>'
    // let keyIcon = document.createElement('div')
    // keyIcon.id = 'key-icon'
    // keyIcon.innerHTML = '<i class="fas fa-key fa-3x"></i>'
    // main.append(keyIcon)

    let userContainer = document.createElement('div')
    userContainer.id = 'user-container'
    userContainer.classList.add("clearfix")
    userContainer.hidden = true
    main.append(userContainer)
    userContainer.innerHTML = `
    <p id='websites-link'>My Websites</p>
    <i id='user-icon' class="far fa-user-circle"></i>
    <i id='up' class="fas fa-angle-up" hidden></i>    
    <div id="user-display" class="clearfix"></div>
    `

    document.getElementById('user-display').innerHTML = `
    <div id="user-display-content">
        <p id="user-name"></p>
        <p id="user-email"></p>
    </div>
    `

    const logoutButton = document.createElement('button')
    logoutButton.id = 'logout-button'
    logoutButton.innerText = "Log Out"
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user_id')
        displayLogin()
    })
    document.getElementById('user-display').append(logoutButton)

    const loginContainer = document.createElement('div')
    loginContainer.id = 'login-container'
    main.append(loginContainer)
    loginContainer.classList.add("center")
    loginContainer.hidden = true
    let loginContent = document.createElement('div')
    loginContent.id = 'login-content'
    loginContainer.append(loginContent)

    let signupModal = document.createElement('div')
    signupModal.id = 'signup-modal'
    main.append(signupModal)
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
        <input type="email" placeholder="Email"><br>
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
        document.getElementById('signup-modal').hidden = true
    })

    let mainContent = document.createElement('div')
    mainContent.id = 'main-content'
    mainContent.hidden = true
    main.append(mainContent)

    let websitesDisplay = document.createElement('div')
    websitesDisplay.id = 'websites-display'
    websitesDisplay.classList.add('clearfix')
    mainContent.append(websitesDisplay)

    // Div element to display all websites
    let uList = document.createElement('ul')
    uList.id = "website-list"
    websitesDisplay.append(uList)

    let searchInput = document.createElement('form')
    searchInput.id = "search-form"
    searchInput.innerHTML = `
    <i class="fas fa-search"></i>
    <input id= "search-input" type="text" onkeyup="search()" placeholder="Search for Websites...">`
    websitesDisplay.insertBefore(searchInput, uList)


    // Button to add new website
    let newWebsiteButton = document.createElement('button')
    newWebsiteButton.id = "new-website-button"
    newWebsiteButton.innerText = "Add New Website"
    websitesDisplay.append(newWebsiteButton)

    // Div element to display website details 
    let webDetails = document.createElement('div')
    webDetails.id = "web-details"
    mainContent.appendChild(webDetails)
    
    
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
    document.getElementById('user-container').hidden = true
    document.getElementById('main-content').hidden = true

    let loginContainer = document.getElementById('login-container')
    loginContainer.hidden = false
    
    let loginContent = document.getElementById('login-content')
    loginContent.innerHTML = `
    <h2>Log In</h2>
    <form>
        <div id='form-input'>
            <input type="email" name="email" placeholder="Email" required>
            <i class="fas fa-user"></i>
        </div>
        <input type="submit" value="Login">
    </form>
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

                document.getElementById('websites-link').addEventListener('click', e => {
                    displayHomePage(data)
                })

                displayHomePage(data)
            } else {
                console.log(data.error)
                if (!document.getElementById('error-msg')) {
                    let errorMsg = document.createElement('h4')
                    errorMsg.id = 'error-msg'
                    errorMsg.innerText = data.error
                    errorMsg.classList.add('error')
                    loginContent.insertBefore(errorMsg, document.getElementById('new-user-line'))
                }
            }   
        })
    })

    let signupLink = document.createElement('p')
    signupLink.id = "signup-link"
    signupLink.innerText = "Register Here"

    document.getElementById('new-user-line').appendChild(signupLink)

    let signupModal = document.getElementById('signup-modal')
    signupModal.hidden = true

    signupLink.addEventListener('click', e => {
        document.getElementById('signup-modal').hidden = false
    })

    
}

// Display Home Page 
function displayHomePage(user) {
    document.getElementById('websites-link').classList.add('clicked')
    let main = document.querySelector('main')
    document.getElementById('login-container').hidden = true

    let userContainer = document.getElementById('user-container')
    userContainer.hidden = false

    let userIcon = document.getElementById('user-icon')
    userIcon.classList.remove('clicked')

    let userDisplay = document.getElementById('user-display')
    userDisplay.hidden = true
    document.getElementById('up').hidden = true
    
    document.getElementById('user-name').innerText = user.name
    document.getElementById('user-email').innerText = user.email

    userIcon.addEventListener('click', e => {
        if (userIcon.classList.contains('clicked')) {
            userIcon.classList.remove('clicked')
            document.getElementById('up').hidden = true
            userContainer.style.zIndex = 0;
            userDisplay.hidden = true
        } else {
            userIcon.classList.add('clicked')
            document.getElementById('up').hidden = false
            userDisplay.hidden = false
            userContainer.style.zIndex = 1;
        }
    })
    // userContainer.innerHTML = ""
    // userContainer.innerHTML = `${user.name}
    // <button id="logout">Logout</button>`

    document.getElementById('main-content').hidden = false

    // UL element to display all of the user's websites
    let uList = document.getElementById('website-list')
    uList.innerHTML = ""

    // let newLi = document.createElement('li')
    // newLi.id = "new-website-button"
    // newLi.innerText = "Register New Website"
    // uList.appendChild(newLi)
    
    // Fetch request to get all websites
    fetch(`${BASE_URL}/websites`).then(resp => resp.json()).then(data => {
        data.forEach(website => {
            if (website.user_id === user.id) {
                uList.innerHTML += `<li class="list-item" data-id=${website.id}>${website.name}</li>`
            }
        })
    })

    let newWebsiteButton = document.getElementById('new-website-button')

    let webDetails = document.getElementById('web-details')
    webDetails.innerHTML = ""

    // Div element for website main details (name, url)
    let mainDetails = document.createElement('div')
    mainDetails.id = "main-details"
    webDetails.appendChild(mainDetails)

    // Back Buttons

    let backWebsite = document.createElement('button')
    backWebsite.id = 'back-website-button'
    backWebsite.classList.add('back')
    backWebsite.innerHTML = `<i class="fas fa-backward"></i> Back to Website Details`
    backWebsite.hidden = true
    webDetails.appendChild(backWebsite)

    let backAccount = document.createElement('button')
    backAccount.id = 'back-account-button'
    backAccount.classList.add('back')
    backAccount.innerHTML = `<i class="fas fa-backward"></i> Back`
    backAccount.hidden = true
    webDetails.appendChild(backAccount)

    let editWebsite = document.createElement('button')
    editWebsite.id = 'edit-website-button'
    editWebsite.innerText = "Edit Website"
    editWebsite.hidden = true
    webDetails.appendChild(editWebsite)

    let deleteWebsite = document.createElement('button')
    deleteWebsite.id = 'delete-website-button'
    deleteWebsite.innerText = "Delete Website"
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
        // clear icons from all uLists
        clearListIcons()
        // if (e.target.id === "new-website-button"){
        //     newWebsite(user)
        // } else 
        if (e.target.classList.contains('list-item')) {
            // Fetch single website data
            fetch(`${BASE_URL}/websites/${e.target.dataset.id}`).then(resp => resp.json()).then(website => {

                // add icon to selected
                const icon = document.createElement('i')
                icon.classList.add("fas")
                icon.classList.add("fa-angle-double-right")
                e.target.append(icon)
                displayWebsite(website)
            })  
        }
    })

    newWebsiteButton.addEventListener('click', e => {
        newWebsite(user)
    })

    displayWebsite("none")
}

function clearListIcons() {
    let uL = document.getElementById('website-list')
    let lists = document.querySelectorAll('li')
    let i;
    for (i = 0; i < lists.length; i++) {
        if (lists[i].querySelector('i')) {
            lists[i].removeChild(lists[i].querySelector('i'))
        }
    }
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
        document.getElementById('delete-website-button').hidden = true

        mainDetails.innerHTML = `<h2>Select Website to See Details<h2>`
        subDisplayTop.innerHTML = ""
    } else {
        mainDetails.innerHTML = `
        <h2>${website.name}</h2>
        <p><a href=${website.url}>${website.url}</a></p>
       `

        let editButton = document.getElementById('edit-website-button')
        editButton.hidden = false

        editButton.addEventListener('click', e => {
            updateWebsite(website)
        })

        
        let deleteWebsiteButton = document.getElementById('delete-website-button')
        deleteWebsiteButton.hidden = false
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
        accountContainer.innerHTML += "<h3>Accounts</h3>"

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
    document.getElementById('delete-website-button').hidden = true
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
    Enter Key Word/Phrase to Get Password
    <input type="text">
    <input type="submit" value="Go">`
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




// Search bar functionality
function search() {
    let input = document.getElementById('search-input')
    let filter = input.value.toUpperCase()
    let uL = document.getElementById('website-list')
    let lis = uL.querySelectorAll('li')
    let i;

    for (i = 0; i < lis.length; i++) {
        let content = lis[i].textContent
        if (content.toUpperCase().indexOf(filter) > -1) {
            lis[i].hidden = false
        } else {
            lis[i].hidden = true
        }
    }
}