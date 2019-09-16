var $table;
var detailBtn = $('<button/>', {
	text : '詳細資料',
	'class' : 'btn btn-sm btn-primary',
	onclick : 'edit(this);'
});

var slotBtn = $('<button/>', {
	text : '抽獎作業',
	'class' : 'btn btn-sm btn-success',
	onclick : 'lottory(this);'
});

var deleteBtn = $('<button/>', {
	text : '刪除資料',
	'class' : 'btn btn-sm btn-danger',
	onclick : 'del(this);'
});
$(function() {
	$table = $('#maintable')
			.DataTable(
					{
						ajax : {
							url : 'api/events.all',
							dataSrc : ''
						},
						columns : [
								{
									data : function(row, type, val, meta) {
										return "<span data-uid='" + row.uid
												+ "'>" + row.eventId
												+ "</span>";
									}
								},
								{
									data : 'eventName'
								},

								{
									data : 'usrPoolObj.poolcnt'
								},
								{
									data : 'usrPoolObj.summary'
								},
								{
									data : 'prizeNameList'
								},
								{
									data : function(row, type, val, meta) {
										if (row.incase == 'N') {
											return "<span class='text-danger'>已封存，請至資料匯出產出報表</span>";
										} else {
											return detailBtn[0].outerHTML + ' '
													+ slotBtn[0].outerHTML
													+ ' '
													+ deleteBtn[0].outerHTML
										}
									}
								} ]
					});
});

$("#addnewprize").on("click", function() {
	var $row = genPrizeRow("Y", "", "0", "0");
	$("#prizeTable > tbody:last").append($row);
});

$('form[name=editform]').on(
		'submit',
		function() {
			var take = $("[name=takecnt]");
			var ready = $("[name=ready]");
			var total = 0;
			$(take).each(function() {
				total += parseInt($(this).val());
			});
			$(ready).each(function() {
				total += parseInt($(this).val());
			});
			console.log(total);
			var selectPoolCnt = parseInt($("[name=usrPool] option:selected")
					.attr("data-cnt"));
			console.log(selectPoolCnt);
			if (total > selectPoolCnt) {
				// if(!confirm("獎項抽出人數 大於 抽獎箱 人數，確定設定？")){
				alert("獎項抽出人數 大於 抽獎箱 人數");
				return false;
				// }
			}
			$.ajax({
				async : false,
				url : 'api/events.update',
				data : $('form[name=editform]').serialize(),
				beforeSend : function() {
					console.log($('form[name=editform]').serialize());
					$('.loading-icon').show();
				},
				success : function(rs) {
					console.log(rs);
					if (rs.status) {
						alert('更新成功! ');
					} else {
						alert('更新失敗!');
					}

				},
				complete : function() {
					$('.loading-icon').hide();
					$('#editmModal').modal('hide');
					$table.ajax.reload();
				}
			});

			return false;
		});

$("#insertBtn").on("click", function() {
	var $form = $('#editmModal form[name=editform]');
	$('#uploadfile').show();
	$('#import-info').text('');
	$form.find("input").val("");
	$form.find('#uid').text("自動新增");
	$form.find('[name=uid]').val(0);
	$('.haspool').hide();
	$("#prizeTable > tbody").html("");
	getprizePool("");
	$form.find("[name=slottype] option[value='']").prop("selected", true);
	$('#editmModal').modal();
});

function edit(obj) {
	var $data = $(obj).parents('tr').find('span');
	$.ajax({
		url : 'api/events',
		data : {
			'uid' : $data.attr("data-uid")
		},
		success : function(rs) {
			console.log(rs);
			var $form = $('#editmModal form[name=editform]');
			
			$form.find('#uid').text(rs.uid);
			$form.find('[name=uid]').val(rs.uid);
			$form.find('[name=eventId]').val(rs.eventId);
			$form.find('[name=eventName]').val(rs.eventName);
			$form.find("[name=slottype] option[value=" + rs.slottype + "]")
					.prop("selected", true);

			if (rs.incase == 'Y') {
				$form.find("#incaseY").prop("checked", true);
			} else {
				$form.find("#incaseN").prop("checked", true);
			}

			// getprizePool(rs.eventId);
			
			var usrpool_uid = rs.usrPoolObj.uid;
			$("#usrpool_uid").val(usrpool_uid);
			
			if(usrpool_uid != 0) {
				var txt = "抽獎人數：" + rs.usrPoolObj.poolcnt +"筆，筆數：" + rs.usrPoolObj.summary +"筆";
				$('#import-info').text(txt).addClass('text-success').removeClass('text-danger');
				$('#uploadfile').hide();
			}else{
				$('#import-info').text('尚未匯入抽獎名單').toggleClass('text-danger');
				$('#uploadfile').show();
			}
			
			

			$("#prizeTable > tbody").html("");
			$(rs.prizeList).each(
					function(i, elem) {
						$("#prizeTable > tbody:last").append(
								genPrizeRow(elem.pid, elem.evname,
										elem.takecnt, elem.readycnt));
					});
			$('#editmModal').modal();
		}
	});
}

function del(obj) {
	var $data = $(obj).parents('tr').find('span');
	if (confirm("確定刪除？")) {
		$.post("api/events.remove", {
			uid : $data.attr("data-uid")
		}, function(rs) {
			if (rs.status) {
				$table.ajax.reload();
			} else {
				alert("刪除失敗。 ");
			}
		});
	}
}

function delPrize(elem) {
	var tr = $(elem).parents('tr');
	var evid = $("[name=uid]").val();
	var pid = $(elem).attr("data-pid");
	var msg = "";
	if (pid != "Y") {
		$.post("api/prize.remove", {
			"evid" : evid,
			"pid" : pid
		}, function(rs) {
			if (rs.status) {
				$("#prizeTable tbody").find(tr).remove();
				$table.ajax.reload();
			} else {
				alert("刪除失敗。 ");
			}
		});
	} else {
		$("#prizeTable tbody").find(tr).remove();
	}
}

function getprizePool(uid) {
	$.post("api/userpool", function(data) {
		$("select[name='usrPool'] option").not("[value='']").remove();
		$(data).each(function(i, elem) {
			if (elem.incase == "Y") {
				$("select[name='usrPool']").append($("<option/>", {
					text : elem.poolName + "，共 " + elem.poolcnt + " 人",
					value : elem.uid,
					selected : (uid == elem.uid ? true : false),
					"data-cnt" : elem.poolcnt
				}));
			}
		});
	});
}

function genPrizeRow(pid, evname, takecnt, readycnt) {
	var span_uid = $("<span/>", {
		text : (pid == "Y" ? "新增" : pid)
	});
	var td_uid = $("<input/>", {
		type : "hidden",
		name : "pid",
		value : pid
	});
	var td_evname = $("<input/>", {
		type : "text",
		name : "evname",
		value : evname,
		"class" : "form-control",
		"required" : true
	});
	var td_takecnt = $("<input/>", {
		type : "number",
		name : "takecnt",
		value : takecnt,
		"class" : "form-control",
		"min" : 1
	});
	var td_readycnt = $("<input/>", {
		type : "number",
		name : "readycnt",
		value : readycnt,
		"class" : "form-control",
		"min" : 0
	});
	var btn_del = $("<button/>", {
		type : "button",
		"data-pid" : pid,
		"class" : "btn btn-danger",
		"text" : "X",
		onclick : "delPrize(this)"
	});
	var $row = $("<tr>" + "<td>" + td_uid[0].outerHTML + td_evname[0].outerHTML
			+ "</td>" + "<td>" + td_takecnt[0].outerHTML + "</td>" + "<td>"
			+ td_readycnt[0].outerHTML + "</td>" + "<td>"
			+ btn_del[0].outerHTML + "</td>" + "</tr>");

	return $row;
}

function lottory(obj) {
	var uid = $(obj).parents('tr').find('span').attr("data-uid");
	location.href = "slot/" + uid;
}