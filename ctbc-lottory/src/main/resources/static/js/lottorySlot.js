$target = $('#planeMachine');
var $target_name = $('#userMachine');
var winner = {};
var m1, m2;
var cnt = 0;
var isStop = true;
var $winList = $('#winnerList');
var selectedLastCnt = 0;
var delaySec = 500;


$(function() {
    // get prize list
    getPrizeList();
    $('.p-lastcnt').val($prizeType.find(":selected").attr('data-lastcnt'));
    $prizeType.on('change', function() {
	selectedLastCnt = $(this).find(":selected").attr('data-lastcnt');
	$('.p-lastcnt').val(selectedLastCnt);
	$('#prizeCnt').val(selectedLastCnt);
	var list = getPrizeWinnerList($(this).val(), 0);
	$winList.html('');
	$(list).each(function(i, val) {
//	    console.log(val);
	    appendWinnerList(12, i, val);
	});
    });
});

$(listModal).on('show.bs.modal', function(e) {
    var list = getPrizeWinnerList($prizeType.val(), 0);
    var objHtml = "";
//    console.log(list);
    $('#listmodal-header').text($prizeType.find(":selected").text());
    appendWinnerModal(list, $winModal);
});


$('#playbtn').click(function() {
    if (isStop) { // 停止狀態
	var $elem = $prizeType.find(":selected");
	cnt = 0;
	if ($elem.attr('data-lastcnt') <= 0) {
//	    alert('請選擇可以抽獎的項目');
	    return false;
	}
	isStop = false;
	$('#playbtn').toggleClass("btn-go-active");
	slotgo();
	console.info("Start Slot = " + new Date().timeNow());
    }
});

function slotDestroy(){
    if (m1 != null) {
	m1.stop();
	m1.destroy();
	m1 = null;
	$target.find('div').not("[data-group='default']").remove();
    }
    if (m2 != null) {
	m2.stop();
	m2.destroy();
	m2 = null;
	$target_name.find('div').not("[data-vid='default']").remove();
    }
}

function slotgo() {
	console.info("Slot = " + new Date().timeNow());
    slotDestroy();
    // get user list
    $.ajax({
	async : false,
	url : 'ap/winner',
	data : {
	    getcnt : $('.p-lastcnt').val() * 10,
	    prizeid : $prizeType.val()
	},
	beforeSend : function() {
	    // get group list
	    $.ajax({
		async : false,
		url : 'ap/deplist',
		success : function(val) {
		    $(val).each(function(i, res) {
			var $_div = $('<div/>', {
			    'class' : 'text-center',
			    'html' : '<span>' + res + '</span>',
			    'data-group' : res
			});
			$target.append($_div);
		    });
		}
	    });
	},
	success : function(val) {
//	    console.log(val);
	    $(val).each(
		    function(i, res) {
			var $span = $('<div/>', {
			    'class' : 'text-center',
			    'data-vid' : res.userId,
			    'html' : '<span>' + res.depGroup + ' '
				    + res.userName + '</span>'
			});
			$target_name.append($span);
		    });

	    // var randomval = 1;//randomNumber(0, val.length, 1);
	    winner = getWinnerObj(val); // 取得POOL的WINNER
	    runSlot();
	}
    });
}

/*
 * run slot action
 */
function runSlot() {
    delaySec = getDelaySecond(selectedLastCnt); //處理秒數
    console.info("delaySec=" + delaySec);
   
    m1 = $target.slotMachine({
	active : 0,
	delay : (delaySec * 0.9),
	randomize : function() {
	    var val = $target.find('.slotMachineContainer').find(
		    "[data-group='" + winner.department + "']").last().index();
	    if (val > -1) {
		val -= 1;
	    }
	    return val;
	}
    });
    m2 = $target_name.slotMachine({
	active : 0,
	delay : delaySec,
	randomize : function() {
	    var val = $target_name.find('.slotMachineContainer').find(
		    "[data-vid='" + winner.userId + "']").last().index();
	    if (val > -1) {
		val -= 1;
	    }
	    return val;
	}
    });
    m1.shuffle(5);
    m2.shuffle(5, function() {
	$.ajax({
	    async : false,
	    url : 'ap/updateWinner',
	    data : {
		userid : winner.userId,
		prizeid : $prizeType.val(),
		runcnt : (cnt + 1)
	    },
	    success : function(val) {
		if (val > -1) {
		    appendWinnerList(12, cnt, winner);
		}
		cnt++;
	    }
	});
	reloadPrizeCount('prizelist');
	var prizeLastCnt = $prizeType.find(':selected').attr('data-lastcnt');
	if (prizeLastCnt > 0 && cnt < $('#prizeCnt').val() && !isStop) {
	    setTimeout(function() { slotgo(); }, 200);
	} else {
	    isStop = true;
	    setTimeout(function() {
		$('#playbtn').toggleClass("btn-go-active");
		$(listModal).modal();
		slotDestroy();
		console.info("End Slot = " + new Date().timeNow());
	    }, 500);
	}
    });
}


function getDelaySecond(v){
    var result = 70;
    result = 3000 / v;
    if(result < 70) result = 70;
    return result;
}