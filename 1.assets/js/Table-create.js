let url = "../../test/database_function/controllers/"
$(".show-create-form").on(`submit`,function (e) {
     e.preventDefault()
    let data = $(this).serialize();
    $.ajax({
        type: "POST",
        url: `${url}show-table-create.php`,
        data: data,
        success: function (response) {
            
        }
    });
    
})

// append data base names
function dbNames() {
    $.post(`${url}show_db_names.php`,
        function (data, textStatus, jqXHR) {
            console.log(data);
        },
    );
}
dbNames()