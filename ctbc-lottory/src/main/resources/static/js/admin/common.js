var $elem = $('.alert');

function showSuccess(msg){
    $elem.removeClass('alert-danger').addClass('alert-success').text(msg).show();
    setTimeout(function() {
    	$elem.hide();
    }, 3000);
}

function showError(msg){
    $elem.addClass('alert-danger').removeClass('alert-success').text(msg).show();
    setTimeout(function() {
    	$elem.hide();
    }, 3000);
}