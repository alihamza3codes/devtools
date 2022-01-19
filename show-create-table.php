<?php require_once("./2.includes/inc/database.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- <php require_once("../1.assets/css/include-all.php") > -->
    <title>Data base functions</title>
    <?= get_dir_files("./1.assets/css/", "css") ?>
</head>

<body>

    <div class="container">
        <div class="card">
            <div class="card-body">
                <!-- show-create form for -->
                <form>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="">Your DB Name:</label>
                            <select name="show_db_name" class="form-control"></select>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <script src="./1.assets/js/jquery.min.js"></script>
    <script src="./1.assets/js/Table-create.js"></script>
</body>

</html>