$(document).ready(function() {
    console.log("options loaded");
    if (localStorageDB == undefined) return console.log('localStorage not defined!');
    else {
        var db_options = new localStorageDB("options", localStorage);
        //load commision
        var comisionResult = db_options.queryAll("settings", {
            query: {
                key: "comision"
            }
        });
        $("#C").val((comisionResult[0].value * 1).toFixed(2));

        var last_tab_result = db_options.queryAll("settings", {
            query: {
                key: "last_tab"
            }
        });
        console.log(last_tab_result);
        if (last_tab_result.length != undefined && last_tab_result.length > 0)
            $(".sidebar>.nav-sidebar a[href='" + last_tab_result[0].value + "']").click();

    }
    $(".sidebar>.nav-sidebar a").click(function(evt) {
        if (db_options == undefined) return;
        var _last_tab = $(this).attr("href");
        db_options.insertOrUpdate("settings", {
            key: "last_tab"
        }, {
            key: "last_tab",
            value: _last_tab
        });
        db_options.commit();
    });

    $("#C").change(function() {
        if (db_options == undefined) return;
        var _val = $("#C").val();
        db_options.insertOrUpdate("settings", {
            key: "comision"
        }, {
            key: "comision",
            value: _val
        });
        db_options.commit();
    });
    $("form.formula").submit(function(evt) {
        evt.preventDefault();
    });

    $("form.formula input").click(function(evt) {
        this.select();
    });

    $("form.formula input").on("blur", function(evt) {
        var value = ($(this).val().replace(/[^\d\.]/g, "") * 1).toFixed(2);
        $(this).val(value);
    });

    $("form.formula input").keyup(function(evt) {
        //console.log(evt.originalEvent.key);
        if (evt.originalEvent.key != 'ArrowUp' && evt.originalEvent.key != 'ArrowDown' &&!evt.originalEvent.key.match(/\d/g)) return;
        $form = $($(this).parents("form")[0]);
        $result = $($("#formula-result"));
        if ($form == undefined || $form == null) return;
        var id = $form.attr("id") * 1;
        console.log(JSON.stringify({
            form: {
                "id": id
            }
        }));
        switch (id) {
            case 1:
                var b = $form.find("#B").val() * 1;
                var c = $("#C").val() * 1 / 100;
                var x = b * (1 + 2 * c);
                $result.text(x.toFixed(2));
                break;
            case 2:
                var a = $form.find("#A").val() * 1;
                var b = $form.find("#B").val() * 1;
                var c = $("#C").val() * 1 / 100;
                var x = (a * (1 + c)) / b;
                $result.text(x.toFixed(2));
                break;
            case 3:
                var a = $form.find("#A").val() * 1;
                var b = $form.find("#B").val() * 1;
                var c = $("#C").val() * 1 / 100;
                var x = (b / a - 1) * (1 - c * 2);
                $result.html((a * x).toFixed(2) + "<small>(" + (x * 100).toFixed(2) + "%)</small>");
                break;
        }
    });
});