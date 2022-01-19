<?php 
	if(!isset($global_dir)) $global_dir = './';
	if(!isset($msg_type)){
		$msg_type = "error";
	}
	if(!isset($msg))
		$msg = "Something Went Wrong! Pls try again";
	$image = "error.png";
	if($msg_type === "success")
		$image = "success.png";
	$page_name = $msg;
	if(!isset($site_name))
		global $site_name;
	if(!isset($image_dir))
		$image_dir = $global_dir;
 ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<?php require_once($global_dir . "includes/head.php"); ?>
</head>
<body class="content-center">
	<div class="container-fluid">
		<div class="row">
			<div class="col-md-6 offset-md-3">
				<div class="card p-3">
					<div class="card-body text-center">
						<div class="content-center">
							<div class="col-lg-3 col-md-6">
								<img src="<?= $image_dir ?>images/<?= $image ?>" alt="image" class="img-fluid">
							</div>
						</div>
						<p class="mt-3">
							<?= $msg ?>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>
<?php die(); ?>