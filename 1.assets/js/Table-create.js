let url = "../../test/database_function/controllers/"


// append data base names
function dbNames() {
    $.post(`${url}show_dbs.php`, { type: "show-db-name" },
        function (data, textStatus, jqXHR) {
            console.log(data);
        },
    );
}
dbNames()