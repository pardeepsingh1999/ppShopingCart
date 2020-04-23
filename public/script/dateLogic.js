let timeLogic = function calculate(e) {
    const t = Date.now(), 
    a = new Date(t), 
    n = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 
    u = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], 
    r = a.getFullYear(), 
    l = n[a.getMonth()], 
    c = a.getDate(), 
    m = u[a.getDay()];
    console.log( m + "_" + c + "_" + l + "_" + r + "_" + pad(a.getHours()) + "_" + pad(a.getMinutes()) + "_" + pad(a.getSeconds()) + "_" + pad(a.getMilliseconds()) )
}

function pad(e) {
    var t = parseInt(e);
    return 10 > t ? "0" + t : t
}