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
    // hi people who look at code site not ready enter at own RISK
    if (tf.value === "aguascalientes2") {
        localStorage.setItem(localStorageKey, tf.value);
        
        var left = document.getElementById("leftCircle");
        left.classList.add("leftAnimating");
        var right = document.getElementById("rightCircle");
        right.classList.add("rightAnimating");
        var left = document.getElementById("leftCircleText");
        left.classList.add("leftAnimatingText");
        var right = document.getElementById("rightCircleText");
        right.classList.add("rightAnimatingText");

        setTimeout(() => {
            window.location.href = "index.html"
        }, 4000);
    }
    else 
    {
        // TODO error shake (check save the date)
        tf.value = ""
    }
}