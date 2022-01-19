<?php 
$css = scandir("./css/");
unset($css[0]);
unset($css[1]);
if ($css) {
    echo "<pre>";
    echo json_encode($css);
    echo "</pre>";
}

?>