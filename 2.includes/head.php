    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> <?php echo $page_title; ?> -
        <?php echo $site_name; ?>
    </title>
    <?php
    $head_files_path = isset($global_dir) ? $global_dir : "";
    $assets_v = "?v=2.0";
    ?>
    <link rel="icon" href="<?= $head_files_path ?>images/design/logo/3.png" id="favicon">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/fonts.css">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/swiper.min.css">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/lightbox.min.css">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/classes.css<?= $assets_v ?>">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/tc.css<?= $assets_v ?>">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/chat.css<?= $assets_v ?>">
    <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/style.css<?= $assets_v ?>">
    <?php if (!isset($no_chat_box_css)) { ?>
        <link rel="stylesheet" href="<?= $head_files_path ?>assets/css/chat-box.css">
    <?php }  ?>
    <?php
    if (isset($assets['css'])) {
        foreach ($assets['css'] as $link) {
            $link = $head_files_path . $link;
    ?>
            <link rel="stylesheet" href="<?= $link; ?>">
    <?php
        }
    } ?>