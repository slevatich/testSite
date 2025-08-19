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

    // too tired to be fancy, here's plaintext
    if (tf.value.toLowerCase() === "aguascalientes") {
        localStorage.setItem(localStorageKey, tf.value);

        // hmm not sure why this waits for animations to complete but oh well
        setTimeout(() => {
            window.location.href = "index.html"
        }, 2500);

        var left = document.getElementById("leftCircle2");
        left.classList.add("leftAnimating");
        var right = document.getElementById("rightCircle2");
        right.classList.add("rightAnimating");
        var left2 = document.getElementById("leftCircleText");
        left2.classList.add("leftAnimatingText");
        var right2 = document.getElementById("rightCircleText");
        right2.classList.add("rightAnimatingText");
        var right3 = document.getElementById("passwordTitle");
        right3.classList.add("textAnimating");


    }
    else
    {
        // TODO error shake (check save the date)
        tf.value = ""
    }
}
