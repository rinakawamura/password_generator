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

    // Display websites within 'webList' div element
    webList.appendChild(uList)
    main.appendChild(webList)

    // Div element to display website details 
    let webDetails = document.createElement('div')
    webDetails.id = "web-details"
    main.appendChild(webDetails)

    // Dive element for website main details (name, url)
    let mainDetails = document.createElement('div')
    mainDetails.id = "main-details"
    webDetails.appendChild(mainDetails)

    // Website Subdetails (Will change based on action)
    let subDetails = document.createElement('div')
    subDetails.id = "sub-details"
    webDetails.appendChild(subDetails) 

    uList.addEventListener('click', e => {
        if (e.target.id === "new-website-list"){
            newWebsite(user)
        } else if (e.target.classList.contains('list-item')) {
            // Fetch single website data
            fetch(`${BASE_URL}/websites/${e.target.dataset.id}`).then(resp => resp.json()).then(website => {
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
    let webDetails = document.getElementById('web-details')
    // Website Name and Link
    let mainDetails = document.getElementById('main-details')
    mainDetails.innerHTML = `
    <h2>${website.name}</h2>
    <p><a href=${website.url}>${website.url}</a></p>
    <br>`

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

     if (website.accounts.length === 0) {
        subDetails.innerHTML += "<p>No Accounts Created</p>"
    } else {
        subDetails.innerHTML += "<p>Select Account by Username</p>"

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
     }

    let createButton = document.createElement('button')
    createButton.id = "create-button"
    createButton.innerText = "Register New Account"
    subDetails.appendChild(createButton)

    createButton.addEventListener('click', e => {
        newAccount(website);
    })
}

// Function to display account data and get password
function displayAccount(account, website) {
    let subDetails = document.getElementById('sub-details')
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
        let password = generatePassword(keyword, account.key, account.special_char, account.char_frequency, account.digit, account.digit_frequency, website.chars_not_permitted, website.password_min, website.password_max)
        
        displayPassword.innerHTML = `<h3>Password:</h3><h3 style="color:red;">${password}</h3>`
        subDetails.appendChild(displayPassword)
    })
}



// Back button to website details
function backToWebsiteDetails(website) {
    let webDetails = document.getElementById('web-details')
    let subDetails = document.getElementById('sub-details')
    if (document.getElementById('back-button')) {
        document.getElementById('back-button').remove()
    }
    
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



