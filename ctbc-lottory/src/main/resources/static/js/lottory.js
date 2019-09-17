var $winList = $('#winnerList');
var $winModal = $('#listmodal-body');
var isStop = true;


$(function() {
	getPrizeList();
	$('.p-lastcnt').val($prizeType.find(":selected").attr('data-lastcnt'));

	$prizeType.on('change', function() {
		var selectedLastCnt = $(this).find(":selected").attr('data-lastcnt');
		$('.p-lastcnt').val(selectedLastCnt);
		$('#prizeCnt').val(selectedLastCnt);
		var list = getPrizeWinnerList($(this).val());
		console.log(list);
		$winList.html('');
		$winModal.html('');
		$(list).each(function(i, val) {
			console.log(i + "," + val);
			appendWinnerList(6, i, val);
		});
	});

});

var app = null;
$('#playbtn').click(function() {
	console.log(isStop);
	if (isStop) {// 停止狀態
		$('#playbtn').addClass("btn-go-active");
		if (goPlay()) {
			isStop = false;
// $(this).text('STOP!');
		}
	} else {
//		isStop = true;
//		if (app != null) {
//			window.clearInterval(app);
//		}
//		$('#playbtn').removeClass("btn-go-active");
//// $(this).html('GO! <i class="fa fa-hand-o-up"></i>');
//		$('#prizeCnt').val($prizeType.find(":selected").attr('data-lastcnt'));
	}
});

function getWinner() {
	var elem;
	$.ajax({
		async : false,
		url : 'ap/winner',
		data : {
			getcnt : $('.p-lastcnt').val() * 3,
			prizeid : $prizeType.val()
		},
		success : function(result) {
			elem = result;
		}
	});
	return elem;
}

/**
 * 啟動抽獎
 * 1.取得winner pool = count * 10
 * 2.randem pool index
 * 3.get winner!
 * @returns
 */
function goPlay() {
	var i = 0;
	var prizeCnt = $('#prizeCnt').val();
	var msec = (prizeCnt > 10 ? (10*1000 / prizeCnt) : 500); //若大於10個，八秒內抽完，其他每個0.5秒
	var $elem = $prizeType.find(":selected");
	
	if ($elem.attr('data-lastcnt') <= 0) {
		alert('請選擇可以抽獎的項目');
		$('#playbtn').toggleClass("btn-go-active");
		return false;
	}
	$winList.html('');
	var winObj;
	var h = 0;
	app = setInterval(function() {
//		winObj = getWinner();
//		h = randomNumber(0, (winObj.length - $('#prizeCnt').val()),winObj.length); //2次Random
		winObj = getWinnerObj(null); //取得得獎者
		updateWinner(i, winObj);
		reloadPrizeCount('prizelist');
		i++;
		if (i >= prizeCnt) {
			console.log("stop!");
			window.clearInterval(app);
			isStop = true;
			$('#playbtn').toggleClass("btn-go-active");
			$('#prizeCnt').val($prizeType.find(":selected").attr('data-lastcnt'));
			setTimeout(function() {
				$(listModal).modal();
			}, 500);
		}
	}, msec);
	return true;
}


$(listModal).on('show.bs.modal',function(e){
	console.log('show.bs.modal - lottory');
	var list = getPrizeWinnerList($prizeType.val());
	var objHtml = "";
	appendWinnerModal(list, $winModal);
	$('#listmodal-header').text($prizeType.find(":selected").text());
});


// $('#winbtn').click(function() {
// var list = getPrizeWinnerList($prizeType.val());
// var objHtml = "";
// console.log(list);
//	
// appendWinnerModal(list, $winModal);
//
// $('#listmodal-header').text($prizeType.find(":selected").text());
//
//
// // //五個屬性各別是：外面div的id名稱、包在裡面的標籤類型
// // //延遲毫秒數、速度、高度
// // slideLine('listmodal-body','div',1000,5,168);
//
// });

//function slideLine(box, stf, delay, speed, h) {
//	// 取得id
//	var slideBox = document.getElementById(box);
//	// 預設值 delay:幾毫秒滾動一次(1000毫秒=1秒)
//	// speed:數字越小越快，h:高度
//	var delay = delay || 1000, speed = speed || 20, h = h || 20;
//	var tid = null, pause = false;
//	// setInterval跟setTimeout的用法可以咕狗研究一下~
//	var s = function() {
//		tid = setInterval(slide, speed);
//	}
//	// 主要動作的地方
//	var slide = function() {
//		// 當滑鼠移到上面的時候就會暫停
//		if (pause)
//			return;
//		// 滾動條往下滾動 數字越大會越快但是看起來越不連貫，所以這邊用1
//		slideBox.scrollTop += 1;
//		// 滾動到一個高度(h)的時候就停止
//		if (slideBox.scrollTop % h == 0) {
//			// 跟setInterval搭配使用的
//			clearInterval(tid);
//			// 將剛剛滾動上去的前一項加回到整列的最後一項
//			slideBox.appendChild(slideBox.getElementsByTagName(stf)[0]);
//			// 再重設滾動條到最上面
//			slideBox.scrollTop = 0;
//			// 延遲多久再執行一次
//			setTimeout(s, delay);
//		}
//	}
//	// 滑鼠移上去會暫停 移走會繼續動
//	slideBox.onmouseover = function() {
//		pause = true;
//	}
//	slideBox.onmouseout = function() {
//		pause = false;
//	}
//	// 起始的地方，沒有這個就不會動囉
//	setTimeout(s, delay);
//}

function updateWinner(i, obj) {
	$.ajax({
		async : false,
		url : 'ap/updateWinner',
		data : {
			userid : obj.userId,
			prizeid : $prizeType.val(),
			runcnt : (i + 1)
		},
		success : function(val) {
			if (val > -1) {
				appendWinnerList(6, i, obj);
			}
		}
	});
}