// Add New Input Group
$(".add-input-group").on("click", function (e) {
    e.preventDefault();
    if (!this.hasAttribute("data-input-name")) return false;
    let target = $(this).parents(".nc-panel").first(),
        input_name = $(this).attr("data-input-name"),
        input_name_2 = rtrim(input_name, "s"),
        input_label_name = toCaptalize(input_name_2);
    if (target.length < 1) return false;
    target.find(".input-group-target").append(`<div class="single-input-group mb-3">
                                    <div class="row">
                                        <div class="col-md-3">
                                                <input type="text" class="form-control ${input_name_2}_name full-border" placeholder="${input_label_name} Name" name="${input_name}[name][]">
                                        </div>
                                        <div class="col-md-7">
                                                <input type="text" class="form-control ${input_name_2}_value full-border" placeholder="${input_label_name} Value" name="${input_name}[value][]">
                                        </div>
                                        <div class="aic col-md-2">
                                            <i class="fas fa-times remove-input-group-btn cp"></i>
                                        </div>
                                    </div>
                                </div>`);
});
$(document).on("click", ".save-web-scrapper-req", function (e) {
    e.preventDefault();
    let form = $(this).parents("form").first();
    if (form.length < 1) return false;
    let btn = $(this),
        req_name = form.find(".request-name").text();
    // Get the request name
    let request_name = "";
    Swal.fire({
        title: "Request Name",
        html: `<div class="px-4">
        		<input type="text" class="form-control request-name-input" placeholder="Enter request name here..." value="${req_name}">
        	</div>`,
        preConfirm: () => {
            return [
                request_name = $('.request-name-input').val(),
            ]
        },
        showCancelButton: true,
        confirmButtonText: "Save"
    }).then((result) => {
        if (result.value) {
            if (removeSpaces(request_name).length < 1) {
                sAlert("Request name can't be empty", "error");
            } else {
                let form_data = form.serialize();
                form_data += "&save_req=true";
                form_data += "&req_token=" + makeReqKey();
                form_data += "&req_name=" + request_name;
                if (btn.get(0).hasAttribute('data-id')) {
                    if (btn.attr("data-id").length > 0) {
                        form_data += "&update=true";
                        form_data += "&update_id=" + btn.attr("data-id");
                    }
                }
                $.ajax({
                    url: "controllers/scrapper/save",
                    type: "POST",
                    data: form_data,
                    dataType: "json",
                    success: function (response) {
                        sAlert(response.data, response.status);
                    },
                    error: makeError
                });
            }
        }
    });
});
// Make Api Documentation Start
// append form data to popup window
$(".make-api-documentation").on("click", function (e) {
    e.preventDefault();
    let form = $(".scrapper-form").clone(),
        targetWindow = $(".documentation-block");
    /* $(".scrapper-form").find(`[name]`).each(function () {
        form.find(`[name="${$(this).attr("name")}"]`).attr("value", $(this).val());
    }); */
    let url = form.find("#web-url");
    if (url.length < 1) return false;
    if (removeSpaces(url.val()).length < 1) {
        sAlert("Url can't be empty", "Error");
        return false;
    }
    form.find(".form-header-buttons").html(`
            Would you like to set the parameters types or Should i calculate it by myself?
            <button class="calculate-documentation s_btn outline" type="button">Calculate Nancy</button>
        `);
    form.find(".form-header").after(`<div class="col-md-6 p-0">
                                        <div class="form-group">
                                            <input type="text" class="form-control full-border website_name" name="website_name" placeholder="Enter Website Name...">
                                        </div>
                                    </div>`);
    targetWindow.find(".content").html(form.get(0).outerHTML);
    targetWindow.find(".content").append($(".response-window-parent").get(0).outerHTML);
    targetWindow.addClass("active");
    $("body").addClass("body-no-scroll");
});
$(".documentation-block").on("submit", "form", function (e) {
    e.preventDefault();
})
// Make the Documentation
$(".documentation-block").on("click", ".calculate-documentation", function (e) {
    e.preventDefault();
    let form = $(this).parents(".scrapper-form"),
        parent = $(this).parents(".documentation-block"),
        request = {
            website_name: capitalizeFirstLetter(form.find(".website_name").val()),
            name: form.find(".request-name").text(),
            url: form.find("#web-url").val(),
            url_without_paramters: form.find("#web-url").val(),
            method: form.find("select[name='method']").val(),
            response: parent.find(".original-response").html()
        }
    let parameters = [];
    request.url = rtrim(request.url, "?");
    let parameter_str = '';
    form.find(".input-group-target .single-input-group").each(function () {
        let parameter_name = $(this).find(".parameter_name").val(),
            parameter_value = $(this).find(".parameter_value").val();
        parameters.push({
            name: $(this).find(".parameter_name").val(),
            value: $(this).find(".parameter_value").val()
        });
        parameter_str += parameter_name + "=" + camelToSnakeCase(parameter_name).toUpperCase() + "_HERE" + "&";
    });
    if (parameter_str !== '') {
        parameter_str = rtrim(parameter_str, "&");
        if (request.url.indexOf("?") !== -1) {
            request.url += "&" + parameter_str;
        } else {
            request.url += "?" + parameter_str;
        }
    }
    request.parameters = parameters;
    let parameters_html = '',
        parameters_documentation = {
            "apikey": {
                documentation: request.website_name + " api key",
                dataType: "string",
            },
            "year": {
                documentation: "value of year",
                dataType: "integer",
                example: "2021"
            },
            "month": {
                documentation: "value of month between 01-12",
                dataType: "integer",
                example: "12"
            }
        }
    request.parameters.forEach(function (parameter) {
        let dataType = '',
            documentation = '',
            example = '';
        if (!isNaN(parameter.value)) {
            dataType = "integer";
            example = getRand(parameter.value.length, 'integer');
        } else {
            dataType = "string";
            example = getRand(parameter.value.length);
        }
        let tmp_name = parameter.name.replace(/[^a-zA-Z0-9]/gmi, '').toLowerCase();
        if (tmp_name in parameters_documentation) {
            dataType = parameters_documentation[tmp_name].dataType;
            documentation = parameters_documentation[tmp_name].documentation;
            if ("example" in parameters_documentation[tmp_name]) {
                example = parameters_documentation[tmp_name].example;
            }
        }
        parameters_html += `<tr>
                                <td><span class="text-primary pr-1">(${dataType})(required)</span>${parameter.name}</td>
                                <td>${documentation}</td>
                                <td>${example}</td>
                                <td>* <span class="text-info">(default=null)</span></td>
                            </tr>`;
    });
    // Curl request
    let method = request.method.toUpperCase();
    let curl = `-X${method} -H "Content-type: application/json" '${request.url}'`;

    if (method === "POST") {
        let curlParam = '';
        request.parameters.forEach(param => {
            let param_value = camelToSnakeCase(param.name).toUpperCase() + "_HERE";
            curlParam += `-F '${param.name}=${param_value}' `;
        });

        curl = `-X${method} ${curlParam} -H "Content-type: application/json" '${request.url_without_paramters}'`;
    }
    // Validate Resonse
    let { response } = request;
    if (isJson(response)) {
        response = JSON.parse(response);
        if (Array.isArray(response)) {
            response.length = 1;
        } else {
            if ("data" in response) {
                let { data } = response;
                if (Array.isArray(data)) {
                    response.data.length = 1;
                }
            }
        }
        request.response = JSON.stringify(response);
    }
    let parameters_table = '';
    if (request.parameters.length) {
        parameters_table = `<h5 class="heading mt-4">Parameters</h5>
        <div class="table-responsive pt-3">
            <table class="table table-broder-bottom">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Example</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    ${parameters_html}
                </tbody>
            </table>
        </div>`;
    }
    let html = `<button class="copy-api-documentation s_btn" type="button"><i class="fas fa-copy"></i> Copy</button>
                <div class="api-documentation">
                        <div class="single-section">
                            <h2 class="heading">${request.name}</h2>
                            <div class="alert-box my-4">
                                <span class="text-info">${request.method.toUpperCase()} </span> <span>- ${request.url_without_paramters}</span>
                            </div>
                            ${parameters_table}
                            <div class="example">
                                <h4 class="heading">Example:</h4>
                                <div class="alert-box my-4">
                                    <span class="text-info">curl </span> <span>${curl}</span>
                                </div>
                                <h4 class="heading">Results:</h4>
                                <div class="my-4">
                                    <pre class="text-white json-text">
${request.response}  
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>`;
    $(".documentation-result .content").html(html);
    $(".documentation-result").addClass("active");
    $("body").addClass("body-no-scroll");
});
$(".popup-window .close-btn").on("click", function (e) {
    e.preventDefault();
    $("body").removeClass("body-no-scroll");
    $(this).parents(".popup-window").removeClass("active");
})
$(document).on("click", ".copy-api-documentation", function (e) {
    e.preventDefault();
    let documentation = $(".api-documentation");
    l(documentation);
    if (documentation.length < 1) return false;
    let html = documentation.get(0).outerHTML;
    if (copyText(html)) {
        notify("Html Copied!");
    } else {
        let htmlWindow = window.open("", "Api Documentation", "");
        htmlWindow.document.write('<pre>' + htmlspecialchars(html) + '</pre>');
    }
})
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
$("#toggleJsonView").on("change", function () {
    let inputClasses = {
        "parameter-inputs": {
            "name": ".form-control.parameter_name",
            "value": ".form-control.parameter_value",
            "nameAttr": "parameters"
        },
        "cookies-panel": {
            "name": ".form-control.cookie_name",
            "value": ".form-control.cookie_value",
            "nameAttr": "cookies"
        },
        "headers-panel": {
            "name": ".form-control.header_name",
            "value": ".form-control.header_value",
            "nameAttr": "headers"
        }
    },
        jsonData = {},
        panel = $(".nc-panel.active"),
        panel_id = panel.attr("id"), names = [], values = []
    if (panel.length > 0) {
        let name_inputs = panel.find(inputClasses[panel_id].name),
            value_inputs = panel.find(inputClasses[panel_id].value);
        if ($(this).is(":checked")) {
            if (name_inputs.length > 0 && value_inputs.length > 0) {
                name_inputs.each(function () {
                    names.push($(this).val());
                });
                value_inputs.each(function () {
                    values.push($(this).val());
                });
                for (let i = 0; i < names.length; i++) {
                    let name = names[i];
                    let value = values[i];
                    if (name == "" && value == "") continue;
                    jsonData[name] = value;
                }
                if (isEmpty(jsonData)) return true;
                panel.find(".single-input-group").remove();
            }
            jsonData = JSON.stringify(jsonData);

            panel.append(`<textarea class="nc-oc-bg json-view-window nc-textarea form-control" spellcheck="false" contenteditable="true" data-editor-fns='{"tab": true,"quotes": true, "brackets": true}'>${jsonData}</textarea>`);
        }
        else {
            let jsonViewWindow = panel.find(".json-view-window"),
                input_class_name = inputClasses[panel_id].name.replaceAll(".", " "),
                input_class_value = inputClasses[panel_id].value.replaceAll(".", " "),
                input_name_attr = inputClasses[panel_id].nameAttr,
                input_name = inputClasses[panel_id].name.replace(".form-control.", "").replace("_", " ").replace("name", "").replace(" ", ""),
                input_value = inputClasses[panel_id].value.replace(".form-control.", "").replace("_", " ").replace("value", "").replace(" ", ""), jsonData, jsonWindowText;
            l(inputClasses[panel_id]);
            if (jsonViewWindow.length > 0) {
                jsonWindowText = jsonViewWindow.val();
                jsonViewWindow.remove();
                if (jsonWindowText.length > 0) {
                    jsonWindowText = jsonWindowText.replaceAll(" ", "");
                    l(jsonWindowText);
                    jsonData = JSON.parse(jsonWindowText);
                    for (const [key, value] of Object.entries(jsonData)) {
                        names.push(key);
                        values.push(value);
                    }
                    for (let i = 0; i < names.length; i++) {
                        let name = names[i];
                        let value = values[i];
                        if (name == "" && value == "") continue;
                        panel.append(`<div class="single-input-group mb-3">
                                                <div class="row">
                                                    <div class="col-md-3">
                                                            <input type="text" class="${input_class_name} full-border" placeholder="${toCaptalize(input_name)} Name" name="${input_name_attr}[name][]" value="${name}">
                                                    </div>
                                                    <div class="col-md-7">
                                                            <input type="text" class="${input_class_value} full-border" placeholder="${toCaptalize(input_value)} Value" name="${input_name_attr}[value][]" value="${value}">
                                                    </div>
                                                    <div class="aic col-md-2">
                                                        <i class="fas fa-times remove-input-group-btn cp"></i>
                                                    </div>
                                                </div>
                                            </div>`);
                    }
                }
            }
        }
    }
});