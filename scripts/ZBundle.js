const Import = {};
(function (exports, window) {

    class Sheets {
        constructor (id=null) {
            if (id === null) throw new Error("Not implemented");

            this.id = id;

        }
        static fromId (id) {
            return new Sheets(id);
        }
        get(range) {
            // ScriptApp.get script is called here
            const token = ScriptApp.getOauthToken();

            const url = `https://sheets.googleapis.com/v4/spreadsheets/17oDKYdAv-vc59K9Mr5KNGXOFon2_04BrbVeOQu0dyiU/values:batchGet?ranges=${range}&majorDimension=ROWS&valueRenderOption=FORMULA&dateTimeRenderOption=SERIAL_NUMBER`;
            const obj = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                muteHttpExceptions: true,
                method: "get"
            };

            // this is the normal way to get this:
            return UrlFetchApp.fetch(url, obj);
        }
        static openFromId (...params) {
            return new Sheets(...params);
        }
    }

	exports.Sheets = Sheets;
})(Import, this)
