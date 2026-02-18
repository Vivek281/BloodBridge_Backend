module.exports = (error, req, res, next) => {
    let code = error.code ?? 500;
    let detail = error.detail ?? error.details ?? null;
    let message = error.message ?? "Server Error...";
    let status = error.status ?? "SERVER_ERR";
    
    if(code > 599) {code = 500;}

    res.status(code).json({
        data: detail,
        message : message,
        status: status
    })
}