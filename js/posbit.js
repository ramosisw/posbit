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
        function tradeListener(){

        }
        return {
            log: function(message) {
                log(message);
            }
        };
    }
    //Return instance
    'undefined' != typeof module && module.exports ? module.exports = core : 'function' == typeof define && define.amd ? define(function() {
        return core;
    }) : parent.posbit = core;
}('undefined' != typeof window ? window : this);