

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
}
