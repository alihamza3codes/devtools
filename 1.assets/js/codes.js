let popupCount = 1;
// Create Form Html Page
function createNewHTmlPageWith(code, code_type, page_title = "Page title") {
    let html_with_card = `
        <div class="card">
            <div class="card-body">
                ${code.html.full}
            </div>
        </div>`;
    let html_with_popup = createCodeInPopup({
        id: toCamelCase(code.name),
        name: code.name,
        html: code.html.full
    });
    let content = `
<?php
    require_once("./includes/db.php");
    $page_title = "${page_title}";
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <?php require_once("includes/head.php"); ?>
</head>

<body class="content-center">
    <div class="breadcrumbs"><a href="./">Home</a> >
        <?php echo $page_title; ?>
    </div>
    <div class="container-fluid">
        <div class="row m-0 content-center">
            <div class="col-12">
                <div class="card p-0">
                    <div class="card-header"><?= $page_title; ?></div>
                    <div class="card-body">
                        ${code.html.full}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php require_once("includes/footer.php"); ?>
</body>

</html>`;
    if (code_type === "new_file") return content;
    else if (code_type === "card") return html_with_card;
    else if (code_type === "popup") return html_with_popup;
    else return code.html.full;
}
// Create Table Html page
function createNewTablePageWith(code, code_type, page_title = "Page title") {
    let html = `
${code.html.table}
${code.html.update}
`
    let html_with_card = `
        <div class="card">
            <div class="card-body">
                ${code.html.table}
            </div>
        </div>
        ${code.html.update}`;
    let content = `
<?php
    require_once("./includes/db.php");
    $page_title = "${page_title}";
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <?php require_once("includes/head.php"); ?>
</head>

<body class="content-center">
    <div class="breadcrumbs"><a href="./">Home</a> >
        <?php echo $page_title; ?>
    </div>
    <div class="container-fluid">
        <div class="row m-0 content-center">
            <div class="col-12">
                <div class="card p-0">
                    <div class="card-header"><?= $page_title; ?></div>
                    <div class="card-body">
                        ${code.html.table}
                    </div>
                </div>
            </div>
        </div>
    </div>
    ${code.html.update}
    <?php require_once("includes/footer.php"); ?>
</body>

</html>`;
    if (code_type === "new_file") return content;
    else if (code_type === "card") return html_with_card;
    else return html;
}
// Create form html
function createFormHtml(code, formData, codeType = "") {
    let form_html = `
<!-- ${formData.formName} form for ${codeType} data -->
<form action="${formData.targetUrl}" method="POST" class="js-form ${formData.ownTarget}">
    <div class="row">${code.html.inputs}
        <div class="col-12">
            <input type="hidden" name="${code.mainDataInput}" value="${true}">
            <button type="submit" class="submit-btn">
                <i class="fas fa-save"></i> Save
            </button> 
        </div>
    </div>
</form>`;
    return form_html;
}
// Create Code in Popup
function createCodeInPopup(popup) {
    let html = `
    <div class="modal fade" id="${(popup.id)}" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" nc-style="bg-t">
                <div class="col-md-12">
                    <div class="card p-0">
                        <div class="card-header pull-away">
                            <span>${popup.name}</span>
                            <i class="fas fa-times cp" data-dismiss="modal"></i>
                        </div>
                        <div class="card-body">
                            ${popup.html}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    return html;
}
// Create Update Modal
function createUpdatePopup(code, formData) {
    let html = createCodeInPopup({
        "id": "edit" + formData.mainDataInput,
        "name": "Edit " + formData.formName,
        "html": code.html.full
    });
    return html;
}
// Create Table HTMl
function createTableHtml(code, formData) {
    let table_html = `
    <?php
        $${formData.mainName1} = $db->select("${formData.tableName}", '','','id DESC');
        if($${formData.mainName1}){
            $count = 1;
    ?>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <td>#</td>
${code.html.thead}
                    <td>Actions</td>
                </tr>
            </thead>
            <tbody>
                <?php foreach($${formData.mainName1} as $${formData.mainName2}){ ?>
                    <tr>
                        <td>
                            <?= $count; ?>
                        </td>
${code.html.tbody}
                        <td data-name="${code.updateParameter}" data-value="<?= $${formData.mainName2}['${code.updateParameter}']; ?>">
                            <a href="#" class="text-success editTableInfo" title="Edit" data-toggle="modal" data-target="#edit${formData.mainDataInput}">
                                <i class="fas fa-pencil-alt"></i>
                            </a>
                            <a href="#" class="delete-td-data text-danger" title="Delete" data-target="<?= $${formData.mainName2}['${code.updateParameter}']; ?>" data-action="${formData.mainName2}">
                                <i class="fas fa-trash-alt"></i>
                            </a>
                        </td>
                    </tr>
                    <?php $count++; } ?>
                </tbody>
            </table>
        </div>
    <?php } else { ?>
        <p>No Data found!</p>
    <?php } ?>
`;
    return table_html;
}
// Create Form PHP Code
function createPHPCode(code_type, code, formData, codeType = "") {
    let php_code = ``;
    let file_inputs_php_code = ``;
    formData.inputs.forEach(function (input) {
        if (input.type === "file") {
            file_inputs_php_code += `
    if($${input.target} === ""){
        unset($dbData['${input.target}']);
    }
        `;
        }
    });
    if (code_type === "insertQuery") {
        php_code = `
    $dbData = ${code.php.insert_data};
    ${file_inputs_php_code}
    $insert = $db->insert('${formData.tableName}', $dbData);
    if($insert){
        echo success("Data Saved Successfully!", "refresh");
    }`;
    } else if (code_type === "updateQuery") {
        php_code = `
    $dbData = ${code.php.update_data};
    ${file_inputs_php_code}
    $update = $db->update('${formData.tableName}', $dbData, ${code.php.update_condition});
    if($update){
        echo success("Data Saved Successfully!", "refresh");
    }`
    } else if (code_type === "modifyData") {
        php_code = `
// ${codeType} ${formData.formName}
if(isset($_POST['${code.mainDataInput}'])){
${code.php.variables}
${code.php.query}
}
    `;
    }
    return php_code;
}
// 
function NcformInputCode(inputInfo) {
    return codes.inputGroup(inputInfo);
}
const codes = {
    inputsHeader: `<div class="col-md-12">
                <div class="row m-0 pb-2">
                    <div class="col-md-2">
                        <span class="label">Input Name</span>
                    </div>
                    <div class="col-md-2">
                        <span class="label">Input Data Type</span>
                    </div>
                    <div class="col-md-2">
                        <span class="label">Target Column Name</span>
                    </div>
                    <div class="col-md-2">
                        <span class="label">Length</span>
                    </div>
                </div>
            </div>`,
    inputGroup: function (inputInfo = false) {
        if (inputInfo === false) {
            inputInfo = {
                name: "",
                type: "",
                target: "",
                length: "",
                required: false,
            };
        } else inputInfo.length = `0-${inputInfo.length}`;

        return `<div class="single-input-group check-item mb-3 col-md-12">
                <div class="align-center">
                    <div class="col-md-2">
                            <input type="text" class="form-control full-border input_name" value="${inputInfo.name}">
                    </div>
                    <div class="col-md-2">
                            <input type="text" class="form-control full-border input_type" value="${inputInfo.type}">
                    </div>
                    <div class="col-md-2">
                            <input type="text" class="form-control full-border input_target" value="${inputInfo.target}">
                    </div>
                    <div class="col-md-1 px-1">
                            <input type="text" class="form-control full-border input_length" value="${inputInfo.length}">
                    </div>
                    <div class="align-center pl-2">
                        <label class="checkboxLabel mb-0" nc-tooltip="Required">
                            <input type="checkbox" class="checkbox required-checkbox" ${inputInfo.required ? "checked" : ""} >
                            <span class="c-box">
                                <i class="fas fa-check"></i>
                            </span>
                        </label>
                        <label class="checkboxLabel mb-0 ml-3" nc-tooltip="Update Data Parameter">
                            <input type="checkbox" class="checkbox update-data-paramater-checkbox" >
                            <span class="c-box">
                                <i class="fas fa-check"></i>
                            </span>
                        </label>
                        <label class="checkboxLabel ml-5" nc-tooltip="Show in Insert Form">
                            <input type="checkbox" class="checkbox show-in-insert-checkbox" ${inputInfo.validToDisplay ? "checked" : ""} >
                            <span class="c-box">
                                <i class="fas fa-check"></i>
                            </span>
                        </label>
                        <label class="checkboxLabel ml-3" nc-tooltip="Show in Update Form">
                            <input type="checkbox" class="checkbox show-in-update-checkbox" ${inputInfo.validToDisplay ? "checked" : ""} >
                            <span class="c-box">
                                <i class="fas fa-check"></i>
                            </span>
                        </label>
                        <label class="checkboxLabel mb-0 ml-3" nc-tooltip="Show In Table">
                            <input type="checkbox" class="checkbox show-in-table-checkbox" ${inputInfo.validToDisplay ? "checked" : ""}>
                            <span class="c-box">
                                <i class="fas fa-check"></i>
                            </span>
                        </label>

                        
                        ${optionsCode}
                        
                        <i class="ml-3 fas fa-times remove-input-group-btn cp"></i>
                    </div>
                </div>
            </div>`;
    }
}