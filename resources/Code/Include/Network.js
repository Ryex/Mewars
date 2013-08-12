/*global $MEW, Crafty*/
$MEW.Routes = {
    "UsersLogin":           ['API',       'POST',   '/api/users/login',         'JSON'],
    "UsersRegester":        ['API',       'POST',   '/api/users',               'JSON'],
    "MapsGetChunks":        ['API',       'POST',   '/api/get_map_chunks',      'JSON'],
    "GetGameByID":          ['API',       'POST',   '/api/get_game_by_id',      'JSON'],
    "GetResourceXML":       ['RESOURCE',  'GET',    '/xml/file/Resources.xml',  'XML' ],
    "GetResourceXMLDate":   ['RESOURCE',  'GET',    '/xml/date/Resources.xml',  'JSON'],
    "GetSceneUserXML":       ['RESOURCE',  'GET',    '/xml/file/SceneUser.xml',  'XML' ],
};

Crafty.c("Network", {

    init: function () {
        this.csrf_token = $('meta[name="csrf-token"]').attr('content');
    },
    
    GetHeaders: function(type) {
        return $MEW.Routes[type] || ['', '', '', ''];
    },

    Send: function(type, data) {
        var headers = this.GetHeaders(type);
        var ajax = this.getAjax(type, data, headers);
        if (ajax) ajax.done(this.Receive(type, headers[3])).fail(this.Error(type, headers));
    },

    Receive: function(type, datatype) {
        return function(data) {
            var responce = {};
            if (datatype === 'JSON') {
                try {
                    responce = JSON.parse(data);
                } catch (e) {
                    responce = data;
                }
            } else if (datatype === 'XML') {
                try {
                    var parser = new DOMParser();
                    responce = parser.parseFromString(data, "text/xml");
                } catch (e) {
                    responce = data;
                }
            } else {
                responce = data;
            }
            this.trigger(type, responce);
        };
    },

    Error: function(type, headers) {
        return function(e) {
            console.log("[NETWORK] " + type + 'Error', headers, e, e.message, e.stack);
            $MEW.Network.trigger(type + 'Error', {
                type: "Network Error",
                error: e,
                headers: headers
            });
            
        };
    },

    getAjax: function(type, data, headers) {
        var error;
        if (headers[0] === 'API') {
            return $.ajax(
                {
                    type: headers[1],
                    url: $MEW.API_URL + headers[2],
                    data: data,
                    context: this,
                    xhrFields: {
                        withCredentials: true
                    },
                    headers: {
                        'X-Transaction': headers[1] + ' ' + type,
                        'X-CSRF-Token': this.csrf_token
                    }
                }
            );
        } else if (headers[0] === 'RESOURCE') {
            return $.ajax(
                {
                    type: headers[1],
                    url: $MEW.RESOURCE_URL + headers[2],
                    data: data,
                    context: this,
                    xhrFields: {
                        withCredentials: true
                    },
                }
            );
        } else if (headers[0] === 'NODE') {
            error = new Error("Unspesified end point for network call '" + type + "'");
            console.log(error.message, error.stack);
        } else if (headers[0] === '') {
            error = new Error("Unspesified end point for network call '" + type + "'");
            console.log(error.message, error.stack);
        }
    },
    
    pBind: function(type, func) {
        this.unbind(type, func);
        this.bind(type, func);
    }
});