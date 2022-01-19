<?php
require_once(dirname(__DIR__) . "/vendor/autoload.php");
require_once "inc/database.php";


if($session->get("user_id")){
    redirectTo("index");
}
$timestamp = date("Y-m-d h:i:s");
if (isset($validate_request)) {
    if ($validate_request === true) {
        if (!isset($_POST['req_token'])) {
            echo error("Request can't process at this time");
            die();
        }
        if (isset($_POST['req_token'])) {
            $token = $_POST['req_token'];
            if (strlen($token) !== 30) {
                echo error("Request can't process at this time");
                die();
            } else {
                unset($_POST['req_token']);
            }
        }
    }
}