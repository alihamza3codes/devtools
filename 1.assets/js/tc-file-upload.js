const tc = {
    files: [],
    fileId: 0,
    get: function(type, data){
    	switch(type){
    		case "files":
    			data = data.toString();
    			let filesIds = data.split(","),
    				files = [];
    				filesIds.forEach(id => {
    					this.files.forEach(file => {
    						if(file.id == id){	
    							files.push(file);
    						}
    					})
    				});
    				return files;
    			break;
    	}
    }
};
tc.rand = function(length = 5, type = "string") {
    let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (type === 'integer') {
        characters = '0123456789';
    }
    let charactersLength = characters.length,
        randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}
tc.append = function(data) {
    let html = '',
        html_attributes = '',
        selector = '',
        selectors = {
            "class": '.',
            "id": '#',
        },
        { type, parent, attributes } = data;
    if (!("duplicate" in data)) data.duplicate = true;
    // 
    if (attributes) {
        for (let key in attributes) {
            html_attributes += `${key}="${attributes[key]}" `;
            selector += `${selectors[key] + attributes[key]}`;
        }
    }
    if (data.type === "container") {
        html = `<div ${html_attributes}></div>`;
    } else if (type === "progressBar") {
        html = `
		<div class="tc-progress-bar" ${html_attributes}>
            <span class="label file-name">${data.text}</span>
            <div class="progress">
                <div class="progress-bar" style="width: 0%;">0%</div>
            </div>
        </div>`;
    }


    if (data.duplicate === true) {
        $(parent).append(html);
    } else {
        if ($(parent).find(selector).length < 1) $(parent).append(html);
    }
}
tc.uploadFileProgressHandler = function(event) {
    var percent = (event.loaded / event.total) * 100;
    var progress = Math.round(percent);
    setProgressBar(progress);
}
tc.uploadFile = function(settings) {
    let { url, file, data } = settings,
    formData = new FormData();
    // Append file
    formData.append("file", file);
    // Append other parameteres
    if (data) {
        for (let key in data) {
            formData.append(key, data[key]);
        }
    }
    let file_id = this.rand(30),
        filename = file.name;
    this.append({
        type: "container",
        parent: "body",
        duplicate: false,
        attributes: {
            "class": "tc-files-container"
        }
    });
    this.append({
        type: "progressBar",
        parent: ".tc-files-container",
        text: filename,
        attributes: {
            "data-id": file_id
        }
    });
    let progressBar = $(`.tc-files-container [data-id="${file_id}"]`);
    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        beforeSend: function() {},
        contentType: false,
        processData: false,
        cache: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(e) {
                var percent = (event.loaded / event.total) * 100;
                var progress = Math.round(percent);
                progressBar.find(".progress-bar").css("width", progress + "%");
                progressBar.find(".progress-bar").html(progress + "%");
            }, false);
            xhr.addEventListener("load", function(event) {
                let response = event.target.responseText;
                progressBar.remove();
                if ("success" in settings)
                    settings.success(response, file);
            }, false);
            xhr.addEventListener("error", function() {
                progressBar.remove();
                if ("error" in settings) settings.error();
            }, false);
            xhr.addEventListener("abort", function() {
                progressBar.remove();
                if ("abort" in settings) settings.abort();
            }, false);

            return xhr;
        },
        error: function() {}
    });
}
tc.upload = function(data) {
    let url = data.url;
    if (url.length < 1) return false;
    let tmpData = jQuery.extend({}, data);
    delete tmpData.files;
    // Append files
    if (Array.isArray(data.files) || !("name" in data.files)) {
        for (let i = 0; i < data.files.length; i++) {
            let file = data.files[i];
            tmpData.file = file;
            this.uploadFile(tmpData);
        }
    } else {
        tmpData.file = data.files;
        this.uploadFile(tmpData);
    }
}
$("body").append(`
		<div class="tc-dragover-content">
			Drag/Drop files here to upload
		</div>
		`);
let tcDOContent = $(".tc-dragover-content");

$(`input[type="file"].tc-file-input`).each(function() {
    let fileInput = $(this).clone().get(0).outerHTML;
    $(`<div class="input-group tc-file-input-group">
    	  <input class="form-control tc-files-name" placeholder="Drop/Paste Files here to upload" readonly>
		  <div class="input-group-prepend">
		  	<label>
			    <span class="input-group-text"><i class="fas fa-folder"></i></span>
			    ${fileInput}
		  	</label>
		  </div>
	</div>`).insertBefore($(this));
	$(this).remove();
});
/*// File Upload Overlay Show
$(document).on("mouseover", `.tc-file-input-group`, function(e) {
    let left = $(this).offset().left,
        top = $(this).offset().top,
        width = $(this).get(0).scrollWidth,
        height = $(this).get(0).scrollHeight;

    top -= height;

    tcDOContent.css({
        "left": left + "px",
        "top": top + "px",
        "width": width + "px",
    }).addClass("active");
    $(this).addClass("tc-upload-focus");
});
// File Upload Overlay Hide
$(document).on("mouseout", `.tc-file-input-group`, function(e) {
    tcDOContent.removeClass("active");
    $(this).removeClass("tc-upload-focus");
});*/
// On Paste
$(document).on("paste", ".tc-file-input-group .tc-files-name", function(e) {
    let inputGroup = $(this).parents(".tc-file-input-group"),
    	items = e.originalEvent.clipboardData.items,
    	fileInput = inputGroup.find(`input[type='file'].tc-file-input`);
    	if(fileInput.length < 1) return true;
    if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            let file = items[i].getAsFile();
            if (file) {
                file.id = ++tc.fileId;
                tc.files.push(file);
                fileInput.attr("data-files", file.id);
                inputGroup.find(".tc-files-name").val(file.name);
            }
        }
    }
});
// On Drag over/start
$(document).on("dragenter dragover", ".tc-file-input-group", function(e){
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    if (data.types && (data.types.indexOf ? data.types.indexOf('Files') != -1 : data.types.contains('Files'))) {
        $(this).addClass("tc-dragover");
    }
});
$(document).on("drop", ".tc-file-input-group", function(e) {
    e.preventDefault();
    let dt = e.originalEvent.dataTransfer;
    let files = dt.files;

    let inputGroup = $(this),
    	fileInput = inputGroup.find(`input[type='file'].tc-file-input`);
    	if(fileInput.length < 1) return true;

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
        	let file = files[i];
        	file.id = ++tc.fileId;
        	tc.files.push(file);
			fileInput.attr("data-files", file.id);
			inputGroup.find(".tc-files-name").val(file.name);
        }
    }
    $(this).removeClass("tc-dragover");
});
// On Drag leave
$(document).on("dragleave", ".tc-file-input-group", function(e){
    e.preventDefault();
    $(this).removeClass("tc-dragover");
});