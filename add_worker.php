<?php
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    // Insert worker into the 'workers' table
    $stmt = $conn->prepare("INSERT INTO workers (first_name, last_name) VALUES (?, ?)");
    $stmt->bind_param("ss", $data["first_name"], $data["last_name"]);
    $stmt->execute();
    $worker_id = $stmt->insert_id;

    // Insert worker's location into the 'location_worker' table
    $stmt = $conn->prepare("INSERT INTO location_worker (location_id, worker_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $data["location_id"], $worker_id);
    $stmt->execute();

    // Return success message
    header("Content-Type: application/json");
    echo json_encode(["success" => true]);
}
?>