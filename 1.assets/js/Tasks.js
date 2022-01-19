// request function
let url = "../../../../php/nancy/controllers/Tasks/";
let save_Tab = url + "save-Tab.php";

function sendRequest($url, $abj = {}, isValid = false) {
    if (!isValid) {
        return false;
    }
    $.ajax({
        url: $url,
        method: "POST",
        data: $abj,
        dataType: "json",
        error: makeError
    });
}

show_task_tabs();
// Select tasktabs 
function show_task_tabs() {
    $.ajax({
        type: "POST",
        url: save_Tab,
        data: {
            "type": "select-taskdata",
        },
        success: function (response) {
            $(".tc-Task-tab-items").html("");
            JSON.parse(response).forEach(element => {
                let tabsHtml = `
                <div class="tc-nav-item pull-away active tc-task-panel" data-id="${element.id}">
                    <span>${element.tabs}</span>
                    <i class="fas fa-times delete_task_tab" data-detach="tc-nav" data-id="${element.id}"></i>
                </div>`;
                $(".tc-Task-tab-items").append(tabsHtml);

            })
        }
    });
}

// Save Tabs
$('.add-Task-tab').on(`click`, function () {
    let tab_title_input = $(this).parent("span").prev('.tc-add-task-tab-input').val(),
        id = $(this).parents(".task-tabs-parent")
    console.log(id);
    if (tab_title_input !== "") {
        sendRequest(save_Tab, {
            "type": "save-Task-tab",
            "tabs": tab_title_input,
        }, true);
        setTimeout(() => {
            show_task_tabs();
        }, 100);
    }
});

// Show members
show_members()
function show_members() {
    $.post(save_Tab, { "type": "show_members" },
        function (data, textStatus, jqXHR) {
            JSON.parse(data).forEach(value => {
                $('.members_show').html('');
                let option = `<option>${value.name}</option>`;
                $('.members_show').append(option);
            });
        },
    );
}

// show groups
show_groups()
function show_groups() {
    $.post(save_Tab, { "type": "show_groups" },
        function (data, textStatus, jqXHR) {
            $('.groups_show').html("");
            JSON.parse(data).forEach(value => {
                let option = `<option value="${value.id}">${value.tabs}</option>`;
                $('.groups_show').append(option);
            });
        },
    );
}
$('.save_task_data').on(`submit`, function (e) {
    e.preventDefault();
    let data = $(this).serialize();
    sendRequest(save_Tab, data, true);
});


$(document).on(`click`, '.tc-task-panel', function () {
    let panel_id = $(this).data("id");
    $.post(save_Tab, { "id": panel_id, "type": "show_panel", },
        function (data, textStatus, jqXHR) {
            $(".tc-nav-panels").html("");
            JSON.parse(data).forEach(value => {
                let panel = `
                <div class="tc-nav-panels">
                    <div data-id="${value.id}">
                        ${value.title}
                    </div>
                </div>
                `;
                $(".tc-nav-panels").append(panel);
                console.log(value.title);
            })
        },
    );
});

$(document).on(`click`, '.delete_task_tab', function () {
    let id = $(this).data("id");
    sendRequest(save_Tab, {
        "type": "delete_tab",
        "id": id,
    }, true)
});