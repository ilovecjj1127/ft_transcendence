import { getUserToken } from "../utils/userData.js";
import { DEBUGPRINTS } from "../config.js"

let switch_bool2 = true

export default function openSelectFriend(frienda)
{
    const SelectFriendgBox = document.getElementById("select-friend-box-id");
    if (SelectFriendgBox && switch_bool2) {
        SelectFriendgBox.style.display = "block";
        document.getElementById("friend-user-name").textContent = frienda;
        document.getElementById("remove-friend").addEventListener("click", () => removeFriend(frienda));
        switch_bool2 = false
    }
    else if (SelectFriendgBox && !switch_bool2) {
        SelectFriendgBox.style.display = "none";
        switch_bool2 = true
    } else {
        console.error("Error: #chatting-box not found in the DOM.");
}}

export async function removeFriend(username)
{
    const response = await fetch(`http://${window.location.host}/api/users/remove_friend/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getUserToken().access}`
        },
        body: JSON.stringify({username})
    });
    const response_data = await response.json()
    if (DEBUGPRINTS) console.log("response_data: ", response_data)
}
