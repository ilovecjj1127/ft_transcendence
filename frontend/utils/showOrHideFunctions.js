import { getUserInfo } from "../chat.js"
import { DEBUGPRINTS } from "../config.js"
import { checkToken } from "./token.js"
import { getUsername } from "./userData.js"


export async function hideOrShowSocialMenu(accessTokenParameter)
{
    if (DEBUGPRINTS) console.log("accessToken: ", accessTokenParameter, checkToken(accessTokenParameter))
    
    const userName = getUsername()

    if (DEBUGPRINTS) console.log("user info; ", userName)

    if (checkToken(accessTokenParameter) && userName != null)
    {
        if (DEBUGPRINTS) console.log("token valid")
        document.getElementById("social-menu-container").style.display = "flex"
    }
    else
    {
        if (DEBUGPRINTS) console.log("token not valid")
        document.getElementById("social-menu-container").style.display = "none"
    }
}
