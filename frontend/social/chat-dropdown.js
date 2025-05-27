
// 3 dots dropdown toggle (add eventlisteners for invite and remove) 

const dropDownToggle = document.querySelector('.chatbox-message-dropdown-toggle')
const dropDownMenu = document.querySelector('.chatbox-message-dropdown-menu')

dropDownToggle.addEventListener('click', function () {
        dropDownMenu.classList.toggle('show')
})

document.addEventListener('click', function (e) {
        if (!e.target.matches('.chatbix-message-dropdown, .chatbox-message-dropdown *')) {
                dropDownMenu.classList.remove('show')
        }
})

