$(document).ready(
		function() {
			$('.table').DataTable(
					{
						dom : 'Bfrtip',
						buttons : [ {
							extend : 'print',
							text : '列印中獎名單',
							className : 'btn-primary',
							customize : function(win) {
								$(win.document.body).css('font-size', '10pt');
								$(win.document.body).find('table').removeClass(
										'dataTable').addClass('compact').css(
										'font-size', '10pt');
							}
						} ],
						"columnDefs" : [ [ {
							"searchable" : false,
							"targets" : 0
						} ], [ {
							"searchable" : false,
							"targets" : 0
						} ] ]
					});

			$('#printBtn').click(function() {
				window.print();
			});

			// 匯出
			$('#exportBtn').click(function() {
				$('#exportXlsControl').toggle(300);
			});

			$('#exportXlsBtn').click(
					function() {
						var url = "/admin/exportwin?prizeid="
								+ $("[name='prizeid']").val();
						window.open(url);
					});

			// 設定未領獎
			$('#updateStatusBtn').click(function() {
				$('#updateStatusControl').toggle(300);
			});

			$('#updateStatusSubmit').click(function() {
				$.ajax({
					url : 'admin.api/updWinnerStatus',
					data : {
						userid : $('[name=updateUserId]').val()
					},
					success : function(obj) {
						alert(obj.message);
						location.reload();
					}
				});
			});
		});
