/*jshint esversion: 8 */

const shifts = ['8a', '4p', '11p'];
const colors = ['#E1E1E0', '#C8C8C7', '#A5A5A5'];
const currentDate = new Date();
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let scheduleData = [];
let workers = [];

const table = document.getElementById('workerTable');
const headerRow = document.querySelector('tr');

//function for fetching data from db in async way
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch location data and populate the select element
fetchData('get_locations_from_DB.php').then((data) => {
  populateLocationSelect(data);
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
    name: `${worker.first_name} ${worker.last_name}`, // Use the correct column name for the worker name
  }));
};

// Call the fetchWorkers function and populate the workers array
fetchWorkers().then((data) => {
  workers = data;
  updateTable();
});

// const scheduleDb = async function fetchData() {
//   const response = await fetch('get_schedule_from_DB.php');
//   const data = await response.json();
//   return data;
// };

// scheduleDb().then((data) => {});

// Populate location select element
function populateLocationSelect(locations) {
  const locationSelect = document.getElementById('locationSelect');

  locations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location.id;
    option.textContent = location.location_name; // Display location name as innerText
    locationSelect.appendChild(option);
  });

  // Set the first location as the default selected option
  locationSelect.selectedIndex = 0;
  locationSelect.dispatchEvent(new Event('change'));
}

function getWeekDates(date) {
  const dayIndex = date.getDay();
  // console.log(dayIndex);
  const dates = [];

  for (let i = 1; i < 8; i++) {
    const dayDate = new Date(date);
    dayDate.setDate(dayDate.getDate() - dayIndex + i);
    dates.push(dayDate);
    // console.log(dates);
  }
  return dates;
}

function getMonthDates(date) {
  const dayIndex = date.getDay();
  const dates = [];
  let today = new Date();
  var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  for (let i = 1; i <= lastDayOfMonth; i++) {
    const dayDate = new Date(date);
    dayDate.setDate(dayDate.getDate() - dayIndex + i);
    dates.push(dayDate);
    // console.log(dates);
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

function createTable() {
  const dates = getWeekDates(currentDate);
  // const dates = getMonthDates(currentDate);

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
    tdEdit.innerHTML =
      '<button class="btn-success btn-sm"><i class="fa-solid fa-pen-to-square"></i></button>  <button class="btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button>';
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
  const dates = getWeekDates(currentDate);

  // Clear previous table content
  clearTable();
  // Create new table content
  createTable();
  applySchedules(scheduleData);
  // Update dates in the header row

  for (let i = 1; i < headerRow.children.length; i++) {
    const th = headerRow.children[i + 2];
    if (th) {
      th.innerText = formatDate(dates[i - 1]);
    }
  }

  // while (bodyRow.children.length > 1) {
  //   bodyRow.removeChild();
  // }
}

function nextWeek() {
  currentDate.setDate(currentDate.getDate() + 7);
  updateTable();
}

function prevWeek() {
  currentDate.setDate(currentDate.getDate() - 7);
  updateTable();
}

//event listeners for next/previous week buttons
document.getElementById('nextWeek').addEventListener('click', nextWeek);
document.getElementById('prevWeek').addEventListener('click', prevWeek);
// Event listener for location select
document.getElementById('locationSelect').addEventListener('change', function () {
  const location_id = this.value;

  // Call the fetchWorkers function with the selected location_id and update the workers array
  fetchWorkers(location_id).then((data) => {
    workers = data;
    updateTable();
  });
});

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

  // Send data to PHP using XMLHttpRequest and JSON
  //   const xhr = new XMLHttpRequest();
  //   xhr.open('POST', action === 'insert' ? 'insert_schedule.php' : 'delete_schedule.php', true);
  //   xhr.setRequestHeader('Content-Type', 'application/json');

  //   xhr.onreadystatechange = function () {
  //     if (xhr.readyState === 4 && xhr.status === 200) {
  //       console.log('Action executed: ' + action);
  //     }
  //   };

  //   xhr.send(JSON.stringify(data));
  // }

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
}
