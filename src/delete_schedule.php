<?php
require './db_connect.php';

header('Content-Type: application/json');

// Get JSON data from request
$jsonData = json_decode(file_get_contents('php://input'), true);

// Get data from JSON
$worker_id = $jsonData['workerId'];
$worker_name =$jsonData['workerName'];
$shift_date = $jsonData['shiftDate'];
$shift_time = $jsonData['shiftTime'];

// Prepare and bind for DELETE action
$stmt = $conn->prepare("DELETE FROM schedule WHERE worker_id=? AND shift_date=? AND shift_time=?");
$stmt->bind_param("iss", $worker_id, $shift_date, $shift_time);

// Execute query and close connection
$stmt->execute();
$stmt->close();
$conn->close();
?>