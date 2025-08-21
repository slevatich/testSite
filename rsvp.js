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

async function addemail() {
    var tf = document.getElementById('email');
    var email = tf.value//.toLowerCase();
    // var hint = document.getElementById(hintID)
    // hint.classList.add("hidden")

    // TODO: fix lowercase data sanitization server side
    showLoading()
    var check = await emailAdd(email); // this will have a data model
    hideLoading()

        var tf2 = document.getElementById('emailresult');
    tf2.classList.remove('hidden');
        var tf3 = document.getElementById('emailbox');
        tf3.classList.add('hidden');


    // if (check !== null)
    // {
    //    stageTwo(check, savedNameKey);
    // }
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
    select.children[1].textContent = "Chicken (contains ham)"
    select.children[2].textContent = "Salmon"
    select.children[3].textContent = "Veggie"
    return select;
}

function shuttleOptionList(isFriday)
{
    var count = 0;
    var select = document.createElement('select');
    select.appendChild(document.createElement('option'));
    select.appendChild(document.createElement('option'));

    select.children[count++].textContent = "Not Needed"
    select.children[count++].textContent = "From/To Hilton"
    if (isFriday) {
        select.appendChild(document.createElement('option'));
        select.children[count++].textContent = "From/To Loretito";
    }

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

// based on the can/can't attend values, have an associated selection to hide and show
// if we hide it, set the tracker properly
// if we show it just show it

function updateButtonTracker2(idx, bit, childButton, submitButton)
{
    if (bit)
    {
        childButton.classList.remove("hidden")
        updateButtonTracker(idx, childButton.selectedIndex !== 0, submitButton);
    }
    else
    {
        childButton.classList.add("hidden")
        updateButtonTracker(idx, true, submitButton);
    }
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
        tableHeader.classList.add("namecell");
        tableHeader.textContent = item.name;
        console.log(item.name + " ghjdkfs")
        tableRow.appendChild(tableHeader)
        var tableHeader2 = document.createElement('th');
        tableHeader2.classList.add("infocell");

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

    var buttonRow = document.getElementById('buttonsTable');

    // onsubmit, modify data, call stage2 with the modified data
    button.onclick = () => {onSubmitInitialUI(data, selectionArr)};
    button.textContent = "Next"
    buttonRow.appendChild(button);
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

async function onSubmitInitialUI(originalData, selectionInfo)
{
    console.log(originalData)
    console.log(selectionInfo)
    var noAttendees = true
    for (var [idx, item] of originalData.entries())
    {

        item.going = selectionToRSVP(selectionInfo[idx]);
        console.log(item.going + " " + noAttendees);
        if (item.going === 1) noAttendees = false;
    }

    if (noAttendees)
    {
        for (var item of originalData)
        {
            showLoading()
            await serverUpdate(item.name, -1)
            hideLoading()
        }
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
        tableHeader.classList.add("namecell");
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeaderFilled = document.createElement('th');
        tableHeaderFilled.classList.add("infocell");

        tableHeaderFilled.textContent = item.going === 1 ? "Can Attend" : item.going === 0 ? "Cannot Attend" : "Error";
        tableRow.appendChild(tableHeaderFilled);
        // TODO: actually handle this error?


        var tableHeader2 = document.createElement('th');
        tableHeader2.classList.add("infocell");
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
            // var babyText = document.createElement('th')
            tableHeader2.innerText = item.baby === 1 ? "Kid's Meal" : "Bites of your food / baby food as appropriate"
            // tableHeader2.appendChild(babyText);
        }

        tableRow.appendChild(tableHeader2)
        elem.appendChild(tableRow)
    }

    // two checkboxes surrounded by text
    // TODO write the text

    // These should maybe be outside the table?

    var attendees4 = document.getElementById("shuttleInfo");
    var shuttleInfo = document.createElement("h2");
    shuttleInfo.innerText = "We are providing shuttles to get you to and from events Friday and Saturday! If anyone in your party plans to utilize the shuttle, please mark the pickup location below!"//\nAs mentioned on the Travel page, the Hilton is the only hotel for which we will have a block reserved. You are welcome to take the shuttle even if not staying there, you will just need to uber to and from the Hilton as that will be the pick up and drop off point."
    attendees4.appendChild(shuttleInfo)
    var shuttleInfo2 = document.createElement("h3");
    shuttleInfo2.classList.add("noTopMargin")

    shuttleInfo2.innerText = "As mentioned on the Travel page, the Hilton is the only hotel for which we will have a block reserved. You are welcome to take the shuttle even if not staying there, you will just need to uber to and from the Hilton as that will be the pick up and drop off point"
    attendees4.appendChild(shuttleInfo2)



    var shuttleCheckboxes = []

    var elem2 = document.getElementById("shuttle")

    var shuttleRow1 = document.createElement('tr');
    var shuttleRowText1 = document.createElement('th');
    shuttleRowText1.classList.add("namecell");
    // shuttleRowText1.classList.add("testMargin");
    // elem2.appendChild(document.createElement('br'))
    shuttleRowText1.innerText = "Friday shuttles"
    shuttleRow1.appendChild(shuttleRowText1)

    var shuttleRowInput1Container = document.createElement('th')
    shuttleRowInput1Container.rowSpan = "2"
    var shuttleRowInput1 = shuttleOptionList(true);
    shuttleCheckboxes.push(shuttleRowInput1)
    shuttleRowInput1Container.appendChild(shuttleRowInput1)
    shuttleRow1.appendChild(shuttleRowInput1Container)

    elem2.appendChild(shuttleRow1);


    var shuttleRowMid1 = document.createElement('tr');
    var shuttleRowTextMid1 = document.createElement('th');
    shuttleRowTextMid1.classList.add("namecell");
    shuttleRowTextMid1.classList.add("infocell");
    shuttleRowTextMid1.innerText = "(pickup->cathedral->reception->dropoff)"
    shuttleRowMid1.appendChild(shuttleRowTextMid1)

    elem2.appendChild(shuttleRowMid1);






    var shuttleRow2 = document.createElement('tr');
    var shuttleRowText2 = document.createElement('th');
    shuttleRowText2.classList.add("namecell");
    shuttleRowText2.innerText = "Saturday shuttles"
    shuttleRow2.appendChild(shuttleRowText2)

    var shuttleRowInput2Container = document.createElement('th')
    shuttleRowInput2Container.rowSpan = "2"
    var shuttleRowInput2 = shuttleOptionList(false)
    shuttleCheckboxes.push(shuttleRowInput2)
    shuttleRowInput2Container.appendChild(shuttleRowInput2)
    shuttleRow2.appendChild(shuttleRowInput2Container)

    elem2.appendChild(shuttleRow2);

    var shuttleRowMid2 = document.createElement('tr');
    var shuttleRowTextMid2 = document.createElement('th');
    shuttleRowTextMid2.classList.add("namecell");
    shuttleRowTextMid2.classList.add("infocell");
    shuttleRowTextMid2.innerText = "(pickup->loretito->dropoff)"
    shuttleRowMid2.appendChild(shuttleRowTextMid2)

    elem2.appendChild(shuttleRowMid2);


    // var buttonRow = document.createElement('tr');

    var buttonRow = document.getElementById('buttonsTable');

    var ebutton = document.createElement('button')
    ebutton.onclick = () => {stageTwo(fulldata, null, false, true)};
    ebutton.textContent = "Back"
    buttonRow.appendChild(ebutton);

    button.onclick = () => {onSubmitFoodUI(fulldata, selectionArr, shuttleCheckboxes)};
    button.textContent = "Submit"
    buttonRow.appendChild(button);

    var hint = document.createElement('div')
    hint.innerText = "(you can edit this later!)"
    hint.classList.add("tinyText")
    buttonRow.appendChild(hint);


    // elem.appendChild(buttonRow);
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
        // info[1].selectedIndex * 30 + info[0].selectedIndex * 10...
        if (shuttleInfo[0].selectedIndex === 1 && shuttleInfo[1].selectedIndex === 1) return 40;
        if (shuttleInfo[0].selectedIndex === 2 && shuttleInfo[1].selectedIndex == 1) return 50;
        if (shuttleInfo[0].selectedIndex === 1 && shuttleInfo[1].selectedIndex == 0) return 10;
        if (shuttleInfo[0].selectedIndex === 2 && shuttleInfo[1].selectedIndex == 0) return 20;
        if (shuttleInfo[0].selectedIndex === 0 && shuttleInfo[1].selectedIndex == 1) return 30;
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
            item.food = food - serverDataForShuttle// optimistic update...
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

    var noAttendees = true;
    for (var item of data)
    {
        if (item.going === 1) {
            noAttendees = false;
            break;
        }
    }

    var button = document.createElement('button')
    initializeButtonTracker(data.filter(attendee => attendee.baby === 0).length)

    elemHeader.textContent = !noAttendees ?
    "Hooray! You're all set. Feel free to edit any of this data before the deadline of October 1 2025. We're excited to see you!" :
    "We're very sorry to be missing you! We understand and know that you are loved with all our hearts. If the situation changes, don't hesistate to come back here and edit before October 1 2025!"

    // var tableRow0 = document.createElement('tr');
    // var tableHeader0 = document.createElement('th');
    // tableHeader0.classList.add("nameCell");
    // var tableHeader01 = document.createElement('th');
    // tableHeader01.classList.add("headerCell");
    // tableHeader01.textContent = "Attending?";
    // var tableHeader02 = document.createElement('th');
    // tableHeader02.classList.add("headerCell");
    // tableHeader02.textContent = "Food?";
    // tableRow0.appendChild(tableHeader0)
    // tableRow0.appendChild(tableHeader01)
    // tableRow0.appendChild(tableHeader02)
    // elem.appendChild(tableRow0)

    for (var [idx, item] of data.entries())
    {
        var tableRow = document.createElement('tr');
        var tableHeader = document.createElement('th');
        tableHeader.classList.add("namecell");
        tableHeader.textContent = item.name;
        tableRow.appendChild(tableHeader)
        var tableHeader2 = document.createElement('th');
        tableHeader2.classList.add("infocell");
        if (item.going !== 1) tableHeader2.classList.add("extrawide")

        var selectionFood = foodOptionList();

        if (!edit)
        {
            tableHeader2.textContent = item.going === 1 ? "Can Attend" : item.going === 0 ? "Cannot Attend" : "Error";
        }
        else
        {
            var selection = attendingOptionList(false);
            selectionArr.push(selection);
            selection.selectedIndex = item.going === 1 ? 0 : 1//item.going === 0 ? 2 : 0;
            selection.addEventListener('change', (e) => {
                updateButtonTracker2(idx, e.target.selectedIndex === 0, selectionFood, button);
            })
            tableHeader2.appendChild(selection);
        }
        tableRow.appendChild(tableHeader2);
        // TODO: actually handle this error
        if (item.going === 1 || edit) {
            var tableHeader3 = document.createElement('th');
            tableHeader3.classList.add("infocell")
            // var selection = foodOptionList();
            // selection.selectedIndex = item.food;
            // tableHeader2.appendChild(selection);

            if (item.baby !== 0 || !edit)
            {
                tableHeader3.textContent = item.baby === 1 ? "Gets Kid's Meal" : item.baby === 2 ? "Parents know what I like :D" : item.food === 1 ? "Wants Chicken" : item.food === 2 ? "Desires Salmon" : item.food === 3 ? "Picked Vegetables" : "Error"
            }
            else
            {
                selectionFood.addEventListener('change', (e) => {
                    updateButtonTracker(idx, e.target.selectedIndex !== 0, button);
                })
                updateButtonTracker(idx, item.going === 1 || item.going === 0, button);
                foodSelectionArr.push(selectionFood);

                selectionFood.selectedIndex = item.food;
                tableHeader3.appendChild(selectionFood);
            }
            tableRow.appendChild(tableHeader3)
        }

        updateButtonTracker2(idx, item.going === 1, selectionFood, button);

        elem.appendChild(tableRow)
    }

    // These should maybe be outside the table?

    // TODO: change these to yesses if we aren't in edit mode
    // TODO: use item values
    // console.log(data[0].shuttle + "SHUTTLE")
    console.log(data)
    var shuttleCheckboxes = []

    var elem2 = document.getElementById("shuttle")


    if (!noAttendees || edit)
    {
        var shuttleRow1 = document.createElement('tr');
        var shuttleRowText1 = document.createElement('th');
        shuttleRowText1.classList.add("namecell");
        // shuttleRowText1.classList.add("testMargin");
        elem2.appendChild(document.createElement('br'))
        shuttleRowText1.innerText = "Friday shuttles"
        shuttleRow1.appendChild(shuttleRowText1)
        if (edit) {

            var shuttleRowInput1 = shuttleOptionList(true)
            shuttleCheckboxes.push(shuttleRowInput1)
            // shuttleRowInput1.type = "checkbox"
            shuttleRowInput1.selectedIndex = (data[0].shuttle === 1 || data[0].shuttle === 4) ? 1 : (data[0].shuttle === 2 || data[0].shuttle === 5) ? 2 : 0;
            var shuttleRowInput1Container = document.createElement('th')
            shuttleRowInput1Container.classList.add("infocell");

            shuttleRowInput1Container.rowSpan = "2"
            shuttleRowInput1Container.appendChild(shuttleRowInput1)
            shuttleRow1.appendChild(shuttleRowInput1Container)
        }
        else
        {
            var shuttleRowInput1 = document.createElement('th')
            shuttleRowInput1.classList.add("infocell");
            shuttleRowInput1.rowSpan = "2"

            // shuttleCheckboxes.push(shuttleRowInput1)
            shuttleRowInput1.innerText = (data[0].shuttle === 1 || data[0].shuttle === 4) ? "From/To Hilton" : (data[0].shuttle === 2 || data[0].shuttle === 5) ? "From/To Loretito" : "Not Needed";
            shuttleRow1.appendChild(shuttleRowInput1)
        }
        elem2.appendChild(shuttleRow1);


        var shuttleRowMid1 = document.createElement('tr');
        var shuttleRowTextMid1 = document.createElement('th');
        shuttleRowTextMid1.classList.add("namecell");
        shuttleRowTextMid1.classList.add("infocell");
        shuttleRowTextMid1.innerText = "(pickup->cathedral->reception->dropoff)"
        shuttleRowMid1.appendChild(shuttleRowTextMid1)

        elem2.appendChild(shuttleRowMid1);













        var shuttleRow2 = document.createElement('tr');
        var shuttleRowText2 = document.createElement('th');
        shuttleRowText2.classList.add("namecell");
        shuttleRowText2.innerText = "Saturday shuttles"
        shuttleRow2.appendChild(shuttleRowText2)
        if (edit) {
            var shuttleRowInput2 = shuttleOptionList(false);
            shuttleCheckboxes.push(shuttleRowInput2)
            // shuttleRowInput2.type = "checkbox"
            shuttleRowInput2.selectedIndex = (data[0].shuttle === 0 || data[0].shuttle === 1 || data[0].shuttle === 2) ? 0 : 1;
            var shuttleRowInput2Container = document.createElement('th')
            shuttleRowInput2Container.classList.add("infocell");

            shuttleRowInput2Container.rowSpan = "2"
            shuttleRowInput2Container.appendChild(shuttleRowInput2)
            shuttleRow2.appendChild(shuttleRowInput2Container)
        }
        else
        {
            var shuttleRowInput2 = document.createElement('th')
            shuttleRowInput2.classList.add("infocell");
            shuttleRowInput2.rowSpan = "2"
            // shuttleCheckboxes.push(shuttleRowInput1)
            shuttleRowInput2.innerText = (data[0].shuttle === 0 || data[0].shuttle === 1 || data[0].shuttle === 2) ? "Not Needed" : "From/To Hilton";
            shuttleRow2.appendChild(shuttleRowInput2)
        }
        elem2.appendChild(shuttleRow2);

        var shuttleRowMid2 = document.createElement('tr');
        var shuttleRowTextMid2 = document.createElement('th');
        shuttleRowTextMid2.classList.add("namecell");
        shuttleRowTextMid2.classList.add("infocell");
        shuttleRowTextMid2.innerText = "(pickup->loretito->dropoff)"
        shuttleRowMid2.appendChild(shuttleRowTextMid2)

        elem2.appendChild(shuttleRowMid2);

        // email stuff
        if (!edit)
        {
            // form takes care of hiding the inner children. will persist until a refresh
            var bb = document.getElementById("emailbigbox");
            bb.classList.remove('hidden');
        }
        else
        {
            var bb = document.getElementById("emailbigbox");
            bb.classList.add('hidden');
        }
    }

    var elem3 = document.getElementById("buttonsTable")


    if (!edit)
    {
        var button2 = document.createElement('button')
        var foodScreenSeen = false;
        for (var item of data)
        {
            if (!(item.food === null || item.food === "")) foodScreenSeen = true
        }
        button2.onclick = () => {stageTwo(data, null, true, noAttendees && !foodScreenSeen)};
        button2.textContent = "Edit"
        elem3.appendChild(button2);
    }
    else
    {
        button.onclick = () => {onSubmitEdits(data, selectionArr, foodSelectionArr, shuttleCheckboxes)};
        button.textContent = "Submit Edits"
        elem3.appendChild(button);
    }
}

async function onSubmitEdits(originalData, attendanceInfo, foodInfo, shuttleCheckboxes)
{
    for (var [idx, item] of originalData.entries())
    {
        item.going = selectionToRSVP(attendanceInfo[idx], false);
        item.food = item.baby !== 0 ? item.going : item.going === 1 ? foodInfo[idx].selectedIndex : 0;
        item.shuttle = item.going === 1 ? serverDataFromShuttleInfo(shuttleCheckboxes, item.baby) / 10 : 0
        showLoading()
        await serverUpdate(item.name, item.food + 10 * item.shuttle)
        hideLoading()
    }

    // if noatendees we could take back to page 1 and null out food

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

    var emailbox = document.getElementById('emailbigbox')
    emailbox.classList.add("hidden");
    // hide by default

    var attendeesHeader = document.getElementById(attendeesHeaderID);
    var attendees = document.getElementById(attendeesID);
    console.log("child count" + attendees.children.length)
    const attendeePrevCount = attendees.children.length;
    for (var i=0; i<attendeePrevCount; i++)
    {
        attendees.children[0].remove()
    }

    var attendees2 = document.getElementById("shuttle");
    const attendeePrevCount2 = attendees2.children.length;
    for (var i=0; i<attendeePrevCount2; i++)
    {
        attendees2.children[0].remove()
    }

    var attendees3 = document.getElementById("buttonsTable");
    const attendeePrevCount3 = attendees3.children.length;
    for (var i=0; i<attendeePrevCount3; i++)
    {
        attendees3.children[0].remove()
    }

    var attendees4 = document.getElementById("shuttleInfo");
    const attendeePrevCount4 = attendees4.children.length;
    for (var i=0; i<attendeePrevCount4; i++)
    {
        attendees4.children[0].remove()
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



const url = 'https://script.google.com/macros/s/AKfycbzcYEKlokJgXPldxv44ujsRVSwclMVqJehgeAYo9UCbohIQxMHfxskm4rQ5Ba4gTbaE/exec';

// TODO: action=email

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

async function emailAdd(email)
{
    var urlWithName = url + '?path=Sheet2&action=email&Email=' + encodeURIComponent(email.toLowerCase());
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



// add a column for if the name cannot RSVP

// With MIMI: put the names in the sheet and format properly

// THIS IS THE POINT I CAN PUSH
// mobile testing + fast follows









// optional
// capture back button click to use the web back? good pattern?
// rig up enter button to submit, or pop up text saying to click the button please :)
// [viz] the width of the first screen looks stupid in fullscreen mode

// Lower Pri for Form
// server side reject food input outside of 0-4 or whatever
// email form for additional updates on the submit page?
// do I want to embed the RSVP on the home page?
// do we need a button to reshow the name entry?
// selecting friday from loretito should zero out the saturday option for shuttles
// disable interaction while loading

// Future TODO
// footer fixing


// Bleh
// fix whatever is happening with local variable storage in safari




// For the bee:
// need a way to track if an element is being hovered (css you do :hover, but I dont think that can be programatic)
// once it is I need to have a buffer of where its aiming and it will move some amount per frame (use waits)
// make the path a bit windy, add some sustained noise perpendicular to direction?
// translating between cursor's position in the document
// check if it has reached the flower it wants (diff bees want diff colors)
// somehow save the bee position for when you click to a new tab

// for mobile maybe it just follows clicks near enough to it
// this I could do now!

function meander(event)
{
    var bee = document.getElementById('beeOuter');
    // get current mouse position
    // set the left and top of the beeOuter as a goal
    // TODO how to access the current left and top of bee?
    console.log(event.clientX, event.clientY);
    moveTowardTarget(bee, bee.style.left.substring(0,bee.style.left.length-2), bee.style.top.substring(0,bee.style.top.length-2), event.clientY - 40, event.clientX - 40, 0);
}

const timeToMeander = 3; // seconds
const updateRate = 30; // fps
var count = 0;
function moveTowardTarget(bee, initialLeft, initialTop, targetTop, targetLeft, t)
{
    if (t >= 1) return
    // if (count == 5) return; // all done!
    count++;
    console.log(initialLeft, initialTop, targetTop, targetLeft, t);

    // lerp left with the variable t
    // TODO add random noise in the line perpendicular direction of some small value
    var rate = 1 / updateRate;
    var newT = t + rate / timeToMeander;

    var newLeft = +initialLeft + (targetLeft - initialLeft) * t
    var newTop = +initialTop + +((targetTop - initialTop) * t)

    console.log(newLeft, newTop);
    // set the position
    bee.style.left = newLeft + "px"
    bee.style.top = newTop + "px"

    // sleep for 1/updateRate, with t value add of that time divided by 2
    // rate seconds later, call this:
    setTimeout(() => {
      moveTowardTarget(bee, initialLeft, initialTop, targetTop, targetLeft, newT)
    }, rate)
}

// Knowledge needed:
// access style props of an element
// access the current mouse pointer location (mousemove.pageX or pageY) [probably not screenX screenY]
// async run a function after sleeping for a time value

// document.addEventListener('mousemove', function(event) {
    //   const x = event.clientX;
    //   const y = event.clientY;
    //   document.getElementById('output').textContent = `Mouse Position: (${x}, ${y})`;
    // });

    // setTimeout(() => {
//   console.log("Runs after 2 seconds");
// }, 2000);

// element.style.left
// element.style.top
// need to set these all inline tho, not with style sheet

// Today's hitlist
// web: make the password field not autocorrect (and rsvp entry field)
// web: upload everything and test mobile stuff!!
// web: mobile rendering: rsvp page table rendering to flexbox
// web: honeyfund work (o otro)
// web: few db todos
// --
// NEXT spanish button for changing
// --
// bee (art)
// map (art)
// taller flowers (art)
// --
// comments functionality
// games
// song page
