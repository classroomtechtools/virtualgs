function Hello(defaults={}) {
    const {Sheets} = Import;
    const sheets = Sheets.openFromId('17oDKYdAv-vc59K9Mr5KNGXOFon2_04BrbVeOQu0dyiU');
	const ss = SpreadsheetApp.openFromId('17oDKYdAv-vc59K9Mr5KNGXOFon2_04BrbVeOQu0dyiU');
    return ss.get('Sheet1!A5');
}

function BlankFunction () {

}

function Echo (param) {
    return param;
}

function Cannot_(param) {
    return param;
}

function LongScript(param) {
    const arr = [1, 2, 3, 4];
    arr.forEach(function (num) {
        yikes;
    });

}
