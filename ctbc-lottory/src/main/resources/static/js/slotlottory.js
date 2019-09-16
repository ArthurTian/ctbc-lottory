var eventUid = $("#uid").val();
var userPoolId = $("#usrPool").val();
var pool_list = null;

/**
 * 抽獎進入點
 * @param type
 * @returns
 */
function slot(type) {
	
	$('.modal').modal();
	
	setTimeout(() => {
		$('#prizebody tr').each(function(i, val) {
		var pid = $(val).attr('data-pid');
		var $td, css;
		if (type == "T") {
			$td = $(val).find("td").eq(3);
			css = "success";
		} else {
			$td = $(val).find("td").eq(4);
			css = "secondary";
		}
		// console.log(eventUid + "," + pid + "," + userPoolId + "," + type);

		slotAction($td, css, pid, type);

	});
		$('.modal').modal('toggle');
	}, 500);
}

/**
 * 抽獎動作
 * @param $td
 * @param css
 * @param pid
 * @param type
 * @returns
 */
function slotAction($td, css, pid, type) {
	var result = [];
	// Get Prize Last;
	var pObj = getPrizeDetail(pid, type);
	var i = 0;
	var cnt = pObj.takecnt_last;
	console.log(cnt);
	if(cnt > 0){
		if (pool_list == null) {
			getWinnerPool(pid, type)
		}
		while (i < cnt) {
			var winner = getWinner();
			console.log(winner);
			if (result.indexOf(winner) == -1) {
				result.push(winner);
				$td.append(showWinnerTag(css, winner)); // show result;
				i++;
			}

		}

		for (var y = 0; y < result.length; y++) { // update Winner;
			updateWinner(eventUid, pid, userPoolId, result[y], type)
		}
	}
	pool_list = null;

}
/**
 * 封存
 * @returns
 */
function closeSlot(){
	if (confirm("封存後表示確認抽獎結果，不得再異動抽獎內容與獎項，確定封存？")) {
		$.post("../api/closeEvent", {
			evid: eventUid,
			pool_id:userPoolId
		}, function (rs) {
			if (rs.status) {
				alert("封存完畢！請至『資料匯出』功能匯出抽獎結果。");
				location.reload();
			}
		});
	}
}

/**
 * 更新得獎者
 * @param eventId
 * @param prizeid
 * @param poolId
 * @param keyId
 * @param takeType
 * @returns
 */
function updateWinner(eventId, prizeid, poolId, keyId, takeType) {
	var flag = false;
	$.ajax({
		async : false,
		url : "../api/AddPLWinner",
		method : "post",
		data : {
			'eventId' : eventId,
			'prizeId' : prizeid,
			'poolId' : poolId,
			'keyId' : keyId,
			'takeType' : takeType
		},
		success : function(rs) {
			if (rs.status) {
				flag = true;
			}
		}
	});
	return flag;
}

/**
 * show winner Tag
 * @param type
 * @param keyid
 * @returns
 */
function showWinnerTag(type, keyid) {
	var html = "<span class=\"badge badge-" + type + "\">" + keyid + "</span> ";
	return html;
}

/**
 * get user pool
 * @returns
 */
function getWinner() {
	var list = pool_list;
	var result;
	if (list != null) {
		var h = randomNumber(0, (list.length - 1), list.length); // 2次Random
		if (list.length > h) {
			result = list[h];
		}
	}
	return result;
}

/**
 * get prize detail
 * @param pid
 * @param type
 * @returns
 */
function getPrizeDetail(pid, type) {
	var obj;
	var takecnt_last;
	$.ajax({
		async : false,
		url : "../api/GetPrize",
		data : {
			"evid" : eventUid,
			"pid" : pid
		},
		success : function(rs) {
			console.log(rs);
			if (!rs.status) {
				alert("Lottory Error!");
				return;
			}
			if (type == "T") {
				takecnt_last = rs.data.takecnt - rs.data.take_winner.length;
			} else {
				takecnt_last = rs.data.readycnt - rs.data.ready_winner.length;
			}
			rs.takecnt_last = takecnt_last;
			obj = rs
		}
	});
	return obj;
}
/**
 * Get Winner Pool
 * @param pid
 * @param taketype
 * @returns
 */
function getWinnerPool(pid, taketype) {
	$.ajax({
		url : "../api/GetPLWinnerList",
		async : false,
		data : {
			"eventId" : eventUid,
			"prizeId" : pid,
			"poolId" : userPoolId,
			"taketype" : taketype
		},
		success : function(rs) {
			console.log(rs);
			if (rs.status) {
				pool_list = rs.data;
			}
		},
		error : function(err) {
			alert("取得中獎名單失敗");
		}
	});
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
	return n;
}