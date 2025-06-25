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

    // This submit button will send new data to update the server store for the sub people and the response will be the food prefs for the attendees
}

function serverCheck(key) {
    // TODO: actually do this
    return testData;
}

initialize();




// high level todos
// figure out server stuff (just need a DB on a server somewhere that people can't read)
// client side need the multiple paths and stages (dropdown for food, checkboxes for who is coming)
// client side need styling
// also fix the footer nonsense