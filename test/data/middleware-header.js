module.exports = function(req, res, next) {
	res.setHeader('x-host-received', req.headers.host);
	if (req.headers.via) {
		res.setHeader('x-via-received', req.headers.via);
	}
	next();
}
