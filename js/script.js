/*jshint esversion: 8 */

const workers = ['Alice', 'Bob', 'Charlie', 'David', 'Eva'];
const shifts = ['7-16', '16-23', '23-7'];
const colors = ['#FFFFEE', '#FFFFDE ', '#FEFFCF'];
let currentDate = new Date();
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getWeekDates(date) {
  const dayIndex = date.getDay();
  const dates = [];
  const days = [];

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
    const tdName = document.createElement('td');
    tdName.textContent = worker;
    tr.appendChild(tdName);

    dates.forEach((date) => {
      const td = document.createElement('td');
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

  // Update dates in the header row
  const headerRow = table.querySelector('thead tr');
  for (let i = 1; i < headerRow.children.length; i++) {
    const th = headerRow.children[i];
    th.innerText = formatDate(dates[i - 1]);
  }
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
  if (this.style.backgroundColor === 'green') {
    this.style.backgroundColor = '';
    action = 'delete';
  } else {
    this.style.backgroundColor = 'green';
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

// function applySchedules(schedules) {
//   const table = document.getElementById('workerTable');
//   schedules.forEach((schedule) => {
//     const workerName = schedule.workerName;
//     const shiftDate = schedule.shiftDate;
//     const shiftTime = schedule.shiftTime;

//     const tdSelector = `td[data-name='${workerName}'][data-date='${shiftDate}']`;
//     const td = table.querySelector(tdSelector);
//     if (td) {
//       const cell =
//       if (cell) {
//         cell.style.backgroundColor = 'green';
//       }
//     }
//   });
// }

// function fetchSchedules() {
//   fetch('get_schedule.php')
//     .then((response) => response.json())
//     .then((schedules) => applySchedules(schedules));
// }

// // ...

// createTable();
// fetchSchedules();
