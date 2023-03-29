<?php
require 'db_connect.php';

// Get JSON data from request
$jsonData = json_decode(file_get_contents('php://input'), true);

// Get data from JSON
$worker_name = $jsonData['workerName'];
$shift_date = $jsonData['shiftDate'];
$shift_time = $jsonData['shiftTime'];

// Prepare and bind for INSERT action
$stmt = $conn->prepare("INSERT INTO schedule (worker_name, shift_date, shift_time) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $worker_name, $shift_date, $shift_time);

// Execute query and close connection
$stmt->execute();
$stmt->close();
$conn->close();
?>