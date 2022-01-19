<?php
require_once("../2.includes/inc/database.php");
//  show data base names 
if ($_POST['type'] == "show-db-name") {
    $db_names = $db->query("SHOW DATABASES");
    if ($db_names) {
        print_r($db_names);
    }
}
