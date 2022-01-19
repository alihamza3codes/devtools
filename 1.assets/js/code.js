let panelCount = 0;
// Make Sortable
function makeSortable(){
	$(".sortable").each(function(){
		$(this).sortable();
	});
}
// Add panel
function addPanel(panels, data = ''){
	let $this = $(panels).find(".add-tab-btn");
	let tabs = $this.parents(".tabs"),
		addBtn = tabs.find(".add-tab-btn-drop"),
		titleInput = tabs.find('.tab-title-input'),
		id = "panel" + (++panelCount),
		title = '', value = '';
		if(data === "") title = titleInput.val();
		else {
			title = data.name;
			value = data.value
		}
	if(title.length < 1){
		titleInput.focus();
		return false;
	}
	let label = toCamelCase(title);
	$(`<div class="tab" data-target="#${id}">
			<span class="tab-title tc-element-input" contenteditable>${title}</span>
		    <i class="fas fa-times close-icon"></i>
		</div>`).insertBefore(addBtn);

	// Panel
	panels = $this.parents(".panels");
	panels.append(`<div class="nc-panel" id="${id}">
			<textarea rows="11" class="form-control code-input nc-textarea scrollbar">${value}</textarea>
			<span class="panel-label">${label}.ncx</span>
		</div>`);
	activePanel(`#${id}`);
	titleInput.val('');
	makeSortable();
}
$(document).on("click", ".add-tab-btn", function(e){
	e.preventDefault();
	addPanel($(this).parents(".code-input-panels"));
});
$(document).on("keydown", ".tab-title-input", function(e){
	let keyCode = getKeyCode(e);
	if(keyCode === 13){
		addPanel($(this).parents(".code-input-panels"));
	}
});
callBackFunctions.addPanel = ($this) => {
	$this.parent().find('.add-tab-btn').trigger("click");
}
// Active a panel
function activePanel(id){
	let tab = $(`.tab[data-target="${id}"]`),
		panels = tab.parents(".panels");
	panels.find('.tab.active').removeClass("active");
	panels.find(".nc-panel.active").removeClass("active");

	tab.addClass("active");
	$(`${id}`).addClass('active');
	//$(`${id}`).find(".code-input").focus();
}
$(document).on("click", ".panels .tab", function(e){
	e.preventDefault();
	activePanel($(this).data('target'));
});
// Remove Panel
$(document).on("click", ".panels .tab .close-icon", function(e){
	e.preventDefault();
	let tab = $(this).parents(".tab"),
		parent = $(this).parents(".panels"),
		target = tab.data('target');
	$(target).remove();
	tab.remove();
});

// Replace Components
function mergeComp(code, comps){
	let div = $('<div></div>');
	comps.forEach(item => {
		div.find(item.name).each(function(){
			$(item.value).insertBefore($(this));
			$(this).remove();
		});
	})
}





/*-----------------------------------------------------------------
	Get Matches From String Start (By Software Engineer Hammad)
------------------------------------------------------------------*/
  function getFromToSubstrIdx(str_array, startIndex, delim)
{
    let idx = startIndex,
        end_index = 0,
        first_char = delim[0];
    while (true) {
        char = str_array[idx];
        if (char == first_char) {
            break;
        }
        end_index++;
        idx++;
    }
    return end_index;
}

function getVariableName(str, index, needle_len, delim_end)
{
    let variableArray = [],
      str_array = str.split(''),
      startIndex = index + needle_len,
      endIndex = startIndex + getFromToSubstrIdx(str_array, startIndex, delim_end);
    let i = 0;
    for (i = startIndex; i < endIndex; i++) {
        variableArray.push(str_array[i]);
    }
    return {
    	start: index,
    	end: endIndex + delim_end.length,
    	match: variableArray.join('')
    };
}
// Function to get varibales from string
function getAllMatches(str, delim_start = "{{", delim_end = "}}")
{
    let positions = [],
      matches = [],
      lastPos = 0,
      delm_len = delim_start.length,
      isFound = true;
    while (isFound) {
        lastPos = str.indexOf(delim_start, lastPos);
        if(lastPos === -1){
          isFound = false;
        } else {
          positions.push(lastPos);
          lastPos += delm_len;
        }
    }
    positions.forEach(pos => {
    	matches.push(getVariableName(str, pos, delm_len, delim_end))
    })
    return matches;
}
/*-----------------------------------------------------------------
	Get Matches From String Start (By Software Engineer Hammad)
------------------------------------------------------------------*/















// Find componment from item
function parseComp(html, comps){
	let found = false;
	comps.forEach(item => {
		let matches = getAllMatches(html, `<${item.name}>`, `</${item.name}>`);
		matches.forEach(match => {
			found = true;
			let str = html.split('');
			str.splice(match.start, match.end - match.start, item.value);
			html = str.join('');
			//html = html.substring(0, match.start) + item.value + html.substring(match.start, match.end);
		});
	});
	return {
		parsed: found,
		html: html
	};
}

// Get code of user
function getCode(){
	let data = [];
	$(".code-card").each(function(){
		let cardName = $(this).find(".card-name").text(),
			comps = [];
		$(this).find(".tabs .tab").each(function(){
			let panel = $($(this).data("target"));
			comps.push({
				name: $(this).find(".tab-title").text(),
				value: panel.find(".code-input").val()
			});
		});
		data.push({
			card: cardName,
			comps: comps
		});
	});
	return data;
}

// Preview Code Input
$(".code-input-preview").on("click", function(){
	let data = getCode();

	
	localStorage.setItem("ncCode", JSON.stringify(data));

	let code = '';

	data.forEach(card => {
		let comps = card.comps;
		let comp = comps[0];
		comps.splice(0, 1);


		let parsing = true, i = 0;
		do{
			let {parsed, html} = parseComp(comp.value, comps);
			parsing = parsed;
			comp.value = html;
		}while(parsing);

		code += comp.value;
	});

	var iframe = document.createElement('iframe'),
		site_url = 'http://localhost/nancy/';
	var html = `
	<html>
		<head>
			<meta charset="UTF-8">
	    	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	    	<title>Code - Nancy</title>
	        <link rel="icon" href="${site_url}images/design/logo/3.png" id="favicon">
		    <link rel="stylesheet" href="${site_url}assets/css/fonts.css">
		    <link rel="stylesheet" href="${site_url}assets/css/bootstrap.min.css">
		    <link rel="stylesheet" href="${site_url}assets/css/swiper.min.css">
		    <link rel="stylesheet" href="${site_url}assets/css/lightbox.min.css">
		    <link rel="stylesheet" href="${site_url}assets/css/jquery.dataTables.min.css">
		    <link rel="stylesheet" href="${site_url}assets/css/classes.css?v=1.0">
		    <link rel="stylesheet" href="${site_url}assets/css/chat.css?v=1.2">
		    <link rel="stylesheet" href="${site_url}assets/css/style.css">
			<link rel="stylesheet" href="${site_url}assets/css/chat-box.css">

			
			<script src="${site_url}assets/js/jquery.min.js"></script>
			<script src="${site_url}assets/js/jquery-ui.min.js"></script>
			<script src="${site_url}assets/js/popper.min.js"></script>
			<script src="${site_url}assets/js/bootstrap.min.js"></script>
			<script src="${site_url}assets/js/jquery.dataTables.min.js"></script>
			<script src="${site_url}assets/js/swiper.min.js"></script>
			<script src="${site_url}assets/js/sweetalert.min.js"></script>
			<script src="${site_url}assets/js/moment.min.js"></script>
			<script src="${site_url}assets/js/lightbox.min.js"></script>
			<script src="${site_url}assets/js/functions.js"></script>
			<script src="${site_url}assets/js/tc-file-upload.js"></script>
		</head>
		<body>
			${code}
		</body>
	</html>`;
	iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
	$(iframe).css({
		width: "100%",
		height: "500px",
		border: "1px solid #fff2"
	});
	$(".container").last().prepend(iframe);

});
// Load Code
function loadCode(codes){
	codes.forEach((item) => {
		let card = addCodeCard(item.card);
		item.comps.forEach(comp => {
			addPanel(card, comp);
		})
	});
}


$(document).ready(function(){
	let codes = localStorage.getItem("ncCode");
	if(codes){
		loadCode(JSON.parse(codes))
	}
});


function addCodeCard(cardName = 'Code', comps = []){
	let html = `    <div class="card folding-card p-0 mb-5 code-card">
        <div class="card-header cp pull-away">
            <div>
                <span class="tc-element-input card-name">${cardName}</span>
            </div>
            <i class="fas fa-times cp removeParent" data-target=".code-card"></i>
        </div>
        <div class="card-body">
            <div class="panels nc-border code-input-panels">
                <div class="tabs sortable">
                    <div class="dropdown add-tab-btn-drop" data-focus=".tab-title-input">
                        <div class="tab-btn" data-toggle="dropdown">
                            <i class="fas fa-plus" title="Add Component"></i>
                        </div>
                        <div class="dropdown-menu border-0" nc-style="bg-t;w-200">
                            <div class="align-center">
                                <input type="text" class="form-control full-border tab-title-input py-1 px-1" onenter="addPanel">
                                <span class="add-tab-btn">
                                    <i class="fas fa-check"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    $(".code-cards-con").append(html);
    let card = $(".code-cards-con").find(".code-card").last();
	let nameInput = card.find(".card-name");
	$wait(200).then(() => {nameInput.focus();})
	refreshFns();
	return card;
}
$(document).on("click", ".add-code-card", function(){
	addCodeCard();
});

// Save Code
$(document).on("click", ".code-save-btn", function(e){
	e.preventDefault();
	let title = $(".code-title").val(),
		code = JSON.stringify(getCode()),
		data = {
			saveCode: true,
			title, code
		};
		if(title.length < 1){
			$(".code-title").focus();
			return false;
		}
	$.ajax({
		url: "controllers/codes/code",
		type: "POST",
		data: data,
		dataType: "json",
		success: function(res){
			if(res.status === "success"){
				sAlert(res.data, res.status);
			} else {
				sAlert(res.data, res.status);
			}
		},
		error: function(){
			makeError();
		}
	});
})