let l = console.log.bind(this),
    paths = {
        "js": "assets/js/"
    },
    logError = console.error.bind(this),
    callBackFunctions = {},
    callback = {
        fn: {}
    };
callback.handle = function (elem) {
    elem = $(elem);
    let callbackFound = false;
    if (elem.hasAttr("data-callback")) {
        callbackFound = true;
        let callbackName = $(elem).attr("data-callback");
        if (callbackName in this) {
            callBackFunctions[callbackName](elem);
        } else {
            if (callbackName in callback.fn) {
                callback.fn[callbackName](elem);
            } else {
                console.error('Uncaught TypeError: callBackFunctions.' + callbackName + ' is not a function');
            }
        }
    }
    return callbackFound;
}
// Show Cards with animation
setTimeout(function () {
    $(".pop-up").addClass("show");
}, 200);
// Get cookie
function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
$.ajaxSetup({
    beforeSend: function (jqXHR, settings) {
        let data = settings.data,
            url = settings.url;
        if (url.indexOf('controllers/') !== -1) {
            if (typeof (data) === "string") {
                if (settings.url.indexOf("?") !== -1) {
                    settings.data += "&req_token=" + makeReqKey();
                } else {
                    settings.data += "&req_token=" + makeReqKey();
                }
            } else {
                if ("data" in settings)
                    settings.data.append("req_token", makeReqKey());
            }
        }

    },
    error: function () {
        notifyError();
    }
});
// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Refresh warning
function refreshWarning() {
    $(window).on('beforeunload', function (e) {
        return 'You have unsaved stuff. Are you sure you want to leave?';
    });
}
// Toggle the group
$(document).on("change", "[data-group-target]", function () {
    // target element
    let $target,
        targetSelector = $(this).data("group-target"),
        radius = $(this).dataVal("radius", false);
    if (radius) {
        $target = $(this).parents(radius).first().find(targetSelector);
    } else {
        $target = $(targetSelector);
    }
    // Check element type
    let type = $(this).get(0).tagName.toLowerCase();
    if (type === "SELECT") type = $(this).attr("type");

    if (type !== "select") {
        if ($(this).is(":checked")) {
            $target.removeClass("toggle-group");
            $($(this).attr("data-group-hide")).addClass("toggle-group");
        } else {
            $target.addClass("toggle-group");
            $($(this).attr("data-group-hide")).removeClass("toggle-group");
        }
        return true;
    }
    $(targetSelector).addClass("toggle-group");
    // Select List
    let $groupTarget = $(this).find(":selected").dataVal("target", false);
    if ($groupTarget)
        $(`${targetSelector}[data-group="${$groupTarget}"]`).removeClass("toggle-group");
});
// Has attribute
$.fn.hasAttr = function (attrName) {
    let attr = false;
    if ($(this).length > 0) {
        if ($(this).get(0).hasAttribute(attrName)) attr = true;
    }
    return attr;
}
// Get data attribute value
$.fn.dataVal = function (dataName, defaultValue = false) {
    let attrVal = defaultValue;
    if ($(this).hasAttr("data-" + dataName)) {
        attrVal = $(this).attr("data-" + dataName);
    }
    return attrVal;
}
// Get tag name of jqueyr elememnt
$.fn.tagName = function () {
    return $(this).get(0).tagName.toLowerCase();
}

// Select By Value of selct list
$.fn.set = function (data) {
    if ($(this).length < 1) return false;
    let type = $(this).get(0).tagName.toLowerCase();
    if (type === "select") {
        if ("option" in data) {
            $(this).find('option[value="' + data.option + '"]').prop("selected", data.value);
        }
    }
}
// Check if emtpy
$.fn.isEmpty = function () {
    if ($(this).length < 1) return true;
    let type = $(this).get(0).tagName.toLowerCase(),
        empty = true;
    if (type === "form") {
        let boxInptus = ['checkbox', 'radio'],
            notValid = ['hidden'];
        $(this).find("input, textarea").each(function () {
            let inputType = $(this).attr("type");
            if (!notValid.includes(inputType)) {
                if (boxInptus.includes($(this).attr("type"))) {
                    if ($(this).is(":checked")) {
                        empty = false;
                    }
                }
                else if ($(this).val().length > 0) {
                    empty = false;
                }
            }
        });
    }
    return empty;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}
// Add quotes to json data
function normalizeJson(str) {
    return str.replace(/[\s\n\r\t]/gs, '').replace(/,([}\]])/gs, '$1')
        .replace(/([,{\[]|)(?:("|'|)([\w_\- ]+)\2:|)("|'|)(.*?)\4([,}\]])/gs, (str, start, q1, index, q2, item, end) => {
            item = item.replace(/"/gsi, '').trim();
            if (index) { index = '"' + index.replace(/"/gsi, '').trim() + '"'; }
            if (!item.match(/^[0-9]+(\.[0-9]+|)$/) && !['true', 'false'].includes(item)) { item = '"' + item + '"'; }
            if (index) { return start + index + ':' + item + end; }
            return start + item + end;
        });
}
// is json
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
// To Boolean
function toBoolean(data) {
    if (typeof data === "boolean") return data;
    if (isJson(data)) {
        data = JSON.parse(data);
    }
    return data ? true : false;
}
// Get Number
function toNumber(str) {
    if (typeof (str) == "number" || typeof (str) == "float") return str;
    if (str) {
        str = str.replace(/[^\d.]/g, "");
        if (str.length > 0) {
            str = parseFloat(str);
        }
    }
    str = parseFloat(str);
    if (isNaN(str)) {
        return false;
    } else {
        return str;
    }
}
// Alert Fuction
function sAlert(text, heading, type = '') {
    let icon_type = heading.toLowerCase();
    if (icon_type === 'congratulations') {
        icon_type = 'success';
    }
    if (type !== '') icon_type = type;
    let icons = ["success", "error", "warning", "info", "question"];
    if (!icons.includes(icon_type)) icon_type = '';
    Swal.fire({
        type: icon_type,
        title: heading,
        text: text,
    });
}
// Error
function makeError() {
    Swal.fire({
        type: 'error',
        title: 'Oops...',
        text: 'Something went wrong! Please try again',
    });
}
// Disaled button
function disableBtn(btn) {
    btn = $(btn);
    btn.html(loader);
    btn.addClass('disabled');
    btn.prop('disabled', true);
}
// Enable button
function enableBtn(btn, text) {
    btn = $(btn);
    btn.html(text);
    btn.removeClass('disabled');
    btn.prop('disabled', false);
}

function say(str, voice_type = 'united states') {

    var available_voices = window.speechSynthesis.getVoices();
    for (var i = 0; i < available_voices.length; i++) {
        if (available_voices[i].name.toLowerCase().indexOf(voice_type) != -1) {
            voice_type = available_voices[i];
            break;
        }
    }
    //if (typeof (voice_type) === "string")
    voice_type = available_voices[21];
    l(voice_type)
    const utter = new SpeechSynthesisUtterance();
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.text = str;
    utter.voice = voice_type;

    speechSynthesis.speak(utter);
}
const ncCheckbox = () => {
    $(".nc-checkbox").each(function () {
        if (this.hasAttribute("data-fetched")) return;
        $(this).attr("data-fetched", "true");
        let checkbox = $(this).clone(),
            label = "",
            extraClass = $(this).dataVal("extra-class", "");

        if (this.hasAttribute('data-label')) label = $(this).attr("data-label");
        if ($(this).hasAttr("data-extra-class") === "")
            checkbox.removeClass("nc-checkbox");
        checkbox.addClass("checkbox");
        let html = `
                    <label class="checkboxLabel ${extraClass}">
                        ${checkbox.get(0).outerHTML}
                        <span class="c-box">
                            <i class="fas fa-check"></i>
                        </span>
                        <span>${label}</span>
                    </label>
                `;
        $(html).insertBefore($(this));
        $(this).remove();
    });
}
function refreshFns() {
    if (!$.isFunction($.fn.tooltip)) return false;
    $('[title]:not([data-toggle="popover"],.no-tooltip)').each(function () {
        let delay = { show: 500 };
        if ($(this).hasAttr("data-delay")) delay.show = $(this).attr("data-delay");
        $(this).tooltip({
            trigger: 'hover',
            delay: delay
        });
    });

    $('[title]:not([data-toggle="popover"])').on("click", function () {
        $(".tooltip").remove();
    });
    $("[data-toggle='popover']:not('.clickable')").popover({ trigger: "hover" });
    $("[data-toggle='popover'][data-json='true']").on("mouseenter", function () {
        let popoverD = $(".popover-body");
        beautifyJSON(".popover-body");
    });
    $(".clickable[data-toggle='popover']").popover();
    if ($.isFunction($.fn.dataTable)) $(".table:not(.not-datatable)").dataTable();
    $(".table").on("page.dt", function () {
        refreshFns();
    });
    if ($.isFunction($.fn.select2)) {
        $(".select2").select2();
    }
    refreshStyles();
    ncCheckbox();
    // TC element input
    $(".tc-element-input").attr("contenteditable", "true");
    $("[data-group-target]").trigger("change");
    lazyLoadImages();
    // Tc elements
    TcElements.create("code.tc-element");
    // Tc jx elements
    initTcJxElements('.tc-jx-element');
}
$(document).ready(function () {
    refreshFns();
});


// Events on elements
function refreshTcEvents($target = 0) {
    if (!$target) {
        $target = $("[data-events]");
    }
    $target.each(function () {
        let events = $(this).dataVal('events', '');
        events = events.split(',');
        events.forEach(event => {
            $(this).trigger(event)
        });
    });
}

function htmlspecialchars(text) {
    if (typeof (text) !== "string") return false;
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

function htmlspecialchars_decode(text) {
    if (typeof (text) !== "string") return false;
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) { return map[m]; });
}
const replaceBrToN = (text) => {
    return text.replace(/(<br *\/?>)/gmi, "\n");
}

function beautifyJSON(selector) {
    $(selector).beautifyJSON({
        type: "flexible",
        hoverable: false,
        collapsible: false
    });
    $('body').find(selector).each(function (i, block) {
        hljs.highlightElement(block);
    });
}

function beautifycode(htmlstr) {
    htmlstr = htmlstr.split(/\>[ ]?\</).join(">\n<");
    htmlstr = htmlstr.split(/([*]?\{|\}[*]?\{|\}[*]?)/).join("\n");
    htmlstr = htmlstr.split(/[*]?\;/).join("\;\n    ");
    return htmlstr;
}

function colorCode(selector) {
    $('body').find(selector).each(function (i, block) {
        hljs.highlightElement(block);
    });
}
const loader = '<div class="loader"></div>';

function validateForm(form) {
    let valid = true;
    let inputs = $(form).find("input");
    for (let i = 0; i < inputs.length; i++) {
        if (!validInput(inputs[i])) {
            valid = false;
            break;
        }
    }
    if (valid) {
        let u_password = $(form).find(".u_password");
        if (u_password.length > 0) {
            if (u_password.get(0).value !== u_password.get(1).value) {
                valid = false;
                appendError($(u_password.get(1)).parents(".form-group"), "Password is not matching.", u_password.get(1));
            }
        }
    }
    return valid;
}
// Submit JS Form
$(document).on("submit", ".js-form, .ajax_form", function (e) {
    e.preventDefault();
    let formData = $(this).serialize(),
        submitBtn = $(this).find("[type='submit']"),
        btnText = submitBtn.html(),
        form = this;
    formData += "&req_token=" + makeReqKey();
    let valid = true;
    let inputs = $(this).find("input");
    for (let i = 0; i < inputs.length; i++) {
        if (!validInput(inputs[i])) {
            valid = false;
            break;
        }
    }
    if (valid) {
        let u_password = $(this).find(".u_password");
        if (u_password.length > 0) {
            if (u_password.get(0).value !== u_password.get(1).value) {
                valid = false;
                appendError($(u_password.get(1)).parents(".form-group"), "Password is not matching.", u_password.get(1));
            }
        }
    }
    // File
    let file = $(form).find('input[type="file"]'),
        containFile = false;
    if (file.length > 0) {
        let files = file.get(0).files;
        if (files.length > 0) {
            containFile = true;
            formData = new FormData(form);
            formData.append("req_token", makeReqKey());
        } else {
            let tcFilesInput = $(form).find(".tc-file-input");
            tcFilesInput.each(function () {

            });
            if (tcFilesInput.length > 0) {
                if (tcFilesInput.hasAttr("data-files")) {
                    let files = tc.get("files", tcFilesInput.attr("data-files"));
                    l(files);
                    if (files.length > 0) {
                        containFile = true;
                        formData = new FormData(form);
                        formData.append("req_token", makeReqKey());
                        files.forEach(file => {
                            formData.append(tcFilesInput.attr("name"), file);
                        });
                    }
                }
            }
        }
    }
    let controller = "main";
    if ($(form).hasClass("own-target")) {
        controller = $(form).attr("action");
    }
    if (valid) {
        disableBtn(submitBtn.get(0));
        let controllers = controller_dir != undefined ? controller_dir : "controllers/";
        let ajaxObject = {
            url: controllers + controller,
            type: "POST",
            data: formData,
            dataType: "json",
            success: function (response) {
                enableBtn(submitBtn, btnText);
                if (form.hasAttribute('data-callback')) {
                    let callbackName = $(form).attr("data-callback");
                    if (callbackName in callBackFunctions) {
                        callBackFunctions[callbackName](response, form);
                        return false;
                    }
                }
                if ("scrapperOutput" in response) {
                    $(".response-window").html(htmlspecialchars(response.data));
                    if (isJson(response.data)) {
                        $(".response-window").beautifyJSON({
                            type: "flexible",
                            hoverable: false,
                            collapsible: false
                        });
                        let jsonData = JSON.parse(response.data);
                        if (Array.isArray(jsonData.data)) {
                            if (jsonData.data.length > 0) {
                                let first_object = jsonData.data[0];
                                if (typeof (first_object) === "object") {
                                    if ("_id" in first_object) {
                                        first_object._id = getRand(first_object._id.length);
                                    }
                                }
                                jsonData.data = [first_object];
                                response.data = JSON.stringify(jsonData);
                            }
                        } else if (typeof (jsonData.data) === "object") {
                            if ("_id" in jsonData.data) {
                                jsonData.data._id = getRand(jsonData.data._id.length);
                            }
                            response.data = JSON.stringify(jsonData);
                        }
                    }
                    if ($(".show-result-in-console").is(":checked")) {
                        let consoleData = response.data;
                        if (isJson(consoleData)) consoleData = JSON.parse(consoleData);
                        console.log(consoleData);
                    }
                    $('.response-window').parents('.response-window-parent').find(".original-response").html(htmlspecialchars(response.data));
                    $('body').find(".response-window").each(function (i, block) {
                        hljs.highlightElement(block);
                    });
                    //$(".response-window").attr("contenteditable", "true");
                    return false;
                }
                if ("redirect" in response) {
                    if (response.redirect === "refresh") {
                        location.reload();
                    } else {
                        location.assign(response.redirect);
                    }
                } else {
                    if ("heading" in response) {
                        sAlert(response.data, response.heading, response.status)
                    } else {
                        sAlert(response.data, response.status);
                    }
                }
                if (response.status === "success") {
                    if (!$(form).hasClass("no-reset"))
                        form.reset();
                }
                if ('projectName' in response) {
                    window.open('./projects/' + response.projectName, '_blank');
                }
            },
            error: function (er) {
                makeError();
                enableBtn(submitBtn, btnText);
            }
        };
        if (containFile) {
            ajaxObject.processData = false;
            ajaxObject.contentType = false;
        }
        $.ajax(ajaxObject);
    }
});
// valid Inputs
function validInput(el) {
    valid = true;
    let value = $(el).val();
    let parent = $(el).parents(".form-group");
    if ($(el).attr("name") === "email") {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(value)) {
            appendError(parent, "Invalid Email", el);
            valid = false;
        }
    }
    if (valid) {
        if (el.hasAttribute("required")) {
            if ($(el).val().length < 1) {
                let error = '<p class="error">Required</p>';
                if (parent.find(".error").length < 1) {
                    parent.append(error);
                    $(el).focus();
                    valid = false;
                }
            }
        }
    }
    if (valid) {
        if (el.hasAttribute("data-length")) {
            let validLength = $(el).attr("data-length");
            if (validLength.indexOf("[") != -1) {
                validLength = validLength.substr(1, validLength.length - 2);
                let fullLength = validLength.split(",");
                minLength = parseInt(fullLength[0]);
                maxLength = parseInt(fullLength[1]);
                if (value.length < minLength) {
                    valid = appendError(parent, "Minimum Length should be " + minLength, el);
                }
                if (maxLength != 0 && maxLength > minLength) {
                    if (value.length > maxLength) {
                        valid = appendError(parent, "Maximum Length should be " + maxLength, el);
                    }
                }
            } else {
                if ($(el).val().length != parseInt(validLength)) {
                    valid = appendError(parent, "Length should be " + maxLength, el);
                }
            }
        }
    }
    if (valid) {
        parent.find(".error").remove();
        parent.removeClass("err");
    }
    if ($(el).hasClass("file-input")) {
        if ($(el).hasClass("required")) {
            if ($(el).val().length < 1) {
                valid = false;
                $(el).parents(".form-group").first().find(".file-name").val("Please Select File").focus();
            }
        }
    }
    return valid;
}

function appendError(parent, err, el) {
    let error = '<p class="error">' + err + '</p>';
    parent.addClass("err");
    if (parent.find(".error").length < 1) {
        parent.append(error);
    } else {
        parent.find(".error").html(err);
    }
    el.focus();
    return false;
}
// check if image file
function isImageFile(file) {
    let allowedExt = ['jpg', 'png', 'jpeg', 'gif'];
    let ext = file.name.split('.').pop().toLowerCase();
    if (allowedExt.includes(ext)) {
        return true;
    } else {
        return false;
    }
}
// Get File Name
$(document).on('change', '.file-upload-label .file-input', function (e) {
    let files = $(this).get(0).files;
    if (files.length < 1) return false;
    let file = files[0];
    $(this).parents('.form-group').first().find('.form-control').val(file.name);
});
// Confirm Delete
function confirmDelete(callback) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            callback();
        }
    });
}
// Delete Data
$(document).on('click', '.deleteData', function (e) {
    e.preventDefault();
    let action = $(this).attr('data-action'),
        target = $(this).attr('data-target'),
        parent = $(this).parents('tr').first(),
        targetUrl = 'main',
        btn = this;
    if (this.hasAttribute("data-parent")) {
        parent = $(this).parents($(this).attr("data-parent")).first();
    }
    if (this.hasAttribute("data-be-target")) {
        targetUrl = $(this).attr("data-be-target");
    }
    if ($(this).dataVal("url", false)) {
        targetUrl = $(this).data("url");
    }
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            $.post(controller_dir + targetUrl, {
                deleteData: true,
                action: action,
                target: target,
                req_token: makeReqKey()
            }).done(function (response) {
                if (!isJson(response)) {
                    makeError();
                } else {
                    if (btn.hasAttribute("data-callback")) {
                        let callbackName = $(btn).attr("data-callback");
                        if (callbackName in callBackFunctions) {
                            callBackFunctions[callbackName](response);
                            return false;
                        }
                    }
                    response = JSON.parse(response);
                    sAlert(response.data, response.status);
                    if (response.status === "success")
                        parent.remove();
                }
            }).fail(makeError);
        }
    });
});
$('.put-focus, .auto-focus').focus();
$("[data-height-target]").each(function () {
    $(this).height($($(this).attr("data-height-target")).height());
});
$("[data-width-target]").each(function () {
    $(this).width($($(this).attr("data-width-target")).width());
});
$("[data-block]").each(function () {
    let element = $($(this).attr("data-block"));
    if (element.width() < 1 || element.height() < 1) return false;
    $(this).width(element.width());
    $(this).height(element.height());
});

function refreshStyles() {
    $("[nc-style]").each(function () {
        let styles = $(this).attr("nc-style"),
            element = $(this);
        if (styles.length < 1) return false;
        styles = styles.split(";");
        styles.forEach(function (style) {
            let property_name = style.replace(/[^a-zA-Z]/gmi, ""),
                property_value = style.replace(/[^0-9]/gmi, ''),
                units = ['px', '%'],
                unit = "px";
            units.forEach((item) => {
                if (style.indexOf(item) !== -1) {
                    unit = item;
                }
            });
            let css_properties = {
                "cp": { "cursor": "pointer" },
                "oa": { "overflow": "auto" },
                "fwn": { "font-weight": "normal" },
                "fwb": { "font-weight": "bold" },
                "bg-t": { "background": "transparent" },
                "ws-bs": { "white-space": "break-spaces" },
                "ws-nw": { "white-space": "nowrap" },
                "fwn": { "font-weight": "normal" },
                "p-stick": { "position": "sticky" },
                "wa": { "width": "auto" },
                "w": "width",
                "h": "height",
                "maw": "max-width",
                "mah": "max-height",
                "t": "top",
                "pt": "padding-top",
                "pb": "padding-bottom",
                "pl": "padding-left",
                "pr": "padding-right",
                "p": "padding",
            }
            switch (property_name) {
                case "block":
                    element.width(property_value);
                    element.height(property_value);
                    break;
                case "fs":
                    element.css("fontSize", property_value + unit);
                    break;
                default:
                    if (style in css_properties) {
                        element.css(css_properties[style]);
                    } else if (property_name in css_properties) {
                        element.css(css_properties[property_name], property_value + unit);
                    }
                    break;
            }
        });
    });
}
refreshStyles();

function getRand(length = 5, type = 'string') {
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

function makeReqKey() {
    return getRand(30);
}

function removeSpaces(str) {
    if (str.length < 1) return str;
    return str.replace(/[ ]/gmi, '');
}
$(".modal [data-dismiss]").on("click", function (e) {
    e.preventDefault();
    $(this).parents(".modal").modal('hide');
})
// Delete Data from table
$(document).on('click', '.delete-td-data', function (e) {
    e.preventDefault();
    let dataTarget = $(this).attr('data-target'),
        dataAction = $(this).attr('data-action'),
        controllerURL = controller_dir != undefined ? controller_dir : 'controllers/',
        row = $(this).parents('tr').first();
    if (!dataTarget || !dataAction) return false;
    if (this.hasAttribute('data-controller')) controllerURL += $(this).attr("data-controller");
    else controllerURL += "delete";
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                url: controllerURL,
                type: 'POST',
                data: { action: dataAction, target: dataTarget, req_token: makeReqKey(), deleteData: true },
                dataType: 'json',
                success: function (data) {
                    if (data.status === "success")
                        row.remove();
                    else
                        sAlert(data.data, data.status);
                },
                error: function () {
                    makeError();
                }
            })
        }
    })
});

function rtrim(str, char) {
    if (str.length < 1) return str;
    let lastChar = str.substr(str.length - 1, 1),
        matchChar = false;

    if (Array.isArray(char)) {
        char.forEach((item) => {
            if (item === lastChar) matchChar = true;
        });
    } else if (lastChar === char) {
        matchChar = true;
    }
    if (matchChar) {
        str = str.substr(0, str.length - 1);
        return rtrim(str, char);
    } else {
        return str;
    }
}

function ltrim(str, char) {
    if (str.length < 1) return str;
    let firstChar = str.substr(0, 1),
        matcchChar = false;
    if (Array.isArray(char)) {
        char.forEach((item) => {
            if (item === firstChar) matcchChar = true;
        });
    } else if (firstChar === char) {
        matcchChar = true;
    }
    if (matcchChar) {
        str = str.substr(1, str.length);
        return ltrim(str, char);
    } else {
        return str;
    }
}
const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const toCaptalize = str => str.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
const camelToNormalCase = (str) => {
    let SnakeCase = camelToSnakeCase(str);
    let normalCase = SnakeCase.replace(/[_]/gmi, " ");
    normalCase = toCaptalize(normalCase);
    return normalCase;
}
const toCamelCase = function (str) {
    str = str.replace(/[_]/g, ' ');
    return str
        .replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); })
        .replace(/\s/g, '')
        .replace(/^(.)/, function ($1) { return $1.toLowerCase(); });
}

function copyText(string) {
    let textarea;
    let copyLink;

    try {
        textarea = document.createElement('textarea');
        textarea.setAttribute('readonly', true);
        textarea.setAttribute('contenteditable', true);
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.value = string;
        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const range = document.createRange();
        range.selectNodeContents(textarea);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        textarea.setSelectionRange(0, textarea.value.length);
        copyLink = document.execCommand('copy');
    } catch (err) {
        console.error(err);
        copyLink = null;
        notify("Error in copy");
    } finally {
        //document.body.removeChild(textarea);
    }
    if (!copyLink) {
        const mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const copyHotkey = mac ? 'Ã¢Å’ËœC' : 'CTRL+C';
        copyLink = prompt('Press ' + copyHotkey, string);
        if (!copyLink) {
            return false;
        }
    } else {
        l(copyLink)
    }
    notify("Copied");
    return true;
}
// Short notification toasts
let notify_id = 1;

function notify(msg, type = '') {
    $(".notify-toasts").append('<div class="single-toast ' + type + '" id="notify-' + notify_id + '">' + msg + '</div>');
    notify_id++;
    setTimeout(function () {
        $(".notify-toasts #notify-" + notify_id).remove();
    }, 4000)
}

function notifyError(err = 'Something went wrong! Please try again') {
    notify(err, "error");
}
$("body").append(`<div class="notify-toasts"></div>`);

function capitalizeFirstLetter(string) {
    if (string.length < 1) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Ajax Request Button
$(document).on("click", ".nc-jx-req-btn", function (e) {
    e.preventDefault();
    if (!this.hasAttribute("data-action") || !this.hasAttribute('data-submit')) return false;
    let targetUrl = $(this).attr("data-action"),
        data = $(this).attr('data-submit'),
        btn = $(this),
        btnText = $(this).html();
    if (!isJson(data)) return false;
    l('json');
    data = JSON.parse(data);
    data.req_token = makeReqKey();
    disableBtn(btn);
    $.ajax({
        url: controller_dir + targetUrl,
        type: "POST",
        data: data,
        dataType: "json",
        success: function (response) {
            enableBtn(btn, btnText);
            if (btn.get(0).hasAttribute('data-callback')) {
                let callbackName = $(btn).attr("data-callback");
                if (callbackName in callBackFunctions) {
                    callBackFunctions[callbackName](response, btn);
                    if (btn.get(0).hasAttribute("data-return-callback")) {
                        return false;
                    }
                }
            }
            if ("redirect" in response) {
                if (response.redirect === "refresh") {
                    location.reload();
                } else {
                    location.assign(response.redirect);
                }
            }
            sAlert(response.data, response.status);
        },
        error: function () {
            enableBtn(btn, btnText);
            makeError();
        }
    });
});
$(document).on("change", ".check-item-checkbox", function () {
    let parent = $(this).parents(".check-item");
    if ($(this).is(":checked")) {
        parent.removeClass("half-opacity");
    } else {
        parent.addClass("half-opacity");
    }
});
// Remove Seconds from time
function removeSeconds(time) {
    let time_arr = time.split(":");
    time_arr.pop();
    time = time_arr.join(":");
    return time_arr;
}
// Edit Table Info
$(document).on("click", ".editTableInfo", function (e) {
    e.preventDefault();
    if (!this.hasAttribute("data-target")) return false;
    let target = $($(this).attr("data-target"));
    if (target.length < 1) return false;
    let parent = $(this).parents("tr").first(),
        inputs = target.find("input[name],textarea[name], select[name]");
    inputs.each(function () {
        let td = parent.find('td[data-name="' + $(this).attr("name") + '"]');
        if (td.length > 0) {
            let value = td.attr('data-value');
            if ($(this).attr("type") == "datetime-local") {
                value = value.replace(" ", "T");
                value = value.substr(0, value.length - 2) + "00";
                //value = removeSeconds(value);
            }
            if ($(this).attr("type") !== "file") {
                if ($(this).attr("type") == "checkbox") {
                    if (value == "true") {
                        $(this).attr("checked", "true");
                    }
                } else if ($(this).get(0).tagName === 'SELECT') {
                    $(this).find("option").each(function () {
                        if ($(this).val() == value) $(this).attr("selected", "selected");
                        else $(this).removeAttr("selected");
                    });
                }
                else $(this).val(value);
            }
        }
    });
});
// Edit Modal Box with id
$(".editModalBoxSingleInput, .editModal").on("click", function (e) {
    e.preventDefault();
    if (!this.hasAttribute("data-target")) return false;
    let target = $($(this).attr("data-target"));
    if (target.length < 1) return false;
    if (!this.hasAttribute("data-name") && !this.hasAttribute("data-value")) {
        if (this.hasAttribute("data-edit")) {
            let editableData = $(this).attr("data-edit");
            if (!isJson(editableData)) return false;
            editableData = JSON.parse(editableData);
            for (let key in editableData) {
                let targetElement = target.find("[name='" + key + "']");
                if (targetElement.length > 0) {
                    targetElement.val(editableData[key]);
                }
            }
            return true;
        }
        return false;
    }
    let targetElement = target.find("[name='" + $(this).attr("data-name") + "']");
    if (targetElement.length > 0) {
        targetElement.val($(this).attr("data-value"));
    }
});
$('[data-toggle="modal"][data-target]').on("click", function (e) {
    e.preventDefault();
    let target = $(this).attr("data-target");
});

function replaceBreaksToBr(str) {
    return str.replace(/(\n)/gmi, "<br>");
}
// Search
const ncSearch = function (element) {
    let val = $(element).val().toLowerCase();
    if (!element.hasAttribute("data-target")) return false;
    let target = $($(element).attr("data-target"));
    target.filter(function () {
        let dataTarget = $(this).hasAttr("data-match") ? $(this).find($(this).attr("data-match")) : $(this);
        let txt = dataTarget.text();
        if (txt) {
            $(this).toggle(txt.toLowerCase().indexOf(val) > -1);
        }
    });
}
$(".nc-search").on("keyup", function () {
    ncSearch(this);
});
// Go to previous page
$(".go-back").on("click", function () {
    if ($(this).attr("data-target") !== "go-back") return false;
    window.history.back();
});
// Go to next page
$(".go-next").on("click", function () {
    if ($(this).attr("data-target") !== "go-next") return false;
    window.history.forward();
});
// Download file
function downloadFile(data) {
    let a = document.createElement("a");
    a.href = data.url;
    a.download = data.name;
    a.click();
}

function $_get(name) {
    let params_parts = window.location.search.substr(1).split("&");
    let $_GET = {};
    for (var i = 0; i < params_parts.length; i++) {
        var temp = params_parts[i].split("=");
        $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    if (name in $_GET) {
        return $_GET[name];
    } else {
        return false;
    }
}

if ($_get("error")) {
    sAlert($_get("error"), "Error");
}
if ($_get("success")) {
    sAlert($_get("success"), "success");
}
// Open image in new tab
$(document).on("click", '[data-action="open-image"]', function (e) {
    e.preventDefault();
    if (!this.hasAttribute('src')) return false;
    window.open($(this).attr("src"), "_blank");
});
// Get Previous Value till n
function getPreviousValue(str, length) {
    if (length === 0) return false;
    if (str.length > length) {
        return str.substr(str.length - (length + 1), str.length);
    } else {
        return getPreviousValue(str, length - 1);
    }
}
// check if string is tag start value
function isTagStartValue(str) {
    let tagValue = str.replace(/[^a-zA-Z:]/gmi, '');
    if (tagValue.length === str.length) return true;
    else return false;

}
// Chagne value of input/textarea
function changeInputValue(input, value) {
    input.focus();
    document.execCommand('selectAll', false);

    var el = document.createElement('p');
    el.innerText = value;

    document.execCommand('insertHTML', false, el.innerHTML);
}
// Insert Value to input
function insertValueInInput(value) {
    var el = document.createElement('p');
    el.innerText = value;
    document.execCommand('insertHTML', false, el.innerHTML);
}
// Prevent Tab in textarea
$(document).on("keydown", 'textarea[data-prevent-tab="true"], .nc-textarea', function (e) {
    /*     let textareaFns = $(this).attr("data-editor-fns");
        if (!isJson(textareaFns)) return true;
        textareaFns = JSON.parse(textareaFns); */
    let keycode = e.keyCode || e.which;
    let start = this.selectionStart,
        $this = $(this),
        value = $(this).val(),
        end = this.selectionEnd,
        shortcutKeys = [
            {
                value: 191,
                extraKey: () => e.ctrlKey,
                data: "/*\n\n*/",
                focus: 3

            }
        ];
    // Shortcut keys
    shortcutKeys.forEach(key => {
        let isKey = false;
        if (key.value === keycode) {
            if ("extraKey" in key) {
                if (key.extraKey(e)) {
                    isKey = true;
                }
            } else isKey = true;
            if (isKey) {
                insertValueInInput(key.data);
                if ("focus" in key)
                    this.selectionStart = this.selectionEnd = start + key.focus;
            }
        }
    })
    if (keycode === 9) {
        var replaceData = {
            value: "\t",
            length: 1
        },
            valueBeforePointer = value.substring(0, start);

        let supportedTags = {
            a: {
                attributes: {
                    "href": "",
                }
            }
        };

        if (start > 1) {
            let lastTagStartingIndex = valueBeforePointer.lastIndexOf("<"),
                tagValue = valueBeforePointer.substring(lastTagStartingIndex);
            tagValue = tagValue.replace("<", "");
            if (isTagStartValue(tagValue)) {
                l(tagValue);
                let tagName = tagValue;
                if (tagName in supportedTags) {
                    let tag = supportedTags[tagName];
                    let attributes = ``;
                    if ("attributes" in tag) {
                        for (let attribute in tag.attributes) {
                            attributes += `${attribute}="${tag.attributes[attribute]}"`;
                        }
                    }
                    let openingTagValue = ` ${attributes}>`;
                    replaceData.length = openingTagValue.length;
                    replaceData.value = openingTagValue + `</${tagName}>`;
                } else {
                    let openingTagValue = `>`;
                    replaceData.length = openingTagValue.length;
                    replaceData.value = openingTagValue + `</${tagName}>`;
                }
            }
        }
        insertValueInInput(replaceData.value);
        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + replaceData.length;

        // prevent the focus lose
        e.preventDefault();
    } else if (keycode === 222) {
        let newValue = "'";
        if (e.shiftKey) newValue = '"';
        insertValueInInput(newValue);
        this.selectionStart = this.selectionEnd = start;
    } else if (keycode === 8) {
        let currentValue = value.substr(start - 1, 1),
            nextValue = value.substr(start, 1);
        if (currentValue === '"' && nextValue === '"') document.execCommand("forwardDelete");
        if (currentValue === "'" && nextValue === "'") document.execCommand("forwardDelete");
    }
});
let keyMode = false;
$(document).on("keydown", function (e) {
    let keyCode = e.keyCode || e.which;
    if (keyMode)
        l(e.keyCode);
});
// Remove Parent
$(document).on("click", "[data-remove-parent]", function (e) {
    e.preventDefault();
    $(this).parents($(this).attr("data-remove-parent")).first().remove();
});
// Get Key code
const getKeyCode = (e) => e.keyCode || e.which;
// Handle JSON Response
const handleJsonRes = (data) => {
    let success = false;
    if (isJson(data)) {
        data = JSON.parse(data);
        if (data.status === "success") {
            success = data;
        } else {
            notifyError(data.data, data.status);
        }
    } else {
        notifyError();
    }
    return success;
}
// Toggle Panel
$(document).on("click", ".toggle-panel .panel-header", function (e) {
    e.preventDefault();
    let panel = $(this).parents(".toggle-panel").first();
    panel.find(".panel-body").first().slideToggle(200);
});
// Check all toggler
$(document).on("click", ".check-all-toggler", function () {
    let items = $(this).parents(".items").first();
    items.find(".item-checkbox").prop("checked", $(this).prop("checked"));
});

$("input[type='checkbox']").on("change", function () {
    if ($(this).is(":checked")) {
        l("yes");
        $(this).get(0).setAttribute("checked", "");
    } else $(this).removeAttr("checked");
});


// single text box editor
$(document).on("click", ".single-text-editor .edit-btn", function (e) {
    e.preventDefault();
    let parent = $(this).parents(".single-text-editor"),
        text_box = parent.find(".text-box");
    parent.addClass("editing-mode");
    text_box.show();
    text_box.focus();
    text_box.val(parent.find(".text").text());
});
$(document).on("blur", ".single-text-editor .text-box", function () {
    let parent = $(this).parents(".single-text-editor");
    if ($(this).get(0).hasAttribute("required")) {
        if ($(this).val().length < 1) {
            $(this).focus();
            return false;
        }
    }
    if ($(this).val().length < 1) return false;
    parent.find(".text-box").hide();
    parent.find(".text").text($(this).val());
    parent.removeClass("editing-mode");
    let data = {};
    if (parent.attr("data-data")) {
        data = JSON.parse(parent.attr("data-data"));
    }
    data[parent.attr("data-action")] = true;
    data["text"] = $(this).val();
    $.ajax({
        url: parent.attr("data-target-url"),
        method: "POST",
        data: data
    });
});

$(document).on("keyup", ".single-text-editor .text-box", function (e) {
    let keycode = e.keyCode || e.which;
    if (keycode === 13) $(this).blur();
});
$(".single-text-editor").each(function () {
    if ($(this).find(".text-box").length < 1) return false;
    if ($(this).find(".text-box").val().length < 1) {
        $(this).addClass("editing-mode");
    }
});

// Wait
const $wait = function (timeout = 0) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, timeout);
    });
}
// Prevent Click on element
$(document).on("click", ".dropdown-menu[prevent-click='true']", function (e) {
    $(this).parent().is(".show") && e.stopPropagation();
});
/*$(".dropdown-menu[prevent-click='true']").on('hide.bs.dropdown', function (e) {
    l(this);
    var target = $(e.target);
    if(target.hasClass("keepopen") || target.parents(".keepopen").length){
        return false; // returning false should stop the dropdown from hiding.
    }else{
        return true;
    }
});*/
// Click target
const clickTarget = (e, selector) => {
    let target = $(e.target);
    return (target.hasClass(selector) || target.parents(selector).length > 0);
}
// On Enter
$('[onenter]').on("keyup", function (e) {
    let keyCode = getKeyCode(e),
        fn = $(this).attr("onenter");
    if (keyCode === 13)
        callBackFunctions[fn]($(this), e);
});
// Add Multiple html
$(document).on("click", '[data-toggle="addHTML"]', function () {
    if (!$(this).hasAttr("data-pick")) return logError("data-pick attribute not found!");
    let $pick,
        pickSelector = $(this).data("pick"),
        radius = $(this).dataVal("pick-radius");
    if (!radius) radius = $(this).dataVal("radius");
    if (radius) $pick = $(this).parents(radius).find(pickSelector);
    else $pick = $(pickSelector);
    if (!$pick.length) return logError("picking element not found!");
    $pick = $pick.clone();
    $pick.removeAttr("id");
    // drop element
    let $drop,
        dropSelector = $(this).data("drop");
    radius = $(this).dataVal("radius", false);
    if (radius) {
        $drop = $(this).parents(radius).first().find(dropSelector);
    } else {
        $drop = $(dropSelector);
    }
    if ($drop.length < 1) return logError("droping element not found!");
    // Append Data
    $drop.append($pick);
    callback.handle(this);
});
// Remove Parent
$(document).on("click", '.removeParent', function () {
    if (!$(this).hasAttr("data-target")) return logError("data-target attribute not found!");
    $(this).parents($(this).data("target")).first().remove();
    callback.handle(this);
});
// Tc Element input
$(document).on("keydown", ".tc-element-input", function (e) {
    let keyCode = getKeyCode(e);
    if (keyCode === 13) {
        callback.handle(this);
        e.preventDefault();
        return false;
    }
});
// clickable dropdown
$(document).on("click", ".dropdown-clickable .dropdown-menu", function (e) {
    e.stopPropagation();
});
// Events on page load
$(document).ready(function () {
    // toggle elements groups
    $("[data-group-target]").trigger("change");
    // Search system on page load
    $(".nc-search").each(function () {
        ncSearch(this);
    });
    // Events on elements
    refreshTcEvents();
});
// Lazy load images
function lazyLoadImages() {
    $("img:not([data-loaded])").each(function () {
        let src = $(this).dataVal("src");
        if (src)
            $(this).attr("src", src);
        else
            console.error("data-src not found in lazy load image");
        $(this).attr("data-loaded", "true");
    });
}