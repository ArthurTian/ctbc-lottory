var isStop = true;
var $winList = $('#winnerList .row');
var $winModal = $('#listmodal-body');
var lastStr = '';
var winner = {};
var app = null;

$(function() {
    // get Table Prize List
    $.post('ap/table.prizelist', {
	level : $('#prizelv').val()
    }, function(result) {
	$(result).each(function(i, val) {
	    $prizeType.append($('<option/>', {
		value : val.PRIZEID,
		text : val.PRIZE_NAME,
		'data-lastcnt' : val.lastcnt,
		'data-group' : val.MEMO
	    }));
	});
    });
});


$('#playbtn').click(function(){goPlay();});


$("#stopbtn").on("click",function(){
    if(isStop!=null && !isStop){
	isStop = true;
	$("#stopbtn").hide();
    }
});



function goPlay() {
    var i = 1;
    var prizeCnt = $('#prizeCnt').val();
    var $elem = $prizeType.find(":selected");
    if (isStop) { // 停止狀態
	var $elem = $prizeType.find(":selected");
	cnt = 0;
	if ($elem.attr('data-lastcnt') <= 0) {
	    alert('請選擇可以抽獎的項目');
	    return false;
	}
	isStop = false;
	$('#playbtn').toggleClass("btn-go-active");
	slotgo();
	$("#stopbtn").show();

    }
}


var m1;
var $target = $('#tableMachine');
function slotDestroy() {
    if (m1 != null) {
	m1.stop();
	m1.destroy();
	m1 = null;
	$target.find('div').not("[data-vid='default']").remove();
    }
}

function slotgo() {
    slotDestroy();
    // get table list
    $.ajax({
	async : false,
	url : 'ap/table.win',
	data : {
	    gp : $prizeType.find(':selected').attr('data-group')
	},
	success : function(val) {
	    console.log(val);
	    $(val).each(function(i, res) {
		var $span = $('<div/>', {
		    'class' : 'text-center',
		    'data-vid' : res.TBID,
		    'html' : '<span>' + res.TBID + '</span>'
		});
		$target.append($span);
	    });
	    winner = getWinnerObj(val); // 取得POOL的WINNER
	    console.log(winner);
	    runSlot();
	}
    });
}

/*
 * run slot action
 */
var cnt = 0;
function runSlot() {
    var ltCnt = $('#prizeCnt').val();
    var delayM1 = 100;
    m1 = $target.slotMachine({
	active : 0,
	delay : delayM1,
	randomize : function() {
	    console.log($target.find('.slotMachineContainer'));
	    var val = $target.find('.slotMachineContainer').find("[data-vid='" + winner.TBID + "']").last().index();
	    if (val > -1) {
		val -= 1;
	    }
	    return val;
	}
    });
    m1.shuffle(5, function() {
	updateTableWinner(cnt + 1, winner);
	reloadPrizeCount('table.prizelist');
//	console.log($prizeType.find(':selected').attr('data-lastcnt') + ":"
//		+ ($prizeType.find(':selected').attr('data-lastcnt') > 0));
	if (($prizeType.find(':selected').attr('data-lastcnt') > 0)
		&& cnt < $('#prizeCnt').val() && !isStop) {
	    setTimeout(function() {
		slotgo();
	    }, 200);
	} else {
	    isStop = true;
	    $("#stopbtn").hide();
	    setTimeout(function() {
		$('#playbtn').toggleClass("btn-go-active");
		$(listModal).modal();
		slotDestroy();
	    }, 500);
	}
    });
}


function getTableWinner() {
    var elem;
    $.ajax({
	async : false,
	url : 'ap/table.win',
	data : {
	    gp : $prizeType.find(':selected').attr('data-group')
	},
	success : function(result) {
	    console.log(result);
	    elem = result;
	}
    });
    return elem;
}

$prizeType.change(function() {
    $winList.html('');
    var selectedLastCnt = $(this).find(":selected").attr('data-lastcnt');
    var list = getLog();
    $(list).each(function(i, res) {
	appendWinnerTableList(res);
    });
    $('#prizeCnt').val(selectedLastCnt);
    $('.p-lastcnt').val(selectedLastCnt);

});

$(listModal).on('show.bs.modal', function(e) {
    var list = getLog();
    var objHtml = "";
    console.log(list);
    appendWinnerModalTable(list, $winModal);
});

function getLog() {
    var list = null;
    $.ajax({
	async : false,
	url : 'ap/table.win.log',
	data : {
	    prizeid : $prizeType.val()
	},
	success : function(val) {
	    list = val;
	}
    });
    return list;
}


/**
 * 寫入看版
 * 
 * @param obj
 * @returns
 */
function appendWinnerTableList(obj) {
    console.log("appendWinnerTableList--" + JSON.stringify(obj));
    if (obj != null && obj != undefined) {
	var txt = obj.TBID + ' 桌';
	var $apObj = $('<span/>', {
	    value : obj.userId,
	    text : txt,
	    'class' : 'col-3 table-winbox badge bg-color mb-3 mr-2 ml-2 '
	});
	$winList.append($apObj);

    }
    $winList.parent()[0].scrollTop = $winList.parent()[0].scrollHeight
	    - $winList.parent()[0].clientHeight;
}

/**
 * 寫入MODAL
 * 
 * @param list
 * @param $modal
 * @returns
 */
function appendWinnerModalTable(list, $modal) {
    $winModal.html("");
    var objHtml = "";
    $(list).each(
	    function(i, obj) {
		var html = "<div class='col-2 col-table'>"
			+ "<div class='card card-table text-white bg-color '>"
			// + "<div class='card-header'>" + (i + 1) + "</div>"
			+ "<div class='card-body'>"
			+ "<h4 class='table-modal-h'>" + obj.TBID + "桌</h4>"
			+ "</div>" + "</div></div>";

		if (i == 0 || i % 5 == 0) {
		    if (i == 0) {
			objHtml += "<div class='slideblock'>";
		    }
		    if (i != 0 && i % 12 == 0) {
			objHtml += "</div><div class='slideblock'>";
		    }
		    objHtml += "<div class='row'>" + html;
		} else if (i % 5 == 4) {
		    objHtml += html + "</div>";
		} else {
		    objHtml += html;
		}
	    });

    $modal.html(objHtml);
    if (list.length > 12) {
	$winModal.cycle({
	    slides : '>.slideblock',
	    fx : 'scrollVert',
	    speed : 800,
	    manualSpeed : 200,
	    timeout : 4000,
	    autoSelector : false
	});
    }
}

function updateTableWinner(i, obj) {
    console.log(i + "--" + JSON.stringify(obj));
    $.ajax({
	async : false,
	url : 'ap/table.win.update',
	data : {
	    tbgroup : obj.TBGROUP,
	    tbid : obj.TBID,
	    runcnt : i,
	    prizeid : $prizeType.val()
	},
	success : function(val) {
	    if (val > -1) {
		appendWinnerTableList(obj);
	    }
	    cnt++;
	}
    });
}
