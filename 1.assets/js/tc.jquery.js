// Ajax Request Elements
function initTcJxElements(selector) {
    $(selector).each(function () {
        if (!$(this).hasAttr("data-launched")) {
            let event = $(this).dataVal("listener"),
                tagName = $(this).tagName();
            if (!event) {
                if (['input', 'select', 'textarea'].includes(tagName))
                    event = "change";
                else if ($(this).hasAttr("contenteditable"))
                    event = "focusout";
                else
                    event = "click";
            }
            $(this).attr("data-launched", "true");
            $(this).on(event, function () {
                // Setting element (if settings element (for data target,submit,include, etc) is another)
                let $settingsEl = $(this);
                if ($(this).dataVal("settings")) {
                    $settingsEl = $($(this).data("settings")).first();
                    let radius = $(this).dataVal("radius");
                    if (radius) $settingsEl = $(this).parents(radius).find($(this).data("settings"));
                    ['return-callback', 'callback'].forEach(attr => {
                        let attrValue = $settingsEl.dataVal(attr);
                        if (attrValue) {
                            $(this).attr(`data-${attr}`, attrValue);
                        }
                    });
                }
                // Select Attributes data
                let targetUrl = $(this).dataVal("target") ? $(this).dataVal("target") : $settingsEl.dataVal("target"),
                    submitData = $(this).dataVal("submit") ? $(this).dataVal("submit") : $settingsEl.dataVal("submit", {}),
                    dataIncludeSel = $(this).dataVal("include") ? $(this).dataVal("include") : $settingsEl.dataVal("include"),
                    dataInclude = {},
                    name = $(this).dataVal("name"),
                    elValue = null,
                    showAlert = true;

                if ($settingsEl.hasAttr("data-show-alert")) {
                    if ($settingsEl.data("show-alert") == false) {
                        showAlert = false;
                    }
                }

                if (typeof submitData === "string") {
                    submitData = normalizeJson(submitData);
                    if (!isJson(submitData)) return logError("data-submit is not json in tc-jx-element");
                    submitData = JSON.parse(submitData);
                }

                if (!name) name = $(this).attr("name");
                if (!targetUrl) return logError("data-target attribute not found in tc-jx-element");
                // Append value
                if (event === "focusout")
                    elValue = $(this).text();
                if (event === "change") {
                    let type = $(this).inputType();
                    if (['radio', 'checkbox'].includes(type)) {
                        let checkedEl = $(this);
                        elValue = checkedEl.is(":checked");
                        if (checkedEl.hasAttr("value"))
                            submitData[`${name}Value`] = checkedEl.val();
                    } else
                        elValue = $(this).val();
                }
                if (elValue !== null) submitData[name] = elValue;
                // Data include
                if (dataIncludeSel) {
                    let radius = $settingsEl.dataVal("radius"),
                        $parent = $("body").first();
                    if (radius) {
                        $parent = $(this).parents(radius);
                    }
                    dataInclude = $parent.find(dataIncludeSel).serializeArray();
                }
                // Mege Data
                for (let key in dataInclude) {
                    let data = dataInclude[key];
                    if (data.name.length)
                        submitData[data.name] = data.value;
                }
                // Show loader
                let loader = $(this).dataVal("loader");
                if (!loader) {
                    loader = (event === "click") ? true : false;
                } else {
                    loader == "false" ? false : true;
                }
                let requestData = {
                    data: submitData,
                    url: targetUrl,
                    element: $(this),
                    showAlert,
                    loader
                };
                tcJxRequest(requestData);
            });
        }
    });
}
// Ajax Request Fn
function tcJxRequestSend(request) {
    let { url, data, element, loader, showAlert } = request,
        $elem = $(element),
        elementHtml = $elem.html(),
        jsonData = $elem.dataVal("res-type", true);
    jsonData = toBoolean(jsonData);
    if (url.indexOf("./") === -1) {
        url = `./controllers/${url}`;
    }
    // Callback
    let callback = $elem.dataVal("callback");
    let ajaxData = {
        url: url,
        type: "POST",
        data: data,
        beforeSend: function () {
            if (loader) disableBtn(element);
        },
        success: function (res) {
            if (loader)
                enableBtn(element, elementHtml);
            if (callback)
                return callBackFunctions._handle(element, response);
            if (!showAlert)
                return true;
            // Alert
            if ("redirect" in response) {
                if (response.redirect === "refresh") {
                    location.reload();
                } else {
                    location.assign(response.redirect);
                }
            } else {
                sAlert(responseMessage, response.status);
            }
        },
        error: function () {
            if (loader)
                enableBtn(element, elementHtml);
            makeError();
        }
    };
    $.ajax(ajaxData)
}
// Send Ajax request
function tcJxRequest(request) {
    let { element, loader, showAlert } = request,
        $elem = $(element);
    // Loader
    if (!("loader" in request)) {
        if ($elem.dataVal("loader", null) !== null) {
            loader = $elem.data("loader");
        }
    }
    loader = JSON.parse(loader);
    request.loader = loader;
    // Show Alert
    if (!("showAlert" in request)) {
        if ($elem.dataVal("alert", null) !== null) {
            showAlert = $elem.data("alert");
        }
    }
    showAlert = JSON.parse(showAlert);
    request.showAlert = showAlert;
    // Confirm Data
    let dataConfirm = false;
    if ($elem.hasAttr("data-confirm")) {
        let isConfirm = $elem.data("confirm");
        if (isJson(isConfirm)) {
            dataConfirm = JSON.parse(isConfirm);
        } else {
            dataConfirm = isConfirm;
        }
    }
    if (dataConfirm) {
        tcConfirm({
            success: function () {
                tcJxRequestSend(request)
            }
        });
        return false;
    }
    tcJxRequestSend(request);

}