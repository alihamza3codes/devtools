// Nc Context Menu
let CtMenu = {
    currentId: 0
};
// Check if proceed click action
CtMenu.proceedClickAction = (e) => {
    let target = $(e.target);
    if (target.hasClass("n-click")) {
        return false;
    } else {
        return true;
    }
}
// Get Context Menu Targets
CtMenu.getTargets = (contextMenu) => {
    let targets = [];
    let targetSelectors = contextMenu.attr('data-target');
    if (targetSelectors) {
        let selectors = targetSelectors.split(",");
        selectors.forEach((selector) => {
            selector = selector.trim();
            if (selector.length > 0) {
                targets.push(selector);
            }
        })
    }
    return targets;
}
// Get Context menu Options
CtMenu.getOptions = (contextMenu) => {
    return contextMenu.find(".ct-menu-opt");
};
// Check if option if valid to display
CtMenu.validToShow = (option, target) => {
    let valid = true;
    if ($(option).get(0).hasAttribute('data-show')) {
        let selector = $(option).attr("data-show");
        if (selector.length < 1) return false;
        let selectorParam = selector.substring(1, selector.length);
        if (selector.charAt(0) === ".") {
            if ($(target).hasClass(selectorParam)) {
                valid = true;
            } else {
                valid = false;
            }
        }
    }
    return valid;
}
// Show Context menu
let showContextMenu = (e) => {
    let contextMenu = e.contextMenu,
        target = e.target,
        event = e.event;
    if (target) {
        target = $(target);
        let options = CtMenu.getOptions(contextMenu);
        options.each(function() {
            if (CtMenu.validToShow($(this), target)) {
                $(this).removeClass("d-none");
            } else {
                $(this).addClass("d-none");
            }
        });
    }
    let contextMenuCoords = {
            "top": event.pageY + 10
        },
        windowWidth = window.innerWidth,
        windowHeight = window.innerHeight,
        left = event.pageX + 20,
        top = event.pageY + 10,
        contextMenuWidth = contextMenu.width(),
        contextMenuHeight = contextMenu.height();

    if ((left + contextMenuWidth) >= windowWidth) {
        contextMenuCoords.right = (windowWidth - left) + 10;
        contextMenuCoords.left = 'auto';
    } else {
        contextMenuCoords.left = event.pageX + 10;
        contextMenuCoords.right = 'auto';
    }
    if ((top + contextMenuHeight) > windowHeight) {
        contextMenuCoords.bottom = (windowHeight - top) + 10;
        contextMenuCoords.top = 'auto';
    } else {
        contextMenuCoords.top = top;
        contextMenuCoords.bottom = 'auto';
    }
    contextMenu.css(contextMenuCoords);
    contextMenu.addClass("active");
};
// Set id to context menu 
CtMenu.setId = (element) => {
    $(element).attr("data-ct-menu-id", CtMenu.currentId);
};

function readyContextMenu() {
    $(".nc-context-menu").each(function() {
        CtMenu.currentId++;
        if (!this.hasAttribute('data-target')) return false;
        let target = $(this).attr("data-target"),
            contextMenu = $(this);
        CtMenu.setId(contextMenu);
        CtMenu.setId(target);
    });
}
$(".nc-context-menu").each(function() {
    CtMenu.currentId++;
    if (!this.hasAttribute('data-target')) return false;
    let target = $(this).attr("data-target"),
        contextMenu = $(this);
    CtMenu.setId(contextMenu);
    CtMenu.setId(target);
    $(document).on("contextmenu", target, function(e) {
        $(target).addClass("contextmenu-target");
        if (e.shiftKey) return;
        e.preventDefault();
        if (!CtMenu.proceedClickAction(e)) return false;
        contextMenu.css({
            "top": e.pageY + 10,
            "left": e.pageX + 10,
        });


        if ($(this).hasClass(".selected")) {
            $(this).addClass("selected");
            showContextMenu({
                event: e,
                contextMenu: contextMenu,
                target: $(this)
            });
        } else {
            $(target).removeClass('selected');
            $(this).addClass("selected");
            showContextMenu({
                event: e,
                contextMenu: contextMenu,
                target: $(this)
            });
        }
    });
});
// Hide Context menu
CtMenu.hide = () => {
    $(".contextmenu-target").removeClass("selected");
    $(".nc-context-menu").removeClass("active");
}

function checkTarget(targets, target) {
    target = $(target);
    let valid = true;
    targets.forEach((className) => {
        if (target.hasClass(className) || target.parents("." + className).length > 0) {
            valid = false;
        }
    });
    return valid;
}
// Hide Context Menu
$(window).on("click", function(e) {
    let target = $(e.target);
    let unValidTargets = [
            "nc-context-menu"
        ],
        valid = true;
    valid = checkTarget(unValidTargets, target);
    if (valid) {
        CtMenu.hide();
    }
});
// Click on Context Menu Option || Context Menu action
$(document).on("click", ".nc-context-menu .ct-menu-opt", function(e) {
    if (!this.hasAttribute('data-action')) return false;
    let action = $(this).attr("data-action");
    if (action in CtMenu) {
        CtMenu[action]({
            option: $(this),
            contextMenu: $(this).parents(".nc-context-menu").first(),
            event: e
        });
    }
});
// Get Target selector with option
CtMenu.getTargets = function(CtOption) {
    let target = '';
    CtOption = $(CtOption).get(0);
    if (CtOption.hasAttribute('data-show')) {
        target = $(CtOption).attr("data-show");
    } else {
        target = $(CtOption).parents(".nc-context-menu").attr("data-target");
    }
    return target;

}
// Get selected element
CtMenu.getActiveElement = function(e) {
    let contextMenu = e.contextMenu,
        targets = this.getTargets(e.option);
    target = '';
    targets.split(',').forEach((selector) => {
        target += selector + ".selected,";
    })
    target = rtrim(target, ',');
    return $(target);
};