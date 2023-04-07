<?php
header("Content-Type: application/json");

require_once './db_connect.php';

// Get the JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

// Validate the data
if (!isset($data['worker_id']) || !isset($data['first_name']) || !isset($data['last_name'])) {
    echo json_encode(["success" => false, "message" => "Invalid data"]);
    exit;
}

// Update the worker
$stmt = $conn->prepare("UPDATE workers SET first_name = ?, last_name = ? WHERE id = ?");
$stmt->bind_param("ssi", $data['first_name'], $data['last_name'], $data['worker_id']);
$result = $stmt->execute();

if ($result) {
    echo json_encode(["success" => true, "message" => "Worker updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating worker: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>