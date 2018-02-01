(function(){
    if(window.location.pathname.indexOf('/trade/') == 0 && window.location.pathname.length != '/trade/xrp/mxn'.length) return;
    var flagBuy = "fa fa-arrow-right";
    var amount = document.querySelector(".tradebalance:nth-child(2) > .balance-container > .balance").innerText.replace(/[^\d\.]/g,"") * 1;
    var commision = document.querySelector("#trading-fee").innerText.replace(/[^\d\.]/g, "") * 1 / 100;
    //array index based 0
    var user_trades = document.querySelectorAll("[data-type=user-trades] > #my-recent-tab > tr");
    var user_ords = document.querySelectorAll("[data-type=user-orders] > #ords-tab > tr");
    var price = document.querySelector("#menu_price_drop").innerText.replace(/(^\d)|([^\d\.])/g, "") * 1;
    /*
    //Sample listener DOM
    document.querySelector("#menu_price_drop").addEventListener("DOMSubtreeModified", function(e){console.log("Change " + e.srcElement.innerText); }, false);
    */

    var loopAmount = 0;
    //console.log("Amount: " + amount)
    //console.log("Trades length: " + user_trades.length);

    //Identificar las compras y quitar comisiones de compra
    for(var i = 0; trade = user_trades[i]; i++){
        var columns = trade.querySelectorAll("td");
        var transaction = {
            buy      : columns[0].querySelector("span").className == flagBuy,
            received : ((columns[1].innerText.replace(/[^\d\.]/g,"") * 1) * (1 - commision)).toFixed(6) * 1,
            paged    : columns[2].innerText.replace(/[^\d\.]/g,"") * 1,
            price    : columns[3].innerText.replace(/[^\d\.]/g,"") * 1
        };
        if(transaction.buy){
            user_trades[i].className = "success";
            columns[1].innerText = transaction.received;
            columns[3].setAttribute("data-toggle","tooltip");
            //b * ( 1 + 2 * c)
            var b = transaction.price;
            var c = commision;
            var x = b * ( 1 + 2 * c) + 0.01;
            columns[3].setAttribute("title", "$" + x.toFixed(2));
        } else {
            columns[2].innerText = transaction.paged;
        }
    }

    //Remover transacciones empatadas en compra venta
    for (var i = user_trades.length - 1; trade = user_trades[i]; i--) {
        var columns = trade.querySelectorAll("td");
        var transaction = {
            buy      : columns[0].querySelector("span").className == flagBuy,
            received : (columns[1].innerText.replace(/[^\d\.]/g,"") * 1).toFixed(6) * 1,
            paged    : columns[2].innerText.replace(/[^\d\.]/g,"") * 1,
            price    : columns[3].innerText.replace(/[^\d\.]/g,"") * 1
        };
        //Solo buscar con las compras
        //console.log("Is Buy: " + transaction.buy);
        if(!transaction.buy) continue;
        //Buscar una venta que se venda en lo recibido por la compra
        for (var j = user_trades.length - 1; searchTrade = user_trades[j]; j--) {
            var searchColumns = searchTrade.querySelectorAll("td");
            var searchTransaction = {
                buy      : searchColumns[0].querySelector("span").className == flagBuy,
                received : (searchColumns[1].innerText.replace(/[^\d\.]/g,"") * 1).toFixed(6) * 1,
                paged    : searchColumns[2].innerText.replace(/[^\d\.]/g,"") * 1,
                price    : searchColumns[3].innerText.replace(/[^\d\.]/g,"") * 1
            };
            if(!searchTransaction.buy && searchTrade.className != "info"){
                //console.log("Paged: " + Math.abs(transaction.received - searchTransaction.paged));
                if(Math.abs(transaction.received - searchTransaction.paged) <= 0.000001){
                    trade.className = "info";
                    searchTrade.className = "info";
                    columns[3].setAttribute("data-toggle","none");
                    searchColumns[3].setAttribute("data-toggle","none");
                    break;
                }
            }
        }
        //Empatar transaciones que sumen lo mismo del renglon actual y sean seguidas.
        var pagedEmp = 0.0;
        for(var j = i - 1; searchTrade = user_trades[j]; j--){
            var searchColumns = searchTrade.querySelectorAll("td");
            var searchTransaction = {
                buy      : searchColumns[0].querySelector("span").className == flagBuy,
                received : (searchColumns[1].innerText.replace(/[^\d\.]/g,"") * 1).toFixed(6) * 1,
                paged    : searchColumns[2].innerText.replace(/[^\d\.]/g,"") * 1,
                price    : searchColumns[3].innerText.replace(/[^\d\.]/g,"") * 1
            };
            if(searchTransaction.buy || searchTrade.className == "info") break;

            pagedEmp += searchTransaction.paged;
            var log = {
                "i" : i,
                "j" : j,
                "buy" : searchTransaction.buy,
                "received" : transaction.received,
                "pagedEmp" : pagedEmp,
                "paged" : searchTransaction.paged,
                "abs-diff" : Math.abs(transaction.received - pagedEmp).toFixed(6),
                "diff" : (transaction.received - pagedEmp).toFixed(6),
                "class" : searchTrade.className
            };

            //console.log(JSON.stringify(log));

            if((transaction.received - pagedEmp) < 0)break;

            if(Math.abs(transaction.received - pagedEmp) <= 0.000001){
                for(var h = j; tradeMark = user_trades[h <= i ? h : -1]; h++){
                    tradeMark.className = "info";    
                    tradeMark.querySelectorAll("td")[3].setAttribute("data-toggle","none");
                }
                break;
            }
        }

        //Mark red las operaciones que esten en venta
        for (var j = user_ords.length - 1; searchOrd = user_ords[j]; j--) {

            var searchColumns = searchOrd.querySelectorAll("td");
            var searchTransaction = {
                buy      : searchColumns[0].querySelector("span").className == flagBuy,
                price : (searchColumns[1].innerText.replace(/[^\d\.]/g,"") * 1).toFixed(6) * 1,
                amount    : searchColumns[2].innerText.replace(/[^\d\.]/g,"") * 1,
                value    : searchColumns[3].innerText.replace(/[^\d\.]/g,"") * 1
            };
            if(!searchTransaction.buy && trade.className != "info" || trade.className != "danger"){
                if(Math.abs(transaction.received - searchTransaction.amount) <= 0.000001){
                    var _i = searchOrd.getAttribute("data-mark");
                    var _className = searchOrd.getAttribute("data-class");
                    if(i < (_i * 1)) user_trades[_i].className = _className;
            
                    searchOrd.setAttribute("data-class", trade.className);
                    trade.className = "danger";
                    searchOrd.setAttribute("data-mark", i);
                    break;
                }
            }
        }
    }

    //addListener to sell fast!
    for(var i = 0; trade = user_trades[i]; i++){
        var columns = trade.querySelectorAll("td");
        if(trade.className == "success"){
            columns[1].addEventListener("click", function(evt){
                var amount = evt.path[0].innerText;
                var price = evt.path[1].querySelectorAll("td")[3].innerText.replace(/[^\d\.]/g,"") * 1;
                var b = price;
                var c = commision;
                var x = (b * ( 1 + 2 * c) + 0.01).toFixed(2);
                //console.log("Sell Amount: " + amount);
                //console.log("Sell Price: " + x);
                var sell_amount = document.querySelector("#sell-amount");
                var sell_rate = document.querySelector("#sell-rate");
                var changeEvent = new Event('change');
                //console.log(sell_amount);
                if(sell_amount != undefined){
                    sell_amount.value = amount;
                    sell_rate.value = x;
                    sell_rate.dispatchEvent(changeEvent);
                    sell_amount.dispatchEvent(changeEvent);
                }
            });    
        }
    }

    //Inject tooltip
    var script = document.createElement('script');
    script.type = 'text/javascript';
    var code = "$(document).ready(function(){$('[data-toggle=\"tooltip\"]').tooltip();});";
    try {
      script.appendChild(document.createTextNode(code));
      document.body.appendChild(script);
    } catch (e) {
      script.text = code;
      document.body.appendChild(script);
    }   

    for(var i = 0; trade = user_trades[i]; i++){
        var columns = trade.querySelectorAll("td");
        var transaction = {
            buy      : columns[0].querySelector("span").className == flagBuy,
            received : (columns[1].innerText.replace(/[^\d\.]/g,"") * 1).toFixed(6) * 1,
            paged    : columns[2].innerText.replace(/[^\d\.]/g,"") * 1,
            price    : columns[3].innerText.replace(/[^\d\.]/g,"") * 1
        };
        transaction.recomended = (transaction.price * (1 + commision * 2) + 0.01).toFixed(2) * 1;
        transaction.percentege = (price / transaction.price - 1);
        transaction.utility = (transaction.received * price).toFixed(2) * 1;
        
        if(!transaction.buy) continue;
        //console.log("S[" + transaction.received + "] > [" + (transaction.price * (1 + commision * 2) + 0.01).toFixed(2) + "] P[" + transaction.price + "/" + price + "]");
        if(loopAmount > amount) break;

        loopAmount += transaction.received;
        if(transaction.recomended > price) continue;
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

    chrome.extension.sendRequest({msg: "Sup?"}, function(response) { 
        // optional callback - gets response
        //console.log(response);
    });
    console.log("Posbit loaded...");
})();