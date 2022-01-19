callBackFunctions.updateProject = function(response) {
    $(".project-name").text($('.project_name').val());
    $(".project-description").html(replaceBreaksToBr($('.project_description').val()));
    sAlert(response.data, response.status);
}
callBackFunctions.deleteProject = function(response) {
    location.assign("view-projects");
}
$(".view-version-tasks").on("click", function(e) {
    e.preventDefault();
    $.get("views/projects/versions/tasks/task?id=" + $(this).attr("data-id"), function(data) {
        $("#projectVersionTasks .card-body").html(data);
        refreshStyles();
        refreshFns();
    });
});
$(".dropdown-menu a").each(function() {
    let title = $(this).attr("title"),
        valid_title = false;
    if (typeof(title) === "string") {
        if (title.length > 0) {
            valid_title = true;
        }
    }
    if (!valid_title) {
        title = $(this).attr("data-original-title");
        $(this).removeAttr("data-original-title");
    }
    $(this).append(title);
});
// Update Project Description
function updateProjectDesc(project_id) {
    l(project_id);
    $.get("views/projects/detail?id=" + project_id, function(data) {
        $("#details-panel").html(data);
        refreshFns();
    });
}
// Edit Project Description
function editProjectDesc(){
    let detailsPanel = $("#details-panel"),
        html = detailsPanel.find(".description-area .project-description").html();
    // Set height
    let height = detailsPanel.find(".description-area .project-description").height();
    detailsPanel.find(".editing-area").css("min-height", height + "px");

    detailsPanel.addClass("editing-mode");
    html = replaceBrToN(html);
    detailsPanel.find(".editing-area").val((html));
    refreshFns();
}
// Save Project Desciption
function saveProjectDesc(){
    let detailsPanel = $("#details-panel"),
        html = detailsPanel.find(".editing-area").val();
    detailsPanel.removeClass("editing-mode");
    html = htmlspecialchars_decode(html);
    detailsPanel.find(".description-area .project-description").html(replaceBreaksToBr(html));
    $.post("controllers/projects/modify", {
        updateProjectDesc: true,
        description: html,
        project_id: $('input[type="hidden"][name="project_id"]').val(),
        req_token: makeReqKey()
    }).done((res) => {
        if(!isJson) notifyError();
    }).fail(notifyError);
    refreshFns();
}

// Open Link of project description
$(document).on("click", ".project-description a", function(e){
    e.preventDefault();
    let url = $(this).text();
    if(this.hasAttribute('href')) url = $(this).attr("href");
    window.open(url, "_blank");
})
// Copy data from project description
$(document).on("click", ".project-description .copy-data", function(e){
    e.preventDefault();
    let text = $(this).html();
    text = replaceBrToN(text);
    l(text);
    if(copyText(text)) notify("Copied");
});
// Toggle panel in description
$(document).on("click", ".d-panel .panel-toggler", function(e){
    e.preventDefault();
    $(this).toggleClass("active");
    $(this).parents(".d-panel").find(".d-panel-body").slideToggle();
});

// Get Project Version Modified Files
$(document).on("click", ".get-modified-files-btn", function(){
    let parent = $(this).parents("tr").first(),
        pv_id = parent.attr("data-id");
    $.post("controllers/projects/changed-files", {
        id: pv_id,
        req_token: makeReqKey(),
        getChangedFiles: true
    }).fail(makeError)
    .done((res) => {
        let target = $("#projectVersionChangedFiles");
        res = handleJsonRes(res);
        if(!res){
            target.find(".panel-body .content").html('');
            target.modal("hide");
            return false;
        }
        let data = res.data;
        target.find(".changed-files-panel .panel-body .content").html(data.changedFiles);
        target.find(".deleted-files-panel .panel-body .content").html(data.deletedFiles);
        target.find(".new-files-panel .panel-body .content").html(data.newFiles);
        refreshFns();
        $("table").each(function(){
            let count = 1;
            $(this).find("tbody .count").each(function(){
                $(this).html(count);
                count++;
            });
        });
    })
});
// Create Zip file of files
$(document).on("click", ".create-zip-file", function(e){
    e.preventDefault();
    let table = $(this).parents(".panel-body").find(".table"),
        tr = table.find("tbody tr"),
        files = [];

    tr.each(function(){
        let checkbox = $(this).find(".item-checkbox"),
            filename = checkbox.attr("data-path");
        if(checkbox.is(":checked")) files.push(filename);
    });
    let project_version_id = $(this).parents(".card").find(".project_version_id").val();
    
    $.post("controllers/projects/versions/create-zip", {
        pv_id: project_version_id,
        files: files,
        req_token: makeReqKey()
    }).fail(notifyError)
    .done((res) => {
        res = handleJsonRes(res);
        if(!res) return notifyError;
        window.open('download?file=' + res.data.filepath + "&filename=" + res.data.filename);
    });
});