let modifyFiles = {
        "cut": [],
        "copy": []
    },
    isShareFolder = false;
shortcutKeys = [113];
fetchFolder(current_folder_id);

Date.prototype.formatDate = function() {
    let monthNames = ["January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December"
        ],
        dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        date = this.getDate(),
        day = dayNames[this.getDay()],
        monthName = monthNames[this.getMonth()],
        year = this.getFullYear(),
        part,
        hours = this.getHours(),
        min = this.getMinutes(),
        sec = this.getSeconds();
    part = hours > 12 ? "PM" : "AM";
    hours = hours > 12 ? hours - 12 : hours;
    hours = hours == 0 ? 12 : hours;
    hours = hours < 10 ? `0${hours}` : hours;
    min = min < 10 ? `0${min}` : min;
    sec = sec < 10 ? `0${sec}` : sec;

    return `${day}, ${monthName} ${date}, ${year}, ${hours}:${min}:${sec} ${part}`;
}

function updateStatus() {
    let folders = $(".single-folder");
    let selectedFolders = $(".single-folder.selected");
    let str = `${folders.length} Items`;
    if (selectedFolders.length > 0) {
        str += ` ${selectedFolders.length} Selected`;
    }
    $(".status-bar .items").text(str);
}

function contextMenuCallback() {
    data = {
        updateModifiedDate: true,
        parent_id: current_folder_id
    }
    $.ajax({
        url: "controllers/shared/folders/update",
        type: "POST",
        data: data
    });
}

// Upload file
$("body").on("dragenter dragover", function(e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    if (data.types && (data.types.indexOf ? data.types.indexOf('Files') != -1 : data.types.contains('Files'))) {
        $(".drag-over-content").addClass("show");
    }
});
$("body").on("drop", function(e) {
    e.preventDefault();
    let dt = e.originalEvent.dataTransfer;
    let files = dt.files;
    if (files.length > 0) {
        uploadFilesInFolders(files);
    }
    $(".drag-over-content").removeClass("show");
});
$("body").on("dragleave", function(e) {
    e.preventDefault();
    $(".drag-over-content").removeClass("show");
});

function setProgressBar(progress) {
    $(".upload-progress-bars .progress-bar").css("width", progress + "%");
    $(".upload-progress-bars .progress-bar").html(progress + "%");
}

function uploadProgressHandler(event) {
    var percent = (event.loaded / event.total) * 100;
    var progress = Math.round(percent);
    setProgressBar(progress);
}

function loadHandler(event) {
    let response = event.target.responseText,
        fileUpload = false;
    if (isJson(response)) {
        response = JSON.parse(response);
        if (response.status == "success") {
            fileUpload = true;
        }
    }
    if (!fileUpload) {
        notifyError("Error: File not uploaded");
    }
    $(".upload-progress-bars").addClass("d-none");
    setProgressBar(0);
    fetchFolder(current_folder_id);
}

function abortHandler(event) {
    $(".upload-progress-bars").addClass("d-none");
    sAlert("Aborted", "error");
}

function errorHandler(event) {
    $(".upload-progress-bars").addClass("d-none");
    sAlert("Upload Failed! Please try again", "error");
}
// Upload files in folder
function uploadFilesInFolders(files) {
    let formData = new FormData();
    formData.append("folder_id", current_folder_id);
    let filename = "";
    for (let i = 0; i < files.length; i++) {
        if (i == 0) filename = files[i].name;
        formData.append("files[]", files[i]);
    }
    $(".upload-progress-bars .file-name").text(filename);
    $(".upload-progress-bars.d-none").removeClass("d-none");
    $.ajax({
        url: "controllers/shared/folders/upload",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress",
                uploadProgressHandler,
                false
            );
            xhr.addEventListener("load", loadHandler, false);
            xhr.addEventListener("error", errorHandler, false);
            xhr.addEventListener("abort", abortHandler, false);

            return xhr;
        }
    });
}
// Upload file with button
$(".upload-files").on("change", function() {
    let files = $(this).get(0).files;
    if (files.length > 0) {
        uploadFilesInFolders(files);
    }
});
// Set width/height to files thumbnails
function setFoldersWidthHeight() {
    $(".file-thumbnail").each(function() {
        let width = $(".single-folder").first().width();
        if (width > 0) {
            $(this).css({
                "width": width + "px",
                "height": width + "px",
            });
        }
        /*let folderIcon = $(".folder-img:not(.file-img)").first();
        if (folderIcon.length > 0) {
            folderHeight = folderIcon.parents(".single-folder").first().height();
            let height = folderIcon.height();
            $(this).css({
                "width": height + "px",
                "height": height + "px",
            });
            $(this).parents(".single-folder").css("height", folderHeight + "px");

        } else {
            $(this).css({
                "width": "155px",
                "height": "155px",
            });
        }*/
    });
}

function processAjaxData(html, urlPath) {
    $('.page-data').html(html);
    window.history.pushState({ "html": html, "pageTitle": "Shared Data - Nancy" }, "", urlPath);
    refreshFunctions();
}
window.onpopstate = function(e) {
    if (e.state) {
        $('.page-data').html(e.state.html);
        refreshFunctions();
    }
};
// Fetch Page Data
function fetchFolder(folder_encrypt_id = false) {
    if (folder_encrypt_id === false) folder_encrypt_id = current_folder_id;
    current_folder_id = folder_encrypt_id;
    let get_folders_url = "views/shared/folders/folder";
    if (folder_encrypt_id != "0") get_folders_url += "?id=" + folder_encrypt_id;
    $.get(get_folders_url, function(data) {
        //$(".page-data").html(data);
        processAjaxData(data, "shared-data?id=" + folder_encrypt_id);
        let type = fetchSortType();
        let order = fetchSortOrder();
        if (order) {
            setSortValue({
                type: "order",
                value: order
            });
        }
        if (type) {
            setSortValue({
                type: "type",
                value: type
            });
        }
        sortFolders();
        updateStatus();
    });
}
// Open file
function openFile(file) {
    let file_name = $(file).find(".folder-name").get(0).innerText;
    let ext = file_name.split(".")[1];
    let link;
    if (ext == "txt" || ext == "html") {
        let href = $(file).find("a[href]").get(0).href;
        var href_split = href.split("/");
        let temp_file_name = href_split[href_split.length - 1];
        link = `editor?file=${temp_file_name}`;
        window.open(link, "_blank");
    } else {
        link = $(file).children("a").first();
        if (link.length < 1) return false;
        window.open(link.attr("href"), "_blank");
    }
}

function refreshFunctions() {
    setFoldersWidthHeight();
    unselectFolders();
    updateModifyFilesCSS();
    toggleSharedFolders();
    $(".single-folder img.file-thumbnail").each(function() {
        let src = $(this).attr('src') + "?t=" + makeReqKey();
        $(this).attr("src", src);
    });
    $(".create-new-folder-btn").attr("data-value", current_folder_id);
}
// Unselect all files on load
$(document).ready(function() {
    $(".check").each(function() {
        $(this).prop("checked", false);
    });
});
// Check if proceed click action
function proceedClickAction(e) {
    let target = $(e.target);
    if (target.hasClass("n-click")) {
        return false;
    } else {
        return true;
    }
}
// Open folder
$(document).on("dblclick", ".single-folder", function(e) {
    if (!proceedClickAction(e)) return false;
    if (!this.hasAttribute("data-id")) return false;
    let folder = this;
    if ($(folder).attr("data-type") === "file") {
        folder = $(folder);
        window.open("download?file_id=" + folder.attr("data-id"));
        return false;
        downloadFile({
            "url": folder.children("a").first().attr("href"),
            "name": folder.find(".folder-name-input").val()
        });
    } else fetchFolder($(this).attr("data-id"));
});
// Select folder
$(document).on("click", ".single-folder", function(e) {
    e.preventDefault();
    hideFolderContextMenu();
    if (!proceedClickAction(e)) return false;
    // check if click on folder name
    let target = $(e.target);
    if (target.hasClass("folder-name")) {
        if ($(this).hasClass("selected")) {
            renameFolder();
            return false;
        }
    }
    let check = $(this).find(".check");
    if (check.length < 1) return false;
    if (check.is(":checked")) {
        check.prop("checked", false);
        $(this).removeClass("selected");
    } else {
        if (!e.ctrlKey) {
            $(".single-folder.selected").each(function() {
                $(this).find(".check").prop("checked", false);
                $(this).removeClass("selected");
            });
        }
        check.prop("checked", true);
        $(this).addClass("selected");
    }
    updateStatus();
});
// Select single folder
function selectFolder(folder) {
    $(folder).find(".check").prop("checked", true);
    $(folder).addClass("selected");
}
// Un Select all folders
function unselectFolders() {
    $(".single-folder.selected").each(function() {
        $(this).find(".check").prop("checked", false);
        $(this).removeClass("selected");
    });
    $('.single-folder.active').removeClass("active");
    hideFolderContextMenu();
    updateStatus();
}
// Select All folders
function selectAllFolders() {
    $(".single-folder").each(function() {
        $(this).find(".check").prop("checked", true);
        $(this).addClass("selected");
    });
    $('.single-folder.active').removeClass("active");
    hideFolderContextMenu();
}
// hide context menu
function hideFolderContextMenu() {
    $(".folder-context-menu").removeClass('active');
}
// show context menu
function showFolderContextMenu(folder = false) {
    if (folder) {
        let type = $(folder).attr("data-type");
        if (type === "folder") {
            $(".folder-context-menu").attr("data-type", "folder");
        } else if (type === "file") {
            $(".folder-context-menu").attr("data-type", "file");
        }
        if ($(folder).hasClass("shared")) {
            $(".folder-context-menu").attr("data-type", "shared");
        }
    }
    $(".folder-context-menu").addClass('active');
    hideContextMenu();
}

function checkTarget(targets, target) {
    target = $(target);
    let valid = true;
    targets.forEach((className) => {
        if (target.hasClass(className) || target.parents("." + className).length > 0) {
            valid = false;
        }
    });
    return valid;
}
$(window).on("click", function(e) {
    let target = $(e.target);
    let unValidTargets = [
            "single-folder",
            "folder-context-menu",
            "window-context-menu",
            "no-click"
        ],
        valid = true;
    valid = checkTarget(unValidTargets, target);
    if (valid) {
        unselectFolders();
    }
    valid = checkTarget(['window-context-menu'], target);
    if (valid) hideContextMenu();
});
// Rename folder/file on press f2
$(window).on("keyup", function(e) {
    let key = e.keyCode || e.which;
    if (key === 113) {
        renameFolder();
    }
});
// Rename folder with double click
$(document).on("dblclick", ".folder-name", function(e) {
    selectFolder($(this).parents(".single-folder").first());

    e.preventDefault();
    e.stopPropagation();
});
// Rename folder
function renameFolder() {
    let folder = $(".single-folder.selected");
    if (folder.length !== 1) {
        unselectFolders();
        return false;
    }
    folder.addClass("editable");
    folder.find(".folder-name-input").select();
    folder.find(".folder-name-input").focus();
}
// Replace folder names
function replaceFoldersNames() {
    $(".modal#ReplaceFileNames").modal("hide");
    let findInput = $("input[name='find']");
    if (findInput.length < 1) return false;
    let find = findInput.val();
    if (find.length < 1) return false;
    let replace = $("input[name='replace']").val();
    if (!replace) replace = "";
    let folders = [];
    $(".single-folder.selected").each(function() {
        let name = $(this).find(".folder-name-input").val();
        let new_name = name.replace(find, replace);
        if (name !== new_name) {
            folders.push({
                "id": $(this).attr("data-id"),
                "type": $(this).attr("data-type"),
                "name": new_name
            });
        }
    });
    unselectFolders();
    if (folders.length < 1) return false;
    $.ajax({
        url: "controllers/shared/folders/update",
        type: "POST",
        data: {
            updateFolderNames: true,
            req_token: makeReqKey(),
            folders: folders
        },
        dataType: "json",
        success: function(response) {
            fetchFolder(current_folder_id);
        },
        error: notifyError
    });

}
// Delete Folders
function deleteFolders() {
    let folders = $(".single-folder.selected");
    if (folders.length < 1) return false;
    let cnfrm = confirmDelete(() => {
        let ids = [];
        folders.each(function() {
            ids.push({
                "id": $(this).attr("data-id"),
                "type": $(this).attr("data-type")
            });
        });
        $.ajax({
            url: "controllers/shared/folders/delete",
            type: "POST",
            data: {
                deleteFolders: true,
                req_token: makeReqKey(),
                data: ids
            },
            dataType: "json",
            success: function(response) {
                folders.remove();
                notify(response.data);
                contextMenuCallback();
            },
            error: notifyError
        });
    });
}
// Delete Share Folders
// Delete Folders
function deleteShareFolders() {
    let folders = $(".single-folder.selected.shared");
    if (folders.length < 1) return false;
    let ids = [];
    folders.each(function() {
        ids.push($(this).attr("data-id"));
    });
    $.ajax({
        url: "controllers/shared/folders/permissions",
        type: "POST",
        data: {
            removePermissions: true,
            req_token: makeReqKey(),
            data: ids
        },
        dataType: "json",
        success: function(response) {
            folders.remove();
            notify(response.data);
            contextMenuCallback();
        },
        error: notifyError
    });
}
// Create New Folder
function createNewFolder(name, type) {
    $.post("controllers/shared/folders/create", {
        insertfolder: true,
        parent_id: current_folder_id,
        name: name,
        type: type,
        req_token: makeReqKey()
    }).done(function() { contextMenuCallback();
        fetchFolder(current_folder_id); });
    hideContextMenu();
}

// Move folder/file to other folder
function moveFolders(data) {
    data.moveFolders = true;
    data.req_token = makeReqKey();
    $.post("controllers/shared/folders/modify", data)
        .done(function() {
            fetchFolder(current_folder_id);
        })
        .fail(notifyError);
}
// Cut Folders/files to other folder
function cutFolders() {
    let folders = $(".single-folder.selected");
    if (folders.length < 1) return false;
    let data = [];
    folders.each(function() {
        data.push({
            "id": $(this).attr("data-id"),
            "type": $(this).attr("data-type")
        });
    });
    modifyFiles.cut = data;
    modifyFiles.copy = [];
    updateModifyFilesCSS();
}

function folderProperties() {
    let folder = $(".single-folder.selected");
    if (folder.length > 1) {
        folder = folder.first();
    }
    let type = folder.attr("data-type");
    let id = folder.attr("data-id");
    $.ajax({
        url: "controllers/shared/folders/properties",
        type: "POST",
        data: {
            getProperties: true,
            type: type,
            id: id
        },
        dataType: 'json',
        success: function(res) {
            let data = res.data;
            let prop = $("#folderPropertiesPopup");
            prop.find(".name").text(data.name);
            prop.find(".type").text(data.type);
            prop.find(".size").text(data.size);
            prop.find(".created-by").text(data.createdBy);
            let modifiedDate = new Date(data.modifiedDate);
            prop.find(".modified-date").text(modifiedDate.formatDate());
            if (data.type == "Folder") {
                prop.find(".items").show();
                let folderText = "Folder",
                    fileText = "File",
                    files = data.files.length,
                    folders = data.folders.length;
                if (files > 1) folderText = "Folders";
                if (folders > 1) fileText = "Files";
                let str = `${folders} ${folderText}, ${files} ${fileText}`;
                prop.find(".items").text(str);
            } else prop.find(".items").hide();
            prop.modal("show");
        }
    });
}
// Share folder
function shareFolders(id) {
    let ids = [];
    $(".single-folder.selected").each(function() {
        ids.push($(this).attr("data-id"));
    });
    $.get(`views/shared/folders/share?id=${ids}`, function(data) {
        $("#folderSharePopup").remove();
        $("body").prepend(data);
        $("#folderSharePopup").modal("show");
        refreshFns();
    });
}
// Update modify folders/files css
function updateModifyFilesCSS() {
    $(".single-folder.highlighted").removeClass("highlighted");
    modifyFiles.cut.forEach((folder) => {
        let file = $(".single-folder[data-id='" + folder.id + "'][data-type='" + folder.type + "']");
        file.addClass("highlighted");
    });
    $(".single-folder.active").removeClass("active");
}
$(document).on("blur", ".folder-name-input", function() {
    let folder = $(this).parents(".single-folder");
    folder.removeClass("editable");
});
// Change folder name
$(document).on("change", ".folder-name-input", function() {
    let val = $(this).val(),
        folder = $(this).parents(".single-folder"),
        folderId = 0,
        target = folder.attr("data-type");
    if (!folder.get(0).hasAttribute("data-id")) return false;
    folderId = folder.attr("data-id");
    if (val.length < 1) {
        $(this).val($(this).attr('data-original-value'));
        folder.removeClass("editable");
        return false;
    }
    folder.find(".folder-name").text(val);
    folder.removeClass("editable");
    $.ajax({
        url: "controllers/shared/folders/update",
        type: "POST",
        data: {
            updatefolder: true,
            name: val,
            id: folderId,
            req_token: makeReqKey(),
            target: target
        },
        dataType: "json",
        error: function() {
            notify("Error changing folder name!");
        }
    })
});
let folderContextMenu = $(".folder-context-menu");
$(document).on("contextmenu", ".single-folder", function(e) {
    if (e.shiftKey) return;
    e.preventDefault();
    e.preventDefault();
    if (!proceedClickAction(e)) return false;
    let contextMenu = $(".folder-context-menu");
    // Get
    let contextMenuCoords = {
        "top": e.pageY + 10
    };
    let windowWidth = window.innerWidth,
        windowHeight = window.innerHeight,
        left = e.pageX + 20,
        top = e.pageY + 10,
        contextMenuWidth = folderContextMenu.width(),
        contextMenuHeight = folderContextMenu.height();

    if ((left + contextMenuWidth) >= windowWidth) {
        contextMenuCoords.right = (windowWidth - left) + 10;
        contextMenuCoords.left = 'auto';
    } else {
        contextMenuCoords.left = e.pageX + 10;
        contextMenuCoords.right = 'auto';
    }
    if ((top + contextMenuHeight) > windowHeight) {
        contextMenuCoords.bottom = (windowHeight - top) + 10;
        contextMenuCoords.top = 'auto';
    } else {
        contextMenuCoords.top = top;
        contextMenuCoords.bottom = 'auto';
    }
    $(".folder-context-menu").css(contextMenuCoords);

    let check = $(this).find(".check");
    if (check.length < 1) return false;
    if (check.is(":checked")) {
        $(this).addClass("active");
        showFolderContextMenu($(this));
    } else {
        $(".single-folder.selected").each(function() {
            $(this).find(".check").prop("checked", false);
            $(this).removeClass("selected");
        });
        check.prop("checked", true);
        $(this).addClass("selected");
        showFolderContextMenu($(this));
    }
    updateStatus();
});
// Open folder
$(document).on("click", ".folder-link", function(e) {
    e.preventDefault();
    if (!this.hasAttribute("data-id")) return false;
    fetchFolder($(this).attr("data-id"));
});
// Open folder/file
folderContextMenu.on("click", "[action='open']", function(e) {
    e.preventDefault();
    let folder = $(".single-folder.selected");
    folderContextMenu.removeClass("active");
    if (folder.length !== 1) return false;
    if ($(folder).attr("data-type") === "file") openFile($(folder));
    else fetchFolder($(this).attr("data-id"));
});
// Download file
folderContextMenu.on("click", "[action='download']", function(e) {
    e.preventDefault();
    let folder = $(".single-folder.selected");
    folderContextMenu.removeClass("active");
    if (folder.length !== 1) return false;
    if (folder.attr('data-type') !== "file") return false;

    var anchor = document.createElement('a');
    anchor.href = folder.children("a").first().attr("href");
    anchor.target = '_blank';
    anchor.download = folder.find(".folder-name-input").val();
    anchor.click();
});
// Download file
folderContextMenu.on("click", "[action='download-direct']", function(e) {
    e.preventDefault();
    let folder = $(".single-folder.selected");
    folderContextMenu.removeClass("active");
    if (folder.length !== 1) return false;
    if (folder.attr('data-type') !== "file") return false;

    window.open("download?file_id=" + folder.attr("data-id"));
});
// Rename Folders
folderContextMenu.on("click", "[action='rename']", function(e) {
    e.preventDefault();
    folderContextMenu.removeClass("active");
    renameFolder();
});
// Delete Folders
folderContextMenu.on("click", "[action='delete']", function(e) {
    e.preventDefault();
    folderContextMenu.removeClass("active");
    deleteFolders();
});
// Delete Share Folders
folderContextMenu.on("click", "[action='deleteShare']", function(e) {
    e.preventDefault();
    folderContextMenu.removeClass("active");
    deleteShareFolders();
});
// Cut Folder/files
folderContextMenu.on("click", "[action='cut']", function(e) {
    hideFolderContextMenu();
    cutFolders();
});
// Share File Folder
folderContextMenu.on("click", "[action='share']", function(e) {
    hideFolderContextMenu();
    shareFolders();
});
// Folder/File Properties
folderContextMenu.on("click", "[action='properties']", function(e) {
    hideFolderContextMenu();
    folderProperties();
});
// hide context menu
function hideContextMenu() {
    $(".window-context-menu").removeClass('active');
}
// show context menu
function showContextMenu(e) {
    hideFolderContextMenu();
    unselectFolders();
    $(".window-context-menu").css({
        "top": e.pageY,
        "left": e.pageX,
    });
    if (modifyFiles.cut.length < 1 && modifyFiles.copy.length < 1) {
        $(".window-context-menu .paste").addClass("disabled");
    } else {
        $(".window-context-menu .paste").removeClass("disabled");
    }
    $(".window-context-menu").addClass('active');
}
// Window context menu
$(window).on("contextmenu", function(e) {
    if (e.shiftKey) return;
    e.preventDefault();
    let target = $(e.target);
    let unValidTargets = [
            "single-folder",
            "folder-context-menu"
        ],
        valid = true;
    unValidTargets.forEach((className) => {
        if (target.hasClass(className) || target.parents("." + className).length > 0) {
            valid = false;
        }
    })
    if (!valid) {
        hideContextMenu();
        return false;
    }
    showContextMenu(e);
});
let windowContextMenu = $(".window-context-menu");
// Refresh folder
windowContextMenu.on("click", '[action="refresh"]', function() {
    hideContextMenu();
    fetchFolder(current_folder_id);
});
// Create New Folder
windowContextMenu.on("click", '[action="new-folder"]', function() {
    createNewFolder("New Folder", "folder");
});
// Create New File
windowContextMenu.on("click", '[action="new-file"]', function() {
    createNewFolder("New file.txt", "file");
});
// Sort Folders By Type
windowContextMenu.on("click", '.sort-data-type', function() {
    let target = $(this).attr("action");
    setSortValue({
        type: "type",
        value: target
    });
    sortFolders();
    hideContextMenu();
});
// Sort Folders By Order
windowContextMenu.on("click", '.sort-data-order', function() {
    let target = $(this).attr("action");
    setSortValue({
        type: "order",
        value: target
    });
    sortFolders();
    hideContextMenu();
});
// Paste Files
windowContextMenu.on("click", '[action="paste"]', function() {
    hideContextMenu();
    if (modifyFiles.cut.length > 0) {
        moveFolders({
            target_folder_id: current_folder_id,
            folders: modifyFiles.cut
        });
        modifyFiles.cut = [];
    }
});
// Replace New Folder Names
windowContextMenu.on("click", '[action="replace"]', function() {
    let modal = $(".modal#ReplaceFileNames");
    // Selected folders
    if ($(".single-folder.selected").length < 1) {
        selectAllFolders();
    }
    modal.modal("show");
    hideContextMenu();
});
windowContextMenu.on("click", '[action="select-all"]', function() {
    hideContextMenu();
    selectAllFolders();
});
$(".replace-folder-names").on("click", function(e) {
    e.preventDefault();
    replaceFoldersNames();
})
// Move folders/files to other folders
$(document).on("dragstart", ".single-folder", function(e) {
    $(this).addClass("selected");
    $(this).find(".check").prop("checked", true);
    let folders = [];
    $(".single-folder.selected").each(function() {
        folders.push({
            id: $(this).attr("data-id"),
            type: $(this).attr("data-type")
        });
    });
    e = e.originalEvent;
    e.dataTransfer.setData("folder", JSON.stringify(folders));
});
$(document).on("dragover dragenter", ".single-folder[data-type='folder']", function(e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    if (data.types.includes("folder")) {
        $(this).addClass("active");
    }
});
$(document).on("drop", ".single-folder[data-type='folder']", function(e) {
    e.preventDefault();
    $(this).removeClass("active");
    let data = e.originalEvent.dataTransfer;
    if (!data.types.includes("folder")) return false;
    let folder = data.getData("folder");
    folder = JSON.parse(folder);
    moveFolders({
        target_folder_id: $(this).attr("data-id"),
        folders: folder
    });
});
$(document).on("dragleave", ".single-folder[data-type='folder']", function(e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    $(this).removeClass("active");
});
const scrollTo = (element, time = 500) => {
    $([document.documentElement, document.body]).animate({
        scrollTop: $(element).offset().top
    }, time);
}
// Select Folder
$(document).on("keydown", function(e) {
    if ($("input, textarea").is(":focus")) return true;
    let keyCode = getKeyCode(e),
        key = String.fromCharCode(keyCode).toLowerCase();
    if (shortcutKeys.includes(keyCode)) return true;
    e.preventDefault();

    if (key.match(/(\w)/gi)) {
        let folders = [],
            select = true;

        $(".single-folder").each(function() {
            let firstChar = $(this).find(".folder-name").text()[0].toLowerCase();
            if (firstChar === key && !$(this).hasClass("selected") && select) {
                scrollTo($(this), 0);
                $(this).addClass("selected");
                select = false;
            } else {
                $(this).removeClass("selected");
            }
        });
    }
    if (keyCode === 13) {
        let folders = $('.single-folder.selected[data-type="folder"]');
        if (folders.length < 1) return false;
        if (folders.length > 1) {
            folders.each(function() {
                window.open("shared-data?id=" + $(this).attr('data-id'));
            });
        } else {
            fetchFolder(folders.attr('data-id'));
        }
    }
    // right 39, left 37
    if (keyCode == 39 || keyCode == 37) {
        let folders = $('.single-folder.selected');
        let firstFolder = $(".all-folders .single-folder").first();
        let lastFolder = $(".all-folders .single-folder").last();
        if (folders.length > 0) {
            let folder = folders[0];
            folders.removeClass("selected");
            if (keyCode == 39) {
                let nextFolder = $(folder).next();
                if (nextFolder.length > 0) {
                    nextFolder.addClass("selected");
                } else {
                    firstFolder.addClass("selected");
                }
            } else if (keyCode == 37) {
                let prevFolder = $(folder).prev();
                if (prevFolder.length > 0) {
                    prevFolder.addClass("selected");
                } else {
                    lastFolder.addClass("selected");
                }
            }
        } else {
            if (keyCode == 39) firstFolder.addClass("selected");
            else if (keyCode == 37) lastFolder.addClass("selected");
        }
    }

    updateStatus();

    // delete 46
    if (keyCode == 46) deleteFolders();

    // backspace
    if (keyCode == 8) {
        let breadCrumbLinks = $(".folder-link");
        if (breadCrumbLinks.length == 1) return false;
        breadCrumbLinks.each(function(i) {
            i++;
            if (i == breadCrumbLinks.length - 1) {
                fetchFolder($(this).attr("data-id"));
            }
        });
    }
});

function appendFoldersByDates(dates) {
    let elements = [];
    dates.forEach(e => {
        $(".single-folder").each(function() {
            if ($(this).attr("data-md") == e) {
                elements.push($(this));
            }
        });
    });
    $(".all-folders").html("");
    elements.forEach(e => {
        $(".all-folders").append(e);
    });
}

function appendFoldersByName(names) {
    let elements = [];
    names.forEach(e => {
        $(".single-folder").each(function() {
            if ($(this).find(".folder-name-input").val() == e) {
                elements.push($(this));
            }
        });
    });
    $(".all-folders").html("");
    elements.forEach(e => {
        $(".all-folders").append(e);
    });
}

function sortFoldersByName() {
    let names = [];
    $(".single-folder").each(function() {
        names.push($(this).find(".folder-name-input").val());
    });
    names.sort();
    let order = $(".sort-order-select").val();
    if (order === "DESC") names.reverse();
    appendFoldersByName(names)
}

function sortFoldersByDate() {
    let dates = [];
    $(".single-folder").each(function() {
        dates.push($(this).attr("data-md"));
    });
    dates.sort();
    let order = $(".sort-order-select").val();
    if (order === "ASC") dates.reverse();
    appendFoldersByDates(dates);
}

function fetchSortOrder() {
    let id = current_folder_id;
    let data = JSON.parse(localStorage.getItem("nc_so"));
    let sortOrder;
    if (data) {
        data.forEach(e => {
            if (e.id == id) {
                sortOrder = e.order;
            }
        });
        return sortOrder;
    } else {
        return false;
    }
}

function fetchSortType() {
    let id = current_folder_id;
    let data = JSON.parse(localStorage.getItem("nc_st"));
    let sortType;
    if (data) {
        data.forEach(e => {
            if (e.id == id) {
                sortType = e.type;
            }
        });
        return sortType;
    } else {
        return false;
    }
}

function changeSortType(id, type) {
    let data = JSON.parse(localStorage.getItem("nc_st"));
    if (data) {
        data.forEach(e => {
            if (e.id == id) {
                e.type = type;
            }
        });
        localStorage.removeItem("nc_st");
        localStorage.setItem("nc_st", JSON.stringify(data));
    } else {
        data = [{
            id: id,
            type: type
        }];
        localStorage.setItem("nc_st", JSON.stringify(data));
    }
}

function changeSortOrder(id, order) {
    let data = JSON.parse(localStorage.getItem("nc_so"));
    if (data) {
        data.forEach(e => {
            if (e.id == id) {
                e.order = order;
            }
        });
        localStorage.removeItem("nc_so");
        localStorage.setItem("nc_so", JSON.stringify(data));
    } else {
        data = [{
            id: id,
            order: order
        }];
        localStorage.setItem("nc_so", JSON.stringify(data));
    }
}

function sortFolders() {
    let type = $(".sort-type-select").val();
    let order = $(".sort-order-select").val();
    changeSortType(current_folder_id, type);
    changeSortOrder(current_folder_id, order);
    switch (type) {
        case '?':
            let get_folders_url = "views/shared/folders/folder";
            if (current_folder_id != "0") get_folders_url += "?id=" + current_folder_id;
            $.get(get_folders_url, function(data) {
                processAjaxData(data, "shared-data?id=" + current_folder_id);
            });
            break;

        case 'sort_by_date':
            sortFoldersByDate();
            break;

        case 'sort_by_name':
            sortFoldersByName();
            break;

        default:
            break;
    }
}
// Set Sort Values
function setSortValue(data) {
    let { type, value } = data;
    if (type === "order") {
        $(".sort-order-select").set({
            value: true,
            option: value
        });
        windowContextMenu.find(`.sort-data-order`).each(function() {
            if ($(this).attr("action") === value) $(this).addClass("selected");
            else $(this).removeClass("selected");
        });
    } else {
        $(".sort-type-select").set({
            value: true,
            option: value
        });
        windowContextMenu.find(`.sort-data-type`).each(function() {
            if ($(this).attr("action") === value) $(this).addClass("selected");
            else $(this).removeClass("selected");
        });
    }
}
$(".sort-type-select, .sort-order-select").on("change", sortFolders);

$("body").on("click", ".share-btn", function() {
    let parent = $(this).parents(".share-form"),
        checkboxes = parent.find(".user-checkbox"),
        usersAllowed = [],
        usersNotAllowed = [],
        folder_id = parent.find(".folder-id").val();
    checkboxes.each(function() {
        if ($(this).is(":checked")) {
            usersAllowed.push($(this).attr("name"));
        } else {
            usersNotAllowed.push($(this).attr("name"));
        }
    });
    l({
        savePermissions: true,
        users_allowed: usersAllowed,
        users_not_allowed: usersNotAllowed,
        folder_id: folder_id
    });
    $.ajax({
        url: "controllers/shared/folders/permissions",
        type: "POST",
        data: {
            savePermissions: true,
            users_allowed: usersAllowed,
            users_not_allowed: usersNotAllowed,
            folder_id: folder_id
        },
        dataType: "json",
        success: function(res) {
            notify(res.data, res.status);
            $("#folderSharePopup").modal("hide");
            fetchFolder();
        }
    });
});

function toggleSharedFolders() {
    let sFolders = $(".single-folder.shared"),
        unSharedFolders = $(".single-folder");
    switch (isShareFolder) {
        case true:
            $(".toggle-shared-folders").removeClass("outline");
            unSharedFolders.hide();
            sFolders.show();
            break;

        case false:
            $(".toggle-shared-folders").addClass("outline");
            unSharedFolders.show();
            sFolders.hide();
            break;

        default:
            break;
    }
}

$(".toggle-shared-folders").on("click", function() {
    isShareFolder = !isShareFolder;
    toggleSharedFolders();
    if (isShareFolder == false && current_folder_id != 0) fetchFolder(0);
});