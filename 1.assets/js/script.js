// 3D Slider
let slider3D = new Swiper('.slider-3d', {
    effect: 'coverflow',
    loop: true,
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
    pagination: {
        el: '.swiper-pagination',
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
var sliderPag = new Swiper('.slider-pag', {
    slidesPerView: 3,
    slidesPerColumn: 2,
    spaceBetween: 30,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});
// Remove input group
$(document).on("click", ".remove-input-group-btn", function (e) {
    e.preventDefault();
    $(this).parents(".single-input-group").remove();
})
// Panels
$(document).on("click", ".nc-panel-btn", function (e) {
    e.preventDefault();
    let target = $($(this).attr("target"));
    if (this.hasAttribute("data-panel")) {
        let dataPanel = '[data-panel="' + $(this).attr("data-panel") + '"]';
        if ($(this).hasClass("active")) {
            $('.nc-panel-btn' + dataPanel).removeClass("active");
            $('.nc-panel' + dataPanel).removeClass("active");
        } else {
            $('.nc-panel-btn' + dataPanel).removeClass("active");
            $('.nc-panel' + dataPanel).removeClass("active");
            $('.nc-panel-btn' + dataPanel + '[target="' + $(this).attr("target") + '"]').addClass("active");
            target.addClass("active");
        }
    } else {
        if ($(this).hasClass("active")) {
            $('.nc-panel-btn').removeClass("active");
            $('.nc-panel').removeClass("active");
        } else {
            $('.nc-panel-btn').removeClass("active");
            $('.nc-panel').removeClass("active");
            $(this).addClass("active");
            target.addClass("active");
        }
    }
});
let allPanelsName = [];
$("button[data-panel]").each(function () {
    if (this.hasAttribute("target")) {
        let panelName = $(this).attr("data-panel");
        if (!allPanelsName.includes(panelName)) {
            $("[data-panel='" + panelName + "']").removeClass("active");
            $(this).addClass("active");
            $($(this).attr("target")).addClass("active");
            allPanelsName.push(panelName);
        }
    }
});
$(".create-project-backup").on("click", function (e) {
    e.preventDefault();
    let btn = $(this).find(".card-icon"),
        btnText = btn.html();
    disableBtn(btn);
    $.get("backup/create/backup", function (data) {
        enableBtn(btn, btnText);
        if (!isJson(data)) {
            makeError();
            return false;
        }
        data = JSON.parse(data);
        sAlert(data.data, data.status);
    }).fail(function () {
        enableBtn(btn, btnText);
        makeError();
    });
});
// Read file by opening folder
$(document).on("click", ".open-in-folder", function (e) {
    e.preventDefault();

    let path = $(this).attr("data-path");

    $.get("read-file", {
        openFolder: true,
        path: path
    })
})
// Remove Parent
$(document).on("click", ".remove-element", function (e) {
    e.preventDefault();
    if (!this.hasAttribute("data-target")) return false;
    let target = $(this).attr("data-target");
    if ($(this).attr("data-type") === "parent") {
        $(this).parents(target).first().remove();
    }
    else $(target).remove();
});

$(".project-upload-image").on("change", function () {
    let formData = new FormData();
    let files = $(this).get(0).files;
    let image, url, input = $(this);
    let showImage = input.attr("data-show-image");
    if (files.length > 0) {
        image = files[0];
    }
    else return false;
    url = URL.createObjectURL(image);
    formData.append("project_id", $(this).attr("data-id"));
    formData.append("project_image", image);
    formData.append("uploadImage", true);
    $.ajax({
        url: "controllers/projects/modify",
        type: "POST",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (response) {
            if (showImage) {
                $(showImage).css("background-image", `url('${url}')`);
            }
            else {
                input.parents(".single-project").find(".project-img").get(0).src = url;
            }
            sAlert(response.data, response.status);
        }
    })
});
// Color scrollbar on scroll
$(window).on("scroll", function (e) {
    let scrollTop = $(window).scrollTop();
    scrollTop > 20 ? $(".nc-navbar").addClass("active") : $(".nc-navbar").removeClass("active");
});
// Update User Image
$('.user-info .user-img-file').on('change', function () {
    let file = this.files;
    if (file.length < 1) return false;
    file = file[0];
    if (!isImageFile(file)) {
        sAlert('Invalid File type. Please upload an image file', 'error');
        return false;
    }
    let image = URL.createObjectURL(file),
        parent = $(this).parents('.user-image-container');
    parent.find('.user-img').css('background-image', 'url("' + image + '")');
    parent.addClass('active');
});
$('.user-info .save-img').on('click', function () {
    let imagecontainer = $(this).parent().find('.user-image-container'),
        file = imagecontainer.find('.user-img-file').get(0).files,
        btn = $(this),
        btnText = $(this).html();
    if (file.length < 1) {
        imagecontainer.removeClass('active');
        return false;
    }
    file = file[0];
    if (!isImageFile) {
        sAlert('Invalid File type. Please upload an image file', 'error');
        return false;
    }
    let formData = new FormData();
    formData.append('image', file);
    formData.append('updateUserImage', true);
    $.ajax({
        url: "../controllers/settings/update-image",
        type: 'POST',
        data: formData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        beforeSend: function () {
            disableBtn(btn);
        },
        success: function (response) {
            enableBtn(btn, btnText);
            imagecontainer.removeClass('active');
            sAlert('Image Changed Successfully!', 'success');
        },
        error: function () {
            enableBtn(btn, btnText);
            makeError();
        }
    })
});
if (typeof notInitChat === 'undefined' && false) {
    TCChat.init({
        userId: logged_in_user_id,
        userKey: userSecretKey,
        layout: "popup",
        dir: {
            controllers: controller_dir,
            userImages: global_dir + "images/users",
            chatFiles: global_dir + "upload/chat/",
            icons: global_dir + "images/icons/uploads",
        },
        afterAppend: function (msg) {
            $('[title]').tooltip();
        }
    }).then(function ($this) {
        let userLayout = $this.getLayout("users"),
            msgsBox = $(".nc-navbar .navbar-nav .nav-item .chat-users-dropdown");
        msgsBox.append(userLayout);
        let msgsUsers = msgsBox.find(".tc-users");
        msgsUsers.addClass("tc-users-dropdown tc-chat-scrollbar");
    });
}
// On bootstrap dropdwon show
$(document).on("show.bs.dropdown", ".dropdown,.dropleft,.dropright", function () {
    if ($(this).hasAttr("data-callback")) {
        callBackFunctions[$(this).attr("data-callback")]();
    }
    if ($(this).hasAttr("data-focus")) {
        $wait(200).then(() => $(this).find($(this).attr("data-focus")).focus());
    }
});
// Focus on search
callBackFunctions.focusToSearch = function () {
    setTimeout(() => $(".quick-links .search-input").focus(), 200);
}
$("body").addClass("hide-scrollbar");
// lighbox image gallery settings
lightbox.option({
    'resizeDuration': 500
});