<?php 


$conn = mysqli_connect("localhost","root","",$_POST['db_name']);


$table_name = $_POST['table_name_col'];
$create = "SHOW CREATE TABLE {$table_name}";
$result = mysqli_query($conn,$create);

while ($row = mysqli_fetch_assoc($result)) {
    echo "<pre>";
    print_r($row);
    echo "</pre>";
}



?>