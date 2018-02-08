var ENUMERATOR = 0;
SET_COMMISION = ENUMERATOR++;
ADD_ORDERS = ENUMERATOR++;
SHOW_NOTIFICATION = ENUMERATOR++;
console.log("Last ENUMERATOR: " + ENUMERATOR);

function log(message) {
	if (typeof message == "object") message = JSON.stringify(JSON.parse(JSON.stringify(message)), null, 2);
	console.log(message);
}

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function isArray(array) {
	return typeof array == 'object' && array.length != undefined;
}

function formatCurrency(value) {
    var rgx = new RegExp("(\\d)(?=(\\d{3})+\\.)", "g");
    return "$ " + (value * 1).toFixed(2).replace(rgx, "$1,");
}

Array.prototype.isArray = true;
Object.prototype.isArray = false;