
export function zlozonaNiepewnoscStandardowa(pomiary, wspolczynnikiWrazliwosci) {
    let suma = 0
    for (let i = 0; i < pomiary.length; i++) {
        const udzialNiepewnosci = wspolczynnikiWrazliwosci[i] * pomiary[i].niepewnoscPomiarowa()
        suma += udzialNiepewnosci * udzialNiepewnosci
    }

    return Math.sqrt(suma)
}

export function niepewnoscRozszerzona(pomiary, wspolczynnikiWrazliwosci, k) {
    return k * zlozonaNiepewnoscStandardowa(pomiary, wspolczynnikiWrazliwosci)
}