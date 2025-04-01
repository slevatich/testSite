const localStorageKey = "samimipw";

function check() {
    var key = localStorage.getItem(localStorageKey);
    if (key === null)
    {
        window.location.href = "../password.html"
        // TODO: potentially pop up the password as a blocking modal instead
        // might be easier to play the animation more times
    }
}

// run this on page load
check();