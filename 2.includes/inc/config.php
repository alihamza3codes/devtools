<?php
define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASSWORD", "");
// define("DB_PASSWORD", "");
define("DB_NAME", "nancy");
$site_name = "Nancy";
$admin_email = "admin@gmail.com";
$site_url = "https://nc.3codes.org";
date_default_timezone_set("Asia/Karachi");
$_MODE = 'prod';
if (DB_PASSWORD === "") $_MODE = 'dev';
