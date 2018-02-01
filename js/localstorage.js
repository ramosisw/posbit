/*
	Kailash Nadh (http://nadh.in)

	localStorageDB v 2.3.1
	A simple database layer for localStorage

	v 2.3.1 Mar 2015
	v 2.3 Feb 2014 Contribution: Christian Kellner (http://orange-coding.net)
	v 2.2 Jan 2014 Contribution: Andy Hawkins (http://a904guy.com) 
	v 2.1 Nov 2013
	v 2.0 June 2013
	v 1.9 Nov 2012

	License	:	MIT License
*/

! function(t, e) {
    function n(t, n) {
        function r() {
            q.hasOwnProperty(I) && delete q[I], _ = null
        }

        function a() {
            var t = 0;
            for (var e in _.tables) _.tables.hasOwnProperty(e) && t++;
            return t
        }

        function i(t) {
            return _.tables[t].fields
        }

        function o(t) {
            return !!_.tables[t]
        }

        function f(t) {
            o(t) || D("The table '" + t + "' does not exist")
        }

        function u(t, e) {
            var n = !1,
                r = _.tables[t].fields;
            for (var a in r)
                if (r[a] == e) {
                    n = !0;
                    break
                }
            return n
        }

        function s(t, e) {
            _.tables[t] = {
                fields: e,
                auto_increment: 1
            }, _.data[t] = {}
        }

        function l(t) {
            delete _.tables[t], delete _.data[t]
        }

        function c(t) {
            _.tables[t].auto_increment = 1, _.data[t] = {}
        }

        function d(t, e, n) {
            if (_.tables[t].fields = _.tables[t].fields.concat(e), void 0 !== n)
                for (var r in _.data[t])
                    if (_.data[t].hasOwnProperty(r))
                        for (var a in e) _.data[t][r][e[a]] = "object" == typeof n ? n[e[a]] : n
        }

        function h(t) {
            var e = 0;
            for (var n in _.data[t]) _.data[t].hasOwnProperty(n) && e++;
            return e
        }

        function p(t, e) {
            return e.ID = _.tables[t].auto_increment, _.data[t][_.tables[t].auto_increment] = e, _.tables[t].auto_increment++, e.ID
        }

        function v(t, n, r, a, i, o) {
            for (var f = null, u = [], s = null, l = 0; l < n.length; l++) f = n[l], s = _.data[t][f], u.push(k(s));
            if (i && i instanceof Array)
                for (l = 0; l < i.length; l++) u.sort(y(i[l][0], i[l].length > 1 ? i[l][1] : null));
            if (o && o instanceof Array) {
                for (var c = 0; c < o.length; c++)
                    for (var d = {}, h = o[c], l = 0; l < u.length; l++) u[l] !== e && (u[l].hasOwnProperty(h) && d.hasOwnProperty(u[l][h]) ? delete u[l] : d[u[l][h]] = 1);
                for (var p = [], l = 0; l < u.length; l++) u[l] !== e && p.push(u[l]);
                u = p
            }
            return r = r && "number" == typeof r ? r : null, a = a && "number" == typeof a ? a : null, r && a ? u = u.slice(r, r + a) : r ? u = u.slice(r) : a && (u = u.slice(r, a)), u
        }

        function y(t, e) {
            return function(n, r) {
                var a = "string" == typeof n[t] ? n[t].toLowerCase() : n[t],
                    i = "string" == typeof r[t] ? r[t].toLowerCase() : r[t];
                return "DESC" === e ? a == i ? 0 : a < i ? 1 : -1 : a == i ? 0 : a > i ? 1 : -1
            }
        }

        function b(t, e) {
            var n = [],
                r = !1,
                a = null;
            for (var i in _.data[t])
                if (_.data[t].hasOwnProperty(i)) {
                    a = _.data[t][i], r = !0;
                    for (var o in e)
                        if (e.hasOwnProperty(o))
                            if ("string" == typeof e[o]) {
                                if (null === a[o] || a[o].toString().toLowerCase() != e[o].toString().toLowerCase()) {
                                    r = !1;
                                    break
                                }
                            } else if (a[o] != e[o]) {
                        r = !1;
                        break
                    }
                    r && n.push(i)
                }
            return n
        }

        function g(t, e) {
            var n = [];
            for (var r in _.data[t]) _.data[t].hasOwnProperty(r) && 1 == e(k(_.data[t][r])) && n.push(r);
            return n
        }

        function m(t) {
            var e = [];
            for (var n in _.data[t]) _.data[t].hasOwnProperty(n) && e.push(n);
            return e
        }

        function w(t, e) {
            for (var n = 0; n < e.length; n++) _.data[t].hasOwnProperty(e[n]) && delete _.data[t][e[n]];
            return e.length
        }

        function O(t, e, n) {
            for (var r = "", a = 0, i = 0; i < e.length; i++) {
                r = e[i];
                var o = n(k(_.data[t][r]));
                if (o) {
                    delete o.ID;
                    var f = _.data[t][r];
                    for (var u in o) o.hasOwnProperty(u) && (f[u] = o[u]);
                    _.data[t][r] = j(t, f), a++
                }
            }
            return a
        }

        function P() {
            try {
                return q.setItem(I, JSON.stringify(_)), !0
            } catch (t) {
                return !1
            }
        }

        function S() {
            return JSON.stringify(_)
        }

        function D(t) {
            throw new Error(t)
        }

        function k(t) {
            var e = {};
            for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
            return e
        }

        function T(t) {
            return !t.toString().match(/[^a-z_0-9]/gi)
        }

        function j(t, n) {
            for (var r = "", a = {}, i = 0; i < _.tables[t].fields.length; i++) n[r = _.tables[t].fields[i]] !== e && (a[r] = n[r]);
            return a
        }

        function x(t, n) {
            for (var r = "", a = {}, i = 0; i < _.tables[t].fields.length; i++) a[r = _.tables[t].fields[i]] = null === n[r] || n[r] === e ? null : n[r];
            return a
        }
        var I = "db_" + t,
            C = !1,
            _ = null;
        try {
            q = n == sessionStorage ? sessionStorage : localStorage
        } catch (t) {
            var q = n
        }
        return (_ = q[I]) && (_ = JSON.parse(_)) && _.tables && _.data || (T(t) ? (_ = {
            tables: {},
            data: {}
        }, P(), C = !0) : D("The name '" + t + "' contains invalid characters")), {
            commit: function() {
                return P()
            },
            isNew: function() {
                return C
            },
            drop: function() {
                r()
            },
            serialize: function() {
                return S()
            },
            tableExists: function(t) {
                return o(t)
            },
            tableFields: function(t) {
                return i(t)
            },
            tableCount: function() {
                return a()
            },
            columnExists: function(t, e) {
                return u(t, e)
            },
            createTable: function(t, e) {
                var n = !1;
                if (T(t))
                    if (this.tableExists(t)) D("The table name '" + t + "' already exists.");
                    else {
                        for (var r = !0, a = 0; a < e.length; a++)
                            if (!T(e[a])) {
                                r = !1;
                                break
                            }
                        if (r) {
                            for (var i = {}, a = 0; a < e.length; a++) i[e[a]] = !0;
                            delete i.ID, e = ["ID"];
                            for (var o in i) i.hasOwnProperty(o) && e.push(o);
                            s(t, e), n = !0
                        } else D("One or more field names in the table definition contains invalid characters")
                    }
                else D("The database name '" + t + "' contains invalid characters.");
                return n
            },
            createTableWithData: function(t, e) {
                ("object" != typeof e || !e.length || e.length < 1) && D("Data supplied isn't in object form. Example: [{k:v,k:v},{k:v,k:v} ..]");
                var n = Object.keys(e[0]);
                if (this.createTable(t, n)) {
                    this.commit();
                    for (var r = 0; r < e.length; r++) p(t, e[r]) || D("Failed to insert record: [" + JSON.stringify(e[r]) + "]");
                    this.commit()
                }
                return !0
            },
            dropTable: function(t) {
                f(t), l(t)
            },
            truncate: function(t) {
                f(t), c(t)
            },
            alterTable: function(t, e, n) {
                var r = !1;
                if (T(t)) {
                    if ("object" == typeof e) {
                        for (var a = !0, i = 0; i < e.length; i++)
                            if (!T(e[i])) {
                                a = !1;
                                break
                            }
                        if (a) {
                            for (var o = {}, i = 0; i < e.length; i++) o[e[i]] = !0;
                            delete o.ID, e = [];
                            for (var f in o) o.hasOwnProperty(f) && e.push(f);
                            d(t, e, n), r = !0
                        } else D("One or more field names in the table definition contains invalid characters")
                    } else if ("string" == typeof e)
                        if (T(e)) {
                            var u = [];
                            u.push(e), d(t, u, n), r = !0
                        } else D("One or more field names in the table definition contains invalid characters")
                } else D("The database name '" + t + "' contains invalid characters");
                return r
            },
            rowCount: function(t) {
                return f(t), h(t)
            },
            insert: function(t, e) {
                return f(t), p(t, x(t, e))
            },
            insertOrUpdate: function(t, e, n) {
                f(t);
                var r = [];
                if (e ? "object" == typeof e ? r = b(t, j(t, e)) : "function" == typeof e && (r = g(t, e)) : r = m(t), 0 == r.length) return p(t, x(t, n));
                var a = [];
                return O(t, r, function(t) {
                    return a.push(t.ID), n
                }), a
            },
            update: function(t, e, n) {
                f(t);
                var r = [];
                return e ? "object" == typeof e ? r = b(t, j(t, e)) : "function" == typeof e && (r = g(t, e)) : r = m(t), O(t, r, n)
            },
            query: function(t, e, n, r, a, i) {
                f(t);
                var o = [];
                return e ? "object" == typeof e ? o = b(t, j(t, e)) : "function" == typeof e && (o = g(t, e)) : o = m(t), v(t, o, r, n, a, i)
            },
            queryAll: function(t, e) {
                return e ? this.query(t, e.hasOwnProperty("query") ? e.query : null, e.hasOwnProperty("limit") ? e.limit : null, e.hasOwnProperty("start") ? e.start : null, e.hasOwnProperty("sort") ? e.sort : null, e.hasOwnProperty("distinct") ? e.distinct : null) : this.query(t)
            },
            deleteRows: function(t, e) {
                f(t);
                var n = [];
                return e ? "object" == typeof e ? n = b(t, j(t, e)) : "function" == typeof e && (n = g(t, e)) : n = m(t), w(t, n)
            }
        }
    }
    "undefined" != typeof module && module.exports ? module.exports = n : "function" == typeof define && define.amd ? define(function() {
        return n
    }) : t.localStorageDB = n
}("undefined" != typeof window ? window : this);

//global.localStorageDB = this.localStorageDB;