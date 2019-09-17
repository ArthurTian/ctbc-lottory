//For the time now
Date.prototype.timeNow = function() {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":"
	    + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":"
	    + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

var $prizeType = $('#prize_type'); // select bar DOM
var $winModal = $('#listmodal-body');
var listModal = $('#listmodal');

$(document).keypress(function(e) {
    console.log(e.which);
    e.preventDefault();
    switch (e.which) {
    case 13:
	// $('#playbtn').addClass("btn-go-active");
	setTimeout(function() {
	    $('#playbtn').click();
	}, 300);
	break;
    case 112: // keyboard: p
	$(listModal).modal('toggle');
	// $("#winbtn").click();
	break;
    case 120: // keyboard: x
	if (!isStop) {

	}
	break;
    }
});

$(listModal).on('hidden.bs.modal', function(e) {
    console.log('hide.bs.modal');
    if ($winModal.data('cycle.API') != null) {
	$winModal.cycle('destroy');
    }
});

/**
 * get prize list
 * 
 * @returns
 */
function getPrizeList() {
    $.ajax({
	url : 'ap/prizelist',
	data : {
	    level : $('#prizelv').val()
	},
	success : function(result) {
	    $(result).each(function(i, val) {
		$prizeType.append($('<option/>', {
		    value : val.PRIZEID,
		    text : val.PRIZE_NAME + '，共' + val.TOTAL + '名',
		    'data-lastcnt' : val.lastcnt,
		}));
	    });
	}
    });
}

/**
 * 取得得獎者名單
 * 
 * @param prizeId
 * @returns
 */
function getPrizeWinnerList(prizeId) {
    return getPrizeWinnerList(prizeId, null);
}
function getPrizeWinnerList(prizeId, status) {
    var elem;
    $.ajax({
	async : false,
	type : 'post',
	url : 'ap/prizelog',
	data : {
	    prizeid : prizeId,
	    status : status
	},
	success : function(result) {
	    elem = result;
	}
    });
    return elem;
}

/**
 * 
 * @returns
 */
function reloadPrizeCount(str) {
    var $elem = $('#prize_type :selected');
    $.ajax({
	async : false,
	url : 'ap/' + str,
	data : {
	    prizeid : $elem.val()
	},
	success : function(result) {
	    console.log("reloadPrizeCount--" + JSON.stringify(result));
	    $(result).each(function(i, val) {
		$elem.attr('data-lastcnt', val.lastcnt);
		$('.p-lastcnt').val($elem.attr('data-lastcnt'));
	    });
	}
    });
    return true;
}

/**
 * 寫入看版
 * 
 * @param obj
 * @returns
 */
function appendWinnerList(type, i, obj) {
    if (obj != null && obj != undefined) {
	var txt = "<h3> " + obj.userId + ' ' + obj.department + '  '
		+ obj.depGroup + ' ' + "</h3>";
	var user = "<h1>" + obj.userName
		+ (obj.isOff == 'Y' ? '<span class="h5">(公假)</p>' : '')
		+ "</h1>"
	var html = "<span class='badge  bg-color'>"
		+ pad2Str((i + 1).toString(), 2) + "</span>";

	html = html + txt + user;
	if (obj.status == "1") {
	    txt += " (未領獎)";
	}
	var $apObj = $('<p/>', {
	    value : obj.userId,
	    html : html,
	    'class' : 'col-12',
	});
	$winList.append($apObj);
    }
    $winList[0].scrollTop = $winList[0].scrollHeight - $winList[0].clientHeight;
}

/**
 * 寫入MODAL
 * 
 * @param list
 * @param $modal
 * @returns
 */
var modalRepeat = null;
var slick = null;
function appendWinnerModal(list, $modal) {
    // var list = getPrizeWinnerList($prizeType.val());
    var objHtml = "";
    var more5size = (list.length > 12);
    $(list).each(function(i, obj) {
			var html = "<div class='col-2 col-table' >"
				+ "<div class='card bg-color'>"
				+ "<div class='card-body'>";

			if (obj.depGroup == '')
			    obj.depGroup = obj.department;

			// Index & group
			html += "<p class='p-0 mb-0 "
				+ (more5size ? "txt-title-s" : "txt-title")
				+ "'>";
			html += "<span class='badge bg-yellow'>";
			html += pad2Str((i + 1).toString(), 2) + "</span> ";
			html += (obj.depGroup.length >= 8 ? obj.depGroup.substring(2): obj.depGroup)
				+ "</p>";

			// ID & NAME
			if (more5size) {
			    html += "<p class='p-0 mb-0'>" + obj.userId
				    + "</p>";
			    html += "<p class='p-0 mb-0 pb-1 text-center'>";
			    html += "<span class='txt-bg'>" + obj.userName;
			    html += (obj.isOff == 'Y' ? '<span class="txt">(公假)</span>'
				    : '');
			    html += "</span></p>";
			} else {
			    html += "<p class='p-0 mb-0 text-center'>";
			    html += "<span class='txt-title-s'>" + obj.userId  + "</span>";
			    html += " <span class='txt-master l-space'>"
				    + obj.userName + "</span>";
			    html += (obj.isOff == 'Y' ? ' <span class="txt">(公假)</span> '
				    : '');
			    html += "</p>";
			}
			html += "</div></div></div>";

			if (list.length > 10) {
			    if (i == 0 || i % 5 == 0) {
				if (i == 0) {
				    objHtml += "<div class='slideblock'>";
				}
				if (i != 0 && i % 20 == 0) {
				    objHtml += "</div><div class='slideblock'>";
				}
				objHtml += "<div class='row'>" + html;
			    } else if (i % 5 == 4) {
				objHtml += html + "</div>";
			    } else {
				objHtml += html;
			    }
			    if ((i + 1) == list.length) {
				objHtml += "</div>";
			    }
			} else if (list.length > 1 && list.length <= 12) {
			    if (i == 0 || i % 3 == 0) {
				objHtml += "<div class='row'>" + html;
			    } else if (i % 3 == 2) {
				objHtml += html + "</div>";
			    } else {
				objHtml += html;
			    }
			} else {
			    objHtml += "<div class='row'>" + html + "</div>";
			}
		    });
    $modal.html(objHtml);

    if (list.length == 1) {
	$winModal.children().find('.col-2').removeClass('col-2').addClass(
		'col-12');
	$winModal.children().find('.h4').removeClass('h4').addClass('h1');
	$winModal.children().find('p').addClass('h4');
    } else if (list.length <= 12) {
	$winModal.children().find('.col-2').removeClass('col-2').addClass('col-4').css('margin-bottom', '10px');
//	$winModal.children().find('p').css('font-size','170%');
//	$winModal.children().find('.txt-bg').css('font-size','200%');
    }
    if (list.length > 20) {
	$winModal.cycle({
	    slides : '>.slideblock',
	    fx : 'scrollVert',
	    speed : 800,
	    manualSpeed : 200,
	    timeout : 3000,
	    autoSelector : false
	});
    }
}

/**
 * 姓名隱碼
 * 
 * @param name
 * @returns
 */
function hashName(name) {
    if (name != null && name != undefined && typeof name == 'string') {
	var len = name.length;
	var str = name.substring(0, 1);
	if (len >= 3) {
	    for (var i = 0; i < name.length - 2; i++) {
		str += 'O';
	    }
	    str += name.substr(name.length - 1);
	} else {
	    str += 'O';
	}
	return str;

    }
}

/**
 * 補0
 * 
 * @param val
 * @param i
 * @returns
 */
function pad2Str(val, i) {
    var valLength = val.length;
    var rtnstr = val;
    if (val.length < i) {
	for (var g = 0; g < (i - valLength); g++) {
	    rtnstr = "0" + rtnstr;
	}
    }
    return rtnstr;
}

/**
 * 取得中獎人
 * 
 * @param obj
 * @returns
 */
function getWinnerObj(obj) {
    var result = null;
    if (obj == null) {
	obj = getWinner();
    }
    var h = randomNumber(0, (obj.length - 1), obj.length); // 2次Random

    if (obj.length > h) {
	result = obj[h];
    }
    return result;
}

/**
 * Random
 * 
 * @param min
 * @param max
 * @param limit
 * @returns
 */
function randomNumber(min, max, limit) {
    var n = Math.floor(Math.random() * (max - min + 1) + min);
    if (n - min > limit) {
	n = n - limit;
    }
    if (n < 0) {
	n = 0;
    }
    // console.log(min + ":" + max + ":" + n +":" + limit);
    return n;
}