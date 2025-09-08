import { translations } from "./dictionary.js"
import { getLanguage } from "../utils/userData.js"
import { getUserToken } from "../utils/userData.js"
import { checkToken } from "../utils/token.js"

export async function applyTranslations(lang) {
  const t = translations[lang]

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    if (t[key]) el.textContent = t[key]
  })

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder')
    if (t[key]) el.placeholder = t[key]
  })
}

document.getElementById('languageSelect').addEventListener('change', async (e) => {
  let selectedLang = e.target.value
  let check = true
  if (getUserToken().access){
    check = await saveLanguage(selectedLang)
  }
  if (check) {
    localStorage.setItem('appLanguage', selectedLang)
    location.reload()
  } else {
    e.target.style.backgroundColor = "red"
    e.target.style.color = "white"
    e.target.disabled = true
    setTimeout( () => {
        e.target.style.backgroundColor = "white"
        e.target.style.color = "black"
        e.target.disabled = false
    }, 3000)
  }
});

async function saveLanguage(lang) {
  const isTokenValid = await checkToken()
  if (!isTokenValid){
    console.log("token problem")
    return 
  }
  
  const response = await fetch(`https://${window.location.host}/api/users/language_change/`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getUserToken().access}`
      },
      body: JSON.stringify({language: lang}),
  });

  if (response.ok) {
    console.log("ok")
    return true
  } else {
    console.log(response.status)
    return false
  }
}