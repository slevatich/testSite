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
        // if pulled from local storage maybe we clear that?
    }
}

function initialize() {
    var key = localStorage.getItem(localStorageKey2);
    console.log(key + " " + localStorageKey2)
    if (key !== null && key != "")
    {
        var tf = document.getElementById(inputID);
        tf.value = key;
    }
        // TODO: loading spinner
        // var check = await serverCheck(key);
        // console.log(check);
        // if (check !== null)
        // {
        //     console.log("sdhjsk");
        //     stageTwo(check, key);
        // }
        // else 
        // {
        //     // OPTIONAL clear local storage if this doesn't work
        //     // OPTIONAL display the message
        // }
    
}

// use official unselected?
function attendingOptionList(includeDashes = true)
{
    var count = 0;
    var select = document.createElement('select');
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));
    if (includeDashes) {
        select.appendChild(document.createElement('option'));
        select.children[count++].textContent = "--";
    }
    select.children[count++].textContent = "Can Attend"
    select.children[count++].textContent = "Cannot Attend"
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

function buildInitialUI(elem, data, edit)
{
    var selectionArr = []
    for (var item of data)
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeader2 = document.createElement('th');
        var selection = attendingOptionList(!edit);
        selectionArr.push(selection);
        selection.selectedIndex = dataToSelectedIndex(!edit);
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

function selectionToRSVP(selection, includeDashes = true)
{
    if (!includeDashes)
    {
        if (selection.selectedIndex == 1) return 0
        else return 1
    }
    if (selection.selectedIndex == 1) return 1
    if (selection.selectedIndex == 2) return 0
    
    console.log("ERROR2")
    return -1
}

function dataToSelectedIndex(item, includeDashes = true)
{
    if (!includeDashes) return item.going === 1 ? 0 : 1
    return item.going === 1 ? 1 : item.going === 0 ? 2 : 0;
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

function buildFoodUI(elem, fulldata, data)
{
    var selectionArr = []

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
        selectionArr.push(selection);

        selection.selectedIndex = item.food;
        tableHeader2.appendChild(selection);
        tableRow.appendChild(tableHeader2)
        elem.appendChild(tableRow)
    }

    var button = document.createElement('button')
    button.onclick = () => {onSubmitFoodUI(fulldata, selectionArr)};
    button.textContent = "Submit"
    elem.appendChild(button);
    // additional dietary restrictions please reach out to sam and mimi

    // TODO: add a back button that will set the attending data but somehow not have it be submitted? hmm. maybe just call stage2 with another bool that forces us into edit mode if the other data isn't filled in yet. maybe the same bool

    // the submit mutation from this function is updating food choices for attending ppl
}

async function onSubmitFoodUI(optimisticData, foodInfo)
{
    console.log(optimisticData);
    var count = 0;
    for (var item of optimisticData)
    {
        if (item.going === 0)
        {
            await serverUpdate(item.name, 0)
        } else
        {
            var food = foodInfo[count++].selectedIndex;
            await serverUpdate(item.name, food)
            item.food = food // optimistic update...
        }
    }

    // if we get some successes go to the next page
    // ideally this returns the data via a fetch but... this is fine
    stageTwo(optimisticData, null)
}

// ok its worth thinking about flow here
// do we show a text output of final selections here including the not attending people

function buildRevisionsUI(elem, data, edit)
{
    var selectionArr = []
    var foodSelectionArr = []

    for (var item of data)
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeader2 = document.createElement('th');
        if (!edit)
        {
            tableHeader2.textContent = item.going === 1 ? "Can Attend" : item.going === 0 ? "Cannot Attend" : "Error";
        }
        else
        {
            var selection = attendingOptionList(false);
            selectionArr.push(selection);
            selection.selectedIndex = item.going === 1 ? 0 : 1//item.going === 0 ? 2 : 0;
            tableHeader2.appendChild(selection);
        }
        tableRow.appendChild(tableHeader2);
        // TODO: actually handle this error
        if (item.going === 1 || edit) {
            var tableHeader3 = document.createElement('th');
            // var selection = foodOptionList();
            // selection.selectedIndex = item.food;
            // tableHeader2.appendChild(selection);

            if (!edit)
            {
                tableHeader3.textContent = item.food === 1 ? "Chicken" : item.food === 2 ? "Salmon" : item.food === 3 ? "Veggie" : "Error"
            }
            else
            {
                var selection = foodOptionList();
                foodSelectionArr.push(selection);

                selection.selectedIndex = item.food;
                tableHeader3.appendChild(selection);
            }
            tableRow.appendChild(tableHeader3)
        }
        
        elem.appendChild(tableRow)
    }

    if (!edit)
    {
        var button = document.createElement('button')
        button.onclick = () => {stageTwo(data, null, true)};
        button.textContent = "Edit"
        elem.appendChild(button);
    }
    else
    {
        var button = document.createElement('button')
        button.onclick = () => {onSubmitEdits(data, selectionArr, foodSelectionArr)};
        button.textContent = "Submit Edits"
        elem.appendChild(button);
    }
}

async function onSubmitEdits(originalData, attendanceInfo, foodInfo)
{
    for (var [idx, item] of originalData.entries())
    {
        item.going = selectionToRSVP(attendanceInfo[idx], false);
        item.food = item.going === 1 ? foodInfo[idx].selectedIndex : 0;
        await serverUpdate(item.name, item.food)
    }

    stageTwo(originalData, null);
}

// TODO: also change the top level text here
function stageTwo(data, namekey, edit = false, back = false)
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
        if (back || (item.going !== 1 && item.going !== 0))
        {
            // this is the first time we are loading this data (unless back is true)
            buildInitialUI(attendees, data, back);
            return;
        }
    }

    for (var item of data)
    {
        if (item.going === 1 && (item.food === null || item.food === ""))
        {
            // second stage
            buildFoodUI(attendees, data, data.filter(attendee => attendee.going === 1));
            return;
        }
    }

    buildRevisionsUI(attendees, data, edit);
}



const url = 'https://script.google.com/macros/s/AKfycbxQwQPjnE-DiEV2bW3UukU-721263tlN1vYsYVRKlkaOTm--nF4-Od3ciHXoCoQtx9C/exec';

async function serverCheck(key) {
    var urlWithName = url + '?path=Sheet1&action=query&Name=' + encodeURIComponent(key);
    console.log(urlWithName);

    return fetch(urlWithName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // response mime type
        })
        .then(data => {
            console.log('Data received:', data);
            return data.data;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });

}

async function serverUpdate(name, food) {
    var urlWithName = url + '?path=Sheet1&action=rsvp&Name=' + encodeURIComponent(name) + '&Food=' + encodeURIComponent(food);
    console.log(urlWithName);

    return fetch(urlWithName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .catch(error => {
            console.error('Update error:', error);
        });

}

document.addEventListener('DOMContentLoaded', initialize)



// TODO list
// loading spinners on async calls
// client styling

// Future TODO
// footer fixing