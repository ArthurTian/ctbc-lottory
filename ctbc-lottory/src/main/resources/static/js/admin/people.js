var $table = null;
$(function() {
    var content = "<td name='check-td'><input type='checkbox' name='checkyn' value='Y' data-id='userId'></td>";
    $table = $('.table').DataTable({
	ajax : {
	    "url" : "/admin.api/getAllUsr",
	    "dataSrc" : ""
	},
	columns : [ {
//	    defaultContent : content
	    "render": function ( data, type, row, meta ) {
	        return "<td name='check-td'><input type='checkbox' name='checkyn' value='Y' data-id='"+row.userId+"'></td>"
	      }
	}, {
	    data : 'userId'
	}, {
	    data : 'userName'
	}, {
	    data : 'department'
	}, {
	    data : 'depGroup'
	}, {
	    data : 'isOff'
	} ,{
	    data : 'emType'
	}]
    });

    $.post("/admin.api/queryLastBatchStatus", {
	batchtype : "LS"
    }, function(data) {
    	console.log(data.DNTIME);
    	$("#dntime").text(data.DNTIME);
    });

});

/*
 * function retrieveData(sUrl, aoData, fnCallback) { $.ajax({ url : sUrl,//
 * 這個就是請求地址對應sAjaxSource data : { "aoData" : JSON.stringify(aoData) },//
 * 這個是把datatable的一些基本數據傳給後臺,比如起始位置,每頁顯示的行數 type : 'post', dataType : 'json',
 * async : false, success : fnCallback, error : function(msg) { console.log(msg) }
 * }); }
 */

$('#con1').click(function() {
    $('#editmModal').modal('toggle');
});

var isReloaded = false;
var reloadFn = null;
var $elem = $('#uploadMemberResult');
$('#uploadMemberBtn').click(function() {
    isReloaded = false;
    $elem.text('');
    if (confirm('上傳後將會覆蓋原本資料，是否繼續?')) {
	uploadFile($('#uploadMemberFileForm')[0]);
    }
    return false;
});

function uploadFile($obj) {
    $.ajax({
	type : "POST",
	enctype : 'multipart/form-data',
	url : "/admin.api/upload",
	data : new FormData($obj),
	processData : false,
	contentType : false,
	cache : false,
	timeout : 600000,
	beforeSend : function() {
	    $('#editmModal').modal({
		backdrop : 'static',
		keyboard : false
	    })
	    $(".loading-icon").show();
	},
	success : function(data) {
	    console.log(data);
	    if (data.status == 0) {
		$elem.toggleClass('text-success');
		$elem.text(data.message);
	    } else if (data.status == 1) {
		$elem.toggleClass('text-danger');
		$elem.text(data.message);
	    }
	    if ($table != null && data.status == 0) {
		reloadTable();
	    }
	},
	complete : function() {
	    $(".loading-icon").hide();
	    $('#editmModal').modal('hide');
	}
    });
}

function reloadTable() {
    $table.ajax.reload();
    $.post("/admin.api/queryLastBatchStatus", {
	batchtype : "LS"
    }, function(data) {
	console.log(data.body.DNTIME);
	$("#dntime").text(data.body.DNTIME);
    });
}

function setType(){
	var $elem = $("[name=checkyn]:checked");
	console.log($elem.length);
	var type = $("#usertype").val();
	$elem.each(function(idx,v){
		$.post("/admin.api/updateUserType",{
			"type":type, "user":$(v).attr("data-id")
		},function(){
			reloadTable();
		});
	});
}