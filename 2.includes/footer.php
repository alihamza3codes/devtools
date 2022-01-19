<?php
$footer_files_path = isset($global_dir) ? $global_dir : "";
$controller_dir = isset($global_dir) ? $global_dir . "controllers/" : "controllers/";
$assets_v = "?v=2.0";
?>
<script>
    let controller_dir = "<?= $controller_dir ?>",
        logged_in_user_id = "<?= $l_user['encrypt_id'] ?>",
        global_dir = "<?= $global_dir ?>",
        userSecretKey = "<?= $l_user['secret_key'] ?>"
</script>
<script src="<?= $footer_files_path ?>assets/js/jquery.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/jquery-ui.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/popper.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/bootstrap.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/jquery.dataTables.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/swiper.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/sweetalert.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/moment.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/lightbox.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/functions.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/tc.jquery.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/TC.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/tc-file-upload.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/emojis.min.js<?= $assets_v ?>"></script>
<script src="<?= $footer_files_path ?>assets/js/TCChat.js<?= $assets_v ?><?= $assets_v ?>"></script>
<script src=" <?= $footer_files_path ?>assets/js/script.js<?= $assets_v ?><?= $assets_v ?>"></script>
<script src=" <?= $footer_files_path ?>assets/js/Tasks.js<?= $assets_v ?><?= $assets_v ?>"></script>


<?php
if (isset($js_files)) {
    foreach ($js_files as $file_path) {
        $file_path = $footer_files_path . $file_path;
?>
        <script src="<?php echo $file_path; ?>"></script>
<?php }
} ?>

<?php if (isset($assets['js'])) {
    foreach ($assets['js'] as $src) {
        $src = $footer_files_path . $src; ?>
        <script src="<?= $src ?>"></script>
<?php
    }
} ?>