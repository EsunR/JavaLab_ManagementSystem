$(function(){
	$('#search').click(function(){
		window.location.href = "/stu_inf_admin?id=" + $('#search_text').val();
	})
})