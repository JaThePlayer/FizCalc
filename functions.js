
export function zlozonaNiepewnoscStandardowa(pomiary, wspolczynnikiWrazliwosci) {
    let suma = 0

    for (let i = 0; i < pomiary.length; i++) {
        const udzialNiepewnosci = wspolczynnikiWrazliwosci[i] * pomiary[i].niepewnoscPomiarowa()
        suma += udzialNiepewnosci * udzialNiepewnosci
    }

    return Math.sqrt(suma)
}

export const niepewnoscRozszerzona = (pomiary, wspolczynnikiWrazliwosci, k) => 
    k * zlozonaNiepewnoscStandardowa(pomiary, wspolczynnikiWrazliwosci)
