const TCChat = {
    start: false,
    connected: false,
    dir: {
        controllers: "",
        userImages: "",
        chatFiles: "",
        icons: "images/icons/",
        uploads: "uploads/chat/",
    },
    layout: "inbox",
    element: function() {
        return $(".tc-chat");
    },
    find: function(selector) {
        return $(this.element.find(selector));
    },
    icons: {
        reactions: []
    },
    refreshFns: function() {
        refreshFns()
    },
    scrollTo: function(element, parent){
        if($(element).length < 1 || $(parent).length < 1) return false;
        $(parent).animate({
            scrollTop: $(element).get(0).offsetTop - $(element).height()/2
        }, 300);
    },
    attachemntId: 1,
    attachments: [],
    tmpFiles: [],
    fileExts: {
        "image": `image`,
        "video": `play-circle`,
        "audio": `volume-up`,
        "word": `file-word`,
        "text": `file-alt`,
        'csv': 'file-csv',
        'exe': '',
        'zip': 'file-archive',
        'sql': 'database',
        'js': 'fab fa-js',
        'php': 'fab fa-php',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt'
    },
    get: function(event, data) {
        if (event === "userImage")
            return this.dir.userImages + data;
        else if (event === "chatBox") {
            if(typeof data === 'string')
                return $(`.tc-single-msg-box[data-room-id="${data}"]`);
            else
                return data;
        } else if (event === "msgDate") {
            // Formating Date
            if(typeof data !== "string") return data;
            if(data.length < 1) return '';
            let date = moment(data).fromNow();
            let todayDateFormats = ['second', 'minute', 'hour'],
                isTodayDate = false;
            // Check if today date
            todayDateFormats.forEach(format => {
                if(date.indexOf(format) !== -1){
                    isTodayDate = true;
                }
            });
            if(isTodayDate) date = moment(data).format('LT');

            /*if(date == "a few seconds ago") date = moment(data).format('LT')
            else if(date.indexOf("minute") != -1)
            date = moment(data).format('LT');*/

            return date;
        } else if (event === "user") {
            if (data in this.users) {
                return this.users[data];
            } else return false;
        } else if (event === "fileType") {
            let filename = data;
            let ext = filename.split(".").pop().toLowerCase(),
                fileTypes = {
                    "image": ['png', 'jpg', 'jpeg', 'gif'],
                    "video": ['mp4', 'mov', 'mkv', '3gp'],
                    "audio": ['mp3'],
                    'word': ['docx'],
                    'text': 'txt'
                },
                fileType = false;
            for (let key in fileTypes) {
                let type = fileTypes[key];
                if (typeof(type) === "object") {
                    for (let keys in type) {
                        if (type[keys].toLowerCase() === ext) {
                            fileType = key;
                        }
                    }
                } else {
                    if (type === ext) {
                        fileType = key;
                    }
                }
            }
            if (!fileType) {
                if(ext in this.fileExts) fileType = ext;
            }
            if (!fileType) fileType = "unknown";
            return fileType;
        } else if (event === "fileData") {
            let fileId = data,
                file = this.get("attachment", fileId);
            if (!file) return false;
            let filename = file.name;

            let fileType = this.get("fileType", filename);
            let fileIcon = TCChat.get("fileIcon", {
                fileType: fileType,
                file: file
            });
            return {
                id: fileId,
                name: filename,
                type: fileType,
                icon: fileIcon,
                file: file
            };
        } else if (event === "fileIcon") {
            let { fileType } = data;
            if (fileType in this.fileExts) {
                let icon = this.fileExts[fileType];
                if(icon.length > 0){
                    let iconClass = `fas fa-${icon}`;
                    if(icon.indexOf(" ") !== -1){
                        iconClass = icon;
                    }
                    return `<i class="tc-file-icon ${iconClass}"></i>`
                }
            }
            return '<i class="tc-file-icon fas fa-file"></i>'
        } else if (event === "attachment") {
            let fileId = data,
                attachemnt = false;
            this.attachments.forEach(file => {
                if (file.id == fileId) attachemnt = file;
            })
            return attachemnt;
        } else if (event === "attachments") {
            let roomId = data,
                files = [];
            this.attachments.forEach(file => {
                if (file.roomId === roomId)
                    files.push(file);
            });
            return files;
        } else if (event === "reactionIcon") {
            let iconId = data,
                icon = false;
            this.icons.reactions.forEach(sIcon => sIcon.id == iconId ? icon = sIcon : '');
            return icon;

        } else if (event === "ringPath") {
            return "./images/water_drop.mp3";
        } else if (event === "roomBtn") {
            let roomId = data,
                room = $(`.tc-users .tc-user[data-user-id="${roomId}"]`);
            if (room.length > 0) return room;
            else return false;
        } else if (event === "message") {
            let msgId = data,
                msg = $(`.tc-chat .tc-single-msg-box .tc-msg-body[data-id="${msgId}"]`);
            if(msg.length > 0) return msg;
            else return false;
        }
    },
    remove: function(event, data) {
        switch (event) {
            case "attachment":
                let id = data,
                    element = $(`.tc-single-msg-box .tc-attachments .tc-single-file[data-id="${id}"]`);
                this.attachments.forEach((file, i) => {
                    if (file.id == id) {
                        let roomId = file.roomId;
                        this.attachments.splice(i, 1);
                        if (this.get("attachments", file.roomId).length == 0) {
                            element.parents(".tc-attachments").hide();
                            element.parents(".tc-msg-box-footer").find(".tc-msg-form").removeClass("tc-active");
                        }
                        element.remove();
                    }
                });
                break;
            case "attachments":
                let roomId = data,
                    files = [];
                this.attachments.forEach((file, i) => {
                    if (file.roomId === roomId) {
                        files.push(file.id);
                    }
                });
                files.map(fileId => this.remove("attachment", fileId));
                break;
            case "userWithId":
                let {users, userId} = data;
                users.forEach((user, i) => {
                    if(user.user_id == userId) users.splice(i, 1);
                });
                return users;
                break;
            case "replyForm":
                let chatBox = this.get("chatBox", data);
                chatBox.find(".tc-reply-form").slideUp(100);
                chatBox.find(".tc-reply-form .tc-reply-msg-txt").html('');
                chatBox.find(".tc-msg-box-footer .tc-msg-text").removeAttr("data-reply");
                chatBox.find(".tc-msg-box-footer .tc-msg-form.tc-active").removeClass("tc-active");
                return true;
        }
    },
    callbacks: {},
    users: {},
    on: function(event, callback) {
        this.callbacks[event] = callback;
    },
    linkify: function(inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;

        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

        return replacedText;
    },
    parseMsg: function(msg) {
        msg = msg.replace(/(\n)/gmi, "<br>");
        msg = msg.replace(/( )/gmi, "&nbsp;");
        msg = this.linkify(msg);
        return msg;
    },
    emojis: {
        ranges: /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
        remove: function(str) {
            return str.replace(this.ranges, '');
        },
        count: function(str) {
            let length = 0,
                emojis = str.match(this.ranges, '');
            if (emojis) length = emojis.length;
            return length;
        },
        is: function(str) {
            let emoji = 0;
            for (var i = 0, n = str.length; i < n; i++) {
                if (str.charCodeAt(i) > 255) {} else emoji++;
            }
            return !emoji;
            return !this.remove(str).length;
        },
        filter: function(str) {
            return str.replace(this.ranges, a => `<span class="tc-emoji-txt">${a}</span>`);
        },
        picker: false
    },
    isEmoji: function(str) {
        return this.emojis.is(str);
    },
    is: function(event, data = '') {
        let output;
        switch (event) {
            case "emojis":
                output = true;
                break;
        }
        return output;
    },
    ring: function() {
        let ring = $("body").find(".tc-msg-ring");
        if (ring.length < 1) return false;
        ring.get(0).play();
    },
    site: {
        url: "http://localhost/nancy/inbox",
        logo: "http://localhost/nancy/images/design/logo/3.png",
        favicon: global_dir + "images/design/logo/3.png",
        faviconUnread: global_dir + "images/design/logo/4.png",
        title: document.title
    }
}
// Update Methods
TCChat.update = function(event, data) {
    let res;
    switch (event) {
        case "msgViews":
            if(document.hidden) return false;
            let room = $(".tc-single-msg-box.tc-current-box"),
                msg = room.find(".tc-msg-body.tc-msg-viewed"),
                unseenMsg = msg.nextAll(".tc-msg-body").last();
                if(msg.find(`.tc-msg-seens .tc-seen-user[data-id="${this.userId}"]`).length < 1){
                    let msgId = room.find(".tc-msg-body").last().attr("data-id");
                    if(msgId){
                        this.send("msgSeen", {
                            "msgId": msgId
                        });
                    }
                    return false;
                }
            if(unseenMsg.length < 1) return false;
            this.send("msgSeen", {
                "msgId": unseenMsg.attr("data-id")
            });
            break;
        case "logo":
            this.updateLogo();
            break;
    }
    return res;
}
// request permission on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== 'granted')
        Notification.requestPermission();
});
TCChat.notify = function(title, description, logo = "") {
    if (Notification.permission !== 'granted')
        Notification.requestPermission();
    else {
        var notification = new Notification(title, {
            icon: logo,
            body: description,
        });
        notification.onclick = function() {
            window.focus();
        };
    }
}
TCChat.send = function(event, data = {}) {
    data = {
        event: event,
        TCChat: true,
        data: data
    };
    if (!this.connected || this.socket.readyState === WebSocket.CLOSED){
        //$(".server-connection-btn").html("Unable to connect the server, Try to <a href=''>refresh</a> the page");
        $(".server-connection-btn").show();
        return false;
    }
    this.socket.send(JSON.stringify(data));
    return false;
    $.ajax({
        url: TCChat.dir.controllers + "TCChat/",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(response) {
            if ('event' in response) {
                let event = response.event;
                if (typeof(event) !== "string") {
                    event.forEach(item => {
                        if (item in TCChat.callbacks) {
                            TCChat.callbacks[item](response.data[item]);
                        }
                    });
                } else if (typeof(event) === "string") {
                    if (event in TCChat.callbacks) {
                        TCChat.callbacks[event](response.data);
                    }
                }
            }
            if (typeof callbacks === "function") {
                callbacks(response.data);
            } else if ("success" in callbacks) {
                callbacks.success(response);
            }
        },
        error: function() {
            l('error');
        }
    })
}
// On recieve new message
TCChat.onmessage = function(response, callbacks = {}) {
    let data = response.data;
    if (isJson(data)) {
        data = JSON.parse(data);
        let event = data.event;
        data = data.data;
        if (event in TCChat.callbacks)
            TCChat.callbacks[event](data);

        if (typeof callbacks === "function") {
            callbacks(data);
        } else if ("success" in callbacks) {
            callbacks.success(response);
        }
    }
}
TCChat.addMsgOptions = function(singleMsg, roomId) {
    // Select Element
    let msg = $(singleMsg).find(".tc-msg-wrapper"),
        msgReacted = $(singleMsg).find(".tc-reactions-reacted"),
        msgReactions = $(singleMsg).find(".tc-msg-reactions");
    // Append Reactions
    if (msgReactions.length < 1 && $(singleMsg).hasClass("tc-left-msg"))
        msg.append(TCChat.getLayout("msgReactions"));

    // Append Message Options
    if ($(singleMsg).find(".tc-msg-options").length < 1){
        let type = $(singleMsg).hasClass("tc-right-msg") ? "right" : "left";
        $(singleMsg).append(TCChat.getLayout("msgOptions", type));
    }

    // Append Reacted Reactions
    msgReacted.html('');
    msgReactions.find(".active").removeClass("active");
    if ($(singleMsg).hasAttr("data-reactions")) {
        let reactions = $(singleMsg).attr("data-reactions").split(",");
        if (reactions.length > 0) {
            reactions.forEach(reactionId => {
                if (msgReacted.find(`.tc-msg-reacted[data-id="${reactionId}"]`).length < 1) {
                    let reaction = TCChat.getLayout("msgReaction", reactionId);
                    msgReacted.append(reaction);
                }
                msgReactions.find(`.tc-reaction[data-id="${reactionId}"]`).addClass("active");

            });
        }
    }
    // Message Attachments
    let attachmentsData = $(singleMsg).find(".tc-attachments-json");
    if (attachmentsData.length > 0) {
        let attachments = attachmentsData.html();
        if (isJson(attachments)) {
            $(singleMsg).find(".tc-msg-files").remove();
            $(singleMsg).find(".tc-msg-wrapper").prepend(TCChat.getLayout("msgFilesCon"));
            attachments = JSON.parse(attachments);
            attachments.forEach(file => {
                file.roomId = roomId;
                $(singleMsg).find(".tc-msg-files").append(TCChat.getLayout("msgAttachment", file));
            });
        }
        attachmentsData.remove();
    }
    // Sender id
    let senderId = this.userId;
    if(!$(singleMsg).hasClass("tc-right-msg")){
        senderId = $(singleMsg).parents(".tc-single-msg-box").attr("data-user-id");
    }
}
// Label message after appending
TCChat.labelMsg = function(chatBox, singleMsg = false) {
    if (typeof(chatBox) === "string")
        chatBox = this.get('chatBox', chatBox);
    else chatBox = $(chatBox);
    if (chatBox.length < 1) return false;
    if (singleMsg) TCChat.addMsgOptions(singleMsg, chatBox.attr("data-room-id"));
    else {
        chatBox.find(".tc-msg-body").each(function() {
            TCChat.addMsgOptions($(this), chatBox.attr("data-room-id"));
        });
    }
}
// Tc Dropdown
$(document).on("click", ".tc-dropdown .tc-dropdown-btn", function() {
    let dropdown = $(this).parents(".tc-dropdown"),
        dropdownMneu = dropdown.find(".tc-dropdown-menu");
    $(".tc-dropdown-menu").removeClass("active");
    dropdownMneu.toggleClass("active");
});
// Toggle TC Dropdown
$(window).on("click", function(e) {
    let target = $(e.target),
        parent = target.parents(".tc-dropdown");
    if (!target.hasClass(".tc-dropdown") && parent.length < 1) {
        $(".tc-dropdown-menu").removeClass("active");
    }
});
// Emojis
$(document).on("click", ".tc-chat .tc-single-msg-box .tc-msg-box-footer .tc-emoji-btn", function(e) {
    if (!TCChat.is("emojis")) return false;
    if (!TCChat.emojis.picker) return false;
    let picker = TCChat.emojis.picker;
    picker.pickerVisible ? picker.hidePicker() : picker.showPicker($(this).get(0));
});
// Update message reaction
TCChat.updateMsgReaction = function(msg, reactionId) {
    msg = $(msg);
    let reactions = [],
        alreadyExists = false;
    if (msg.hasAttr("data-reactions"))
        reactions = msg.attr("data-reactions").split(",");

    // if already reacted
    reactions.forEach((id, i) => {
        if (id == reactionId) {
            alreadyExists = true;
            reactions.splice(i, 1);
        }
    });
    if (!alreadyExists) reactions.push(reactionId);
    msg.attr("data-reactions", reactions.join(","));
    TCChat.labelMsg(msg.parents(".tc-single-msg-box"));
}
// React on Message
$(document).on("click", ".tc-chat .tc-single-msg-box .tc-msg-body .tc-msg-reactions .tc-reaction", function(e) {
    e.preventDefault();
    let iconId = $(this).data('id'),
        msg = $(this).parents(".tc-msg-body"),
        msgId = msg.data("id"),
        roomId = msg.parents(".tc-single-msg-box").attr("data-room-id");

    TCChat.send("reactOnMsg", {
        msgId: msgId,
        reactionId: iconId,
        roomId: roomId
    });
    //TCChat.updateMsgReaction(msg, iconId);
});
// Get Users layout
TCChat.getLayout = function(type, data = {}) {
    let html = '';
    if (type === "users") {
        html = `<div class="tc-users scroll_bar">
                    <div class="tc-head">
                        <div class="tc-search-bar">
                            <input type="text" placeholder="Search..." class="tc-search-input">
                            <i class="fas fa-search tc-search-icon"></i>
                        </div>
                    </div>
                    <div class="tc-all-users scroll_bar">
                    </div>
                </div>`;
    } else if (type === "user") {
        let user = data,
            unreadMsgs = user.newMsgs == "0" ? "" : user.newMsgs,
            lastMsgTime = this.get("msgDate", user.lastMsgTime);
        html = `
            <div class="tc-user tc-open-chat" data-user-id="${user.id}">
                <div class="tc-user-overlay-top"></div>
                <div class="media">
                    <div class="image-fluid tc-user-img" style="background-image: url('${this.dir.userImages}${user.image}');"></div>
                    <div class="media-body">
                        <div class="pull-away">
                            <p class="tc-user-name">${user.name}</p>
                            <span class="tc-user-time">${lastMsgTime}</span>
                        </div>
                        <span class="tc-user-last-msg">${user.lastMsg}</span>
                    </div>
                    <span class="tc-msg-count ${unreadMsgs === "" ? "d-none" : ""}">${unreadMsgs}</span>
                </div>
                <div class="tc-user-overlay-bottom"></div>
            </div>
        `;
    } else if (type === "forwardBox") {
        html = `
            <div class="tc-forward-box">
                <div class="card">
                    <div class="card-header">
                        <span>Users</span>
                    </div>
                    <div class="card-body">

                    </div>
                </div>
            </div>
        `;
        html = ``;
    } else if (type === "chats") {
        html = `<div class="tc-messages-boxes-wrapper"></div>`;
    } else if (type === "chatBox") {
        let user = data,
            emojiBtn = ``;
        emojiBtn = `<button type="button" class="tc-footer-icon tc-emoji-btn">
                        <i class="far fa-smile"></i>
                    </button>`;
        let messagesLayout = ``;
        for(let i=0; i<2; i++){
            messagesLayout += `
                    <div class="tc-msg-layout tc-left-msg">
                        <div class="user-img tc-msg-layout-line"></div>
                        <div class="media-body">
                            <div class="user-msg tc-msg-layout-line"></div>
                            <div class="msg-time tc-msg-layout-line"></div>
                        </div>
                    </div>
                    <div class="tc-msg-layout tc-right-msg">
                        <div class="media-body">
                            <div class="user-msg tc-msg-layout-line"></div>
                            <div class="msg-time tc-msg-layout-line"></div>
                        </div>
                        <div class="user-img tc-msg-layout-line"></div>
                    </div>
            `;
        }
        html = `
        <div class="tc-single-msg-box tc-layout" data-user-id="${user.id}">
            <div class="tc-msg-box-head">
                <div class="media">
                    <div class="tc-user-img bg-img border tc-msg-layout-line"></div>
                    <div class="media-body">
                        <a class="tc-user-name tc-msg-layout-line"></a>
                        <p class="tc-user-last-seen tc-msg-layout-line"></p>
                    </div>
                    <div class="media-foot">
                        <i class="fa fa-times tc-close-box-btn"></i>
                    </div>
                </div>
            </div>
            <div class="tc-msg-box-body scroll_bar">
                <div class="tc-all-messages">
                ${messagesLayout}
                </div>
            </div>
            <div class="tc-msg-box-footer">
                <div class="tc-reply-form">
                    <div class="tc-reply-form-heading">
                        <span>
                            <i class="fas fa-quote-left"></i>
                        </span>
                        <i class="fas fa-times tc-close-reply-form"></i>
                    </div>
                    <div class="tc-reply-msg-txt"></div>
                </div>
                <div class="tc-attachments">
                    <i class="fas fa-times tc-clear-attachments"></i>
                </div>
                <div class="tc-msg-form">
                    <textarea name="msg" class="tc-msg-text" placeholder="Write message..." autocomplete="off"></textarea>
                    <button type="button" class="tc-footer-icon tc-close-edit-btn" title="Dismiss Edit" data-delay="0">
                        <i class="fas fa-times"></i>
                    </button>
                    <button type="button" class="tc-footer-icon tc-quick-reply-btn" title="Quick Reply" data-delay="0">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button type="button" class="tc-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <label class="tc-attach-file">
                        <i class="fa fa-link"></i>
                        <span class="tc-attach-file-name">Attach File</span>
                        <input type="file" class="tc-file-input" multiple>
                    </label>
                    ${emojiBtn}
                </div>
            </div>
            <div class="tc-drag-over-content">
                <div class="tc-content">
                    <i class="fas fa-cloud-upload"></i>
                    <p>Drop here to upload files</p>
                </div>
            </div>
        </div>`;
    } else if (type === "editedMsg") {
        html = `<div class="tc-edited-icon">
                    <i class="fas fa-pencil-alt"></i>
                </div>`;
    } else if (type === "quotedMsg") {
        let msg = data;
        if(typeof msg !== "object") return '';
        if(!("message" in msg)) return '';
        msg.message = this.parseMsg(msg.message);
        html = `
        <div class="tc-reply-msg-con">
            <div class="tc-reply-msg" data-id="${msg.id}">
                <div class="tc-reply-form-heading">
                    <span>
                            <i class="fas fa-quote-left"></i>
                    </span>
                </div>
                <div class="tc-reply-msg-txt">${msg.message}</div>
            </div>
        </div>
        `;
    } else if (type === "message") {
        // Message Type
        let msgType = "left";
        if (this.userId == data.user.id) msgType = "right";
        // message data
        let { time, body, id, attachments } = data.msg,
            formatTime = this.get("msgDate", time);
        body = this.parseMsg(body),
            msgTextType = 'tc-normal-msg';
        // if only emojis
        if (this.isEmoji(body)) {
            msgTextType = 'tc-emoji-msg';
            if (this.emojis.count(body) > 1) msgTextType = 'tc-mulitple-emojis-msg';
        } else {
            body = this.emojis.filter(body);
        }
        if (body.length < 1) {
            msgTextType = 'tc-normal-msg';
        }
        // Message Time as Tooltip
        let msgTooltip = ` title="${formatTime}" data-placement="left"`;
        if (this.layout !== "popup") msgTooltip = '';
        // Reactions
        let reactions = '';
        if ("reactions" in data.msg) {
            reactions = data.msg.reactions.join(',');
        }
        // Attachments
        let attachmentsHtml = ``;
        if (attachments) {
            attachmentsHtml = `<code class="tc-attachments-json">${JSON.stringify(attachments)}</code>`;
        }
        // Edited Msg
        let edited = '';
        if('edited' in data.msg){
            if(data.msg.edited === true){
                edited = TCChat.getLayout("editedMsg");
            }
        }
        // Quoted Message
        let quotedMsg = TCChat.getLayout("quotedMsg", data.msg.replyMsg),
            quotedMsgClass = quotedMsg.length > 0 ? "tc-quoted-msg" : "";
        if (msgType === "right") {
            html = `
                <div class="tc-right-msg ${quotedMsgClass} tc-msg-body ${msgTextType}" data-id="${id}" data-reactions="${reactions}">
                    <div class="media">
                        <div class="media-body single-msg">
                            <p class="tc-user-info">
                                <span class="tc-msg-time">${formatTime}</span>
                            </p>
                            ${quotedMsg}
                            <div class="tc-msg-wrapper">
                                <div class="tc-msg-txt" data-time="${time}" ${msgTooltip}>
                                    <div class="tc-msg-txt-body">${body}</div>
                                    ${edited}
                                </div>
                            </div>
                            <div class="tc-reactions-reacted"></div>
                        </div>
                    </div>
                    ${attachmentsHtml}
                </div>`;
        } else {
            user = data.user;
            if (this.get("user", user.id)) {
                user = this.get("user", user.id);
            }
            let fname = '';
            if ('name' in user) {
                fname = user.name.split(" ").shift();
            }
            html = `
                <div class="tc-left-msg  ${quotedMsgClass} tc-msg-body ${msgTextType}" data-id="${id}" data-reactions="${reactions}">
                    <div class="media">
                        <div class="img-fluid tc-msg-user-img d-none" style="background-image: url(${this.get("userImage", user.image)})"></div>
                        <div class="media-body single-msg">
                            <p class="tc-user-info">
                                <span class="tc-user-name">${fname}, </span>
                                <span class="tc-msg-time">${formatTime}</span>
                            </p>
                            ${quotedMsg}
                            <div class="tc-msg-wrapper">
                                <div class="tc-msg-txt" data-time="${time}"  ${msgTooltip}>
                                    <div class="tc-msg-txt-body">${body}</div>
                                    ${edited}
                                </div>
                            </div>
                            <div class="tc-reactions-reacted"></div>
                        </div>
                    </div>
                    ${attachmentsHtml}
                </div>`;
        }
    } else if (type === "loader") {
        html = `<div class="tc-chat-loader-container"><div class="tc-chat-loader"></div></div>`;
    } else if (type === "bigLoader") {
        html = `<div class="tc-chat-loader-container"><div class="tc-chat-loader tc-big-loader"></div></div>`;
    } else if (type === "msgUploadAttachment") {
        let { id, icon, name, type } = data;
        name = name.substr(0, 5);
        if (data.name.length > 5) name += "..";
        // for image
        let imgData = '';
        if (type === "image") {
            let img = URL.createObjectURL(data.file);
            imgData = `style="background-image: url(${img})"`;
        }
        html = `<div class="tc-single-file tc-${type}-file" title="${data.name}" data-delay="0" data-id="${id}" ${imgData}>
                    ${icon}
                    <p class="tc-file-title">${name}</p>
                    <i class="fas fa-times tc-delete-file-btn"></i>
                </div>`;
    } else if (type === "msgFilesCon") {
        html = `<div class="tc-msg-files"></div>`;
    } else if (type === "msgAttachment") {
        let fileType = this.get('fileType', data.name),
            fileIcon = this.get("fileIcon", { fileType: fileType }),
            uploaded = true,
            fileId = "id" in data ? `data-id="${data.id}"` : "";
        imgData = '',
            downloadLink = '#',
            downloadBtn = '';
        // Check if uploaded
        if ("uploaded" in data) {
            if (!data.uploaded) uploaded = false;
        }
        // Set Path
        if (uploaded) {
            data.filepath = this.dir.uploads + data.filename;
            data.filepath = `download?file=${data.filepath}&filename=${data.name}`
        }
        // Check if image
        if (fileType === "image") {
            if (!uploaded) {
                let file = this.get('attachment', data.id);
                if (file)
                    data.filepath = URL.createObjectURL(file);
                else fileType = "unknown";
            }
        }
        if (fileType === "image") {
            fileIcon = `
                <a href="${data.filepath}" data-lightbox="msgAttachments-${data.roomId}">
                    <img src="${data.filepath}" alt="attachment" class="img-fluid attachment-img">
                </a>`;
        }
        if ("filename" in data) {
            if(data.filename.length > 0){
                downloadLink = `download?file=${this.dir.uploads + data.filename}&filename=${data.name}`;
                downloadBtn = `<a href="${downloadLink}" class="tc-download-icon fas fa-download"></a>`;
                
            } else {
                downloadBtn = "<span class='loader d-none loader-small tc-download-icon'></span>";
            }
        }
        html = `
        <div class="tc-single-file tc-${fileType}-file" title="${data.name}"  data-delay="0" ${fileId}>
            ${fileIcon}
            ${downloadBtn}
        </div>`;
    } else if (type === "downloadBtn") {
        downloadLink = `download?file=${this.dir.uploads + data.filename}&filename=${data.name}`;
        html = `<a href="${downloadLink}" class="tc-download-icon fas fa-download"></a>`;
    } else if (type === "attachemntImage") {
        let downloadLink = `download?file=${this.dir.uploads + data.filename}&filename=${data.name}`;
        html = `<a href="${downloadLink}" data-lightbox="msgAttachments-${data.roomId}">
                    <img src="${downloadLink}" alt="attachment" class="img-fluid attachment-img">
                </a>`;
    } else if (type === "msgOptions") {
        let moreOptions = ``;
        if(data === "right"){
            moreOptions = `
                        <div class="dropdown-item tc-option-edit">Edit</div>
                        <div class="dropdown-item tc-option-remove">Remove</div>`;
        }
        html = `<div class="dropleft tc-msg-options">
                    <i class="fas fa-ellipsis-v tc-dropdown-btn" data-toggle="dropdown"></i>
                    <div class="dropdown-menu">
                        <div class="dropdown-item tc-option-copy">Copy</div>
                        <div class="dropdown-item tc-option-reply">Quote</div>
                        ${moreOptions}
                        <!--- <div class="dropdown-item tc-option-forward">Forward</div>
                        <div class="dropdown-item tc-option-bookmark">Add Bookmark</div>
                        <div class="dropdown-item tc-option-select">Select Message</div> -->
                    </div>
                </div>`;
    } else if (type === "msgReactions") {
        let icons = ``;
        this.icons.reactions.forEach(icon => {
            icons += `<div class="dropdown-menu-item tc-reaction" data-id="${icon.id}">
                        <img src="${icon.icon}" alt="${icon.name}" class="img-fluid tc-reaction-icon no-tooltip" title="${icon.name}">
                    </div>`;
        })
        html = `<div class="dropup tc-msg-reactions tc-no-select">
                    <i class="far fa-smile tc-dropdown-btn" data-toggle="dropdown"></i>
                    <div class="dropdown-menu">
                        <div class="tc-reactions scroll_bar small-scrollbar">
                            ${icons}
                        </div>
                    </div>
                </div>`;
    } else if (type === "msgReaction") {
        let iconId = data,
            icon = this.get("reactionIcon", iconId);
        if (icon) {
            html = `
            <div class="tc-msg-reacted" data-id="${icon.id}">
                <div class="tc-reaction">
                    <div class="tc-reaction-con">
                        <img src="${icon.icon}" alt="${icon.name}" class="img-fluid tc-reaction-icon">
                        <div class="tc-box">
                            <img src="${icon.icon}" alt="${icon.name}" class="img-fluid tc-reaction-icon">
                        </div>
                    </div>
                    
                </div>
            </div>
            `;
        }
    } else if (type === "ring") {
        html = `<audio src="${this.get("ringPath")}" class="tc-msg-ring"></audio>`
    } else if (type === "seenMessages") {
        let views = data,
            viewsHtml = ``;
        views.forEach(view => {
            let senderId = 0,
                msg = this.get("message", view.msgId);
            if(msg){
                senderId = msg.parents(".tc-single-msg-box").attr("data-user-id");
            }
            view.time = this.get("msgDate", view.time);
            let tUser = this.get("user", view.userId);
            if(tUser){
                let userImage = this.dir.userImages + tUser.image;
                viewsHtml += `
                    <div class="media tc-seen-user" style="display: none;" data-user-id="${tUser.id}" >
                        <div class="dropup">
                            <div class="tc-user-img"style="background-image: url(${userImage})" data-toggle="dropdown"></div>
                            <div class="dropdown-menu tc-box tc-msg-seen-popup">
                                <p class="tc-small-txt">Read By:</p>
                                <div class="media">
                                    <img src="${userImage}" alt="user image" class="tc-user-img">
                                    <div class="media-body">
                                        <span class="tc-user-name">${tUser.name}</span>
                                        <span class="tc-view-time">${view.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                `;
            }
        })
        html = `
            <div class="tc-msg-seens">
            ${viewsHtml}
            </div>
        `;
    }
    return html;
}

// Set Data to tcchat
$(document).on("click", ".tc-users-toggler", function() {
    let tcUsers = $(this).parents(".tc-users-container").find(".tc-users .tc-all-users");
    TCChat.updateUsers(tcUsers);
});
$(document).on("click", ".tc-download-icon", function(e){
    e.preventDefault();
    let href = $(this).attr("href");
    if(href.length > 0 && href != "#"){
        window.open(href, "_blank");
    }
});
TCChat.newMsgTimeout = false;
// Set
TCChat.set = function(type, data) {
    if (type === "userImage") {
        $(data.element).find(".tc-msg-box-head .tc-user-img").css("background-image", 'url("' + this.dir.userImages + data.image + '")')
    } else if (type === "scrollToBottom") {
        let { element, delay } = data;
        if (!delay) delay = 200;
        $(element).animate({ scrollTop: $(element).height() }, delay);
    } else if (type === "layout") {
        if (data === "popup") {
            $(".tc-chat").addClass("tc-popup-design");
        } else {
            $(".tc-chat").removeClass("tc-popup-design");
        }
    } else if (type === "goToBottom") {
        let { element, delay } = data;
        if (!("delay" in data)) delay = 200;
        if (typeof(element) === "string") {
            element = this.get("chatBox", element);
        }
        element = $(element).find(".tc-msg-box-body");
        $(element).animate({
            scrollTop: $(element).get(0).scrollHeight
        }, delay);
    } else if (type === "user") {
        this.users[data.id] = data;
    } else if (type === "msgViews") {
        let {roomId, msgViews} = data,
            chatBox = this.get("chatBox", roomId);
        if(chatBox.length < 1) return false;
        msgViews.forEach(view => {
            let msg = chatBox.find(`.tc-msg-body[data-id="${view.msgId}"]`);
            msg.append(this.getLayout("seenMessages", msgViews));
            msg.find(".tc-seen-user").show();
            msg.addClass("tc-msg-viewed");
        });
    } else if (type === "msgView") {
        let view = data;
        let msg = $(`.tc-single-msg-box .tc-msg-body[data-id="${view.msgId}"]`);
        if(msg.length < 1) return false;
        let viewedMsg = msg.parents(".tc-single-msg-box").find(".tc-msg-seens");
        viewedMsg.slideUp(100, function(){
            viewedMsg.remove();
        });
        msg.append(this.getLayout("seenMessages", [view]));
        msg.find(".tc-seen-user").slideDown(100);
        let chatBox = msg.parents(".tc-single-msg-box");
        $wait(500).then(() => {
            this.updateMsgCount(chatBox.attr("data-user-id"), 0);
        });
    } else if (type === "favicon") {
        let favicon = $(`link[rel="icon"]`);
        if(data.status === "unread") {
            favicon.attr('href', this.site.faviconUnread);
            document.title = data.message;
            TCChat.newMsgTimeout = setTimeout(() => {
                let count = this.getUnreadCount();
                if(count > 0){
                    $(".tc-users .tc-user").each(function(){
                        let counter = $(this).find(".tc-msg-count"),
                            username = $(this).find(".tc-user-name").text().toLowerCase(),
                            val = toNumber(counter.text());
                        if(val){
                            if(!counter.hasClass("d-none") && val > 0){
                                if(username.indexOf("talha") !== -1){
                                    //say("You have un seen messages from Mr Talha Please View the chat as soon as possible. From Nancy");
                                    clearTimeout(TCChat.newMsgTimeout);
                                }
                            }
                        }
                    });
                }
            }, 30000);
        } else {
            favicon.attr("href", this.site.favicon);
            document.title = this.site.title;
        }
    }
}
// Add Data to chatbox
TCChat.add = function(type, data) {
    if (type === "chat") {
        let chatContainer = $(".tc-chat .tc-messages-boxes-wrapper"),
            { userId } = data,
            chatBoxSelector = `.tc-single-msg-box[data-user-id="${userId}"]`;
        if (chatContainer.find(chatBoxSelector).length < 1) {
            $.ajax({
                url: this.dir.controllers + "TCChat/open-chat",
                type: "POST",
                data: {
                    startChat: true,
                    userId: userId
                },
                dataType: "json",
                beforeSend: function() {
                    chatContainer.append(TCChat.getLayout("chatBox", { id: userId }));
                    chatBox = $(chatBoxSelector);
                    $(".tc-chat .tc-single-msg-box").removeClass("tc-current-box");
                    chatBox.addClass("tc-current-box");
                },
                success: function(response) {
                    let { status, data } = response,
                    chatBox = $(chatBoxSelector);

                    $wait(200).then(() => {
                        chatBox.removeClass("tc-layout");
                        chatBox.find(".tc-msg-layout-line").removeClass("tc-msg-layout-line");
                        chatBox.find(".tc-all-messages").html('');
                        if (status !== "success") {
                            notify(data, status);
                            return false;
                        }
                        TCChat.set("user", data.user);
                        chatBox.attr("data-room-id", data.roomId);
                        chatBox.find(".tc-user-name").text(data.user.name);
                        chatBox.find(".tc-user-last-seen").text(data.user.lastSeen);
                        TCChat.set("userImage", {
                            element: chatBox,
                            image: data.user.image
                        });
                        data.chat.reverse();
                        // Append chat
                        data.chat.forEach(msg => {
                            TCChat.appendMsg({
                                room: {
                                    id: data.roomId
                                },
                                msg: msg,
                                user: {
                                    id: msg.userId,
                                    name: data.user.fname,
                                    image: data.user.image
                                }
                            });
                        });
                        TCChat.set("msgViews", {
                            roomId: data.roomId,
                            msgViews: data.msgViews
                        });
                        TCChat.update("msgViews");
                        TCChat.set("goToBottom", {
                            element: data.roomId,
                            delay: 0
                        });
                        chatBox.find(".tc-msg-box-footer .tc-msg-text").focus();
                    });
                },
                error: function() {
                    notifyError();
                }
            });
        } else {
            $(".tc-chat .tc-single-msg-box").removeClass("tc-current-box");
            chatContainer.find(chatBoxSelector).removeClass("tc-hide").addClass("tc-current-box");
            this.update("msgViews", chatContainer.find(chatBoxSelector));
            chatContainer.find(chatBoxSelector).find(".tc-msg-box-footer .tc-msg-text").focus();
        }

        $(".tc-chat").removeClass("d-none");
    } else if (type === "attachment") {
        let { file, roomId } = data,
        id = this.attachemntId;
        file.id = id;
        file.roomId = roomId;
        this.attachments.push(file);
        this.attachemntId++;
        return id;
    } else if (type === "user") {
        let user = data;
        this.users[user.id] = user;
    }
}

// Start chat with user
$(document).on("click", ".tc-open-chat", function(e) {
    if (!TCChat.start) {
        console.error("TCChat is not initliazed");
        return false;
    }
    e.preventDefault();
    let userId = $(this).attr("data-user-id");
    if (userId.length < 1) {
        console.error("Users id not provided");
        return false;
    }


    TCChat.add("chat", {
        userId: userId
    });
});
// Close Chat Box
$(document).on("click", ".tc-single-msg-box .tc-close-box-btn", function(e) {
    e.preventDefault();
    let msgBox = $(this).parents(".tc-single-msg-box");
    msgBox.addClass("tc-hide");
    msgBox.remove();
});
// Drag/Drop Attachment
$(document).on("dragenter dragover", ".tc-single-msg-box", function(e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    if (data.types && (data.types.indexOf ? data.types.indexOf('Files') != -1 : data.types.contains('Files'))) {
        $(this).find(".tc-drag-over-content").addClass("active");
    }
});
$(document).on("drop", ".tc-single-msg-box", function(e) {
    e.preventDefault();
    let dt = e.originalEvent.dataTransfer;
    l(dt.getData('text'))
    let files = dt.files;
    if (files.length > 0) {
        let roomId = $(this).attr("data-room-id");
        for (let i = 0; i < files.length; i++) {
            TCChat.addAttachment(roomId, files[i]);
        }
    }
    $(this).find(".tc-drag-over-content").removeClass("active");
});
$(document).on("dragleave", ".tc-single-msg-box", function(e) {
    e.preventDefault();
    $(this).find(".tc-drag-over-content").removeClass("active");
});
// Add message Attachment
TCChat.addAttachment = function(roomId, file) {
    let chatBox = this.get("chatBox", roomId);
    if (chatBox.length < 1) return false;
    let fileId = this.add("attachment", {
        file: file,
        roomId: roomId
    });
    let fileData = this.get("fileData", fileId);
    chatBox.find(".tc-attachments").append(this.getLayout("msgUploadAttachment", fileData));
    chatBox.find(".tc-attachments").slideDown().css("display", "flex");
    chatBox.find(".tc-msg-box-footer .tc-msg-form").addClass("tc-active");
    this.refreshFns();
}
// Remove Attachemnt
$(document).on("click", ".tc-single-msg-box .tc-attachments .tc-delete-file-btn", function(e) {
    e.preventDefault();
    let id = $(this).parents(".tc-single-file").data('id');
    TCChat.remove("attachment", id);
});
// Clear Attachment
$(document).on("click", ".tc-single-msg-box .tc-attachments .tc-clear-attachments", function(e) {
    e.preventDefault();
    let roomId = $(this).parents(".tc-single-msg-box").attr("data-room-id");
    TCChat.remove("attachments", roomId);
    $(this).parents(".tc-attachments").hide();
    $(this).parents(".tc-msg-box-footer").find(".tc-msg-form").removeClass("tc-active");
})
// Messages Attachments
$(document).on("change", ".tc-single-msg-box .tc-file-input", function() {
    let files = this.files,
        roomId = $(this).parents(".tc-single-msg-box").attr("data-room-id");
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            TCChat.addAttachment(roomId, files[i]);
        }
    }
});
TCChat.getAttachments = function(chatBoxId) {
    let chatBox = $('.tc-single-msg-box[data-user-id="' + chatBoxId + '"]');
    return [];
}
// Search Users
$(document).on("keyup", ".tc-users .tc-search-input", function() {
    let val = $(this).val().toLowerCase(),
        users = $(this).parents(".tc-users").find(".tc-all-users .tc-user");
    users.filter(function() {
        let userName = $(this).find(".tc-user-name").text().toLowerCase();
        $(this).toggle(userName.indexOf(val) > -1);
    })
});
// Send Message
$(document).on("click", ".tc-chat .tc-single-msg-box .tc-send-btn", function() {
    TCChat.sendMessage($(this).parents(".tc-single-msg-box"));
});
// Send Message
$(document).on("keydown", ".tc-chat .tc-single-msg-box .tc-msg-text", function(e) {
    let keyCode = getKeyCode(e);
    if (keyCode === 13) {
        if (!e.shiftKey) {
            e.preventDefault();
            TCChat.sendMessage($(this).parents(".tc-single-msg-box"));
        }
    }
    /*if(keyCode === 8){
        let start = this.selectionStart,
            value = $(this).val(),
            currentValue = value.substr(start - 1, 1);
        if(currentValue === "\n"){
            $(this).css("height", `${height - heightVal}px`);
        }

    }*/
});
$(document).on("keyup", ".tc-chat .tc-single-msg-box .tc-msg-text", function(e) {
    let val = $(this).val(),
        height = 40;
    heightVal = 20;
    val.split("\n").forEach(() => {
        height += heightVal;
    });
    height -= heightVal;
    $(this).css("height", `${height}px`);
});
TCChat.tooTrim = function(str) {
    if (typeof str !== "string") return str;
    str = str.replace(/[\r\n]+/, '\n');
    str = str.replace(/[ \t]+/, ' ');
    str = str.replace(/(  )/, '');
    str = str.trim();
    if (str == " ") str = "";
    return str;
}
TCChat.sendMessage = function(chatBox) {
    let emptyMsg = false;
    if (!this.connected) {
        notifyError("Server is connecting, pls try again");
        return false;
    }
    if (!(chatBox.hasAttr("data-user-id") && chatBox.hasAttr("data-room-id"))) return false;
    let userId = chatBox.attr("data-user-id"),
        roomId = chatBox.attr("data-room-id"),
        msgInput = chatBox.find(".tc-msg-box-footer .tc-msg-text"),
        msg = msgInput.val();
    let tmpMsg = this.tooTrim(msg);
    if (msgInput.length < 1) emptyMsg = true;
    if (tmpMsg.length < 1) emptyMsg = true;
    // Get Attachments
    let attachments = this.get("attachments", roomId);
    if (attachments.length > 0) emptyMsg = false;

    if (emptyMsg) {
        msgInput.focus();
        return false;
    }
    let attachemntData = [];
    attachments.forEach(file => {
        attachemntData.push({
            name: file.name,
            id: file.id
        });
    });
    let msgData = {
            type: "chat",
            msg: msg,
            roomId: roomId,
            attachments: attachemntData
        },
        event = "sendMessage";
    // Edit Message
    if(msgInput.hasAttr("data-edit")){
        msgData.msgId = msgInput.attr("data-edit");
        event = "updateMessage";
    } else if(msgInput.hasAttr("data-reply")){
        msgData.replyMsgId = msgInput.attr("data-reply");
    }
    this.send(event, msgData);
    attachments.forEach(file => {
        TCChat.tmpFiles.push(file)
    });
    TCChat.remove("attachments", roomId);
    TCChat.remove("replyForm", roomId);
    msgInput.removeAttr("data-edit");
    msgInput.val("");
    msgInput.focus();
}
// Update Users Messages Count
TCChat.updateMsgCount = function(roomId, newMsgs = false) {
    let roomBtn = this.get("roomBtn", roomId);
    if (!roomBtn) return false;
    let counter = roomBtn.find(".tc-msg-count"),
        value = toNumber(counter.text().trim());
    if (value) value++;
    else value = 1;
    if(newMsgs !== false) value = newMsgs;
    counter.text(value);
    if (value === 0) counter.addClass("d-none");
    else counter.removeClass("d-none");
    TCChat.update("logo");
}
TCChat.getUnreadCount = function(){
    let unreadMsgs = 0;
    $(".tc-users .tc-user").each(function(){
        let counter = $(this).find(".tc-msg-count"),
            val = toNumber(counter.text());
        if(val){
            if(!counter.hasClass("d-none")){
                unreadMsgs += val;
            }
        }
    });
    return unreadMsgs;
}
// Update Logo
TCChat.updateLogo = function(){
    let unreadMsgs = 0;
    $(".tc-users .tc-user").each(function(){
        let counter = $(this).find(".tc-msg-count"),
            val = toNumber(counter.text());
        if(val){
            if(!counter.hasClass("d-none")){
                unreadMsgs += val;
            }
        }
    });
    let status = unreadMsgs > 0 ? "unread" : "read";
    TCChat.set("favicon", {
        status: status,
        message: `(${unreadMsgs}) new message${unreadMsgs > 1 ? "s" : ""}`
    });
    let togglerCounter = $(".tc-users-toggler .count");
    togglerCounter.text(unreadMsgs);
    if(unreadMsgs > 0) togglerCounter.removeClass("d-none");
    else togglerCounter.addClass("d-none");
}
// Label Users
TCChat.labelUsers = function(roomId, msgData = {}) {
    let chatBox = this.get("chatBox", roomId),
        lastMsgText = '',
        chatBoxId = '';
    if (chatBox.length < 1 || !chatBox.hasClass("tc-current-box") || document.hidden) {
        if (!("msg" in msgData)) return false;
        let { msg, user, room } = msgData;
        lastMsgText = msg.body;
        if (user.id === this.userId) lastMsgText = "Me: " + msg.body;
        chatBoxId = user.id;
        this.updateMsgCount(user.id);
    } else {
        let lastMsg = chatBox.find(".tc-msg-body").last().find(".tc-msg-txt-body");
        lastMsgText = lastMsg.text();
        if (lastMsg.parents(".tc-right-msg").length > 0) lastMsgText = "Me: " + lastMsgText;
        chatBoxId = chatBox.attr("data-user-id");
    }
    let msgText = lastMsgText.substr(0, 20);
    if (lastMsgText.length > 20) msgText += '...';
    $(".tc-users .tc-all-users").each(function() {
        let tcRoom = $(`.tc-users .tc-user[data-user-id="${chatBoxId}"]`);
        tcRoom.find(".tc-user-last-msg").text(msgText);
        $(this).prepend(tcRoom);
    });
    TCChat.update("logo");
}
// Append Message to chat
TCChat.appendMsg = function(data, scrollToBottom = { delay: 0 }) {
    // Upload Attachments
    this.uploadAttachments(data);
    let newMsg = this.getLayout("message", data);
    let chatBox = this.get("chatBox", data.room.id);
    if (chatBox.length < 1) {
        let user = this.get("user", data.user.id);
        if (user) {
            if(user.id !== this.userId)
            this.notify(user.name, data.msg.body, this.dir.userImages + user.image);
        }
        return false;
    }
    chatBox.find(".tc-msg-box-body .tc-all-messages").append(newMsg);
    newMsg = chatBox.find(".tc-msg-box-body .tc-all-messages").find(`.tc-msg-body[data-id="${data.msg.id}"]`);
    if ("afterAppend" in this.callbacks) {
        this.callbacks.afterAppend(newMsg);
    }
    if (scrollToBottom) {
        TCChat.set("goToBottom", {
            element: data.room.id,
            delay: scrollToBottom.delay
        });
    }
    this.labelMsg(data.room.id);
    this.refreshFns();
    if(document.hidden){
        let user = this.get("user", data.user.id);
        if (user) {
            if(user.id !== this.userId)
            this.notify(user.name, data.msg.body, this.dir.userImages + user.image);
        }
    }
    // Set quoted message width
    $(`.tc-single-msg-box .tc-quoted-msg:not(.tc-quoted-msg-active)`).each(function(){
        let qWidth = $(this).find(".tc-reply-msg").get(0).offsetWidth,
            mWidth = $(this).find(".tc-msg-txt").get(0).offsetWidth,
            width = mWidth;
        if(qWidth > width) width = qWidth;
        if(width < 100) width = 100;
        $(this).find(".tc-reply-msg").css("min-width", width + "px");
        $(this).find(".tc-msg-txt").css("min-width", width + "px");
        $(this).addClass("tc-quoted-msg-active");
    });
}
TCChat.updateUsers = function(tcUsers = "") {
    if (tcUsers === "") {
        tcUsers = $(".tc-users .tc-all-users");
    }
    if ($(tcUsers).length < 1) return false;
    $.ajax({
        url: TCChat.dir.controllers + "/TCChat/users",
        type: "POST",
        data: { getUsers: true },
        dataType: "json",
        beforeSend: function() {
            tcUsers.html(TCChat.getLayout("bigLoader"))
        },
        success: function(response) {
            let { status, data } = response,
            html = '';
            if (status === "success") {
                data.forEach(function(user) {
                    html += TCChat.getLayout("user", user);
                    TCChat.add("user", user);
                });
                tcUsers.html(html);
            } else {
                notifyError(data, status);
            }
            TCChat.update("logo");
        },
        error: function() {
            tcUsers.html("No Data Found!");
            notifyError();
        }
    });
}
TCChat.on("thisUser", function(data){
    TCChat.add("user", data);
});
// Socket Init callback
TCChat.initSocket = function(){
    let ip1 = '192.168.100.27',
        ip2 = '192.168.43.216',
        ip4 = '192.168.0.109',
        ip5 = '192.168.0.111',
        ip3 = 'localhost';
    if(this.layout === "inbox"){
        $(".server-connection-btn").show();
    } else {
        $(".server-connection-btn").hide();
    }
    this.socket = new WebSocket("ws://"+ ip4 +":8080?key=" + encodeURI(this.userData.key));
    this.socket.onopen = () => {
        TCChat.connected = true;
        TCChat.send("test", {
            'send': true
        });
        TCChat.socket.onmessage = TCChat.onmessage;
        // Load Reactions
        this.send("getReactionsIcons");
        this.send("getThisUser");
        $(".server-connection-btn").hide();
    }
    // On Close
    this.socket.onclose = function(e){
        setTimeout(() => {
            TCChat.initSocket();
        }, 1000);
    }
    // On Error
    this.socket.onerror = () => {
        //$(".server-connection-btn").html("Unable to connect to the server. Pls <a href=''>refresh</a> the page");
        $(".server-connection-btn").show();
        //notifyError("Unable to connect to the server. Pls refresh the page");
    }
}
// Run tc chat
TCChat.initialized = function() {
    $('body').append(`<div class="server-connection-btn">Connecting....</div>`);
    this.updateUsers();
    $(".server-connection-btn").show();
    // Socket Initialized callback
    this.initSocket();
    // Message notification
    $("body").append(this.getLayout("ring"));
    // Update Messages time
    setInterval(() => {
        $(".tc-single-msg-box .tc-msg-box-body .tc-msg-txt").each(function() {
            if ($(this).hasAttr("data-time")) {
                let time = TCChat.get("msgDate", $(this).attr("data-time"));
                if (this.layout === "popup") {
                    $(this).attr("data-original-title", time);
                    $(this).attr("title", time);
                }
            }
        });
    }, 60000);
    // Initialize Emoji picker
    if (this.is("emojis")) {
        this.emojis.picker = new EmojiButton({
            position: "top-left"
        });
        this.emojis.picker.on("emoji", function(emoji) {
            let input = $(".tc-single-msg-box.tc-current-box").find(".tc-msg-box-footer .tc-msg-text");
            input.val(input.val() + emoji);
            input.focus();
        });
    }
// On Paste
$(document).bind("paste", function(e){
    let activeRoom = $(".tc-single-msg-box.tc-current-box");
    if(activeRoom.length < 1) return false;
    var items = e.originalEvent.clipboardData.items;
    if(items.length > 0){
        for(let i=0; i<items.length; i++){
            let file = items[i].getAsFile();
            if(file)
            TCChat.addAttachment(activeRoom.attr("data-room-id"), file);
        }
    }
});

}
// Reactions Icons
TCChat.on("getReactionsIcons", function(icons) {
    TCChat.icons.reactions = [];
    icons.forEach(icon => {
        TCChat.icons.reactions.push({
            name: icon.name,
            icon: TCChat.dir.icons + icon.file,
            id: icon.id
        });
    })
});
TCChat.on("msgSeen", function(data){
    TCChat.set("msgView", data);
});
// Update Attachement
TCChat.uploadAttachments = function(data) {
    if (!("msg" in data)) return false;
    let msg = data.msg,
        msgId = msg.id,
        attachments = msg.attachments;
    if (attachments.length < 1) return false;

    // Get Files
    let files = [];
    attachments.forEach(file => {
        if("fileId" in file){
            this.tmpFiles.forEach(tFile => {
                if(tFile.id == file.fileId){
                    file.file = tFile;
                    files.push(file);
                }
            });
        }
    });

    // Upload Attachments
    files.forEach(file => {
        tc.upload({
                url: TCChat.dir.controllers + "TCChat/upload",
                data: {
                    uploadMsgAttachment: true,
                    msgId: msgId,
                    fileId: file.id
                },
                files: file.file,
                success: function(response) {
                    if (!isJson(response)) {
                        notifyError("Error file uploading " + file.name);
                        return false;
                    }
                    TCChat.send("fileUploaded", {
                        id: file.id
                    });
                }
        });
    });
}
// New user online
TCChat.on("newUser", function(data) {
    l(data);
});
// Get Online users
TCChat.on("onlineUsers", function(data) {
    l(data);
});
// New Message
TCChat.on("newMessage", function(data) {
    data.msg.body = htmlspecialchars(data.msg.body);
    let { msg, user, room } = data;
    TCChat.appendMsg({
        msg: msg,
        user: user,
        room: room
    }, 200);
    TCChat.labelUsers(room.id, { msg, user, room });
    if (user.id != TCChat.userId) {
        TCChat.ring();
    }
    TCChat.update("msgViews");
});
// Update Message
TCChat.on("updateMessage", function(data){
    data.msg = htmlspecialchars(data.msg);
    let msg = $(`.tc-single-msg-box .tc-msg-body[data-id="${data.msgId}"]`);
    if(msg.length < 1) return false;
    msg.find(".tc-edited-icon").remove();
    msg.find(".tc-msg-txt-body").text(data.msg);
    msg.find(".tc-msg-txt").append(TCChat.getLayout("editedMsg"));
});
// Delete Message
TCChat.on("deleteMessage", function(data){
    let msg = $(`.tc-single-msg-box .tc-msg-body[data-id="${data.msgId}"]`);
    msg.remove();
});
// Reaction on message
TCChat.on("reactOnMsg", function(data) {
    let { msgId, reactionId } = data,
    msg = $(".tc-single-msg-box").find(`.tc-msg-body[data-id="${msgId}"]`);
    if (msg.length < 1) return false;
    TCChat.updateMsgReaction(msg, reactionId);
    TCChat.ring();
});
// on File uploaded
TCChat.on("fileUploaded", function(data){
    let msg = $(`.tc-single-msg-box .tc-msg-body[data-id="${data.msgId}"]`),
        file = msg.find(`.tc-msg-files .tc-single-file[data-id="${data.fileId}"]`);
    if(file.length < 1) return false;
    let fileType = TCChat.get("fileType", data.name);
    if(fileType === "image"){
        file.find(".tc-file-icon").remove();
        file.attr("class", "tc-single-file tc-image-file");
        file.append(TCChat.getLayout("attachemntImage", data));
    }
    file.append(TCChat.getLayout("downloadBtn", data));
    let imagePath = `download?file=${TCChat.dir.uploads + data.filename}&filename=${data.name}`;
    file.find(".attachment-img").attr("src", imagePath);
});
// Start TCChat
TCChat.init = function(data) {
    return new Promise(function(resolve, reject) {
        if (!("userId" in data)) {
            console.error("User id not provided");
            return reject("userId not provided");
        } else {
            TCChat.userId = data.userId
            TCChat.start = true;
            // Set Dirs
            if ("dir" in data) {
                for (let key in data.dir) {
                    let dir = data.dir[key];
                    dir = rtrim(dir, '/');
                    dir += "/";
                    TCChat.dir[key] = dir;
                }
            }
            TCChat.userData = {
                key: data.userKey
            }
            if ("afterAppend" in data) {
                TCChat.callbacks.afterAppend = data.afterAppend;
            }
            if ("layout" in data) TCChat.layout = data.layout;
            $("body").append(`<div class="tc-chat d-none">
                    ${TCChat.getLayout("users")}
                    ${TCChat.getLayout("chats")}
                    ${TCChat.getLayout("forwardBox")}
                </div>`);
            if (TCChat.layout === "popup") $(".tc-chat").addClass("tc-popup-design");
            else $(".tc-chat").removeClass("tc-popup-design d-none");
            TCChat.initialized();
            return resolve(TCChat);
        }
    });
}

let hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}
$(document).on(visibilityChange, function(e){
    if(document.visibilityState === 'visible' ){
        TCChat.update("msgViews");
    }
});
// Messages Options
// Edit Message
$(document).on("click", ".tc-chat .tc-msg-body .tc-msg-txt-body a", function(e){
    e.preventDefault();
    let href = $(this).attr("href");
    window.open(href, "_blank");
});
// Edit Message
$(document).on("click", ".tc-chat .tc-msg-options .tc-option-edit", function(e){
    e.preventDefault();
    let msg = $(this).parents(".tc-msg-body"),
        chatBox = $(this).parents(".tc-single-msg-box"),
        msgForm = chatBox.find(".tc-msg-box-footer .tc-msg-form"),
        input = msgForm.find(".tc-msg-text"), 
        msgId = msg.data('id');
    input.attr("data-edit", msgId);
    input.val(msg.find(".tc-msg-txt-body").text());
    input.focus();
});
// Dismiss Edit
$(document).on("click", ".tc-chat .tc-single-msg-box .tc-msg-box-footer .tc-close-edit-btn", function(e){
    e.preventDefault();
    let chatBox = $(this).parents(".tc-single-msg-box"),
        input = chatBox.find(".tc-msg-box-footer .tc-msg-form .tc-msg-text");
    input.removeAttr("data-edit");
    input.val('');
});
// Copy Message
$(document).on("click", ".tc-chat .tc-msg-options .tc-option-copy", function(e){
    e.preventDefault();
    let msg = $(this).parents(".tc-msg-body"),
        msgBody = msg.find(".tc-msg-txt-body").text();
    copyText(msgBody);
});

// Reply message || Quote Message
$(document).on("click", ".tc-chat .tc-msg-options .tc-option-reply", function(e){
    let msg = $(this).parents(".tc-msg-body"),
        msgValue = msg.find(".tc-msg-txt-body").text(),
        chatBox = $(this).parents(".tc-single-msg-box"),
        footer = chatBox.find(".tc-msg-box-footer"),
        msgForm = footer.find(".tc-msg-form"),
        msgInput = msgForm.find(".tc-msg-text"),
        replyForm = footer.find(".tc-reply-form");
    if(msg.length < 1) return false;

    replyForm.slideDown(100);
    msgValue = TCChat.parseMsg(msgValue);
    replyForm.find(".tc-reply-msg-txt").html(msgValue);
    msgForm.addClass("tc-active");

    msgInput.removeAttr("data-edit");
    msgInput.attr("data-reply", msg.attr('data-id'));
    msgInput.focus();
});
// Close message Reply/quote form
$(document).on('click', '.tc-chat .tc-single-msg-box .tc-reply-form .tc-close-reply-form', function(e){
    e.preventDefault();
    let chatBox = $(this).parents(".tc-single-msg-box");
    TCChat.remove("replyForm", chatBox);
});
// go to quoted Message
$(document).on("click", '.tc-chat .tc-single-msg-box .tc-quoted-msg .tc-reply-msg', function(e){
    e.preventDefault();
    let msgId = $(this).attr("data-id"),
        chatBox = $(this).parents(".tc-single-msg-box .tc-msg-box-body"),
        msg = chatBox.find(`.tc-msg-body[data-id="${msgId}"]`);
    TCChat.scrollTo(msg, chatBox);
    msg.addClass('tc-highlighted');
    setTimeout(() => {
        msg.removeClass("tc-highlighted");
    }, 5000);
});
$(document).on("click", ".tc-chat .tc-single-msg-box .tc-msg-body", function(e){
    e.preventDefault();
    $(this).removeClass("tc-highlighted");
});
// Quote Selected
/*$(document).on("contextmenu", ".tc-chat .tc-single-msg-box .tc-msg-body .tc-msg-txt-body", function(e){
    e.preventDefault();
    e.stopPropagation();
    let msg = $(this).parents(".tc-msg-body"),
        msgOptions = msg.find(".tc-msg-options .dropdown-menu");
    
});*/
// Forward
$(document).on("click", ".tc-chat .tc-msg-options .tc-option-forward", function(e){
    e.preventDefault();
    $(`.tc-chat .tc-forward-box`)
});
// Remove Message
$(document).on("click", ".tc-chat .tc-msg-options .tc-option-remove", function(e){
    e.preventDefault();
    let msg = $(this).parents(".tc-msg-body");
    TCChat.send("deleteMessage", {
        msgId: msg.data("id")
    });
});
