var eventUid = $("#uid").val();
var userPoolId = $("#usrPool").val();
var isDone = true;
$(function () {
	var status = $('#status').val();
	if (status != '') {
		if (status == '1') {
			alert("重設成功");
		} else if (status == '2') {
			alert("無資料可刪除");
		} else {
			alert("重設失敗");
		}
		$("#status").val("");
		location.search = "";
	}

	/**
	 * 
	 */
	$("#slotAllBtnP").on("click", function () {
		slotLottory("T");
	});

	$("#slotAllBtnB").on("click", function () {
		slotLottory("R");
	});


	/**
	 * 
	 */
	$("#resetSlotBtn").on("click", function () {
		if (confirm("確定重設？重設後援有抽獎資料將會遺失！")) {
			$("#actionform").attr("action", "/SlotResetAction");
			$("#actionform").submit();
		}
	});

	/**
	 * 封存活動
	 */
	$("#closeEventBtn").on("click", function () {
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
	});
});


function slotLottory(type) {
	$('#prizebody tr').each(function (i, val) {
		var pid = $(val).attr('data-pid');
		var $td, css;
		if (type == "T") {
			$td = $(val).find("td").eq(3);
			css = "success";
		} else {
			$td = $(val).find("td").eq(4);
			css = "secondary";
		}
		var result = [];
		$.ajax({
			async: false,
			url: "../api/GetPrize",
			data: {
				"evid": eventUid,
				"pid": pid
			}, success: function (rs) {
				if (!rs.status) {
					alert("Lottory Error!");
					return;
				}
				var takecnt_last = 0
				if (type == "T") {
					takecnt_last = rs.data.takecnt - rs.data.take_winner.length;
				} else {
					takecnt_last = rs.data.readycnt - rs.data.ready_winner.length;
				}
				rs.takecnt_last = takecnt_last;
				// console.log(rs);
				result = rs;
			}
		});


		var cnt = 1;
		while (cnt <= result.takecnt_last) {
			
			var winner = getWinner(eventUid, pid, userPoolId, type);
			console.log(cnt + ":" + winner);
			if (winner == null) {
				return;
			}

			if (updateWinner(eventUid, pid, userPoolId, winner.keyid, type)) {
				$td.append(showWinnerTag(css, winner.keyid));
				cnt++;
			}
			
		}


		// $("#loadding").modal('hide');
	});
}



/**
 * 抽獎
 * 
 * @param type
 * @param obj
 * @returns
 */
function slot(prizeUid, type, obj) {
	// var $loading = $(obj).find(".loading-icon");
	// var prizeUid = $(obj).attr("data-pid");
	var takecnt = 0;
	var flag = false;
	$.ajaxSetup({
		async: false
	});
	if (isDone) {
		$.post("../api/GetPrize", {
			"evid": eventUid,
			"pid": prizeUid
		}, function (rs) {
			console.log(rs);
			var winner = null;
			var $td;
			var css;
			if (rs.status) {
				// $loading.show();
				if (type == 'T') {
					takecnt = rs.data.takecnt - rs.data.take_winner.length;
					$td = $(obj).find("td").eq(3);
					css = "success";
				} else {
					takecnt = rs.data.readycnt - rs.data.ready_winner.length;
					$td = $(obj).find("td").eq(4);
					css = "secondary";
				}
				var i = 0;
				console.log(takecnt);
				if (takecnt <= 0) {
					// $loading.hide();
					// $(obj).prop("disabled", true);
					return false;
				}
				console.log(isDone);

				var app = setInterval(function () {
					isDone = false;
					winner = getWinner(eventUid, prizeUid, userPoolId, type);
					if (winner == null) {
						window.clearInterval(app);
						// $loading.hide();
						// $(obj).prop("disabled",
						// true);
						// isDone = true;
						return;
					}
					if (updateWinner(eventUid, prizeUid, userPoolId,
						winner.keyid, type)) {
						$td.append(showWinnerTag(css, winner.keyid));
						i++;
						if (i >= takecnt) {
							window.clearInterval(app);
							// $loading.hide();
							// $(obj).prop("disabled",
							// true);
							// isDone = true;
						}
					} else {
						window.clearInterval(app);
						// $loading.hide();
						// $(obj).prop("disabled",
						// true);
						// isDone = true;
					}
				}, 250);

			}
		});
	}
}

function showWinnerTag(type, keyid) {
	var html = "<span class=\"badge badge-" + type + "\">" + keyid + "</span> ";
	return html;
}

// eventId, poolId, keyId, takeType
function updateWinner(eventId, prizeid, poolId, keyId, takeType) {
	var flag = false;
	$.ajax({
		async: false,
		url: "../api/AddPLWinner",
		method: "post",
		data: {
			'eventId': eventId,
			'prizeId': prizeid,
			'poolId': poolId,
			'keyId': keyId,
			'takeType': takeType
		},
		success: function (rs) {
			if (rs.status) {
				flag = true;
			}
		}
	});
	return flag;
}

/**
 * 
 * @param eventId
 * @param poolId
 * @returns
 */
function getWinner(eventId, prizeId, poolId, taketype) {
    console.log({eventId, prizeId, poolId, taketype});
	var list = null;
	$.ajax({
		url: "../api/GetPLWinnerList",
		async: false,
		data: {
			"eventId": eventId,
			"prizeId": prizeId,
			"poolId": poolId,
			"taketype": taketype
		},
		success: function (rs) {
			if (rs.status) {
				list = rs.data;
			}
		},
		error: function (err) {
			alert("取得中獎名單失敗");
		}
	});
	var result = null;
	if (list != null) {
		var h = randomNumber(0, (list.length - 1), list.length); // 2次Random
		if (list.length > h) {
			result = list[h];
		}
	}
	return result;
	// return list[0];
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