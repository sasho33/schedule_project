<?php
// Database connection
include 'db_connect.php';

$query = "SELECT id, first_name, last_name FROM workers";
$result = $conn->query($query);

$workers = array();
if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $workers[] = array(
      'id' => $row['id'],
      'name' => $row['first_name'] . ' ' . $row['last_name']
    );
  }
}

echo json_encode($workers);
$conn->close();
?>