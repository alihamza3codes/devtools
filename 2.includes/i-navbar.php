<?php 
    $pages = [];
    $selectPages = $db->select("pages");
    if ($selectPages) {
        if (!($is_admin)) {
            foreach ($selectPages as $selectPage) {
                if ($selectPage["is_exclude"]) array_push($pages, $selectPage);
                else if (has_access("pages", [
                    "url" => $selectPage["url"]
                ])) array_push($pages, $selectPage);
            }
        } else $pages = $db->select("pages");
    }
?>
<div class="nc-navbar fixed-top" style="position: absolute;">
    <div class="container-fluid">
        <nav class="navbar navbar-expand-sm navbar-dark">
            <a class="navbar-brand" href="<?= $global_dir ?>">Nancy</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ncNavbarMenu">
                <i class="fas fa-bars"></i>
            </button>
            <div class="collapse navbar-collapse" id="ncNavbarMenu">
                <ul class="navbar-nav align-center">
                    <li class="nav-item active">
                        <div class="dropleft quick-links-dropmenu" data-callback="focusToSearch">
                            <i class="fas fa-th cp" nc-style="cp" data-toggle="dropdown"></i>
                            <div class="dropdown-menu">
                                <div class="quick-links">
                                    <div class="w-100 pull-right pb-2">
                                        <div class="col-md-6">
                                            <input type="text" autocomplete="false" class="nc-search search-input form-control" data-target=".single-link" data-match=".page-name" placeholder="Search...">
                                        </div>
                                    </div>
                                    <?php foreach($pages as $page){ ?>
                                        <a href="<?= $global_dir . $page['url'] ?>" class="single-link">
                                            <?= file_get_contents($global_dir . "images/icons/" . $page['icon']) ?>
                                            <span class="page-name"><?= $page['name'] ?></span>
                                        </a>
                                    <?php } ?>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</div>