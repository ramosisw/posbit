$(document).ready(function() {
	console.log("options loaded");
	$("form.formula").submit(function(evt){
		evt.preventDefault();
	});

	$("form.formula input").click(function(evt){
		this.select();
	});

	$("form.formula input").on("blur",function(evt){
		var value = ($(this).val().replace(/[^\d\.]/g, "") * 1).toFixed(2);
		$(this).val(value);
	});

	$("form.formula input").keyup(function(evt){
		$form = $($(this).parents("form")[0]);
		$result = $($("#formula-result"));
		if($form == undefined || $form == null) return;
		var id = $form.attr("id") * 1;
		console.log(JSON.stringify({form : {"id":id}}));
		switch(id){
			case 1 : 
				var b = $form.find("#B").val() * 1;
				var c = $form.find("#C").val() * 1 / 100;
				var x = b * ( 1 + 2 * c);
				console.log(JSON.stringify({formula: "b * ( 1 + 2 * c)", "x" : x, "b" : b, "c" : c}));
				$result.text(x.toFixed(2));
			break;
		}
	});
});