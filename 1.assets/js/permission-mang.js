let views_dir = "../views/permissions-management/";

$(".permission-btn").on("click", function () {
    let val = $(this).attr("data-id");
    $.get(`${views_dir}permissions-type?uid=${uid}&id=${val}`, function (response) {
        $(".project-types-result").html(response);
        refreshFns();
    });
});
$(document).ready(function(){
    $(".permission-btn").get(0).click();
});

$(document).on("click", ".action-list", function () {
    let item_id = $(this).attr("data-id"),
        type_id = $(this).attr("data-type-id");
    $.get(`${views_dir}actions/list?user_id=${uid}&item_id=${item_id}&type_id=${type_id}`, function (response) {
        $("#actionListModal").html(response);
        $("#actionListModal").modal("show");
        refreshFns();
    });
});

$(".save-permissions-btn").on("click", function () {
    let checkboxes = $("input[name='is_allowed']");
    let allowed_data = [], not_allowed_data = [], data;
    checkboxes.each(function () {
        let id = $(this).attr("data-page-id");
        if ($(this).is(":checked")) allowed_data.push(id);
        else not_allowed_data.push(id);
    });
    data = {
        savePermission: true,
        allowed_data: allowed_data,
        not_allowed_data: not_allowed_data,
        uid: uid,
        type_id: $(".permission-btn.active").data("id")
    };
    $.ajax({
        url: `${controller_dir}permission-management/save`,
        method: "POST",
        dataType: "json",
        data: data,
        success: function (response) {
            notify(response.data, response.status);
        }
    });
});

$(document).on("click", ".add-action", function () {
    let addActionModal = $("#addActionModal"),
        item_id = $(this).attr("data-id"),
        type_id = $(this).attr("data-type-id");
    addActionModal.find(".item_id").val(item_id);
    addActionModal.find(".type_id").val(type_id);
    addActionModal.modal("show");
});


$(document).on("click", ".delete-action", function () {
    let id = $(this).attr("data-id");
    let parent = $(this).parents(".action-list-item");
    $.post(`${controller_dir}permission-management/delete`, { deleteAction: true, id: id }, function (res) {
        parent.remove();
    });
});
