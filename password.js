const localStorageKey = "samimipw";

// COULD maybe think about having the animation be more modal
// COULD logging! to make sure people get in

// TODO style this page

function checkpassword() {
    var tf = document.getElementById("pw");

    // TODO case insensitive

    // too tired to be fancy, here's plaintext
    if (tf.value === "aguascalientes") {
        localStorage.setItem(localStorageKey, tf.value);
        // TODO start the animation
        window.location.href = "index.html"
    }
    else 
    {
        // TODO error shake (check save the date)
        tf.value = ""
    }
}