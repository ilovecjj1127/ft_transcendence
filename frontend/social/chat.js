const list = document.getElementById("friends-list")
const chatBox = document.querySelector('.chatbox-message-wrapper')

//example to check the overflow-y
// const friends = [
//     {name: "friend1"},
//     {name: "friend2"},
//     {name: "friend3"},
//     {name: "friend4"},
//     {name: "friend5"},
//     {name: "friend6"},
//     {name: "friend7"},
//     {name: "friend8"},
//     {name: "friend9"},
//     {name: "friend10"},
//     {name: "friend11"},
//     {name: "friend12"},
//     {name: "friend13"},
//     {name: "friend14"},
//     {name: "friend15"},
//     {name: "friend17"},
//     {name: "friend18"},
//     {name: "friend20"},
//     {name: "friend21"},
//     {name: "friend22"},
//     {name: "friend23"},
//     {name: "friend24"},
//     {name: "friend25"},
//     {name: "friend26"},
//     {name: "friend27"},
//     {name: "friend28"},
//     {name: "friend29"},
//     {name: "friend30"},
//     {name: "friend31"},
//     {name: "friend32"},

// ]

//used to check if same friend is pressed
let friendChatOpen = null

export function populateFriendList() {

	const friends = JSON.parse(localStorage.getItem("friends"))
	list.innerHTML = ''
	if (friends.length > 0){
		friends.forEach(friend => {
			const li = document.createElement('li')
			console.log(friend)
			const img = document.createElement('img')
			img.src = friend.img ? friend.img : "./media/default.jpeg";
			img.addEventListener('click', () => {
			//here change id with whatever
				if (friendChatOpen && friendChatOpen.name == friend.name) {
					chatBox.classList.remove('show')
					friendChatOpen = null
				} else {                
					if (chatBox.classList.contains('show')) {
						chatBox.classList.remove('show')
				
						setTimeout(() => updateChat(friend), 600)
						friendChatOpen = friend
					} else {
						updateChat(friend)
						friendChatOpen = friend
					}
				}
			})
			li.appendChild(img)
			list.appendChild(li)
		});
	}
}

function updateChat (friend) {
    /* 
    here update all content of chat box
    */
   //get user infos and then update the chat
   chatBox.classList.add('show')
}

const closeChat = document.querySelector('.chatbox-message-close')

closeChat.addEventListener('click', function (){
    chatBox.classList.remove('show')
})
