<?php
// Database connection
require_once './db_connect.php';

$location_id = isset($_GET['location_id']) ? intval($_GET['location_id']) : null;

if ($location_id) {
  $query = "SELECT w.* FROM workers w JOIN location_worker lw ON w.id = lw.worker_id WHERE lw.location_id = ?";
  $stmt = $conn->prepare($query);
  $stmt->bind_param('i', $location_id);
  $stmt->execute();
  $result = $stmt->get_result();
} else {
  $query = "SELECT * FROM workers";
  $result = mysqli_query($conn, $query);
}

$workers = array();
while ($row = mysqli_fetch_assoc($result)) {
  $workers[] = $row;
}

// Output data as JSON
header('Content-Type: application/json');
echo json_encode($workers);
?>