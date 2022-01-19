function getInputInfo(column) {
    let inputInfo = {
        "name": camelToNormalCase(column.Field),
        "target": (column.Field),
        "type": "text",
        "length": 0,
        "required": false,
        "validToDisplay": true
    };
    let file_column_names = ['img', 'images', 'file'];
    if (column.Type.indexOf("int") !== -1) inputInfo.type = "int";
    else if (column.Type.indexOf("timestamp") !== -1) inputInfo.type = "datetime-local";
    else if (column.Type.indexOf("text") !== -1) inputInfo.type = "textarea";
    else if (file_column_names.includes(column.Field)) inputInfo.type = "file";
    // Check if required
    if (column.Null === "NO") inputInfo.required = true;
    // Input Max Length
    let numbers = column.Type.replace(/[^0-9]/gmi, '');
    if (numbers.length > 0) inputInfo.length = parseInt(numbers);
    // Invliad For display
    let invalid_for_display_inputs = ['id', 'encrypt_id', 'created_at'];
    if (invalid_for_display_inputs.includes(column.Field)) {
        inputInfo.validToDisplay = false;
    }
    if (column.Field.indexOf("id") !== -1) {
        inputInfo.validToDisplay = false;
    }
    if (inputInfo.type === "file") inputInfo.length = 1;
    return inputInfo;
}
// Add Tab Spaces
function addTabs(length) {
    let txt = '';
    for (let i = 0; i < length; i++) {
        txt += `    `;
    }
    return txt;
}

callBackFunctions.fetchTableForm = function (response) {
    if (response.status !== "success") {
        sAlert(response.data, response.status);
        return false;
    }
    let tableInfo = response.data;
    let html = codes.inputsHeader;
    tableInfo.forEach(function (column) {
        let inputInfo = getInputInfo(column);
        html += NcformInputCode(inputInfo);
    });
    if (html != '') {
        $(".form-inputs-data .content").first().html(html);
        $(".form-inputs-data").first().removeClass("d-none");
    }
    refreshFns();
    refreshTcEvents();
}
// Add New Input Group
$(".add-input-group").on("click", function (e) {
    e.preventDefault();
    $(".input-group-target").append(codes.inputGroup());
    refreshFns();
});
$(document).on("change", ".input_type", function (e) {
    let val = $(this).val();
    if (val === "hidden") {
        $(this).parents(".single-input-group").find(".input_name").val('');
        $(this).parents(".single-input-group").find(".input_length").val('');
        $(this).parents(".single-input-group").find(".required-checkbox").prop("checked", false);
    }
});
// Create Form Code
$(".create-form-code").on("click", function (e) {
    e.preventDefault();
    let parent = $(this).parents(".form-inputs-data"),
        btn = $(this),
        inputs = [],
        hasInputFiletype = false;
    parent.find(".single-input-group").each(function () {
        let input_name = $(this).find(".input_name").val(),
            input_type = $(this).find(".input_type").val();
        if (removeSpaces(input_name).length > 0 || input_type === "hidden") {
            if ($(this).find(".input_type").val() === "file") {
                hasInputFiletype = true;
            }
            // Options
            let options = {};
            $(this).find(".nc-code-options .nc-code-option").each(function () {
                let $optionToggler = $(this).find(".nc-option-toggler");
                if ($optionToggler.length) {
                    let optionName = $optionToggler.attr("name"),
                        isChecked = $optionToggler.is(":checked"),
                        optionData = {
                            value: isChecked
                        };

                    // Select other data if available
                    if (isChecked) {
                        let data = {};
                        $(this).find(".nc-code-option-body").find("input,select").each(function () {
                            let inputName = $(this).attr("name"),
                                value = $(this).val(),
                                isArrayValue = false,
                                tagName = $(this).get(0).tagName.toLowerCase();
                            if (inputName.indexOf("[]") !== -1) {
                                isArrayValue = true;
                                inputName = inputName.replace(/(\[\])/gmi, "");
                            }
                            // Append Value to object
                            let isInputExists = false;
                            for (let key in data) {
                                let dataValue = data[key];
                                if (key === inputName) {
                                    isInputExists = true;
                                    if (isArrayValue) {
                                        if (typeof dataValue === "string")
                                            data[key] = [value];
                                        else {
                                            dataValue.push(value);
                                            data[key] = dataValue;
                                        }
                                    }
                                }
                            }
                            if (!isInputExists) {
                                if (isArrayValue)
                                    data[inputName] = [value];
                                else
                                    data[inputName] = value;
                            }
                        });
                        optionData.data = data;
                    }
                    options[optionName] = optionData;
                }
            });

            inputs.push({
                "name": input_name,
                "type": $(this).find(".input_type").val(),
                "length": $(this).find(".input_length").val(),
                "target": $(this).find(".input_target").val(),
                "required": $(this).find(".required-checkbox").is(":checked"),
                "updateParameter": $(this).find(".update-data-paramater-checkbox").is(":checked"),
                "showInInsertForm": $(this).find(".show-in-insert-checkbox").is(":checked"),
                "showInUpdateForm": $(this).find(".show-in-update-checkbox").is(":checked"),
                "showInTable": $(this).find(".show-in-table-checkbox").is(":checked"),
                "options": options
            });
            l(options)
        }
    });
    if (inputs.length < 1) {
        sAlert("No inputs found!", "error");
        return false;
    }
    let form = $(".form-code-form");
    form.find("[name='form_name']").attr("required", "required");
    if (hasInputFiletype) {
        form.find(".additional-inputs-group").removeClass("toggle-group");
        form.find("[name='file_upload_path']").attr("required", "required");
    }
    if (!validateForm(form)) {
        return false;
    }
    let formData = {
        "targetUrl": form.find("[name='target_url']").val(),
        "fileUploadPath": form.find("[name='file_upload_path']").val(),
        "formName": form.find("[name='form_name']").val(),
        "tableName": form.find("[name='table_name']").val(),
        "ownTarget": "own-target",
        "mainDataInput": toCamelCase(form.find("[name='form_name']").val()),
        "inputs": inputs
    };
    formData.mainDataInput = capitalizeFirstLetter(formData.mainDataInput);
    formData.mainName2 = rtrim(formData.tableName, "s");
    formData.mainName1 = rtrim(formData.tableName, "s") + "s";
    if (formData.targetUrl.length < 1) {
        formData.ownTarget = "";
    }
    let code = {
        "insertForm": {
            "php": {
                "variables": '',
                "insert_data": '[\n',
            },
            "html": { "inputs": '' },
            'formType': "insert",
            'mainDataInput': "insert" + formData.mainDataInput,
        },
        "updateForm": {
            "php": {
                "variables": '',
                "update_data": '[\n',
                "update_condition": '[\n',
            },
            "html": { inputs: '' },
            'formType': "update",
            'mainDataInput': "update" + formData.mainDataInput,
        },
        "table": {
            "html": {
                "thead": "",
                "tbody": ""
            },
            "php": {

            }
        }
    };
    // Input Loop Start
    inputs.forEach(input => {
        let inputHtml = '';
        // Form Code
        let inputElement = '',
            inputRequired = input.required ? "required" : "",
            inputLength = input.length !== "" ? "data-length='[" + input.length + "]'" : "",
            inputColumn = "col-md-6",
            { statusColumn, selectList } = input.options;
        switch (input.type) {
            case "textarea":
                inputColumn = "col-md-12";
                inputElement = `<textarea name="${input.target}" class="form-control" ${inputRequired} ${inputLength}></textarea>`;
                break;
            case "hidden":
                let hiddenInputValue = makeReqKey();
                if (input.updateParameter) {
                    hiddenInputValue = `<?= $${rtrim(formData.tableName, "s")}['${input.target}']; ?>`;
                }
                inputElement = `\n        <input type="${input.type}" name="${input.target}" value="${hiddenInputValue}">`;
                break;
            case "select":
                let options = ``,
                    tabsLength = 5;
                if (selectList.value) {
                    let { selectType, selectTexts, selectValues, tableName, tableContentColumn, tableKeyColumn } = selectList.data;
                    if (selectType === "options") {
                        options += `${addTabs(tabsLength)}<option selected ${input.required ? "disabled" : ""}>-- Select --</option>\n`;
                        selectTexts.forEach((txt, i) => {
                            let value = selectValues[i];
                            options += `${addTabs(tabsLength)}<option value="${value}">${txt}</option>\n`;
                        });
                    } else if (selectType === "table") {
                        let varName = "$" + tableName + "_data";
                        options += `${addTabs(tabsLength)}<option selected ${input.required ? "disabled" : ""}>-- Select --</option>
                    <?php
                        ${varName} = $db->query("SELECT ${tableContentColumn},${tableKeyColumn}  FROM ${tableName} ORDER BY 1 DESC");
                        if(${varName}){
                            foreach(${varName} as $data){
                        ?>
                                <option value="<?= $data["${tableKeyColumn}"] ?>"><?= $data["${tableContentColumn}"] ?></option>
                        <?php
                            }
                        }
                    ?>\n`;
                    }
                }
                inputElement = `<select name="${input.target}" class="form-control" ${inputRequired}>\n${options + addTabs(tabsLength - 1)}</select>`;
                break;
            case "checkbox":
                input.options.showLabel.value = false;
                inputElement = `<label class="checkboxLabel">
                    <input type="checkbox" name="${input.target}" value="true" class="checkbox">
                    <span class="c-box">
                        <i class="fas fa-check"></i>
                    </span>
                    ${input.name}
                </label>`;
                break;
            case "select":
                inputElement = `<select class="form-control" name="${input.target}" ${inputRequired}>
                    </select>`
                break;
            default:
                inputElement = `<input type="${input.type}" class="form-control" name="${input.target}" ${inputRequired} ${inputLength}>`;
                break;
        }
        if (input.type === "hidden") {
            inputHtml += inputElement;
        } else {
            inputHtml += `
        <div class="${inputColumn}">
            <div class="form-group">
                ${input.options.showLabel.value ? '<span class="label">' + input.name + '</span>' : ""}
                ${inputElement}
            </div>
        </div>`;
        }
        // Backend PHP code
        let php_single_varaible_code_block = ``;
        let target = input.target;
        if (input.type === "file") {
            if (input.required) {
                php_single_varaible_code_block = `
    if(!isset($_FILES['${target}'])){
        echo error("${input.name} can't be empty");
        die();
    }
                `;
            }
            php_single_varaible_code_block += `
    $${target} = '';
    if(isset($_FILES['${target}'])){
        $${target} = $_FILES['${target}'];
        $get_file_ext = explode('.', $${target}['name']);
        $ext = strtolower(end($get_file_ext));
        $upload_path = '${formData.fileUploadPath}';
        $upload_path = rtrim($upload_path, "/");
        $upload_path .= "/";
        $new_file_name = generate_file_name($ext, $upload_path);
        $file_uploaded = false;
        if(move_uploaded_file($${target}['tmp_name'], $upload_path . $new_file_name)){
            $file_uploaded = true;
            $${target} = $new_file_name;
        } else $${target} = '';
    }\n`;
        } else {
            if (input.type === "checkbox") {
                php_single_varaible_code_block += `
    $${target} = false;
    if(isset($_POST['${target}'])){
        if($_POST['${target}'] === "true"){
            $${target} = true;
        }
    }`;
            } else {
                php_single_varaible_code_block = `    `;
                php_single_varaible_code_block += `$${target} = tooTrim($_POST['${target}']);\n`;
                if (input.required) {
                    php_single_varaible_code_block += `    `;
                    php_single_varaible_code_block += `
    if(strlen($${target}) < 1){
        echo error("${input.name} can't be empty.");
        die();
    }\n`;
                }
            }
        }
        let php_code_block_2 = `        `;
        php_code_block_2 += `"${target}" => $${target},\n`;
        if (input.updateParameter) {
            code.updateForm.php.update_condition += php_code_block_2;
        } else if (input.showInUpdateForm) {
            code.updateForm.php.update_data += php_code_block_2;
        }
        if (input.showInInsertForm) {
            code.insertForm.php.insert_data += php_code_block_2;
        }


        // Html Form Inputs
        if (input.showInUpdateForm || input.updateParameter) {
            code.updateForm.html.inputs += inputHtml;
            code.updateForm.php.variables += php_single_varaible_code_block;
        }
        if (input.showInInsertForm) {
            code.insertForm.html.inputs += inputHtml;
            code.insertForm.php.variables += php_single_varaible_code_block;
        }
        let inputVar = `$${formData.mainName2}['${input.target}']`;
        // Table Code
        if (input.showInTable) {
            let tdValue = `<?= ${inputVar}; ?>`;
            if (input.type === "file") {
                if (['img', 'image'].includes(input.target)) {
                    tdValue = `<img src="${formData.fileUploadPath}/${tdValue}" alt="img" class="img-fluid" />`;
                }
            }
            // Status Item
            if (statusColumn.value) {
                tdValue = `<?php\n`;
                tdValue += addTabs(8) + `$status = ${inputVar};\n`;
                tdValue += addTabs(8) + `$color = "";\n` + addTabs(8);
                let { statusNames, statusColors } = statusColumn.data;
                statusNames.forEach((name, i) => {
                    let color = statusColors[i];
                    tdValue += `${i !== 0 ? " else " : ""}if ($status === "${name}"){
                                    $color = "${color}";
                                }`;
                });
                tdValue += `\n` + addTabs(7);
                tdValue += "?>";
                tdValue += `\n` + addTabs(7);
                tdValue += `<span class="badge badge-<?= $color ?>"><?= $status ?></span>`;
            }
            code.table.html.thead += `                    `;
            code.table.html.thead += `<td>${input.name}</td>\n`;
            code.table.html.tbody += `                        `;
            code.table.html.tbody += `<td data-name="${input.target}" data-value="<?= ${inputVar}; ?>">
                            ${tdValue}
                        </td>\n`;
        }
        if (input.updateParameter) {
            code.table.updateParameter = input.target;
        }
    });
    // Input Loop End Here
    code.insertForm.php.insert_data += `    `;
    code.insertForm.php.insert_data += "]";
    code.updateForm.php.update_data += `    `;
    code.updateForm.php.update_data += "]";
    code.updateForm.php.update_condition += `    `;
    code.updateForm.php.update_condition += "]";
    // Create Form HTML
    code.insertForm.html.full = createFormHtml(code.insertForm, formData, "add");
    code.updateForm.html.full = createFormHtml(code.updateForm, formData, "update");
    code.updateForm.html.full = createUpdatePopup(code.updateForm, formData);
    code.table.html.table = createTableHtml(code.table, formData);
    code.table.html.update = code.updateForm.html.full;
    // PHP Code
    code.insertForm.php.query = createPHPCode("insertQuery", code.insertForm, formData);
    code.updateForm.php.query = createPHPCode("updateQuery", code.updateForm, formData);
    code.insertForm.php.full = createPHPCode("modifyData", code.insertForm, formData, "add");
    code.updateForm.php.full = createPHPCode("modifyData", code.updateForm, formData, "update");

    let php_code = `
${code.insertForm.php.full}
${code.updateForm.php.full}
`,
        createNewFilesCode = false,
        forms_code = `
${code.insertForm.html.full}
${code.updateForm.html.full}
`;
    $("input[name='code_type']").each(function () {
        if ($(this).is(':checked')) {
            code.insertForm.name = "Add " + formData.formName;
            code.insertForm.html.full = createNewHTmlPageWith(code.insertForm, $(this).val(), "Add " + rtrim(formData.formName, "s"));
            code.table.html.full = createNewTablePageWith(code.table, $(this).val(), formData.formName);
            if ($(this).val() === "new_file") createNewFilesCode = true;
        }
    });
    if (createNewFilesCode) {
        php_code = `
<?php
require_once "../includes/db.php";
require_once "./validate-req.php";

${php_code}
`;
    }
    let resultContainer = $(".form-results");
    // Apend Insert Form Code
    resultContainer.find("#form-code .code-executed").html(code.insertForm.html.full);
    resultContainer.find("#form-code .html-code pre").html(htmlspecialchars(code.insertForm.html.full));
    resultContainer.find("#form-code .php-code pre").html(htmlspecialchars(php_code));
    // Apend Table Code
    resultContainer.find("#table-code .code-executed").html(code.table.html.full);
    resultContainer.find("#table-code .html-code pre").html(htmlspecialchars(code.table.html.full));
    colorCode(".code-div")
    resultContainer.removeClass("d-none");
});
// Insert Or Update Form Check box toggle
/*$('.update-form-type-checkbox').on("change", function(){
    if($(this).is(":checked")) $(".update-data-paramater-checkbox").removeClass('d-none');
    else $(".update-data-paramater-checkbox").addClass('d-none');
});
$('.insert-form-type-checkbox').on("change", function(){
    if($(this).is(":checked")) $(".update-data-paramater-checkbox").addClass('d-none');
    else $(".update-data-paramater-checkbox").removeClass('d-none');
});*/
//refreshWarning();