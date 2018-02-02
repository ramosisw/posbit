chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var containsRequest = ["title","message"];
    var isValidRequest = false;
    for(var key in request){
        if(!request.hasOwnProperty(key)) continue;
        for (var i = 0; contain = containsRequest[i]; i++) {
            if(isValidRequest = contain == key) break;
        }
        if(!isValidRequest) return;
    }
    showNotification(request.title, request.message,[
        {
            title:"Sell",
            iconUrl:"/icons/icon16x16.png"
        }
    ],function(id, index){

    });

    sendResponse({
        returnMsg: "All good!"
    }); // optional response
});

function showNotification(title, message, buttons, callbackButtons) {
    var options={
        iconUrl: '/icons/icon48x48.png',
        title : 'Posbit | ' + title,
        message:message,
        type:"basic"
    };
    if(buttons != undefined){
        options.buttons=buttons;
    }
    /*var notification = webkitNotifications.createNotification(icons[icon], // icon url - can be relative
        'Feebbo Check Surveys | ' + title, // notification title
        message // notification body text
    );
    notification.show();*/
    chrome.notifications.create("id",options,function(){});
    if(callbackButtons != undefined && typeof callbackButtons == 'function'){
        chrome.notifications.onButtonClicked.addListener(callbackButtons);   
    }
}

