// fizlib.js

function pow2(x) {
    return x * x
}

class Pomiar {
    constructor() {
        this.wartosci = []
        this._niepewnoscWzorcowania = 0
        this._niepewnoscEksperymentatora = 0
        this.onChanged = () => {}
    }

    applyChanges(newValues) {
        this._niepewnoscEksperymentatora = newValues._niepewnoscEksperymentatora
        this._niepewnoscWzorcowania = newValues._niepewnoscWzorcowania
        this.wartosci = newValues.wartosci

        this.onChanged()
    }

    hook(onChanged) {
        const orig = this.onChanged
        this.onChanged = () => {
            orig()
            onChanged()
        }
    }

    dodajPomiar(x) {
        this.wartosci.push(x)
        this.onChanged()
    }

    usunWymiarPoIndeksie(idx) {
        this.wartosci.splice(idx, 1)
        this.onChanged()
    }

    get pusty() {
        return this.wartosci.length == 0
    }

    get niepewnoscEksperymentatora() {
        return this._niepewnoscEksperymentatora
    }

    set niepewnoscEksperymentatora(x) {
        this._niepewnoscEksperymentatora = x
        this.onChanged()
    }

    get niepewnoscWzorcowania() {
        return this._niepewnoscWzorcowania
    }

    set niepewnoscWzorcowania(x) {
        this._niepewnoscWzorcowania = x
        this.onChanged()
    }

    sredniaArytmetyczna() {
        if (this.pusty)
            return NaN
        return this.wartosci.reduce((a, b) => a + b) / this.wartosci.length
    }

    niepewnoscStandardowaSquared() {
        // Metoda A
        const n = this.wartosci.length
        const srednia = this.sredniaArytmetyczna()
        const licznik = this.wartosci.reduce((a, b) => a + pow2((b - srednia)), 0)
        const mianownik = n * (n - 1)

        return licznik / mianownik
    }

    niepewnoscStandardowa() {
        return Math.sqrt(this.niepewnoscStandardowaSquared())
    }

    niepewnoscStandardowaBSquared() {
        // Metoda B - niepewność wzorcowania i eksperymentatora
        const wplywNiepewnosci = function (x) {
            return pow2(x) / 3
        }

        return wplywNiepewnosci(this.niepewnoscWzorcowania) 
             + wplywNiepewnosci(this.niepewnoscEksperymentatora)
    }

    niepewnoscStandardowaB() {
        return Math.sqrt(this.niepewnoscStandardowaBSquared())
    }

    niepewnoscPomiarowa() {
        if (this.znanaNiepewnoscPomiarowa) {
            return this.znanaNiepewnoscPomiarowa
        }

        // Pełna niepewność, wliczająca metody A i B
        return Math.sqrt(
            this.niepewnoscStandardowaSquared() +
            this.niepewnoscStandardowaBSquared()
        )
    }
}

export function nowyPomiar() {
    return new Pomiar()
}

export function zlozonaNiepewnoscStandardowa(pomiary, wspolczynnikiWrazliwosci) {
    let suma = 0
    for (let i = 0; i < pomiary.length; i++) {
        const udzialNiepewnosci = wspolczynnikiWrazliwosci[i] * pomiary[i].niepewnoscPomiarowa()
        suma += pow2(udzialNiepewnosci)
    }

    return Math.sqrt(suma)
}

export function niepewnoscRozszerzona(pomiary, wspolczynnikiWrazliwosci, k) {
    return k * zlozonaNiepewnoscStandardowa(pomiary, wspolczynnikiWrazliwosci)
}