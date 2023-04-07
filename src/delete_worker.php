<?php
// Delete worker from the workers, schedule, and location_worker tables

// Connect to the database
require_once './db_connect.php';
header('Content-Type: application/json');

// Get the JSON input data
$data = json_decode(file_get_contents("php://input"), true);

// Extract the worker_id from the associative array
$worker_id = $data["worker_id"];
// echo $worker_id;

// Delete from the schedule table
$sql_schedule = "DELETE FROM schedule WHERE worker_id=?";
$stmt_schedule = $conn->prepare($sql_schedule);
$stmt_schedule->bind_param("i", $worker_id);
$stmt_schedule->execute();

// Delete from the location_worker table
$sql_location_worker = "DELETE FROM location_worker WHERE worker_id=?";
$stmt_location_worker = $conn->prepare($sql_location_worker);
$stmt_location_worker->bind_param("i", $worker_id);
$stmt_location_worker->execute();

// Delete from the workers table
$sql_workers = "DELETE FROM workers WHERE id=?";
$stmt_workers = $conn->prepare($sql_workers);
$stmt_workers->bind_param("i", $worker_id);
$result = $stmt_workers->execute();

// Close the database connections
$stmt_schedule->close();
$stmt_location_worker->close();
$stmt_workers->close();
$conn->close();

if ($result) {
    echo json_encode(["success" => true, "message" => "Worker deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error deleting worker: " . $conn->error]);
}
?>