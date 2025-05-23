### comments about diffs aka changes from pull requests

## backend

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

# so that it refreshes after login



docker-compose file; 
    environment:
      - REDIS_HOST=transcendence_redis
      - REDIS_PORT=6379

settings.py;
REDIS_HOST = os.getenv("REDIS_HOST", "transcendence_redis")  # Defaults to service name
REDIS_PORT = os.getenv("REDIS_PORT", "6379")  # Defaults to service name
# seems logical for me to keep it, i wrote it some time ago

consumers.py;

        chat_message = {
            'username': self.username,
            'message': data['message'],
            # 'option-game-invite':  data['option-game-invite'],
            'date': data['date']
# need this for chat
views.py;
def room(request, room_id):
    username_to_chat_with = request.GET.get("username_to_chat_with", "unknown") 
    return render(request, 'chat/room.html', {
        'room_id': room_id,
        'username_to_chat_with': username_to_chat_with,
        'current_user': request.user.username
    })
# also for chat

    def patch(self, request: Request) -> Response:
        serializer = ChatGetOrCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        chatroom_id = request.query_params.get('chatroom_id')
# need this one also?? not sure

requirements.txt
# only additions is ok

backend/users/management/commands/make_friends.py
# extra file, for testing

app.js;
if (DEBUGPRINTS) console.log("%c Hashchange happend!", "color: red;")
if (DEBUGPRINTS) console.log("location.hash: ", location.hash)

# good to keep for debugging later
settings.py;

REDIS_HOST = os.getenv("REDIS_HOST", "transcendence_redis")  # Defaults to service name
REDIS_PORT = os.getenv("REDIS_PORT", "6379")  # Defaults to service name

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
+            "hosts": [(REDIS_HOST, int(REDIS_PORT))],  # Ensure this matches your Redis host and port
-
        },
    }
}
# correct working hosts config now

## frontend

routes/users/users.js;

    const user = localStorage.getItem("userSearched")
    localStorage.removeItem("userSearched")
   + console.log("user: ", user)
   + getUserSearched(user)

   - getUserSearched()
-

    function closeStats () {
        deleteStatsEvents()
        location.hash = '/stats'
    }
    

    // get user stats and save it in stats variable
    async function getUserSearched () {
    async function getUserSearched (user) {
        const isTokenValid = await checkToken()

        if (!isTokenValid) return
# now putting user( to search ) into parameter

utils/modals.js

    loginModal.hide()
    setTimeout( () => {
        window.location.reload()
    }, 1000);

# reload window after loginmodal close, so that u dont have to do manually

utils/modals.js
window.addEventListener('load', () => {
    if (checkToken() == true)
    {
        if (DEBUGPRINTS) console.log("checkToken ok. token=", getUserToken().access)

        document.getElementById("social-menu-container").style.display = "flex"
    }
    else
    {
        if (DEBUGPRINTS) console.log("checkToken not ok. token=", getUserToken().access)

        document.getElementById("social-menu-container").style.display = "none"
        // showLoginModal()
        // return
    }
    if (DEBUGPRINTS) console.log("userInfo  now. token=", await getUserInfo(getUsername()))

//what to do if token not correct? why not showlogin modal again?

# to hide socialmenu when not logged in..

nginx.conf;
add_header X-Content-Type-Options nosniff;
# addition


to check changes before merge conveniently;

git diff 2dec016 --patch-with-stat frontend/

git diff 2dec016 --patch-with-stat backend/
