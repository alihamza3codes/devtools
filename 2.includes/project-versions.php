<?php
$projects_versions = $db->select("projects_versions", ['project_id' => $project['id']], '', 'id DESC');
if ($projects_versions) {
    $count = 1;
    ?>
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <td>#</td>
                <td>Version</td>
                <td>Is Completed</td>
                <td>Time</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($projects_versions as $projects_version) {

        $version = floatval($projects_version['version']);
        if (strlen($version) === 1) {
            $version .= ".0";
        }

        $is_completed = intval($projects_version['is_completed']);
        if ($is_completed == 1) {
            $is_completed = true;
        } else {
            $is_completed = false;
        }

        $start_time = $projects_version['start_time'];
        $end_time   = $timestamp;
        if ($is_completed) {
            $end_time = $projects_version['end_time'];
        }

        $real_end_time = $projects_version['end_time'];

        // Project Version Task
        $tasks         = $db->select("projects_versions_tasks", ['project_version_id' => $projects_version['id']], '', 'id DESC');
        $project_tasks = '';
        if ($tasks) {
            foreach ($tasks as $task) {
                $task_desc = $task['description'];
                if (strlen($task_desc) > 50) {
                    $task_desc = substr($task_desc, 0, 50) . ".....";
                }
                $status = 'line-through';
                if ($task['is_completed'] != 1) {
                    $status = '';
                }
                $project_tasks .= <<<BODY
<li class='$status'> $task_desc </li>
BODY;
            }
        }
        if (strlen($project_tasks) < 1) {
            $project_tasks = 'No Task Found!';
        }
        ?>
            <tr>
                <td>
                    <?=$count;?>
                </td>
                <td data-name="version" data-value="<?=$projects_version['version'];?>" data-toggle="popover" title="Tasks" data-html="true" data-content="<?=$project_tasks;?>">
                    <a href="#" data-toggle="modal" class="text-white view-version-tasks" data-id="<?=$projects_version['id'];?>" data-target="#projectVersionTasks">
                        <?=$version;?>
                    </a>
                </td>
                <td data-name="is_completed" data-value="<?=$projects_version['is_completed'];?>">
                    <?php
                        if ($is_completed) {
                    ?>
                    <span class="badge badge-success">Completed</span>
                    <?php
                        } else {
                    ?>
                    <span class="badge badge-warning">Pending</span>
                    <?php
                        }
                    ?>
                </td>
                <td data-toggle="popover" title="Time Period" data-html="true" data-content="
                    <?php if(!in_array($start_time, $not_allowed_times)){ ?>
                    <b>Start Date:</b>
                    <?= date(" d F, Y - h:i A", strtotime($start_time));?> <br>
                    <?php if ($is_completed) {?>
                    <b>Finish Date:</b>
                    <?=date("d F, Y - h:i A", strtotime($end_time));?>
                    <?php } } ?>
                    ">


                    <?php if(!in_array($start_time, $not_allowed_times)){ ?>
                    <?=toDateAgo($start_time, $end_time, true);?>
                    <?=$is_completed ? "" : "- - -"?>
                    <?php } ?>
                </td>
                <td class="d-none" data-name="start_time" data-value="<?=$projects_version['start_time'];?>">
                    <?=$projects_version['start_time'];?>
                </td>
                <td class="d-none" data-name="end_time" data-value="<?=$projects_version['end_time'];?>">
                    <?=$projects_version['end_time'];?>
                </td>
                <td data-name="encrypt_id" data-value="<?=$projects_version['encrypt_id'];?>">
                    <a href="./projects/<?= $project['folder_name'] . "/v" . $projects_version['version']; ?>" class="text-white ml-1" title="View Project" target="_blank">
                        <i class="far fa-eye"></i>
                    </a>
                    <a href="#" class="text-success editTableInfo ml-1" title="Edit" data-toggle="modal" data-target="#editprojectsVersion">
                        <i class="fas fa-pencil-alt"></i>
                    </a>
                    <a href="#" class="delete-td-data text-danger ml-1" title="Delete" data-target="<?=$projects_version['encrypt_id'];?>" data-action="projects_version">
                        <i class="fas fa-trash-alt"></i>
                    </a>
                    <a href="#" class="text-white editModalBoxSingleInput ml-1" title="Add Version Task" data-target="#addProjectsVersionsTasks" data-toggle="modal" data-name="project_version_id" data-value="<?=$projects_version['id'];?>">
                        <i class="fas fa-plus"></i>
                    </a>
                    <?php if($is_completed){ ?>
                    <a href="#" class="nc-jx-req-btn text-white ml-1" data-action="projects-versions" data-submit='{"markAsUncomplete": true, "target": "project_version", "id": "<?= $projects_version['encrypt_id']; ?>" }' title="Mark as Uncomplete">
                        <i class="far fa-check-square"></i>
                    </a>
                    <?php } else { ?>
                    <a href="#" class="nc-jx-req-btn text-white ml-1" data-action="projects-versions" data-submit='{"markAsComplete": true, "target": "project_version", "id": "<?= $projects_version['encrypt_id']; ?>" }' title="Mark as Complete">
                        <i class="far fa-square"></i>
                    </a>
                    <?php if(in_array($projects_version['start_time'], $not_allowed_times)){ ?>
                    <a href="#" class="nc-jx-req-btn text-white ml-1" data-action="projects-versions" data-submit='{"startTime": true, "target": "project_version", "id": "<?= $projects_version['encrypt_id']; ?>" }' title="Start Time">
                        <i class="fas fa-play"></i>
                    </a>
                    <?php } ?>
                    <?php } ?>
                    <a href="#" class="nc-jx-req-btn text-white ml-1" data-action="project-changed-files" data-submit='{"getChangedFiles": true, "version": "<?= $projects_version['encrypt_id']; ?>", "id": "<?= $projects_version['encrypt_id']; ?>" }' title="Get Changed Files" data-callback="getChangedFiles" data-return-callback="true">
                        <i class="fas fa-file-alt"></i>
                    </a>
                    <?php if(strlen($projects_version['file']) > 0 && $is_completed){ ?>
                    <a href="./projects/<?= $project['folder_name'] . "/" . $projects_version['file']; ?>" download="<?= $project['name'] . " v" . $projects_version['version']; ?>" title="Download Version <?= $version; ?>" class="text-white ml-1">
                        <i class="fas fa-cloud-download-alt"></i>
                    </a>
                    <?php } ?>
                </td>
            </tr>
            <?php $count++;}?>
        </tbody>
    </table>
</div>
<?php } else {?>
<p>No Data found!</p>
<?php }?>