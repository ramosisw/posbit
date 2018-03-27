function log(message) {
    if (typeof message == "object") message = JSON.stringify(JSON.parse(JSON.stringify(message)), null, 2);
    console.log(message);
}

function formatCurrency(value) {
    var rgx = new RegExp("(\\d)(?=(\\d{3})+\\.)", "g");
    return "$ " + (value * 1).toFixed(2).replace(rgx, "$1,");
}

$(document).ready(function() {
    log("options loaded");

    if (localStorageDB == undefined) return console.log('localStorage not defined!');

    var db_options = new localStorageDB("options", localStorage);
    //load commision
    var comisionResult = db_options.queryAll("settings", {
        query: {
            key: "comision"
        }
    });

    $("#C").val((comisionResult[0].value * 1).toFixed(2));

    var books = db_options.queryAll("books");
    var $notifications_panel = $("#notifications .panel-body [data-content]");
    var $notifications_panel_tablist = $("<UL>").addClass("nav nav-tabs");
    var $notifications_panel_content = $("<DIV>").addClass("tab-content");
    $notifications_panel.empty();

    var $whales_panel = $("#whales .panel-body [data-content]");
    var $whales_panel_tablist = $("<UL>").addClass("nav nav-tabs");
    var $whales_panel_content = $("<DIV>").addClass("tab-content");
    $whales_panel.empty();
    for (var i = 0; item = books[i]; i++) {
        var book = item.book.toUpperCase().replace("_","/");
        $("#modal-notifications #book").append($("<OPTION>").val(item.book).text(book));
        $("#modal-whales #book").append($("<OPTION>").val(item.book).text(book));
        $notifications_panel_tablist.append(
            $("<LI>").addClass(!i ? "active" : "")
            .append($("<A>").text(book).attr("data-toggle", "tab").attr("href", "#notification-" + item.book))
        );
        $whales_panel_tablist.append(
            $("<LI>").addClass(!i ? "active" : "")
            .append($("<A>").text(book).attr("data-toggle", "tab").attr("href", "#whale-" + item.book))
        );
        $notifications_panel_content.append(
            $("<DIV>").addClass("tab-pane " + (!i ? "active" : "")).attr("id", "notification-" + item.book).attr("role", "tabpanel").append(
                //'<p>'+ item.book +'<p>'+
                '<table class="table table-bordered">' +
                '    <thead>' +
                '        <tr>' +
                '            <th>Abajo de</th>' +
                '            <th>Arriba de</th>' +
                '            <th>Accion</th>' +
                '        </tr>' +
                '    </thead>' +
                '<tbody></tbody>'
            )
        );

        $whales_panel_content.append(
            $("<DIV>").addClass("tab-pane " + (!i ? "active" : "")).attr("id", "whale-" + item.book).attr("role", "tabpanel").append(
                //'<p>'+ item.book +'<p>'+
                '<table class="table table-bordered">' +
                '    <thead>' +
                '        <tr>' +
                '            <th>Desde</th>' +
                '            <th>Hasta</th>' +
                '            <th>Accion</th>' +
                '        </tr>' +
                '    </thead>' +
                '<tbody></tbody>'
            )
        );
    }
    $notifications_panel.append($notifications_panel_tablist).append($notifications_panel_content);
    $whales_panel.append($whales_panel_tablist).append($whales_panel_content);

    function load_whales() {
        var $whales = db_options.queryAll("whales");
        log({
            "whales": $whales
        });
        var listEmpty = [];
        $("#whales tbody").empty();
        for (var i = 0; $whale = $whales[i]; i++) {
            var book_id = $whale.book;
            var $tbody = $("#whales #whale-" + book_id +" tbody");
            if (listEmpty.indexOf(book_id) == -1) {
                $tbody.empty();
                listEmpty.push(book_id);
            }
            var tr = $("<TR>").addClass(!$whale.status ? "danger" : "success").attr("data-type", "whale").attr("data-book", $whale.ID).attr("data-value", $whale.book)
                .append($("<TD>").text(formatCurrency($whale.min)).attr("data-type", "whale").attr("data-value", $whale.min).attr("data-min", $whale.ID))
                .append($("<TD>").text(formatCurrency($whale.max)).attr("data-type", "whale").attr("data-value", $whale.max).attr("data-max", $whale.ID))
                .append($("<TD>").addClass("col-md-4")
                    .append($("<BUTTON>").html("<span class=\"oi oi-pencil\"></span>").addClass("btn btn-xs").attr("data-edit", "whale").attr("data-id", $whale.ID))
                    .append(" ")
                    .append($("<BUTTON>").html('<span class="oi oi-trash"></span>').addClass("btn btn-xs").attr("data-delete","whale").attr("data-id", $whale.ID))
                    .append(" ")
                    .append($("<BUTTON>").html("<span class=\"oi oi-volume-" + ($whale.status ? "high" : "off") + "\"></span>").addClass("btn btn-xs").attr("data-" + ($whale.status ? "disable" : "enable"), "whale").attr("data-id", $whale.ID))
                );
            $tbody.append(tr);
        }
    }

    function load_notifications() {
        var $notifications = db_options.queryAll("notifications");
        log({
            "notifications": $notifications
        });
        var listEmpty = [];
        $("#notifications tbody").empty();
        for (var i = 0; $notification = $notifications[i]; i++) {
            var book_id = $notification.book;
            var $tbody = $("#notifications #notification-" + book_id + " tbody");
            if (listEmpty.indexOf(book_id) == -1) {
                $tbody.empty();
                listEmpty.push(book_id);
            }
            var tr = $("<TR>").addClass(!$notification.status ? "danger" : "success").attr("data-type", "notification").attr("data-book", $notification.ID).attr("data-value", $notification.book)
                .append($("<TD>").text(formatCurrency($notification.min)).attr("data-type", "notification").attr("data-value", $notification.min).attr("data-min", $notification.ID))
                .append($("<TD>").text(formatCurrency($notification.max)).attr("data-type", "notification").attr("data-value", $notification.max).attr("data-max", $notification.ID))
                .append($("<TD>").addClass("col-md-4")
                    .append($("<BUTTON>").html("<span class=\"oi oi-pencil\"></span>").addClass("btn btn-xs").attr("data-edit", "notification").attr("data-id", $notification.ID))
                    .append(" ")
                    .append($("<BUTTON>").html("<span class=\"oi oi-trash\"></span>").addClass("btn btn-xs").attr("data-delete","notification").attr("data-id", $notification.ID))
                    .append(" ")
                    .append($("<BUTTON>").html("<span class=\"oi oi-volume-" + ($notification.status ? "high" : "off") + "\"></span>").addClass("btn btn-xs").attr("data-" + ($notification.status ? "disable" : "enable"), "notification").attr("data-id", $notification.ID))
                );
            $tbody.append(tr);
        }
    }

    function showLastNotificationsTab() {
        var last_notifications_tab = db_options.queryAll("settings", {
            query: {
                key: "last_notifications_tab"
            }
        });
        log(last_notifications_tab);
        if (last_notifications_tab.length != undefined && last_notifications_tab.length > 0) $("#notifications a[href='" + last_notifications_tab[0].value + "']").click();
    }

    function showLastWhalesTab() {
        var last_whales_tab = db_options.queryAll("settings", {
            query: {
                key: "last_whales_tab"
            }
        });
        log(last_whales_tab);
        if (last_whales_tab.length != undefined && last_whales_tab.length > 0) $("#whales a[href='" + last_whales_tab[0].value + "']").click();
    }

    function setStatus(table, id, status) {
        if (!db_options.tableExists(table)) return;
        db_options.insertOrUpdate(table, {
            ID: id
        }, {
            "status": status
        });
        db_options.commit();
    }

    function setMinMax(table, id, min, max) {
        if (!db_options.tableExists(table)) return;
        db_options.insertOrUpdate(table, {
            ID: id
        }, {
            "min": min,
            "max": max,
            "status": 1
        });
        db_options.commit();
    }

    function setMinMaxBook(table, id, min, max, book) {
        if (!db_options.tableExists(table)) return;
        db_options.insertOrUpdate(table, {
            ID: id
        }, {
            "min": min,
            "max": max,
            "book": book,
            "status": 1
        });
        db_options.commit();
    }

    $("#notifications a[data-toggle=\"tab\"]").click(function(evt){
        var href = $(this).attr("href");
        db_options.insertOrUpdate("settings", {
            key: "last_notifications_tab"
        }, {
            key: "last_notifications_tab",
            value: href
        });
        db_options.commit();
    });

    $("#whales a[data-toggle=\"tab\"]").click(function(evt){
        var href = $(this).attr("href");
        db_options.insertOrUpdate("settings", {
            key: "last_whales_tab"
        }, {
            key: "last_whales_tab",
            value: href
        });
        db_options.commit();
    });

    $(".sidebar>.nav-sidebar a").click(function(evt) {
        if (db_options == undefined) return;
        var href = $(this).attr("href");
        db_options.insertOrUpdate("settings", {
            key: "last_tab"
        }, {
            key: "last_tab",
            value: href
        });
        switch (href) {
            case "#whales":
                load_whales();
                break;
            case "#notifications":
                load_notifications();
                break;
        }
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

    $("[data-add]").click(function(evt) {
        var type = $(this).attr("data-add");
        switch (type) {
            case "whale" :
                $("#modal-whales .modal-title").text("Nueva ballena");
                $("#modal-whales [data-save]").attr("data-id", 0);
                $("#modal-whales").modal();
                break;
            case "notification" :
                $("#modal-notifications .modal-title").text("Nueva notificación");
                $("#modal-notifications [data-save]").attr("data-id", 0);
                $("#modal-notifications #book").show();
                $("#modal-notifications").modal();
                break;
        }
    });

    $(document).on("click", "[data-edit]", function(evt) {
        var type = $(this).attr("data-edit");
        var id = $(this).attr("data-id");
        switch (type) {
            case "whale":
                $("#modal-whales .modal-title").text("Editar ballena");
                $("#modal-whales #min").val($("[data-min=" + id + "][data-type=" + type + "]").attr("data-value"));
                $("#modal-whales #max").val($("[data-max=" + id + "][data-type=" + type + "]").attr("data-value"));
                $("#modal-whales #book").val($("[data-book=" + id + "][data-type=" + type + "]").attr("data-value"));
                $("#modal-whales [data-save]").attr("data-id", id);
                $("#modal-whales").modal();
                break;
            case "notification":
                $("#modal-notifications .modal-title").text("Editar notificación");
                $("#modal-notifications #min").val($("[data-min=" + id + "][data-type=" + type + "]").attr("data-value"));
                $("#modal-notifications #max").val($("[data-max=" + id + "][data-type=" + type + "]").attr("data-value"));
                $("#modal-notifications #book").val($("[data-book=" + id + "][data-type=" + type + "]").attr("data-value"));
                //$("#modal-notifications #book").hide();
                $("#modal-notifications [data-save]").attr("data-id", id);
                $("#modal-notifications").modal();
                break;
        }
    });

    $(document).on("click", "[data-delete]", function(){
        var type = $(this).attr("data-delete");
        var id = $(this).attr("data-id");
        log({"type": type, "id": id});
        switch(type){
            case "notification":
                db_options.deleteRows("notifications", {ID : id});
                db_options.commit();
                load_notifications();
                break;
            case "whale":
                db_options.deleteRows("whales", {ID : id});
                db_options.commit();
                load_whales();
                break;

        }
    });

    $("[data-save]").click(function(evt) {
        var type = $(this).attr("data-save");
        var id = $(this).attr("data-id");
        switch (type) {
            case "whale":
                var min = $("#modal-whales #min").val();
                var max = $("#modal-whales #max").val();
                var book = $("#modal-whales #book").val();
                var id = $("#modal-whales [data-save]").attr("data-id");
                setMinMaxBook("whales", id, min, max, book);
                load_whales();
                $("#modal-whales").modal('hide');
                break;
            case "notification":
                var min = $("#modal-notifications #min").val();
                var max = $("#modal-notifications #max").val();
                var book = $("#modal-notifications #book").val();
                var id = $("#modal-notifications [data-save]").attr("data-id");
                setMinMaxBook("notifications", id, min, max, book);
                load_notifications();
                $("#modal-notifications").modal('hide');
                break;
        }
    });

    $(document).on("click", "[data-disable]", function(evt) {
        var type = $(this).attr("data-disable");
        var id = $(this).attr("data-id");
        switch (type) {
            case "whale":
                setStatus("whales", id, 0);
                load_whales();
                break;
            case "notification":
                setStatus("notifications", id, 0);
                load_notifications();
                break;
        }
    });

    $(document).on("click", "[data-enable]", function(evt) {
        var type = $(this).attr("data-enable");
        var id = $(this).attr("data-id");
        switch (type) {
            case "whale":
                setStatus("whales", id, 1);
                load_whales();
                break;
            case "notification":
                setStatus("notifications", id, 1);
                load_notifications();
                break;
        }
    });

    $("form.formula input").keyup(function(evt) {
        //console.log(evt.originalEvent.key);
        if (evt.originalEvent.key != 'ArrowUp' && evt.originalEvent.key != 'ArrowDown' && !evt.originalEvent.key.match(/\d/g)) return;
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

    var last_tab_result = db_options.queryAll("settings", {
        query: {
            key: "last_tab"
        }
    });

    if (last_tab_result.length != undefined && last_tab_result.length > 0) $(".sidebar>.nav-sidebar a[href='" + last_tab_result[0].value + "']").click();
    showLastNotificationsTab();
    showLastWhalesTab();
});