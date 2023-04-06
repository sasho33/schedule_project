/*jshint esversion: 8 */

const shifts = ['8a', '4p', '11p'];
const colors = ['#E1E1E0', '#C8C8C7', '#A5A5A5'];
const currentDate = new Date();
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let scheduleData = [];
let workers = [];
const nextPeriodButton = document.getElementById('nextWeek');
const previousPeriodButton = document.getElementById('prevWeek');
const table = document.getElementById('workerTable');
const headerRow = document.querySelector('tr');
const locationSelect = document.getElementById('locationSelect');
const locationSelectModal = document.getElementById('workerLocation');

document.getElementById('addWorkerForm').addEventListener('submit', function (event) {
  event.preventDefault();
  addWorker();
});

document.getElementById('showSelect').addEventListener('change', function () {
  updateTable();
  if (this.value === 'Month') {
    nextPeriodButton.innerText = 'Next month';
    previousPeriodButton.innerText = 'Previous month';
  } else {
    nextPeriodButton.innerText = 'Next week';
    previousPeriodButton.innerText = 'Previous week';
  }
});

//event listeners for next/previous week buttons

nextPeriodButton.addEventListener('click', nextPeriod);
previousPeriodButton.addEventListener('click', prevPeriod);
// Event listener for location select
document.getElementById('locationSelect').addEventListener('change', function () {
  const location_id = this.value;

  // Call the fetchWorkers function with the selected location_id and update the workers array
  fetchWorkers(location_id).then((data) => {
    workers = data;
    updateTable();
  });
});

//function for fetching data from db in async way
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch location data and populate the select element
fetchData('get_locations_from_DB.php').then((data) => {
  populateLocationSelect(data, locationSelect);

  populateLocationSelect(data, locationSelectModal);
});

// fetching schedule data from DB
fetchData('get_schedule_from_DB.php').then((data) => {
  // Process and apply schedules
  // Call the function and use forEach to process the data
  data.forEach((item) => {
    // Process the item and add it to the resultArray
    scheduleData.push(item);
  });
  applySchedules(scheduleData);
});

// Fetching worker data from DB
const fetchWorkers = async function (location_id) {
  const response = await fetch('get_workers_from_DB.php?location_id=' + location_id);
  const data = await response.json();
  return data.map((worker) => ({
    id: worker.id,
    name: `${worker.first_name} ${worker.last_name}`,
    first_name: `${worker.first_name}`,
    last_name: `${worker.last_name}`,
  }));
};

// Call the fetchWorkers function and populate the workers array
fetchWorkers().then((data) => {
  workers = data;
  updateTable();
});

// Populate location select element
function populateLocationSelect(locations, target) {
  locations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location.id;
    option.textContent = location.location_name; // Display location name as innerText
    target.appendChild(option);
  });

  // Set the first location as the default selected option
  target.selectedIndex = 0;
  if (target == locationSelect) {
    target.dispatchEvent(new Event('change'));
  } //
}

function getWeekDates(date) {
  const dayIndex = date.getDay();

  const dates = [];

  for (let i = 1; i < 8; i++) {
    const dayDate = new Date(date);
    dayDate.setDate(dayDate.getDate() - dayIndex + i);
    dates.push(dayDate);
  }
  return dates;
}

function getMonthDates(date) {
  const dayIndex = date.getDay();
  const dates = [];
  // let today = new Date();
  var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  for (let i = 1; i <= lastDayOfMonth; i++) {
    const dayDate = new Date(date);
    dayDate.setDate(i);
    dates.push(dayDate);
  }
  return dates;
}

function formatDate(date) {
  if (!(date instanceof Date)) {
    console.error('Invalid date object:', date);
    return '';
  }
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).substring(2);
  return `${daysOfWeek[date.getDay()]} ${dd}/${mm}/${yy}`;
}

function createSubTable(workerObj, rowDate) {
  const subTable = document.createElement('table');
  subTable.classList.add('inside');
  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('td');
    cell.classList.add('subtable-cell');
    cell.innerText = shifts[i];
    cell.style.backgroundColor = colors[i];
    cell.dataset.worker_id = workerObj.id; // Add the worker id as a data attribute
    cell.dataset.name = workerObj.name;
    cell.dataset.date = formatDate(rowDate);
    cell.addEventListener('click', cellClickHandler);
    subTable.appendChild(cell);
  }
  return subTable;
}

function createTableHeader(dates) {
  const headerRow = document.querySelector('tr');
  dates.forEach((date) => {
    const th = document.createElement('th');
    th.innerText = formatDate(date);
    headerRow.appendChild(th);
  });

  return headerRow;
}

function createTable(dates) {
  // Add dates to the header row
  const headerRow = createTableHeader(dates);
  table.querySelector('thead').appendChild(headerRow);

  // Add worker names and create cells for each day
  const tbody = table.querySelector('tbody');
  workers.forEach((workerObj) => {
    const tr = document.createElement('tr');
    tr.setAttribute('scope', 'row');
    const tdName = document.createElement('td');
    tdName.setAttribute('scope', 'col');
    tdName.textContent = workerObj.name;
    tr.appendChild(tdName);
    const tdEdit = document.createElement('td');
    tdEdit.setAttribute('scope', 'col');

    // creatin edit buttons insile cell
    const editButton = document.createElement('button');
    editButton.classList.add('editButton', 'btn-primary', 'btn-sm');
    const editIcon = document.createElement('i');
    editIcon.classList.add('fa-solid', 'fa-pen-to-square');
    editButton.appendChild(editIcon);
    editButton.dataset.worker_id = workerObj.id;
    editButton.dataset.first_name = workerObj.first_name;
    editButton.dataset.last_name = workerObj.last_name;
    tdEdit.appendChild(editButton);
    handleClickEdit(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('deleteButton', 'btn-danger', 'btn-sm');
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fa-solid', 'fa-trash');
    deleteButton.appendChild(deleteIcon);
    deleteButton.dataset.worker_id = workerObj.id;
    tdEdit.appendChild(deleteButton);

    tr.appendChild(tdEdit);

    const tdTotal = document.createElement('td');
    tdTotal.setAttribute('scope', 'col');
    tdTotal.setAttribute('id', 'total');
    tdTotal.textContent = 'Sum';
    tr.appendChild(tdTotal);

    dates.forEach((date) => {
      const td = document.createElement('td');
      td.setAttribute('scope', 'col');
      td.classList.add('date-field');
      const subTable = createSubTable(workerObj, date);
      td.appendChild(subTable);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}
function clearTable() {
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  const headerRow = table.querySelector('thead tr');
  while (headerRow.children.length > 3) {
    headerRow.removeChild(headerRow.lastChild);
  }
}

function updateTable() {
  const showSelect = document.getElementById('showSelect');
  const selectedOption = showSelect.options[showSelect.selectedIndex].value;

  let dates;
  if (selectedOption === 'Month') {
    dates = getMonthDates(currentDate);
  } else {
    dates = getWeekDates(currentDate);
  }

  // Clear previous table content
  clearTable(dates);
  // Create new table content
  createTable(dates);
  applySchedules(scheduleData);
  // Update dates in the header row

  for (let i = 1; i < headerRow.children.length; i++) {
    const th = headerRow.children[i + 2];
    if (th) {
      th.innerText = formatDate(dates[i - 1]);
    }
  }
}

function nextPeriod() {
  const showSelect = document.getElementById('showSelect');
  const selectedOption = showSelect.options[showSelect.selectedIndex].value;

  if (selectedOption === 'Month') {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    currentDate.setDate(currentDate.getDate() + daysInMonth);
  } else {
    currentDate.setDate(currentDate.getDate() + 7);
  }

  updateTable();
}

function prevPeriod() {
  const showSelect = document.getElementById('showSelect');
  const selectedOption = showSelect.options[showSelect.selectedIndex].value;

  if (selectedOption === 'Month') {
    const daysInPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    ).getDate();
    currentDate.setDate(currentDate.getDate() - daysInPrevMonth);
  } else {
    currentDate.setDate(currentDate.getDate() - 7);
  }

  updateTable();
}

//handle the clicks to fetch data and update the table
// Add this function to handle cell clicks
function cellClickHandler() {
  const workerName = this.dataset.name;
  const shiftDate = this.dataset.date;
  const shiftTime = this.innerText;
  const workerId = this.dataset.worker_id;

  // Toggle the cell color and determine the action
  let action;
  if (this.classList.contains('green')) {
    this.classList.remove('green');
    action = 'delete';
  } else {
    this.classList.add('green');
    action = 'insert';
  }

  // Create an object with the data
  const data = {
    workerName: workerName,
    workerId: workerId,
    shiftDate: shiftDate,
    shiftTime: shiftTime,
  };

  const url = action === 'insert' ? 'insert_schedule.php' : 'delete_schedule.php';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Action executed: ' + action);
        updateTotalHours(); // Update the total hours after the action
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

function applySchedules(scheduleData) {
  // Remove existing green class from cells
  const greenCells = document.querySelectorAll('.subtable-cell.green');
  greenCells.forEach((cell) => {
    cell.classList.remove('green');
  });

  // Apply new styles
  scheduleData.forEach((schedule) => {
    const workerId = schedule.worker_id;
    const shiftDate = schedule.shift_date;
    const shiftTime = schedule.shift_time;

    const subtableCells = document.querySelectorAll('.subtable-cell');
    subtableCells.forEach((cell) => {
      if (
        cell.dataset.worker_id === workerId &&
        cell.dataset.date === shiftDate &&
        cell.innerText === shiftTime
      ) {
        cell.classList.add('green');
      }
    });
  });
  // Update total hours
  updateTotalHours();
}

function updateTotalHours() {
  const rows = document.querySelectorAll('tbody tr');
  rows.forEach((row) => {
    const subtableCells = row.querySelectorAll('.subtable-cell.green');
    let sum = 0;
    subtableCells.forEach((cell) => {
      sum += 8;
    });
    const totalCell = row.querySelector('#total');
    totalCell.textContent = sum;
  });
}

function addWorker() {
  const firstName = document.querySelector('input[name="firstName"]').value;
  const lastName = document.querySelector('input[name="lastName"]').value;
  const workerLocation = locationSelectModal.value;

  // Fetch location data and populate the select element
  // fetchData('get_locations_from_DB.php').then((data) => {

  // });

  if (firstName === '' || lastName === '' || workerLocation === '') {
    alert('All fields must be filled out.');
    return;
  }

  const data = {
    first_name: firstName,
    last_name: lastName,
    location_id: workerLocation,
  };

  fetch('add_worker.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        // document.getElementById('addWorkerModal').hide();
        location.reload();
      } else {
        alert('Error: ' + data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function handleClickEdit(button) {
  // eventListener for edit button
  button.addEventListener('click', function () {
    // Get the worker details from the dataset
    const workerId = this.dataset.worker_id;
    const firstName = this.dataset.first_name;
    const lastName = this.dataset.last_name;
    console.log(this.dataset);

    // Populate the input fields in the modal
    document.getElementById('editWorkerId').value = workerId;
    document.getElementById('editWorkerFirstName').value = firstName;
    document.getElementById('editWorkerLastName').value = lastName;

    // Show the edit worker modal
    const editWorkerModal = new bootstrap.Modal(document.getElementById('editWorkerModal'));
    editWorkerModal.show();
  });
}

const editWorkerForm = document.getElementById('editWorkerForm');

editWorkerForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from submitting and refreshing the page

  // Get the worker data from the form
  const workerId = document.getElementById('editWorkerId').value;
  const firstName = document.getElementById('editWorkerFirstName').value;
  const lastName = document.getElementById('editWorkerLastName').value;

  // Send the updated worker data to the server
  fetch('update_worker.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      worker_id: workerId,
      first_name: firstName,
      last_name: lastName,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        // Close the edit modal and refresh the workers list
        const editWorkerModal = bootstrap.Modal.getInstance(
          document.getElementById('editWorkerModal'),
        );
        editWorkerModal.hide();
        location.reload();
      } else {
        // Show an error message
        alert('Error updating worker: ' + result.message);
      }
    })
    .catch((error) => {
      console.error('Error updating worker:', error);
      alert('Error updating worker: ' + error.message);
    });
});
