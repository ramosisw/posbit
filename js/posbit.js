//posbit.js
/**
posbit v 1.0.0
author ramosisw
email ramos.isw@gmail.com
**/
! function(parent) {
    /**
     * @return {instance} Instance of API
     */
    function core() {
        console.log('Posbit Core loading!');
        if (localStorageDB == undefined) console.log('localStorage not defined!');
        else var db_options = new localStorageDB("posbit", localStorage);

        /**
         * @param  {string} Message to log
         * @return {boolean} Always true
         */
        function log(message) {
            console.log(message);
            return true;
        }
        /**
         * @return {boolean} Always true
         */
        function tradeListener() {

        }
        return {
            log: function(message) {
                log(message);
            },
            saveCommision: function(commision) {
                chrome.extension.sendRequest({
                    code: SET_COMMISION,
                    value: commision
                }, function(response) {
                    console.log(response);
                });
            }
        };
    }
    //Return instance
    "undefined" != typeof module && module.exports ? module.exports = core : "function" == typeof define && define.amd ? define(function() {
        return core;
    }) : parent.posbitCore = core;
}("undefined" != typeof window ? window : this);