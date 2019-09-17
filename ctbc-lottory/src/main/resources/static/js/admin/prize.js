var fnobj = $('<button/>', {
	text : '編輯',
	'class' : 'btn btn-sm btn-success',
	onclick : 'edit(this);'
});
var table;
$(function() {
    table = $('.table').DataTable({
	ajax : {
	    url : "/ap/prizelist",
	    dataSrc : ""
	},
	columns : [ {
	    data : 'PRIZEID'
	}, {
	    data : 'PRIZE_NAME'
	}, {
	    data : 'LEVEL_DESC'
	}, {
	    data : 'TOTAL'
	}, {
	    data : 'MEMO',
	    defaultContent : ''
	}, {
	    defaultContent : fnobj[0].outerHTML
	} ],
	order : [ [ 0, "decs" ] ]
    });
    
    //Get Edit Modal Select Options
    $.post("/admin.api/systemkey",{keytype:"LEVEL"},function(rs){
	if(rs.status){
	    $(rs.data).each(function(i,val){
		$("#levelSelect").append("<option value='"+val.KEYID+"'>"+val.KEYVAL+"</option>");
	    });
	}
    });
});

function edit(obj) {
    var data = $(obj).parents('tr').find('td');
    var $form = $('#editmModal form[name=editform]');
    $form.find('input').val('');
    $.ajax({
	url : '/ap/prizelist',
	data : {
	    'prizeid' : data[0].innerText
	},
	success : function(rs) {
	    var content = rs[0];
	    console.log(content);
	    $form.find('#prizeid').text(content.PRIZEID);
	    $form.find('[name=prize_id]').val(content.PRIZEID);
	    $form.find('[name=prize_name]').val(content.PRIZE_NAME);
	    $form.find('[name=total]').val(content.TOTAL);
	    $form.find('[name=level] option[value=' + content.PRIZE_LEVEL+ ']').attr('selected', true);
	    $form.find('[name=memo]').val(content.MEMO);
	    $('#editmModal').modal();
	}
    });
}

$('#insertBtn').on('click', function() {
	$('#editmModal form[name=editform] input').val('');
	$('form[name=editform] select').val('');
	$('span#prizeid').text('自動新增');
	$('input[name=status]').val(1);
	$('input[name=prize_id]').val('New');
	$('#editmModal').modal();
});

$('#editsubmit').on('click', function() {
    if ($('input[name=prize_id]').val() == 'New') {
	$('input[name=status]').val(1);
    } else {
	$('input[name=status]').val(0);
    }
    $.ajax({
	async : false,
	url : '/admin.api/updprize',
	data : $('form[name=editform]').serialize(),
	beforeSend : function() {
	    console.log($('form[name=editform]').serialize());
	    $('.loading-icon').show();
	},
	success : function(rs) {
	    console.log(rs);
	    if (rs.status == 0) {
		alert('更新成功!');
	    } else {
		alert('更新失敗!');
	    }

	},
	complete : function() {
	    $('.loading-icon').hide();
	    $('#editmModal').modal('hide');
	    table.ajax.reload();
	}
    });
    return false;
});

$('#delbtn').on('click', function() {
    if (confirm('確定刪除?')) {
	$('input[name=status]').val(2);
	$.ajax({
	    async : false,
	    url : '/admin.api/updprize',
	    data : $('form[name=editform]').serialize(),
	    beforeSend : function() {
		console.log($('form[name=editform]').serialize());
	    },
	    success : function(rs) {
		console.log(rs);
		if (rs.status == 0) {
		    alert('刪除成功!');
		} else {
		    alert('刪除失敗!');
		}

	    },
	    complete : function() {
		$('#editmModal').modal('hide');
		table.ajax.reload();
	    }
	});
    }
    return false;
});