

export function hideOrShowSocialMenu(accessTokenParameter)
{
    if (accessTokenParameter)
    {
        document.getElementById("social-menu-container").style.display = "flex"

    }
    else
    {
        document.getElementById("social-menu-container").style.display = "none"
    }
    // if (checkToken() == true)
    // {
    //     if (DEBUGPRINTS) console.log("checkToken ok. token=", getUserToken().access)

    //     document.getElementById("social-menu-container").style.display = "flex"
    // }
    // else
    // {
    //     if (DEBUGPRINTS) console.log("checkToken not ok. token=", getUserToken().access)

    //     document.getElementById("social-menu-container").style.display = "none"
    //     // showLoginModal()
    //     // return
    // }
    // if (DEBUGPRINTS) console.log("userInfo  now. token=", await getUserInfo(getUsername()))

    // what to do if token not correct? why not showlogin modal again?


    // if (!token) {
    //         document.getElementById("social-menu-container").style.display = "none"
    //         showLoginModal()

    //         console.log("post showLoginModal. token=", token)
    //         // window.location.reload();
    //         return
    // }
    // document.getElementById("social-menu-container").style.display = "flex"

}