<?php
function l($a)
{
    echo "$a <br>";
}
// Convert Object to array
function toArray($data){
    if(gettype($data) === "array") return $data;
    return json_decode(json_encode($data), true);;
    $dataArr = [];
    foreach($data as $key => $value){
        $dataArr[$key] = $value;
    }
    return $dataArr;
}
function get_current_url()
{
    $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'
        ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    $link = str_replace('save.php', '', $link);
    return $link;
}
	// pretty print array 
function prety_print($arr = []){
		echo "<pre>";
			print_r($arr);
		echo "</pre>";
}
function get_current_path()
{
    $url = preg_replace('/\/nancy\//m', "", $_SERVER["REQUEST_URI"]);
    $url = preg_replace('/.php/m', "", $url);
    $url_split = explode("?", $url);
    $url = $url_split[0];
    $url = rtrim($url, '/');
    return $url;
}
// To Date Ago
function toDateAgo($date2, $date1 = "", $only_val = false)
{
    if ($date1 == "") $date1 = date("Y-m-d h:i:s");
    if ($date2 == $date1) return "0 days";
    if (strlen($date2) < 1) return "";
    $get_date1_time = explode(' ', $date1);
    $date1_time = $get_date1_time[1];
    $arr = explode(" ", $date2);
    $dat = $arr[0];
    $tim = $arr[1];
    $c_y = date("Y", strtotime($date1));
    $c_m = date("m", strtotime($date1));
    $c_d = date("d", strtotime($date1));
    $m_days = cal_days_in_month(CAL_GREGORIAN, $c_m, $c_y);
    $p_date = strtotime($dat);
    $p_y = date("Y", $p_date);
    $p_m = date("m", $p_date);
    $p_d = date("d", $p_date);
    if ($c_d >= $p_d) {
        $f_d = $c_d - $p_d;
    } else {
        $c_d = $c_d + $m_days;
        $c_m -= 1;
        $f_d = $c_d - $p_d;
    }
    if ($c_m >= $p_m) {
        $f_m = $c_m - $p_m;
    } else {
        $c_m = $c_m + 12;
        $c_y -= 1;
        $f_m = $c_m - $p_m;
    }
    $f_y = $c_y - $p_y;
    if ($f_y < 1) {
        if ($f_m < 1) {
            if ($f_d < 1) {
                $date1_time = explode(':', $date1_time);
                $date2_time = explode(':', $tim);
                $h = intval($date1_time[0]) - intval($date2_time[0]);
                $m = intval($date1_time[1]) - intval($date2_time[1]);
                $s = intval($date1_time[2]) - intval($date2_time[2]);
                if ($h < 1) {
                    if ($m < 1) {
                        $c_time = $s . " second";
                    } else {
                        $c_time = $m . " minutes";
                    }
                } else {
                    $c_time = $h . " hours";
                }
            } else if ($f_d == 1) {
                $c_time = $f_d . " day";
            } else {
                $c_time = $f_d . " days";
            }
        } else if ($f_m == 1) {
            $c_time = $f_m . " month";
        } else {
            $c_time = $f_m . " months";
        }
    } else if ($f_y == 1) {
        $c_time = $f_y . " year";
    } else {
        $c_time = $f_y . " years";
    }
    if ($only_val) return $c_time;
    return $c_time . " ago";
}
// To Month Date
function monthDate($date2)
{
    $date1 = date("Y-m-d");
    $date2 = explode(" ", $date2);
    $date2 = $date2[0];
    $date2 = date("d F, Y", strtotime($date2));
    return $date2;
}
// Success Msg
function success($data, $redirect = "none")
{
    if ($redirect != "none") {
        return json_encode(array("status" => "success", "data" => $data, "redirect" => $redirect));
    } else {
        return json_encode(array("status" => "success", "data" => $data));
    }
}
// return success
function returnSuccess($data, $redirect = "none"){
    echo success($data, $redirect);
    die();
}
// Error Msg
function error($data = "Error Please Try Again!")
{
    return json_encode(array("status" => "error", "data" => $data));
}
// Error Msg
function returnError($data = "Error Please Try Again!")
{
    echo json_encode(array("status" => "error", "data" => $data));
    die();
}
// Redirect To
function redirectTo($url)
{
    echo '<script>location.assign("' . $url . '");</script>';
    die();
}
function bc_code()
{
    return md5(rand(100, 9999));
}
function is_image_file($file_name)
{
    $allowed_ext = array('jpg', 'jpeg', 'png', 'gif');
    $getExt = explode('.', $file_name);
    $ext = strtolower(end($getExt));
    if (in_array($ext, $allowed_ext)) {
        return $ext;
    } else {
        return false;
    }
}
function generate_scrapper_image_capture_content($url, $userAgent = false)
{
    if ($userAgent !== false) {
        $userAgent = "userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0'";
    } else {
        $userAgent = '';
    }
    $image_name = generate_file_name('png');
    $content = <<<BODY
  var page = require('webpage').create();
  page.viewportSize = { width: 1024, height: 768 };
    page.settings = {
      loadImages: true,
      localToRemoteUrlAccessEnabled: true,
      javascriptEnabled: true,
      loadPlugins: true,
      $userAgent
   };
  page.clipRect = { top: 0, left: 0, width: 1024, height: 768 };
  page.open('$url', function() {
    page.render('$image_name');
    console.log('$image_name');
    phantom.exit();
  });
BODY;
    return $content;
}
function generate_js_content($url, $userAgent = false)
{
    if ($userAgent !== false) {
        $userAgent = "userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0'";
    } else {
        $userAgent = '';
    }
    $content = <<<BODY
var casper = require('casper').create({
    verbose: false,
    logLevel: 'debug',
    headers: {
        'Accept-Language': 'en-US'
    },
    pageSettings: {
        loadImages: false,
        loadPlugins: true,
        javascriptEnabled: true,
        $userAgent
    },
    viewportSize: {width: 1366, height: 625},
    stepTimeout: 30000
});


var url = "$url";
casper.start(url);

casper.wait(100, function(){
    this.capture('image.png');
    var html = this.evaluate(function() {
        return document; 
    });
    this.echo(html.all[0].outerHTML);
});

casper.run();
BODY;
    return $content;
}
function get_page_js($url, $user_agent = false)
{
    $content = generate_js_content($url, $user_agent);
    fopen("scrapper.js", "w");
    file_put_contents('scrapper.js', $content);
    $cmd  = exec("casperjs scrapper.js", $output);
    $html = implode('', $output);
    return $html;
}
function get_web_page($url, $user_agent = false, $fetch_by_js = true)
{
    if ($fetch_by_js === true) {
        $page = get_page_js($url, $user_agent);
        if ($page != '') {
            $dom = new DomDocument();
            libxml_use_internal_errors(true);
            $dom->loadHTML($page);
            $links = $dom->getElementsByTagName('a');
            return $page;
            if (count($links) > 0) {
                return $page;
            }
        }
    }
    $options = array(

        CURLOPT_CUSTOMREQUEST  => "GET", //set request type post or get
        CURLOPT_POST           => false, //set to GET
        CURLOPT_RETURNTRANSFER => true, // return web page
        CURLOPT_HEADER         => false, // don't return headers
        CURLOPT_FOLLOWLOCATION => true, // follow redirects
        CURLOPT_ENCODING       => "", // handle all encodings
        CURLOPT_AUTOREFERER    => true, // set referer on redirect
        CURLOPT_CONNECTTIMEOUT => 30, // timeout on connect
        CURLOPT_TIMEOUT        => 30, // timeout on response
        CURLOPT_MAXREDIRS      => 10, // stop after 10 redirects
    );
    if ($user_agent) {
        $options = array(

            CURLOPT_CUSTOMREQUEST  => "GET", //set request type post or get
            CURLOPT_POST           => false, //set to GET
            CURLOPT_RETURNTRANSFER => true, // return web page
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
            CURLOPT_HEADER         => false, // don't return headers
            CURLOPT_FOLLOWLOCATION => true, // follow redirects
            CURLOPT_ENCODING       => "", // handle all encodings
            CURLOPT_AUTOREFERER    => true, // set referer on redirect
            CURLOPT_CONNECTTIMEOUT => 30, // timeout on connect
            CURLOPT_TIMEOUT        => 30, // timeout on response
            CURLOPT_MAXREDIRS      => 10, // stop after 10 redirects
        );
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, $options);
    $content = curl_exec($ch);
    $err     = curl_errno($ch);
    $errmsg  = curl_error($ch);
    $header  = curl_getinfo($ch);
    curl_close($ch);

    $header['errno']   = $err;
    $header['errmsg']  = $errmsg;
    $header['content'] = $content;
    if (strpos(strtolower($content), 'object not found!') || strlen($content) < 1000) {
        return file_get_contents_curl($url);
    } else {
        return $content;
    }
}
function get_file_info($file_name)
{
    $file = [];
    $getExt = explode('.', $file_name);
    $file['ext'] = strtolower(end($getExt));
    array_pop($getExt);
    if (count($getExt) > 0) {
        $file['name'] = implode('.', $getExt);
    } else {
        $file['name'] = $file['ext'];
        $file['ext'] = '';
    }
    return $file;
}
function get_date_with($term)
{
    return date("Y-m-d", strtotime(date("Y-m-d") . $term));
}
// Rand Number
function getRandom($length = 5)
{
    $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    $result = '';
    for ($i = 0; $i < $length; $i++) {
        $result .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $result;
}
function generate_key($length = 30){
    global $db;
    $chars = '-*$_.)([]{}.;=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-*$_.)([]{}.;=';
    $key = '';
    for ($i = 0; $i < $length; $i++) {
        $key .= $chars[rand(0, strlen($chars) - 1)];
    }
    $exist = $db->select("users", ['secret_key' => $key]);
    if($exist){
        return generate_key($length);
    } else {
        return $key;
    }
}
function makeReqKey()
{
    return getRandom(30);
}
function removeSpaces($str)
{
    return preg_replace('/[ ]/', "", $str);
}
function tooTrim($str)
{
    $str = preg_replace('/[ \t]+/', ' ', preg_replace('/[\r\n]+/', "\n", $str));
    $str = preg_replace('/(  )/', '', $str);
    $str = trim($str);
    if ($str == " ") $str = "";
    return $str;
}
function extractZipFile($zip_file, $extract_path)
{
    $zip = new ZipArchive;
    $res = $zip->open($zip_file);
    if ($res === TRUE) {
        $zip->extractTo($extract_path);
        $zip->close();
        return true;
    } else {
        return false;
    }
}
// Generate File name
function generate_file_name($ext, $dir = '', $return_full_path = false, $length = 5)
{
    $file_name = getRandom($length);
    $file_name .= '.' . $ext;
    if ($dir === '') return $file_name;
    $file_location = $dir . $file_name;
    if (file_exists($file_location)) {
        return generate_file_name($ext, $dir);
    } else {
        if ($return_full_path) return $file_location;
        return $file_name;
    }
}
// Download file from another website
function download_file($params)
{
    $file_info = get_file_info($params['source']);
    if ($file_info['ext'] !== '') {
        $new_file_name = generate_file_name($file_info['ext'], $params['save_path']);
        $file = fopen($new_file_name, "w");
        $new_file_path = rtrim($params['save_path'], '/') . "/" . $new_file_name;
        if (file_put_contents($new_file_path, file_get_contents($params['source']))) {
            return $new_file_name;
        }
    } else return false;
}
function captureWebPage($url, $save_path)
{
    $content = generate_scrapper_image_capture_content($url, true);
    $scrapper_file = generate_file_name('js');
    fopen($scrapper_file, "w");
    file_put_contents($scrapper_file, $content);
    $cmd  = exec("casperjs $scrapper_file");
    if (strpos($cmd, ".png")) {
        $new_file_name = generate_file_name("png", $save_path);
        copy($cmd, $save_path . "/" . $new_file_name);
        if (file_exists($cmd)) unlink($cmd);
        if (file_exists($scrapper_file)) unlink($scrapper_file);
        if (file_exists($save_path . "/" . $new_file_name)) return $new_file_name;
        else return false;
    } else return false;
}
function deleteDirectory($dir)
{
    if (!file_exists($dir)) {
        return true;
    }

    if (!is_dir($dir)) {
        return unlink($dir);
    }

    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }

        if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
            return false;
        }
    }

    return rmdir($dir);
}
function makeZipFile($zip_file_path = "")
{
    if ($zip_file_path === "") $zip_file_path = generate_file_name("zip");
    $zip = new ZipArchive();
    $zip->open($zip_file_path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    return $zip_file_path;
}
// Create Zip file
function createZipFile($folder, $zip_file_path = "", $folder_name_in_zip_file = "")
{
    if ($zip_file_path === "") $zip_file_path = generate_file_name("zip");
    $zip = new ZipArchive();
    $zip->open($zip_file_path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    $get_final_folder = explode('/', $folder);
    $folder_real_name = end($get_final_folder);
    if ($folder_name_in_zip_file !== "") $folder_real_name = $folder_name_in_zip_file;
    $rootPath = realpath($folder);
    $files    = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($rootPath),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($files as $name => $file) {
        if (!$file->isDir()) {
            $filePath     = $file->getRealPath();
            $relativePath = substr($filePath, strlen($rootPath) + 1);

            $zip->addFile($filePath, $folder_real_name . "/" . $relativePath);
        }
    }
    $zip->close();
}
function br()
{
    echo "<br>";
}
function replaceBreaksToBr($str)
{
    return preg_replace('/(\n)/mi', "<br>", $str);
}
// Parse Code into html
function parseCode($str)
{
    $str = replaceBreaksToBr($str);
    $str = preg_replace("/\t/", '&nbsp;&nbsp;&nbsp;&nbsp;', $str);
    $str = preg_replace("/[ ]/", "&nbsp;", $str);
    return $str;
}
// delete file
function deleteFile($file)
{
    if (file_exists($file))
        unlink($file);
}
// check json
function isJson($string)
{
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}
// Page URL
function get_domain()
{
    $domain = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http';
    $domain .= "://";
    $domain .= $_SERVER['SERVER_NAME'];

    return $domain;
}
function require_get($params, $redirect = "")
{
    foreach ($params as $param) {
        if (!isset($_GET[$param])) {
            if ($redirect !== "") {
                redirectTo($redirect);
            } else {
                echo "$param Paramter not provided in the url";
                die();
            }
        }
    }
}
// Read Dir
function read_dir($r_dir)
{
    $files = [];
    $dir_files = scandir($r_dir);
    $not_allowed_files = ['.', '..'];
    foreach ($dir_files as $file) {
        if (!in_array($file, $not_allowed_files)) {
            array_push($files, $file);
        }
    }

    return $files;
}
// Read file
function read_file($file)
{
    if (!file_exists($file)) return false;
    $data = "";
    $fh = fopen($file, 'r');
    while ($line = fgets($fh)) {
        $data .= ($line);
    }
    fclose($fh);
    return $data;
}
// Read file in array
function read_file_in_array($file)
{
    if (!file_exists($file)) return false;
    $data = [];
    $fh = fopen($file, 'r');
    while ($line = fgets($fh)) {
        array_push($data, $line);
    }
    fclose($fh);
    return $data;
}
function removeDir($dir)
{
    if (!file_exists($dir)) {
        return true;
    }

    if (!is_dir($dir)) {
        return unlink($dir);
    }

    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }

        if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
            return false;
        }
    }

    return rmdir($dir);
}
// Replace Links
function replace_links($text)
{
    $text = preg_replace('/(https?:\/\/)([^ ]+)/i', "'$2'<a target=\"_blank\" href=\"$2\"><i class=\"fas fa-link\"></i></a>
            ", $text);
    return $text;
}
// Open file in file exploler
function openInExploler($path)
{
    $htdocs_folder = $_SERVER['DOCUMENT_ROOT'];
    $path = $htdocs_folder . "\\nancy\\" . $path;
    $path = str_replace('/', '\\', $path);
    exec("explorer.exe /select,\"" . $path . "\"");
}
function downloadFile($filepath, $filename)
{
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filepath));
    flush();
    readfile($filepath);
}
    function linkify($inputText){
        $replacedText; $replacePattern1; $replacePattern2; $replacePattern3;

        //URLs starting with http://, https://, or ftp://
        $replacePattern1 = '/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/mi';
        $replacedText = preg_replace($replacePattern1, '<a href="$1" target="_blank">$1</a>', $inputText);

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        $replacePattern2 = '/(^|[^\/])(www\.[\S]+(\b|$))/mi';
        $replacedText = preg_replace($replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>', $replacedText);

        //Change email addresses to mailto:: links.
        $replacePattern3 = '/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/mi';
        $replacedText = preg_replace($replacePattern3, '<a href="mailto:$1">$1</a>', $replacedText);
        return $replacedText;
    }

    // function for read dir files
    function get_dir_files($scan_dir_url = "",$type = "",$remove_file = []){
       $directory =  scandir($scan_dir_url);
       foreach ($remove_file as $num) {
            unset($directory[$num]);   
       }

       if ($directory) {
           switch ($type) {
               case 'css':
                foreach ($directory as $file) {
                    $csslink = "<link rel=\"stylesheet\" href=\"$scan_dir_url$file\">\n";
                    echo $csslink;
                }
                   break;
               
               default:
                $i = -1;
                    foreach ($directory as $files) {
                        $i = $i + 1;
                        $script =  "<script data-remove=\"$i\" src=\"$scan_dir_url$files\"></script>\n";
                        echo $script;
                    }
                   break;
           }
       }
   
    }
    
    


    ?>

    