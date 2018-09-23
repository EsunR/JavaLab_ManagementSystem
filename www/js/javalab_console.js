$(function(){
	$('#search').click(function(){
		window.location.href = "/stu_inf?id=" + $('#search_text').val();
	})
})