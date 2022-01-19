<?php
if(!isset($global_dir)) $global_dir = "./";
require_once(dirname(__DIR__) . "/vendor/autoload.php");
require_once "inc/database.php";
$timestamp = date("Y-m-d h:i:s");
$is_admin = false;


// check if login
$loginData = isLogin();
if(!$loginData){
	$link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'
	    ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	$url = "login?continue=" . $link;
	redirectTo( $global_dir . $url);
} 

$user = $loginData;
$l_user = $loginData;
$user_id = $l_user['id'];
if($l_user['is_admin'] === true) $is_admin = true;
if($is_admin) $access_type = "all";

$current_path = get_current_path();
$is_page = $db->selectSingle("pages", ['url' => $current_path]);
if(!$is_page) $access_type = "all";


require_once($global_dir . "middleware/access.php");