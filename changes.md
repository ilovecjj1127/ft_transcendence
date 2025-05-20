[O--- a/frontend/utils/modals.js
+++ b/frontend/utils/modals.js
@@ -18,6 +18,9 @@ export function hideLoginModal () {
     document.getElementById('login-message').innerHTML = ''
     document.getElementById("login-form").reset()
     loginModal.hide()
+    setTimeout( () => {
+        window.location.reload()
+    }, 1000);
 }

so that it refreshes after login



to check changes before merge conveniently;

git diff 2dec016 --patch-with-stat frontend/

git diff 2dec016 --patch-with-stat backend/
