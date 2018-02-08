(function() {
    var posbit = new posbitCore();
    posbit.log("Test OK");
    if (window.location.pathname.indexOf('/trade') == -1) return;
    if (window.location.pathname.indexOf('/trade/') == 0 && window.location.pathname.length != '/trade/xxx/xxx'.length) return;


    var flagBuy = "fa fa-arrow-right";
    var amount = document.querySelector(".tradebalance:nth-child(2) > .balance-container > .balance").innerText.replace(/[^\d\.]/g, "") * 1;
    var commision = document.querySelector("#trading-fee").innerText.replace(/[^\d\.]/g, "") * 1 / 100;
    //array index based 0
    var user_trades = document.querySelectorAll("[data-type=user-trades] > #my-recent-tab > tr");
    var user_ords = document.querySelectorAll("[data-type=user-orders] > #ords-tab > tr");
    var price = document.querySelector("#menu_price_drop").innerText.replace(/(^\d)|([^\d\.])/g, "") * 1;
    var book = document.querySelector("#book-label [data-bind=\"label\"]").textContent;
    /*
    //Sample listener DOM
    document.querySelector("#menu_price_drop").addEventListener("DOMSubtreeModified", function(e){console.log("Change " + e.srcElement.innerText); }, false);
    */
    //posbit.saveCommision(commision);

    var loopAmount = 0;

    //Identificar las compras y quitar comisiones de compra
    posbit.normalizeValues(user_trades, commision);
    var books = book.toLowerCase().split("/");
    var book_id = books[1] + "_" + books[0];
    posbit.addOrders(user_ords, book_id);
    posbit.listenerNotifications();
    posbit.listenerOrdersTab(book);

    //Remover transacciones empatadas en compra venta
    for (var i = user_trades.length - 1; trade = user_trades[i]; i--) {
        var columns = trade.querySelectorAll("td");
        var transaction = posbit.processColumnsRows(columns);
        //Solo buscar con las compras
        //console.log("Is Buy: " + transaction.buy);
        if (!transaction.buy) continue;
        //Buscar una venta que se venda en lo recibido por la compra
        for (var j = user_trades.length - 1; searchTrade = user_trades[j]; j--) {
            var searchColumns = searchTrade.querySelectorAll("td");
            var searchTransaction = posbit.processColumnsRows(searchColumns);
            if (!searchTransaction.buy && searchTrade.className != "info") {
                //console.log("Paged: " + Math.abs(transaction.received - searchTransaction.paged));
                if (Math.abs(transaction.received - searchTransaction.paged) <= 0.000001) {
                    trade.className = "info";
                    searchTrade.className = "info";
                    columns[3].setAttribute("data-toggle", "none");
                    searchColumns[3].setAttribute("data-toggle", "none");
                    break;
                }
            }
        }
        //Empatar transaciones que sumen lo mismo del renglon actual y sean seguidas.
        var pagedEmp = 0.0, $i = i;
        for (var j = i - 1; searchTrade = user_trades[j]; j--) {
            var searchColumns = searchTrade.querySelectorAll("td");
            var searchTransaction = posbit.processColumnsRows(searchColumns);
            if (searchTransaction.buy || searchTrade.className == "info") break;

            pagedEmp += searchTransaction.paged;

            //console.log(JSON.stringify(log));

            if ((transaction.received - pagedEmp) < 0) {
                break;
            };

            if (Math.abs(transaction.received - pagedEmp) <= 0.000001) {
                for (var h = j; tradeMark = user_trades[h <= i ? h : -1]; h++) {
                    tradeMark.className = "info";
                    tradeMark.querySelectorAll("td")[3].setAttribute("data-toggle", "none");
                }
                break;
            }
        }

        //Mark red las operaciones que esten en venta
        for (var j = user_ords.length - 1; searchOrd = user_ords[j]; j--) {
            var searchColumns = searchOrd.querySelectorAll("td");
            var searchTransaction = posbit.processOrderColumns(searchColumns);
            if (!searchTransaction.buy && trade.className != "info" || trade.className != "danger") {
                if (Math.abs(transaction.received - searchTransaction.amount) <= 0.000001) {
                    var _i = searchOrd.getAttribute("data-mark");
                    var _className = searchOrd.getAttribute("data-class");
                    if (i < (_i * 1)) user_trades[_i].className = _className;

                    searchOrd.setAttribute("data-class", trade.className);
                    trade.className = "danger";
                    searchOrd.setAttribute("data-mark", i);
                    break;
                }
            }
        }
    }

    //addListener to sell fast!
    posbit.addFastSell(user_trades, commision);

    //Inject tooltip
    posbit.injectTooltip();

    //under construction
    for (var i = 0; trade = user_trades[i]; i++) {
        var columns = trade.querySelectorAll("td");
        var transaction = posbit.processColumnsRows(columns);
        transaction.recomended = (transaction.price * (1 + commision * 2) + 0.01).toFixed(2) * 1;
        transaction.percentege = (price / transaction.price - 1);
        transaction.utility = (transaction.received * price).toFixed(2) * 1;

        if (!transaction.buy) continue;
        //console.log("S[" + transaction.received + "] > [" + (transaction.price * (1 + commision * 2) + 0.01).toFixed(2) + "] P[" + transaction.price + "/" + price + "]");
        if (loopAmount > amount) break;

        loopAmount += transaction.received;
        if (transaction.recomended > price) continue;
        /*console.log("Sell[" + transaction.received + "]" 
            +" > [" + transaction.recomended + "] "
            +"Price[Buy: " + transaction.price + " / Actual: " + price + "]"
            +"[" + (transaction.percentege * 100).toFixed(2) + "%]"
            +"[$" + transaction.utility + "]"
        );*/
        //console.log("Sell " + transaction.received + " over then " + (transaction.price * (1 + commision * 2) + 0.01).toFixed(2));

        //console.log((buy ? "Buy  " : "Sell ") + received + "\t for " + paged + "\t at " + price);
    }


    //(("8.474577" * 1 + 0.0000001 * (1 - 0.008)).toFixed(6) * 1
    //TEST
    console.log("Posbit loaded...");
})();