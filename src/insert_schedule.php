<?php
require './db_connect.php';

header('Content-Type: application/json');

// Get JSON data from request
$jsonData = json_decode(file_get_contents('php://input'), true);

// Get data from JSON
$worker_name = $jsonData['workerName'];
$worker_id = $jsonData['workerId'];
$shift_date = $jsonData['shiftDate'];
$shift_time = $jsonData['shiftTime'];

// Prepare and bind for INSERT action
$stmt = $conn->prepare("INSERT INTO schedule (worker_name, shift_date, shift_time, worker_id) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $worker_name, $shift_date, $shift_time, $worker_id);

// Execute query and close connection
$stmt->execute();
$stmt->close();
$conn->close();
?>