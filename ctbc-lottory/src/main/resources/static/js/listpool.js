var $table;
var detailBtn = $("<button/>", {
    text : "詳細資料",
    "class" : "btn btn-sm btn-primary",
    onclick : "edit(this);"
});
var deleteBtn = $("<button/>", {
    text : "刪除資料",
    "class" : "btn btn-sm btn-danger",
    onclick : "del(this);"
});

$(function() {
    $table = $("#maintable").DataTable(
	    {
		ajax : {
		    url : "api/userpool",
		    dataSrc : ""
		},
		columns : [
			{
			    data : "uid"
			},
			{
			    data : "poolName"
			},
			{
			    data : "poolcnt"
			},
			{
			    data : "summary"
			},
			{
			    data : function(row,type,val,meta){
				if(row.incase == 'N'){
				    return "<span class='text-danger'>已封存</span>";
				}else{
				    return deleteBtn[0].outerHTML
				}
			    }
//			    defaultContent : deleteBtn[0].outerHTML
			} ]
	    });
});

$("#insertBtn").on("click",function(){
    var $form = $('#editmModal form[name=editform]');
    $form.find("span").text("");
    $form.find("input").val("");
    $('#file').val('');
    $("#uid").text("自動新增");
    $("[name='uid']").val("New");
    $('#editmModal').modal();
});


function edit(obj) {
    var data = $(obj).parents('tr').find('td');
    $('#file').val('');
    getEditData(data[0].innerText);
    $('#editmModal').modal();
}
/**
 * 取得編輯資料
 * @param uid
 * @returns
 */
function getEditData(uid) {
    $.ajax({
	url : 'api/userpool.uid',
	data : {
	    'uid' : uid
	},
	success : function(rs) {
	    console.log(rs);
	    if (rs.status && rs.data != null) {
		var $form = $('#editmModal form[name=editform]');
		var data = rs.data;
		$form.find('#uid').text(data.uid);
		$form.find('[name=uid]').val(data.uid);
		$form.find('[name=poolName]').val(data.poolName);
		$form.find("#poolcnt").text(data.poolcnt);
		if (data.incase == 'N') {
		    $form.find("#incaseN").prop("checked", true);
		} else {
		    $form.find("#incaseY").prop("checked", true);
		}
	    }
	}
    });
}


$("#editform").on("submit", function() {
    var filename = $("#file").val();
    var form = $(this)[0];
    // var prefix = filename.substring(filename.indexOf(".")+1);
    var reg = /(zip$)/;
    if(filename==""){
	uploadFile(form);
    }else if (filename != "" && reg.test(filename)) {
//	console.log(filename);
	uploadFile(form);
    } else {
	alert("僅接受 .zip 檔案");
	$("#file").val("");
    }
    return false;
});

function del(obj){
    var poolId = $(obj).parents('tr').find('td')[0].innerText;
    if(confirm("刪除後無法還原，確定刪除？")){
	$.post("api/RemoveUserPool",{'poolId':poolId},function(rs){
	    if(rs.status) {
		$table.ajax.reload();
	    }
	});
    }
}

function uploadFile($obj) {
//    console.log($obj);
//    console.log(new FormData($obj));
    $.ajax({
	type : "POST",
	enctype : 'multipart/form-data',
	url : "api/user.upload",
	data : new FormData($obj),
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
	    if(rs.status){
		showSuccess("更新成功");
		getEditData(rs.data.uid);
	    }else{
		showError("更新失敗 "  + rs.errormsg);
	    }
	    if ($table != null && rs.status) {
		 $table.ajax.reload();
	    }
	},
	complete : function() {
	    $(".loading-icon").hide();
//	    $('#editmModal').modal('hide');
	}
    });
}