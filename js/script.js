/*jshint esversion: 8 */

const workers = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Oleg'];
const shifts = ['8a', '4p', '11p'];
const colors = ['#FBFCDF', '#FAFCB6 ', '##FBFE80'];
let currentDate = new Date();
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let table;
// fetching data from DB
const scheduleDb = async function fetchData() {
  const response = await fetch('get_schedule_from_DB.php');
  const data = await response.json();
  return data;
};

// Declare a variable to store the results
let scheduleData = [];

// Call the function and use forEach to process the data
scheduleDb().then((data) => {
  data.forEach((item) => {
    // Process the item and add it to the resultArray
    // For example, let's assume we just want to store the item as it is:
    scheduleData.push(item);
  });
  applySchedules(scheduleData);
});

// function renderEachShift () {

// }

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

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).substring(2);
  return `${daysOfWeek[date.getDay()]} ${dd}/${mm}/${yy}`;
}

function createSubTable(dataAtribute, rowDate) {
  const subTable = document.createElement('table');
  subTable.classList.add('inside');
  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('td');
    cell.classList.add('subtable-cell');
    cell.innerText = shifts[i];
    cell.style.backgroundColor = colors[i];
    cell.dataset.name = dataAtribute;
    cell.dataset.date = formatDate(rowDate);
    cell.addEventListener('click', cellClickHandler); // Add click event listener
    subTable.appendChild(cell);
  }
  return subTable;
}

function createTable() {
  const table = document.getElementById('workerTable');
  const dates = getWeekDates(currentDate);
  console.log('Curerrent date: ' + currentDate);

  // Add dates to the header row
  const headerRow = table.querySelector('thead tr');
  dates.forEach((date) => {
    const th = document.createElement('th');
    th.innerText = formatDate(date);
    headerRow.appendChild(th);
  });

  // Add worker names and create cells for each day
  const tbody = table.querySelector('tbody');
  workers.forEach((worker) => {
    const tr = document.createElement('tr');
    tr.setAttribute('scope', 'row');
    const tdName = document.createElement('td');
    tdName.setAttribute('scope', 'col');
    tdName.textContent = worker;
    tr.appendChild(tdName);

    dates.forEach((date) => {
      const td = document.createElement('td');
      td.setAttribute('scope', 'col');
      td.classList.add('date-field');
      const subTable = createSubTable(worker, date);
      td.appendChild(subTable);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function updateTable() {
  const table = document.getElementById('workerTable');
  const dates = getWeekDates(currentDate);

  // Clear previous table content
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  const headerRow = table.querySelector('thead tr');
  while (headerRow.children.length > 1) {
    headerRow.removeChild(headerRow.lastChild);
  }

  createTable();
  applySchedules(scheduleData);
  // Update dates in the header row
  const bodyRow = table.querySelector('tbody tr');

  for (let i = 1; i < headerRow.children.length; i++) {
    // headerRow.removeChild(headerRow.lastChild);
    const th = headerRow.children[i];
    th.innerText = formatDate(dates[i - 1]);
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

createTable();

//event listeners for next/previous week buttons
document.getElementById('nextWeek').addEventListener('click', nextWeek);
document.getElementById('prevWeek').addEventListener('click', prevWeek);

//handle the clicks to fetch data and update the table
// Add this function to handle cell clicks
// Add this function to handle cell clicks
function cellClickHandler() {
  const workerName = this.dataset.name;
  const shiftDate = this.dataset.date;
  const shiftTime = this.innerText;

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
    shiftDate: shiftDate,
    shiftTime: shiftTime,
  };

  // Send data to PHP using XMLHttpRequest and JSON
  const xhr = new XMLHttpRequest();
  xhr.open('POST', action === 'insert' ? 'insert_schedule.php' : 'delete_schedule.php', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log('Action executed: ' + action);
    }
  };

  xhr.send(JSON.stringify(data));
}

function applySchedules(scheduleData) {
  // delete classlist from every cell
  const subtableCells = document.querySelectorAll('.subtable-cell');
  subtableCells.forEach((cell) => {
    cell.classList.remove('green');
  });

  // Apply new styles
  scheduleData.forEach((schedule) => {
    const workerName = schedule.worker_name;
    const shiftDate = schedule.shift_date;
    const shiftTime = schedule.shift_time;

    const subtableCells = document.querySelectorAll('.subtable-cell');
    subtableCells.forEach((cell) => {
      if (
        cell.dataset.name === workerName &&
        cell.dataset.date === shiftDate &&
        cell.innerText === shiftTime
      ) {
        cell.classList.add('green');
      }
    });
  });
}
