const localStorageKey = "samimipw";

// COULD maybe think about having the animation be more modal
// COULD logging! to make sure people get in

// TODO style this page

// if you are a curious technologically savy person and reading this
// I do not stand by this security
// please dont hack us
// we just wanted a nice intro animation

function checkpassword() {
    var tf = document.getElementById("pw");

    // TODO case insensitive

    // too tired to be fancy, here's plaintext
    if (tf.value === "aguascalientes") {
        localStorage.setItem(localStorageKey, tf.value);
        // TODO start the animation, load new page on completion
        window.location.href = "index.html"
    }
    else 
    {
        // TODO error shake (check save the date)
        tf.value = ""
    }
}