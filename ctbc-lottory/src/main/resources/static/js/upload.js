var file = $('#file');

$('#editsubmit').on('click', function() {
	loadLocalFile();
})

function loadLocalFile(){
	var fname = $('#eventId').val();
	if(fname == '' || fname == undefined){
		alert("請先輸入需求單號");
		return false;
	}
	$(".loading-icon").show();
	$.ajax({
		url : 'api/user.localfile',
		data : {
			name : fname
		},
		success: function(rs){
			console.log(rs);
			if(rs.status){
				var $text = $('#import-info');
				var txt = "匯入抽獎人數：" + rs.data.poolcnt +"筆，筆數：" + rs.data.summary +"筆";
				$text.text(txt).addClass('text-success').removeClass('text-danger');;
				$('#usrpool_uid').val(rs.data.uid);
			}else{
				$('#import-info').text(rs.errormsg).addClass('text-danger');
			}
		},
		complete : function(){
			$(".loading-icon").hide();
		}
		
	});
}


function uploadfile() {
	var filename = $("#file").val();
	var reg = /(zip$)/;

	var flag = checkfiletype(filename);

	if (flag) {
		uploadFile();
	}
}

function checkfiletype(filename) {
	// var form = $(this)[0];
	// var prefix = filename.substring(filename.indexOf(".")+1);
	var reg = /(zip$)|(txt$)/;
	if (filename == "" || !reg.test(filename)) {
		alert("僅接受CRMS單位提供之檔案");
		$("#file").val("");
		return false;
	}
	return true;
}

function uploadFile() {
	console.log('uploadfile');
	console.log(file[0].files[0]);
	const formdata = new FormData();
	formdata.append('file', file[0].files[0]);
	console.log(formdata);
	$.ajax({
		type : "POST",
		enctype : 'multipart/form-data',
		url : "api/user.upload",
		data : formdata,
		processData : false,
		contentType : false,
		cache : false,
		timeout : 600000,
		beforeSend : function() {
			$('#editmModal').modal({
				backdrop : 'static',
				keyboard : false
			});
			$(".loading-icon").show();
		},
		success : function(rs) {
			console.log(rs);
			if (rs.status) {
				showSuccess("更新成功");
				getEditData(rs.data.uid);
			} else {
				showError("更新失敗 " + rs.errormsg);
			}
			if ($table != null && rs.status) {
				$table.ajax.reload();
			}
		},
		complete : function() {
			$(".loading-icon").hide();
			// $('#editmModal').modal('hide');
		}
	});
}

function getEditData(uid) {
	$.ajax({
		url : 'api/userpool.uid',
		data : {
			'uid' : uid
		},
		success : function(rs) {
			console.log(rs);
			if (rs.status && rs.data != null) {
				var $text = $('#import-info');
				var txt = "匯入抽獎人數：" + rs.data.poolcnt +"筆，筆數：" + rs.data.summary +"筆";
				$text.text(txt).addClass('text-success').removeClass('text-danger');;
				$('#usrpool_uid').val(rs.data.uid);
//				var $form = $('#editmModal form[name=editform]');
//				var data = rs.data;
//				$form.find('#uid').text(data.uid);
//				$form.find('[name=uid]').val(data.uid);
//				$form.find('[name=poolName]').val(data.poolName);
//				$form.find("#poolcnt").text(data.poolcnt);
//				if (data.incase == 'N') {
//					$form.find("#incaseN").prop("checked", true);
//				} else {
//					$form.find("#incaseY").prop("checked", true);
//				}
			}
		}
	});
}