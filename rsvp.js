const localStorageKey2 = "samimi_rsvpkey";

var hintID = "hint"
var inputID = "rsvp"
var formID = "form"
var attendeesID = "attendees"
var loadingID = "loading"
var attendeesHeaderID = "attendeesHeader"
var initialCalloutID = "initialCallout"

var timerID = 0;
var timerFrame = 0;
function showLoading()
{
    // show
    var loading = document.getElementById(loadingID);
    loading.classList.remove("hidden"); // TODO: add this

    timerID = setInterval(() => {
        if (timerFrame % 3 == 0) loading.textContent = "Loading."
        if (timerFrame % 3 == 1) loading.textContent = "Loading.."
        if (timerFrame % 3 == 2) loading.textContent = "Loading..."
        timerFrame++;
    }, 500)
}

function hideLoading()
{
    clearInterval(timerID)
    // hide
    var loading = document.getElementById(loadingID);
    loading.classList.add("hidden");
}


async function checkrsvp() {
    var tf = document.getElementById(inputID);
    var savedNameKey = tf.value//.toLowerCase();
    var hint = document.getElementById(hintID)
    hint.classList.add("hidden")

    // TODO: fix lowercase data sanitization server side
    showLoading()
    var check = await serverCheck(savedNameKey); // this will have a data model
    hideLoading()
    if (check !== null)
    {
       stageTwo(check, savedNameKey);
    }
    else {
        // attempted = true; this was going to be for auto loading I think?
        hint.classList.remove("hidden")
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

var buttonTracker = [];
function initializeButtonTracker(elemCount)
{
    buttonTracker = []
    for (var i=0; i<elemCount; i++)
    {
        buttonTracker.push(0);
    }
}

function updateButtonTracker(idx, bit, button)
{
    buttonTracker[idx] = bit ? 1 : 0;

    console.log(buttonTracker + " " + bit);
    for (var tracker of buttonTracker)
    {
        if (tracker === 0) {
            button.disabled = true;
            return;
        }
    }

    button.disabled = false;
}

function buildInitialUI(elem, elemHeader, data, edit)
{
    elemHeader.textContent = "Hello! We have your party down for these attendees. To start, mark each person's attendance for Friday's festivities"
    var selectionArr = []

    var button = document.createElement('button')
    initializeButtonTracker(data.length)


    for (let [idx, item] of data.entries())
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        console.log(item.name + " ghjdkfs")
        tableRow.appendChild(tableHeader)
        var tableHeader2 = document.createElement('th');
        var selection = attendingOptionList(); // !edit to do the revised flow but submission is more complex
        selection.addEventListener('change', (e) => {
            updateButtonTracker(idx, e.target.selectedIndex !== 0, button);
        })
        updateButtonTracker(idx, item.going === 1 || item.going === 0, button);
        selectionArr.push(selection);
        selection.selectedIndex = dataToSelectedIndex(item);
        tableHeader2.appendChild(selection);
        tableRow.appendChild(tableHeader2)
        elem.appendChild(tableRow)
    }

    // onsubmit, modify data, call stage2 with the modified data
    button.onclick = () => {onSubmitInitialUI(data, selectionArr)};
    button.textContent = "Next"
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

    // TODO:
    // if everyone is a no, we early submit
    // this case also needs to route to the edit screen in stageTwo

    console.log("hi");
    console.log(originalData)
    stageTwo(originalData, null)
}

function buildFoodUI(elem, elemHeader, fulldata, data)
{
    elemHeader.textContent = "Wonderful! We've selected some very tasty food options for dinner: for those attending, please mark what food option they'd prefer. Please let sam or mimi know via text if your party has additional dietary restrictions we should be aware of."
    // TODO: add shuttle text here too / styling wise we should have a lower pt font for addt info like the dietary ask

    var selectionArr = []

    var button = document.createElement('button')
    initializeButtonTracker(data.filter(attendee => attendee.baby === 0).length)


    for (let [idx, item] of data.entries())
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeaderFilled = document.createElement('th');
        tableHeaderFilled.textContent = item.going === 1 ? "Can Attend" : item.going === 0 ? "Cannot Attend" : "Error";
        tableRow.appendChild(tableHeaderFilled);
        // TODO: actually handle this error?


        var tableHeader2 = document.createElement('th');
        if (item.baby === 0)
        {
            var selection = foodOptionList();
            selection.addEventListener('change', (e) => {
                updateButtonTracker(idx, e.target.selectedIndex !== 0, button);
            })
            console.log(item.food)
            updateButtonTracker(idx, item.food !== 0 && item.food !== "", button);
            selectionArr.push(selection);
            selection.selectedIndex = item.food;
            tableHeader2.appendChild(selection);
        }
        else
        {
            var babyText = document.createElement('th')
            babyText.innerText = item.baby === 1 ? "Kid's Meal" : "Bites of your food / baby food as appropriate"
            tableHeader2.appendChild(babyText);
        }

        tableRow.appendChild(tableHeader2)
        elem.appendChild(tableRow)
    }

    // two checkboxes surrounded by text
    // TODO write the text

    // These should maybe be outside the table?

    var shuttleCheckboxes = []

    var shuttleRow1 = document.createElement('tr');
    var shuttleRowText1 = document.createElement('th');
    shuttleRowText1.innerText = "Friday shuttles (hotel->cathedral->reception->hotel)"
    shuttleRow1.appendChild(shuttleRowText1)
    var shuttleRowInput1 = document.createElement('input')
    shuttleCheckboxes.push(shuttleRowInput1)
    shuttleRowInput1.type = "checkbox"
    shuttleRow1.appendChild(shuttleRowInput1)
    elem.appendChild(shuttleRow1);


    var shuttleRow2 = document.createElement('tr');
    var shuttleRowText2 = document.createElement('th');
    shuttleRowText2.innerText = "Saturday shuttles (hotel->loretito->hotel)"
    shuttleRow2.appendChild(shuttleRowText2)
    var shuttleRowInput2 = document.createElement('input')
    shuttleCheckboxes.push(shuttleRowInput2)
    shuttleRowInput2.type = "checkbox"
    shuttleRow2.appendChild(shuttleRowInput2)
    elem.appendChild(shuttleRow2);

    var buttonRow = document.createElement('tr');

    var ebutton = document.createElement('button')
    ebutton.onclick = () => {stageTwo(fulldata, null, false, true)};
    ebutton.textContent = "Back"
    buttonRow.appendChild(ebutton);

    button.onclick = () => {onSubmitFoodUI(fulldata, selectionArr, shuttleCheckboxes)};
    button.textContent = "Submit"
    buttonRow.appendChild(button);

    elem.appendChild(buttonRow);
    // additional dietary restrictions please reach out to sam and mimi

    // TODO: add a back button that will set the attending data but somehow not have it be submitted? hmm. maybe just call stage2 with another bool that forces us into edit mode if the other data isn't filled in yet. maybe the same bool

    // the submit mutation from this function is updating food choices for attending ppl
}

// app script data appears to allow floats...

function serverDataFromShuttleInfo(shuttleInfo, baby)
{
    // technically you could infer this from food being zero? eh
    if (baby === 0 || baby === 1)
    {
        if (shuttleInfo[0].checked === true && shuttleInfo[1].checked == true) return 30;
        if (shuttleInfo[0].checked === true && shuttleInfo[1].checked == false) return 20;
        if (shuttleInfo[0].checked === false && shuttleInfo[1].checked == true) return 10;
    }
    return 0;
}

async function onSubmitFoodUI(optimisticData, foodInfo, shuttleInfo)
{
    console.log(optimisticData);
    var count = 0;
    for (var item of optimisticData)
    {
        if (item.going === 0 || item.baby !== 0)
        {
            showLoading()
            await serverUpdate(item.name, item.going)
            hideLoading()
        } else
        {
            var serverDataForShuttle = serverDataFromShuttleInfo(shuttleInfo, item.baby)
            var food = foodInfo[count++].selectedIndex + serverDataForShuttle;
            showLoading()
            await serverUpdate(item.name, food)
            hideLoading()
            item.food = food // optimistic update...
            item.shuttle = serverDataForShuttle / 10 // optimistic
            //console.log("logan " + item.shuttle)
        }
    }

    // if we get some successes go to the next page
    // ideally this returns the data via a fetch but... this is fine
    stageTwo(optimisticData, null)
}

// ok its worth thinking about flow here
// do we show a text output of final selections here including the not attending people

function buildRevisionsUI(elem, elemHeader, data, edit)
{
    var selectionArr = []
    var foodSelectionArr = []

    var noAttendees = false;
    elemHeader.textContent = !noAttendees ? 
    "Hooray! You're all set. Feel free to edit any of this data before the deadline of October 1 2025. We're excited to see you!" :
    "We're very sorry to be missing you! We understand and know that you are loved with all our hearts. That said, if any part of your inability to attend is financial Sam and Mimi would love to chat about if some support could make attending possible :)"

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

            if (item.baby !== 0 || !edit)
            {
                tableHeader3.textContent = item.baby === 1 ? "Kid's Meal" : item.baby === 2 ? "Whatever the baby eats" : item.food === 1 ? "Chicken" : item.food === 2 ? "Salmon" : item.food === 3 ? "Veggie" : "Error"
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

    // These should maybe be outside the table?

    // TODO: change these to yesses if we aren't in edit mode
    // TODO: use item values
    // console.log(data[0].shuttle + "SHUTTLE")
    console.log(data)
    var shuttleCheckboxes = []


    var shuttleRow1 = document.createElement('tr');
    var shuttleRowText1 = document.createElement('th');
    shuttleRowText1.innerText = "Friday shuttles (hotel->cathedral->reception->hotel)"
    shuttleRow1.appendChild(shuttleRowText1)
    if (edit) {


    var shuttleRowInput1 = document.createElement('input')
    shuttleCheckboxes.push(shuttleRowInput1)
    shuttleRowInput1.type = "checkbox"
    shuttleRowInput1.checked = (data[0].shuttle === 2 || data[0].shuttle === 3)
    shuttleRow1.appendChild(shuttleRowInput1)
    }
    else
    {
        var shuttleRowInput1 = document.createElement('th')
    // shuttleCheckboxes.push(shuttleRowInput1)
    shuttleRowInput1.innerText = data[0].shuttle === 2 || data[0].shuttle === 3 ? "Yes" : "No"
    shuttleRow1.appendChild(shuttleRowInput1)
    }
    elem.appendChild(shuttleRow1);

    // TODO: fix this to have 2 options for friday

    var shuttleRow2 = document.createElement('tr');
    var shuttleRowText2 = document.createElement('th');
    shuttleRowText2.innerText = "Saturday shuttles (hotel->loretito->hotel)"
    shuttleRow2.appendChild(shuttleRowText2)
    if (edit) {
        var shuttleRowInput2 = document.createElement('input')
        shuttleCheckboxes.push(shuttleRowInput2)
        shuttleRowInput2.type = "checkbox"
        shuttleRowInput2.checked = (data[0].shuttle === 1 || data[0].shuttle === 3)
        shuttleRow2.appendChild(shuttleRowInput2)
    }
    else
    {
        var shuttleRowInput2 = document.createElement('th')
        // shuttleCheckboxes.push(shuttleRowInput1)
        shuttleRowInput2.innerText = data[0].shuttle === 1 || data[0].shuttle === 3 ? "Yes" : "No"
        shuttleRow2.appendChild(shuttleRowInput2)
    }
    elem.appendChild(shuttleRow2);

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
        button.onclick = () => {onSubmitEdits(data, selectionArr, foodSelectionArr, shuttleCheckboxes)};
        button.textContent = "Submit Edits"
        elem.appendChild(button);
    }
}

async function onSubmitEdits(originalData, attendanceInfo, foodInfo, shuttleCheckboxes)
{
    for (var [idx, item] of originalData.entries())
    {
        item.going = selectionToRSVP(attendanceInfo[idx], false);
        item.food = item.baby !== 0 ? item.going : item.going === 1 ? foodInfo[idx].selectedIndex : 0;
        item.shuttle = serverDataFromShuttleInfo(shuttleCheckboxes, item.baby) / 10
        showLoading()
        await serverUpdate(item.name, item.food + serverDataFromShuttleInfo(shuttleCheckboxes, item.baby))
        hideLoading()
    }

    stageTwo(originalData, null);
}

// TODO: also change the top level text here
function stageTwo(data, namekey, edit = false, back = false)
{
    if (namekey !== null)
    {
        // test
        console.log("dhi" + namekey);
        if (localStorage.getItem(localStorageKey2) !== null) localStorage.removeItem(localStorageKey2)
        localStorage.setItem(localStorageKey2, namekey);
        console.log(localStorage.getItem(localStorageKey2));
    }

    var initial = document.getElementById(initialCalloutID)
    initial.classList.add("hidden");

    var hint = document.getElementById(hintID);
    hint.classList.add("hidden"); // TODO: add this

    var form = document.getElementById(formID);
    form.classList.remove("hidden");

    var attendeesHeader = document.getElementById(attendeesHeaderID);
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
            buildInitialUI(attendees, attendeesHeader, data, back);
            return;
        }
    }

    for (var item of data)
    {
        if (item.going === 1 && item.baby === 0 && (item.food === null || item.food === ""))
        {
            // second stage
            buildFoodUI(attendees, attendeesHeader, data, data.filter(attendee => attendee.going === 1));
            return;
        }
    }

    buildRevisionsUI(attendees, attendeesHeader, data, edit);
}



const url = 'https://script.google.com/macros/s/AKfycbyCQn2PbMB2xf0iEWYt84ETsEBvhw7gXpLmumZ7WLI-ssswY9S6ZK3b-eBOjY7AIzbm/exec';

async function serverCheck(key) {
    var urlWithName = url + '?path=Sheet1&action=query&Name=' + encodeURIComponent(key.toLowerCase());
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
            return null;
        });

}

async function serverUpdate(name, food) {
    var urlWithName = url + '?path=Sheet1&action=rsvp&Name=' + encodeURIComponent(name.toLowerCase()) + '&Food=' + encodeURIComponent(food);
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
// ** client styling (seperate segments)

// fix the shuttles

// different text for if everyone in party says no
// dynamic disabling for the edit view




// put the names in the sheet and format properly

// THIS IS THE POINT I CAN UPDATE

// mobile testing + fast follows




// Lower Pri for Form
// fix whatever is happening with local variable storage in safari
// server side reject food input outside of 0-4 or whatever
// email form for additional updates on the submit page?
// do I want to embed the RSVP on the home page?
// do we need a button to reshow the name entry? 

// Future TODO
// footer fixing