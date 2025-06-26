import { translations } from "./dictionary.js"

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

document.getElementById('languageSelect').addEventListener('change', (e) => {
  const selectedLang = e.target.value;
  localStorage.setItem('appLanguage', selectedLang); // Save selected language
  location.reload(); // Reload page to reapply translation
});