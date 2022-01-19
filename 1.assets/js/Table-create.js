$(".show-create-form").on(`submit`,function (e) {
     e.preventDefault()
    let data = $(this).serialize();
    $.ajax({
        type: "POST",
        url: "../../test/database_function/controllers/show-table-create.php",
        data: data,
        success: function (response) {
            
        }
    });
    
})