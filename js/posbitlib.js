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