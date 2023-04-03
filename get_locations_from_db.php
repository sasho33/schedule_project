<?php
// Database connection
require_once 'db_connect.php';

$query = "SELECT * FROM location";
$result = mysqli_query($conn, $query);

$locations = array();
while ($row = mysqli_fetch_assoc($result)) {
  $locations[] = $row;
}

// Output data as JSON
header('Content-Type: application/json');
echo json_encode($locations);
?>