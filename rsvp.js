const localStorageKey2 = "samimi_rsvpkey";

var hintID = "hint"
var inputID = "rsvp"
var formID = "form"
var attendeesID = "attendees"





async function checkrsvp() {
    var tf = document.getElementById(inputID);
    var savedNameKey = tf.value//.toLowerCase();
    // TODO: fix lowercase data sanitization server side
    var check = await serverCheck(savedNameKey); // this will have a data model
    if (check !== null)
    {
       stageTwo(check, savedNameKey);
    }
    else if (!attempted) {
        attempted = true;
        // show hint
    }
}

async function initialize() {
    var key = localStorage.getItem(localStorageKey2);
    console.log(key + " " + localStorageKey2)
    if (key !== null && key != "")
    {
        // TODO: loading spinner
        var check = await serverCheck(key);
        console.log(check);
        if (check !== null)
        {
            console.log("sdhjsk");
            stageTwo(check, key);
        }
        else 
        {
            // OPTIONAL clear local storage if this doesn't work
            // OPTIONAL display the message
        }
    }
}

function buildInitialUI(elem, data)
{
    for (var item of data)
    {
        var nameDiv = document.createElement('div');
        nameDiv.textContent = item.name;
        attendees.appendChild(nameDiv)
    }

    // the submit mutation from this function is updating attendee variable for the given party
}

function buildFoodUI(elem, data)
{
    // show the menu?

    // the submit mutation from this function is updating food choices for attending ppl
}

function buildRevisionsUI(elem, data)
{

}

function stageTwo(data, namekey)
{
    localStorage.setItem(localStorageKey2, namekey);
    var hint = document.getElementById(hintID);
    hint.classList.add("hidden"); // TODO: add this

    var form = document.getElementById(formID);
    form.classList.remove("hidden");

    var attendees = document.getElementById(attendeesID);
    console.log("child count" + attendees.children.length)
    const attendeePrevCount = attendees.children.length;
    for (var i=0; i<attendeePrevCount; i++)
    {
        attendees.children[0].remove()
    }

    // what state are we in. This is where we do data processing
    // if we ever see a null attending field, 

    for (var item of data)
    {
        if (data.going != "1" || data.going != "0")
        {
            // this is the first time we are loading this data
            buildInitialUI(attendees, data);
            return;
        }
    }

    for (var item of data)
    {
        if (data.going === "1" && (data.food === null || data.food === ""))
        {
            buildFoodUI(attendees, data.filter(attendee => attendee.going === "1"));
            return;
        }
    }

    buildRevisionsUI(attendees, data);
    




    


    // ok create the ppl checkboxes dynamically? add these things as children of a div
    // checkbox shows the dietary restrictions

    // submit button

    // This submit button will send new data to update the server store for the sub people and the response will be the food prefs for the attendees
}

async function serverCheck(key) {

    var url = 'https://script.google.com/macros/s/AKfycby_lgXWcSDUPHzBWWKjwQvkNs2jy8QShYPu8TTOJrMQiTvSEAiGboK0bb08IkNb2pNy/exec'
    var urlWithName = url + '?path=Sheet1&action=query&Name=' + encodeURIComponent(key);
    console.log(urlWithName);

    return fetch(urlWithName)
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // or .text(), .blob(), etc., depending on expected response
        })
        .then(data => {
            console.log('Data received:', data);
            return data.data;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });

}

initialize();




// high level todos
// figure out server stuff (just need a DB on a server somewhere that people can't read)
// client side need the multiple paths and stages (dropdown for food, checkboxes for who is coming)
// client side need styling
// also fix the footer nonsense