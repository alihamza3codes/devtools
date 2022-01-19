<?php require_once("./2.includes/inc/database.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- <php require_once("../1.assets/css/include-all.php") > -->
    <title>Data base functions</title>
    <?= get_dir_files("./1.assets/css/","css") ?>
</head>

<body>


    <div class="container">
        <div class="card">
            <div class="card-body">
                <!-- show-create form for -->
                <form class="show-create-form">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <span class="label">DB Name:</span>
                                <input type="text" class="form-control" name="db_name" required data-length='[0-50]'>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <span class="label">Table Name:</span>
                                <input type="text" class="form-control" style="color: black;" name="table_name_col" required data-length='[0-100]'>
                            </div>
                        </div>
                        <div class="col-12">
                            <input type="hidden" name="insertNew" value="true">
                            <button type="submit" class="submit-btn">
                                <i class="fas fa-save"></i> Fetch
                            </button> 
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