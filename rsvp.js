const localStorageKey = "samimi_rsvpkey";

var attempted = false;

// on page load if we have the key stored the edit rsvp link will show and that function will submit

var testData = {
    "number":"2",
    "names":"yui"
}

var hintID = "hint"
var inputID = "rsvp"
var formID = "form"

function checkrsvp() {
    var tf = document.getElementById(inputID);
    var savedNameKey = tf.value.toLowerCase();
    var check = serverCheck(savedNameKey); // this will have a data model
    if (check !== null)
    {
       stageTwo(check, savedNameKey);
    }
    else if (!attempted) {
        attempted = true;
        // show hint
    }
}

function initialize() {
    var key = localStorage.getItem(localStorageKey);
    if (key !== null)
    {
        var check = serverCheck(key);
        if (check !== null)
        {
            stageTwo(check, key);
        }
        else 
        {
            // OPTIONAL clear local storage if this doesn't work
            // OPTIONAL display the message
        }
    }
}

function stageTwo(data, namekey)
{
    localStorage.setItem(localStorageKey, namekey);
    var hint = document.getElementById(hintID);
    hint.classList.add("hidden"); // TODO: add this

    var form = document.getElementById(formID);
    form.classList.remove("hidden");

    console.log("?")
    // ok create the ppl checkboxes dynamically? add these things as children of a div
    // checkbox shows the dietary restrictions

    // submit button

    // hide hint if alive
    // show next bit
    // change above text to be "rsvping for:" or like the field is auto filled in or something
}

function serverCheck(key) {
    // TODO: actually do this
    return testData;
}

initialize();