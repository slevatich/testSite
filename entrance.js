const localStorageKey = "samimipw";

// if you are a curious technologically savy person and reading this
// I do not stand by this security
// please dont hack us
// we just wanted a nice intro animation

function check() {
    var key = localStorage.getItem(localStorageKey);
    if (key === null)
    {
        window.location.href = "password.html"
        // TODO load the intro page (or always play the animation? make that a part of the pages?)
        
        // console.log("error!");
    }
    // console.log("hshhs");

    // localStorage.setItem(localStorageKey, "yes");
    // localStorage.setItem(localStorageKey, null);
}

// running
check();