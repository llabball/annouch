function(doc, req) {
	var resp = {headers: {'Content-Type': 'application/json;charset=utf-8'}}
	var data = {}

	if (req.body.length === 0 || req.body === 'undefined') {
		resp.code = 417
		resp.body = JSON.stringify({error: 'aborted', reason: 'no content'})
		return [null,resp]
	}	

	if (req.id && req.id.length > 0 && !doc) {
		resp.code = 404
		resp.body = JSON.stringify({error: 'aborted', reason: 'doc not found'})
		return [null,resp]
	}	

	try {
		data = JSON.parse(req.body)
	} catch (e) {
		resp.code = 417
		resp.body = JSON.stringify({error: 'aborted', reason: 'could not parse content'})
		return [null,resp]
	}
	

	if (!doc) {
		//create a new annotation
		doc = data
		doc._id = doc.id = req.uuid //the bookmarklet expects the property id
		resp.code = 201 //workaround until webkit can handle 303 SEE OTHER over CORS
	} else {
		resp.code = 202 //workaround until webkit can handle 303 SEE OTHER over CORS
		//update an annotation
		for (p in data) {
			if (p !== '_id' && p !== '_revisions' && data.hasOwnProperty(p)) {
				doc[p] = data[p]
			}
		}
		if (req.method === 'DELETE')
			doc._deleted = true
	}
	
	if (req.method !== 'DELETE') {
		resp.headers.Location = 'http://' + req.headers.Host + '/store/' + req.headers['x-couchdb-vhost-path'] + '/' + doc.id
		resp.body = JSON.stringify(doc)
	} else {
		resp.code = 204
	}

	return [doc,resp]
}