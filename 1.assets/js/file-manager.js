let sidebar = $(".file-manager .sidebar"),
    codeEditor = {
        files: {},
        setting: {
            fontSize: 16,
            theme: 'ayu-dark'
        },
        minFontSize: 6,
        maxFontSize: 72
    };

function addDragEvent(selector){
	$(selector).each(function(){
		$(this).get(0).addEventListener("dragenter", dragenter, false);
		$(this).get(0).addEventListener("dragover", dragenter, false);
		$(this).get(0).addEventListener("drop", drop, false);
		$(this).get(0).addEventListener("dragleave", dragleave, false);
	})
}
// Get Drag/Drop Data
const getDragTarget = (e) => {
    let target = $(e.target),
        targetFolder = $(target);
    if(target.hasAttr("data-type") && target.hasClass("folder")){
        if(target.attr("data-type") !== "folder")
            targetFolder = target.parents(".folder").first();
    } else {
        targetFolder = target.parents(".folder").first();
    }
    return targetFolder;
}
// Check if drag/drop are files
const isFiles = (data) => {
    if (data.types && (data.types.indexOf ? data.types.indexOf('Files') != -1 : data.types.contains('Files')))
        return true;
    else return false;
}
// Upload into file manager
$(document).on("dragenter dragover", ".sidebar li.project-folder", function(e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer,
        targetFolder = getDragTarget(e);
    if (isFiles(data)) {
        $(".sidebar").find(".dragover").removeClass("dragover");
        targetFolder.addClass("dragover");
    }
});
$(document).on("drop", ".sidebar li.project-folder", function(e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer,
        targetFolder = getDragTarget(e),
        folderPath = targetFolder.children(".t-folder").attr("data-path");
    $(targetFolder).removeClass("dragover");
    if (isFiles(data)) {
        tc.upload({
            url: "controllers/file-manager/upload",
            data: {
                uploadFile: true,
                p_id: project.id,
                pv_id: project.version_id,
                path: folderPath
            },
            files: data.files,
            success: function(response, file){
                if(!isJson(response)){
                    notifyError("Error: " + file.name + " not uploaded");
                    return false;
                }
                refreshFolder(folderPath);
            }
        });
    }
});
$(document).on("dragleave", ".sidebar li.folder",function(e) {
    e.preventDefault();
    $(this).removeClass("dragover");
});
// Upload files in folder

// Fetch Page Data
function fetchFolder(data) {
    project.dir = data.folder_path;
    let parent = data.parent,
        appendType = false,
        toggleType = "toggle";
    if("appendType" in data) appendType = data.appendType;
    if("toggleType" in data) toggleType = data.toggleType;

    let get_folders_url = "views/file-manager/folders/data";


    $.ajax({
        url: "views/file-manager/folders/data",
        type: "GET",
        data: {
            p_id: project.id,
            pv_id: project.version_id,
            dir: data.folder_path
        },
        success: function(data) {
            if (appendType === "replace")
                $(parent).html(data);
            else if (appendType === "append") {
                $(parent).append(data)
            } else {
                $(parent).attr("data-fetch", "fetched");
                $(parent).parent().append(data);
                toggleFolders($(parent).parent(), toggleType);
            }
            $(parent).find(".loader").remove();

            readyContextMenu();
        },
        error: makeError
    })

}
// Refresh Folder data
function refreshFolder(folder_path){
    let folder = sidebar.find(".t-folder[data-path='"+ folder_path +"']"),
        parent = folder.parent();
    parent.children(".files").remove();
    parent.find(".new-file-form").remove();
    if(folder.length > 0){
        fetchFolder({
            folder_path: folder.attr("data-path"),
            parent: folder,
            toggleType: 'show'
        });
    }
}

fetchFolder({
    folder_path: "",
    parent: sidebar.find(".files-list"),
    appendType: "replace"
});
// Toggle folder view
function toggleFolders(folder, toggleType = "toggle") {
    files = folder.children(".files");
    if (files.length > 0) {
        if(toggleType == "toggle"){
            files.slideToggle(200);
            folder.toggleClass("active");
        } else if(toggleType == "show"){
            files.slideDown(200);
            folder.addClass("active");
        }
    }
}
// fetch folder data || Toggle folder view
sidebar.on("click", ".files .file.folder .meta-data", function() {
    let name = $(this).find(".name");
    if($(this).find(".name").hasAttr("contenteditable")) return false;
    if (this.hasAttribute('data-fetch')) {
        let parent = $(this).parent();
        toggleFolders(parent);

    } else {
        $(loader).insertBefore($(this).find(".data-icon"));
        fetchFolder({
            folder_path: $(this).attr("data-path"),
            parent: $(this)
        });
    }
});
// Resize Sidebar
let resizeSidebar = false;
sidebar.on("mousedown", ".resizer", function(e) {
    resizeSidebar = true;
    $("body").addClass("resizing");
});
$(window).on("mousemove", function(e) {
    if (!resizeSidebar) return false;
    let width = e.pageX;
    if (width < 20) return false;

    sidebar.css("width", width + "px");
    $(".code-editor").css("margin-left", width + "px");
});
$(window).on("mouseup", function(e) {
    resizeSidebar = false;
    $("body").removeClass("resizing");
});
// Editor Config
codeEditor.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    lineWrapping: true,
    styleActiveLine: false,
    matchBrackets: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    keyMap: "sublime",
    foldGutter: true,
    mode: "text/html",
    showHint: true,
    lint: true,
    tabSize: 4,
    highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
    matchTags: {bothTags: true},
    extraKeys: {"Ctrl-J": "toMatchingTag"},
    extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()) }
    },
    gutters: [
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter",
        "CodeMirror-lint-markers",
    ],
});
codeEditor.editor.getDoc().cantEdit = true;
// Auto Complete
CodeMirror.commands.autocomplete = function(cm) {
    cm.showHint({hint: CodeMirror.hint.anyword});
}
// Editor functions
codeEditor.getValue = () => codeEditor.editor.getValue();
// File Saved
codeEditor.fileSaved = (fileId) => {
    let file = getFile(fileId, "tabs");
    if (file.length > 0) {
        file.find(".edit-btn").addClass("d-none");
        file.find(".close-file-btn").removeClass("d-none");
    }
    codeEditor.files[fileId].saved = true;
}
// File unSaved
codeEditor.fileUnSaved = (fileId) => {
    let file = getFile(fileId, "tabs");
    if (file.length > 0) {
        file.find(".edit-btn").removeClass("d-none");
        file.find(".close-file-btn").addClass("d-none");
    }
    codeEditor.files[fileId].saved = false;
}
// Set Default Theme
let defaultTheme = "ayu-dark";
if (localStorage.getItem('editorTheme')) {
    defaultTheme = localStorage.getItem('editorTheme');
}
let defaultThemeFound = false;
$(".theme-changer option").each(function() {
    if ($(this).text() === defaultTheme) {
        defaultThemeFound = true;
        $(this).attr("selected", "selected");
    } else {
        $(this).removeAttr("selected");
    }
});
if (defaultThemeFound) {
    codeEditor.editor.setOption("theme", defaultTheme);
} else {
    codeEditor.editor.setOption("theme", "ayu-dark");
}
// Get Current Selected Theme
function getSelectedTheme() {
    let input = $(".theme-changer").get(0);
    let theme = input.options[input.selectedIndex].textContent;
    return theme;
}
// Change Theme
function changeTheme() {
    let theme = getSelectedTheme();
    codeEditor.editor.setOption("theme", theme);
    $(".apply-theme").addClass("cm-s-" + theme);

}
$(".theme-changer").on("change", changeTheme);
// Save Theme
$(".save-theme").on("click", function() {
    let theme = getSelectedTheme();
    localStorage.setItem("editorTheme", theme);
});

// get file with id
function getFile(fileId, location = "sidebar") {
    let file;
    if (location === "tabs") {
        file = $(".code-editor .tabs .tab[data-id='" + fileId + "']");
    } else {
        file = sidebar.find('.files .t-file[data-id="' + fileId + '"]');
    }
    return file;
}

codeEditor.selectFile = function(fileId) {
    if (!(fileId in codeEditor.files)) return false;
    var buf = codeEditor.files[fileId].editor;
    if (buf.getEditor()) buf = buf.linkedDoc({
        sharedHist: true
    });
    var old = codeEditor.editor.swapDoc(buf);
    var linked = old.iterLinkedDocs(function(doc) {
        linked = doc;
    });
    if (linked) {
        // Make sure the document in buffers is the one the other view is looking at
        for (var fileId in codeEditor.files)
            if (codeEditor.files[fileId].editor == old) codeEditor.files[fileId].editor = linked;
        old.unlinkDoc(linked);
    }
    codeEditor.editor.focus();
    codeEditor.files[fileId].value = codeEditor.getValue();

    // Active file tab
    let tabs = $(".code-editor .tabs");
    tabs.find(".tab.active").removeClass("active");
    getFile(fileId, "tabs").addClass("active");
    sidebar.find(".t-file").parent().removeClass("active");
    getFile(fileId).parent().addClass("active");
}
// Get File name
codeEditor.getFileName = function(fileId){
    let fileName = "",
        file = sidebar.find('.files .t-file[data-id="' + fileId + '"]');
    if(file.length > 0)
        fileName = file.find(".name").text();
    return fileName;
}

// Add file tab
function addFileTab(fileData) {
    let fileId = fileData.id;
    let file = sidebar.find('.files .t-file[data-id="' + fileId + '"]');
    if (file.length < 1) return false;
    let tabs = $(".code-editor .tabs");
    tabs.append(`<div class="tab" data-id="${fileId}">
                    <span class="name">${fileData.name}</span>
                    <span class="icons">
                        <i class="fas fa-pencil-alt edit-btn d-none"></i>
                        <i class="fas fa-times close-file-btn"></i>
                    </span>
                </div>`);
}

codeEditor.openFile = function(file) {
    if(file.id in codeEditor.files) return false;
    file.editor = CodeMirror.Doc(file.text, file.mode);
    file.value = file.text;
    codeEditor.files[file.id] = file;
    addFileTab(file);
    codeEditor.selectFile(file.id);
}

// Open file in editor | Read File
sidebar.on("click", ".t-file", function() {
    if (!this.hasAttribute("data-path")) return false;
    if (!this.hasAttribute("data-id")) return false;

    let name = $(this).find(".name");
    if(name.get(0).hasAttribute('contenteditable')) return false;

    let filename = $(this).attr("data-path"),
        fileId = $(this).attr("data-id"),
        fileExt = filename.split('.').pop(),
        filesMode = {
            "php": "application/x-httpd-php",
            "js": "javascript",
            "sql": "text/x-mariadb",
            "sql": "text/x-mariadb",
            "css": "css",
            "html": "text/html",
            "json": "application/ld+json",
        },
        mode = 'text/plain';

    if (fileExt in filesMode) {
        mode = filesMode[fileExt];
    }
    if (fileId in codeEditor.files) {
        codeEditor.selectFile(fileId);
        return false;
    }
    let parentFolder = $(this).parents(".files").first().parents('.file').first().children(".t-folder").attr("data-path");

    $.post("controllers/file-manager/file/read", {
        readFile: true,
        req_token: makeReqKey(),
        filename: filename,
        p_id: project.id,
        pv_id: project.version_id
    }).done((response) => {
        if (isJson(response)) {
            response = JSON.parse(response);
            if (response.status === "success") {
                codeEditor.openFile({
                    id: fileId,
                    saved: true,
                    parentFolder: parentFolder,
                    text: response.data,
                    mode: mode,
                    name: codeEditor.getFileName(fileId)
                });
            } else {
                notify(response.data, response.status);
            }
        } else
            notifyError();
    }).fail(notifyError);
});
// Switch File
$(".code-editor .tabs").on("click", ".tab", function() {
    if (!this.hasAttribute("data-id")) return false;
    let fileId = $(this).attr('data-id');

    codeEditor.selectFile(fileId);
});
// Get First Opened file
codeEditor.getFirstFileId = function() {
    let tab = $(".code-editor .tabs .tab").first();
    return tab.attr('data-id');
}
// Close file function
function closeFile(fileId) {
    if(!(fileId in codeEditor.files)) return false;
    let file = codeEditor.files[fileId];
    if(!file.saved){
        let permission = confirm('File has been modified. Save Changes?');
        if(permission){
            codeEditor.saveFile(fileId);
        }
    }
    delete codeEditor.files[fileId];
    getFile(fileId).parent().removeClass("active");
    getFile(fileId, "tabs").remove();
    if (Object.keys(codeEditor.files).length < 1) {
        codeEditor.editor.getDoc().setValue('');
    } else {
        codeEditor.selectFile(codeEditor.getFirstFileId());
    }
}
// Close File
$(".code-editor .tabs").on("click", ".tab .close-file-btn", function(e) {
    let parent = $(this).parents(".tab"),
        fileId = parent.attr("data-id");
    closeFile(fileId);
});
// Close File
$(".code-editor .tabs").on("mousedown", ".tab", function(e) {
    if (e.button === 1) {
        closeFile($(this).attr("data-id"));
    }
});
// Get Active file id
codeEditor.getActiveFileId = function() {
    let activeFile = $(".tabs .tab.active");
    if (activeFile.length < 1) return false;
    return $(activeFile.get(0)).attr("data-id");
}
// Get Active file id
codeEditor.activeFile = function() {
    let activeFile = $(".tabs .tab.active");
    if (activeFile.length < 1) return false;
    return true;
}
// Get Active file
codeEditor.getActiveFile = function() {
    let activeFile = $(".tabs .tab.active");
    if (activeFile.length < 1) return false;
    let fileId = $(activeFile.get(0)).attr("data-id");
    if (fileId in codeEditor.files) {
        return codeEditor.files[fileId];
    } else {
        return false;
    }
}
$.ajaxSetup({
    beforeSend: function(jqXHR, settings) {
        settings.data = "req_token=" + makeReqKey() + "&" + settings.data;
    }
});
// Save File
codeEditor.saveFile = (fileId = "") => {
    let activeFileId = codeEditor.getActiveFileId();
    if (!activeFileId) return false;
    if(fileId !== "") activeFileId = fileId;

    let file = getFile(activeFileId);
    if (file.length < 1) return false;

    let fileData = codeEditor.getValue(),
        filename = file.attr("data-path");

    $.post("controllers/file-manager/file/save", {
            saveFile: true,
            p_id: project.id,
            pv_id: project.version_id,
            filename: filename,
            fileData: fileData
        }).fail(notifyError)
        .done((res) => {
            if (isJson(res)) {
                res = JSON.parse(res);
                if (res.status !== "success")
                    notify(res.data, res.status);
                else {
                    codeEditor.files[activeFileId].value = fileData;
                    codeEditor.fileSaved(activeFileId);
                }
            }
        });
}
// Save File
const editorOptions = $(".editorOptions");
editorOptions.find(".save-file").on("click", function(e) {
    codeEditor.saveFile();
});
// Save File with ctrl + s
$(window).on("keydown", function(e) {
    if (e.ctrlKey) {
        let keycode = e.keyCode || e.which;
        if (keycode === 83) {
            e.preventDefault();
            codeEditor.saveFile();
            return false;
        }
    }
});
// File Save/unSave
$(".CodeMirror").on("keyup", function(e) {
    let file = codeEditor.getActiveFile();
    if(!file) return false;
    if (file.value === codeEditor.getValue()) {
        codeEditor.fileSaved(file.id);
    } else {
        codeEditor.fileUnSaved(file.id);
    }
});
// Create new file inside the folder
let getNewFileForm = (parentFolder, type) => {
    let form = `<li class="file new-file-form-li">
            <div class="new-file-form">
                <input type="text" class="file-name-input" data-path="${parentFolder}" data-type="${type}">
                <i class="fas fa-times" nc-style="[cp]" data-remove-parent=".file"></i>
            </div>
            </li>`;
    return form;
}
let createNewFile = (e, type = 'file') => {
    let folder = CtMenu.getActiveElement(e),
        folderPath = folder.attr("data-path");
    if(folder.length < 1) return false;
    folder = folder.parent();
    if(folder.children(".files").length > 0){
        toggleFolders(folder, "show");
        folder = folder.children(".files").first();
    }
    if(folder.children(".new-file-form-li").length < 1){
        folder.append(getNewFileForm(folderPath, type));
    }
    folder.find(".file-name-input").focus();
    CtMenu.hide();
    refreshFns();

};
CtMenu.NewFile = function(e) {
    createNewFile(e, 'file');
}
CtMenu.NewFolder = function(e) {
    createNewFile(e, 'folder');
}
// Create File Id
codeEditor.createFileId = function() {
    let fileId = getRand(20);
    if (getFile(fileId).length > 0) return this.createFileId();
    else return fileId;
}
/*// Create new file inside the folder
codeEditor.createNewFile = function(parentFolder) {
    let fileId = this.createFileId();
    this.openFile({
        saved: false,
        parentFolder: parentFolder,
        id: fileId,
        newFile: true,
        text: '',
        mode: '',
        name: 'Untitled'
    });
}*/
$(document).on("keyup", ".sidebar .files .file-name-input", function(e){
    let keyCode = e.keyCode || e.which;
    if(keyCode === 13){
        if(!this.hasAttribute('data-path')) return false;
        let folder = $(this).attr('data-path'),
            filename = $(this).val(),
            type = $(this).attr("data-type");
        if(filename.length < 1){
            $(this).focus();
            return false;
        }
        $.post("controllers/file-manager/file/create", {
            createFile: true,
            filename: filename,
            folder: folder,
            type: type,
            p_id: project.id,
            pv_id: project.version_id
        }).fail(notifyError)
        .done((res) => {
            if(!isJson(res)) notifyError();
            else {
                res = JSON.parse(res);
                if(res.status === "success")
                    refreshFolder(folder)
                else 
                    notifyError(res.data);
            }
        })
    }
});
// Code Editor Save Setting
codeEditor.saveSetting = () => {
    localStorage.setItem('editorSetting', JSON.stringify(codeEditor.setting));
}
// Code Editor Load Setting
codeEditor.loadSetting = () => {
    let settings = localStorage.getItem("editorSetting");
    if (!settings) return false;
    if (!isJson(settings)) return false;
    settings = JSON.parse(settings);

    codeEditor.setFontSize(settings.fontSize);
}
// Editor Options
// go to line
codeEditor.goToLine = () => {
    if (!codeEditor.activeFile()) return false;
    let lineNo = prompt("Enter line no");
    if (lineNo == null) return false;
    lineNo = toNumber(lineNo);
    if (!lineNo) return false;
    codeEditor.editor.setCursor(lineNo);
}
editorOptions.find(".go-to-line").on("click", function() {
    codeEditor.goToLine();
});
// Change font size
codeEditor.setFontSize = function(size) {
    if (!(size >= this.minFontSize && size <= this.maxFontSize)) return false;
    $(".CodeMirror").attr("style", `font-size: ${size}px !important`);
    editorOptions.find(".change-font-size").val(size);
    codeEditor.setting.fontSize = size;
    codeEditor.saveSetting();
}
editorOptions.find(".change-font-size").on("change", function() {
    let val = $(this).val();
    codeEditor.setFontSize(val);
});
// Change font size on wheel
$(".CodeMirror").on("wheel", function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        let wheelData = e.originalEvent.wheelDelta / 120,
            modifyBy = 1;

        if (wheelData > 0) {
            codeEditor.setFontSize(codeEditor.setting.fontSize + modifyBy);
        } else {
            codeEditor.setFontSize(codeEditor.setting.fontSize - modifyBy);
        }
    }
});
codeEditor.loadSetting(); // Load Settings
// Open in Containing Folder
CtMenu.OpenInFileExploler = function(e){
    let folder = CtMenu.getActiveElement(e),
        folderPath = folder.attr("data-path");
    if(folder.length < 1) return false;
    $.post("controllers/file-manager/read", {
        openInExploler: true,
        p_id: project.id,
        pv_id: project.version_id,
        path: folderPath,
        req_token: makeReqKey()
    });
    this.hide();
}
// Rename file/Folder
CtMenu.Rename = function(e){
    let folder = this.getActiveElement(e),
        name = folder.find(".name");
    name.attr("contenteditable", "true");
    name.focus();

    this.hide();
}
function handleResponse(res){
    let success = false;
    if(!isJson(res)){
        notifyError();
    } else {
        res = JSON.parse(res);
        if(res.status === "success"){
            success = res;
        } else {
            notify(res.data, res.status);
        }
    }
    return success;
}
function renameFile(file){
    file = $(file);
    file.find(".name").removeAttr("contenteditable");
    $.post("controllers/file-manager/file/rename", {
        renameFile: true,
        type: file.attr("data-type"),
        oldName: file.attr("data-path"),
        newName: file.find(".name").text(),
        p_id: project.id,
        pv_id: project.version_id,
        req_token: makeReqKey(),
    }).fail(notifyError)
    .done((res) => {
        let data = handleResponse(res);
        if(data){
            file.attr("data-path", data.data);
        }
    })
}
$(document).on("keydown", ".sidebar .files .file .name", function(e){
    let keyCode = e.keyCode || e.which;
    if(keyCode === 13){
        e.preventDefault();
        $(this).blur();
        return false;
    }
});
$(document).on("blur", ".sidebar .files .file .name", function(){
    renameFile($(this).parents(".meta-data").first());
});
// Delete File/Folder
const deleteFiles = (e) => {
    let folders = CtMenu.getActiveElement(e);
    if(folders.length < 1) return false;

    let files = [];

    folders.each(function(){
        files.push({
            path: $(this).attr("data-path"),
            type: $(this).attr("data-type")
        })
    });

    $.post("controllers/file-manager/file/delete", {
        deleteFiles: true,
        files: files,
        p_id: project.id,
        pv_id: project.version_id
    }).fail(notifyError)
    .done((res) => {
        let success = handleResponse(res);
        if(success){
            folders.each(function(){
                closeFile($(this).attr("data-id"));
            });
            folders.remove();
        }
    });
    CtMenu.hide();
};
CtMenu.DeleteFile = function(e){
    deleteFiles(e);
}
CtMenu.DeleteFolder = function(e){
    deleteFiles(e);
}
$(window).on('beforeunload', function(e) {
    if(Object.keys(codeEditor.files).length > 0)
    return 'You have unsaved stuff. Are you sure you want to leave?';
});
// Refresh folder
CtMenu.RefreshFolder = function(e){
    let folder = this.getActiveElement(e);
    if(folder.length < 1) return false;
    refreshFolder(folder.attr("data-path"));
    this.hide();
}
// Open file in browser
CtMenu.OpenInBrowser = function(e){
    let folder = this.getActiveElement(e);
    if(folder.length < 1) return false;
    window.open(project.path + folder.attr("data-path"), "_blank");
    this.hide();
}
// Extract Zip file
CtMenu.ExtractFile = function(e){
    let file = this.getActiveElement(e),
        filePath = file.attr("data-path");
    this.hide();
    Swal.fire({
            text: "Extract Path",
            input: 'text',
            inputAttributes: {
                "style": "color: #fff",
                "value": filePath
            },
            showCancelButton: true,
            confirmButtonText: 'Extract'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "controllers/file-manager/file/extract",
                    type: "POST",
                    data: {
                        extractFile: true,
                        filename: file.attr("data-path"),
                        path: result.value,
                        p_id: project.id,
                        pv_id: project.version_id
                    },
                    success: function(data){
                        let res = handleResponse(data);
                        if(res)
                        refreshFolder(file.parents(".folder").children(".t-folder").attr("data-path"));
                    }
                });
            }
        });
};