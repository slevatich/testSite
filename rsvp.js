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

// use official unselected?
function attendingOptionList()
{
    var select = document.createElement('select');
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));
    select.children[0].textContent = "--";
    select.children[1].textContent = "Can Attend"
    select.children[2].textContent = "Cannot Attend"
    return select;
}

function foodOptionList()
{
    var select = document.createElement('select');
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));
    select.children[0].textContent = "--";
    select.children[1].textContent = "Chicken"
    select.children[2].textContent = "Salmon"
    select.children[3].textContent = "Veggie"
    return select;
}

function buildInitialUI(elem, data)
{
    var selectionArr = []
    for (var item of data)
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeader2 = document.createElement('th');
        var selection = attendingOptionList();
        selectionArr.push(selection);
        selection.selectedIndex = item.going === 1 ? 1 : item.going === 0 ? 2 : 0;
        tableHeader2.appendChild(selection);
        tableRow.appendChild(tableHeader2)
        elem.appendChild(tableRow)
    }

    // onsubmit, modify data, call stage2 with the modified data
    var button = document.createElement('button')
    button.onclick = () => {onSubmitInitialUI(data, selectionArr)};
    button.textContent = "Submit"
    elem.appendChild(button);
    // TODO: button must be disabled until all are used
    // TODO: button style needs to be outside this element

    // <tr>
    //         <th>Mimi Santos</th>
    //         <th>Can Attend</th>
    //         <th><select><option>--</option><option>Can Attend</option><option>Cannot Attend</option></select></th>

    // the submit mutation from this function is updating attendee variable for the given party
    // use optimistic data from last time to load this without a fetch?
}

function selectionToRSVP(selection)
{
    if (selection.selectedIndex == 1) return 1
    if (selection.selectedIndex == 2) return 0
    
    console.log("ERROR2")
    return -1
}

function onSubmitInitialUI(originalData, selectionInfo)
{
    console.log(originalData)
    console.log(selectionInfo)
    for (var [idx, item] of originalData.entries())
    {
        item.going = selectionToRSVP(selectionInfo[idx]);
    }
    console.log("hi");
    console.log(originalData)
    stageTwo(originalData, null)
}

function buildFoodUI(elem, data)
{
    for (var item of data)
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeaderFilled = document.createElement('th');
        tableHeaderFilled.textContent = item.going === 1 ? "Can Attend" : item.going === 0 ? "Cannot Attend" : "Error";
        tableRow.appendChild(tableHeaderFilled);
        // TODO: actually handle this error
        var tableHeader2 = document.createElement('th');
        var selection = foodOptionList();
        selection.selectedIndex = item.food;
        tableHeader2.appendChild(selection);
        tableRow.appendChild(tableHeader2)
        elem.appendChild(tableRow)
    }

    // additional dietary restrictions please reach out to sam and mimi

    // the submit mutation from this function is updating food choices for attending ppl
}

// ok its worth thinking about flow here
// do we show a text output of final selections here including the not attending people

function buildRevisionsUI(elem, data)
{
    for (var item of data)
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeaderFilled = document.createElement('th');
        tableHeaderFilled.textContent = item.going === 1 ? "Can Attend" : item.going === 0 ? "Cannot Attend" : "Error";
        tableRow.appendChild(tableHeaderFilled);
        // TODO: actually handle this error
        if (item.going === 1) {
            var tableHeader2 = document.createElement('th');
            // var selection = foodOptionList();
            // selection.selectedIndex = item.food;
            // tableHeader2.appendChild(selection);


            tableHeader2.textContent = item.food === 1 ? "Chicken" : item.food === 2 ? "Salmon" : item.food === 3 ? "Veggie" : "Error"
            tableRow.appendChild(tableHeader2)
        }
        
        elem.appendChild(tableRow)
    }
}

// TODO: also change the top level text here
function stageTwo(data, namekey)
{
    if (namekey !== null)
    {
        localStorage.setItem(localStorageKey2, namekey);
    }
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

    console.log("testin")
    for (var item of data)
    {
        console.log(item.name + " " + item.going)
        if (item.going !== 1 && item.going !== 0)
        {
            // this is the first time we are loading this data
            buildInitialUI(attendees, data);
            return;
        }
    }

    for (var item of data)
    {
        if (item.going === 1 && (item.food === null || item.food === ""))
        {
            // second stage
            buildFoodUI(attendees, data.filter(attendee => attendee.going === 1));
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