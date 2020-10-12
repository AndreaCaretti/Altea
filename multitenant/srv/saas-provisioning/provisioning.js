module.exports = (service) => {
	service.on("dependencies", async (req, next) => {
		const res = await next();
		const deps = [
			{ xsappname: "6e011442-8e05-4078-a0d4-55e9dec06173!b13893|portal-cf-service!b1483" },
		];
		console.log(
			"[INFO ][ON_GET_DEPENDENCIES] Dependent applications/services - : " +
				JSON.stringify(deps),
		);
		return deps;
	});

	service.on("UPDATE", "tenant", async (req, next) => {
		const res = await next(); // first call default implementation which is doing the HDI container creation
		let url = `https://${req.data.subscribedSubdomain}-dev-cap-template-approuter.cfapps.us10.hana.ondemand.com`;
		console.log("[INFO ][ON_UPDATE_TENANT] " + "Application URL is " + url);
		return url;
	});
};
