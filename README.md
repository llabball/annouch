Annouch
=======

Annouch is a CouchApp that can store annotations from [Annotator][1].

[1]: http://okfnlabs.org/annotator/

## use the annotateit.org Bookmarklet
**1. create an account on annotateit.org**

**2. Copy and configure (i used XYZ.iriscouch.com/store) the following code into a bookmarklet of your browser**

```js
javascript:(
  function(a, b) {
    a._annotatorConfig = {
      auth: {
        tokenUrl: "http://annotateit.org/api/token"
      },
      store: {
        prefix: "http://YOUR_OWN_API_ENDPOINT"
      },
      tags: !0
    }, s = b.body.appendChild(b.createElement("script")), s.language = "javascript", s.src = "http://assets.annotateit.org/bookmarklet/bootstrap.js"
  }
)(this,this.document);
```
**3. configure a vhost** (local.ini)
```
[vhosts]
XYZ.iriscouch.com/store = DBNAME/_design/annouch/_rewrite
```
**4. enable CORS** (local.ini)
```
[cors]
headers = Accept, Origin, x-annotator-auth-token, Content-Type
methods = PUT, POST, GET, OPTIONS, DELETE
origins = *
```

## Core storage API

The storage API is defined in terms of a `prefix` and a number of endpoints. It attempts to follow the principles of REST, and emits JSON documents to be parsed by the Annotator. Each of the following endpoints for the storage API is expected to be found on the web at `prefix` + `path`. For example, if the prefix were `http://example.com/api`, then the **index** endpoint would be found at `http://example.com/api/annotations`.

General rules are those common to most REST APIs. If a resource cannot be found, it returns `404 NOT FOUND`. If an action is not permitted for the current user, it returns `401 NOT AUTHORIZED`, otherwise it returns `200 OK`. It sends JSON text with the header `Content-Type: application/json;charset=utf-8`.

Below you can find details of the six core endpoints, **root**, **index**, **create**, **read**, **update**, **delete**, **search**.

## root

- method: `GET`
- path: `/`
- returns: object containing store metadata, including API version

Example:

```
$ curl http://example.com/api/
{
  "name": "Annotator Store API",
  "version": "2.0.0"
}
```

## index

- method: `GET`
- path: `/annotations`
- returns: a list of all annotation objects

```json
$ curl http://example.com/api/annotations
[
  {
    "text": "Example annotation text",
    "ranges": [ ... ],
    ...
  },
  {
    "text": "Another annotation",
    "ranges": [ ... ],
    ... 
  },
  ...
]
```

## create

- method: `POST`
- path: `/annotations`
- receives: an annotation object, sent with `Content-Type: application/json`
- returns: `201 CREATED`, Location header with the read uri, the new doc as JSON

Example:

```
$ curl -i -X POST \
       -H 'Content-Type: application/json' \
       -d '{"text": "Annotation text"}' \
       http://example.com/api/annotations
HTTP/1.0 201 CREATED
Location: http://example.com/api/annotations/d41d8cd98f00b204e9800998ecf8427e
{
  "id": "d41d8cd98f00b204e9800998ecf8427e",
  "text": "Annotation text",
  ...
} 
```

## read

- method: `GET`
- path: `/annotations/<id>`
- returns: an annotation object

Example:

```
$ curl http://example.com/api/annotations/d41d8cd98f00b204e9800998ecf8427e
{
  "id": "d41d8cd98f00b204e9800998ecf8427e",
  "text": "Annotation text",
  ...
} 
```

## update

- method: `PUT`
- path: `/annotations/<id>`
- receives: a (partial) annotation object, sent with `Content-Type: application/json`
- returns: `202 ACCEPTED`, Location header with the read uri, the updated doc as JSON

Example:

```
$ curl -i -X PUT \
       -H 'Content-Type: application/json' \
       -d '{"text": "Updated annotation text"}' \
       http://example.com/api/annotations/d41d8cd98f00b204e9800998ecf8427e
HTTP/1.0 202 ACCEPTED
Location: http://example.com/api/annotations/d41d8cd98f00b204e9800998ecf8427e
{
  "id": "d41d8cd98f00b204e9800998ecf8427e",
  "text": "Annotation text",
  ...
} 
```

## delete

- method: `DELETE`
- path: `/annotations/<id>`
- returns: `204 NO CONTENT`, and -- obviously -- no content

```
$ curl -i -X DELETE http://example.com/api/annotations/d41d8cd98f00b204e9800998ecf8427e
HTTP/1.0 204 NO CONTENT
Content-Length: 0
```

## search

- method: `GET`
- path: `/search?uri=http://domain.tld/path`
- returns: an object with `total` and `rows` fields. `total` is an integer denoting 
  the *total* number of annotations matched by the search, while `rows` is a list containing
  what might be a subset of these annotations.
- this method also support the `limit` and `offset` query parameters for paging through results.

```
$ curl http://example.com/api/search?uri=http://domain.tld/path
{
  "total": 43127,
  "rows": [
    {
      "id": "d41d8cd98f00b204e9800998ecf8427e",
      "text": "Updated annotation text",
      ...
    },
    ...
  ]
}
```

License
-------

Annouch is licensed under the MIT License.
