const xsenv = require("@sap/xsenv");
/**
 * DB utilities methods
 */
class GlobalUtilities {
    static async isRunnungInLocalHost() {
        try {
            return (
                xsenv.serviceCredentials({ label: "redis-cache" }).hostname === "127.0.0.1" ||
                xsenv.serviceCredentials({ label: "redis-cache" }).hostname === "localhost"
            );
        } catch (Error) {
            return false;
        }
    }
}

module.exports = GlobalUtilities;
