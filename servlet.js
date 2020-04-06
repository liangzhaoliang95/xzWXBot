module.exports = [
	require("./filter/servletChecker")([
		["/nc",require("./filter/nc")],
		["/", require("./filter/tokenChecker")]
	]),
	[require("./servlet/cronJob"),"/cronJob"],
	[require("./servlet/message"),"/message"],
	[require("./servlet/login"),"/login"],
	[require("./servlet/friend"),"/friend"]
]