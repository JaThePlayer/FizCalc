export class Pomiar {
    #niepewnoscWzorcowania
    #niepewnoscEksperymentatora

    constructor() {
        this.wartosci = []
        this.#niepewnoscWzorcowania = 0
        this.#niepewnoscEksperymentatora = 0
        this.onChanged = () => {}
    }

    applyChanges(newValues) {
        this.#niepewnoscEksperymentatora = newValues.niepewnoscEksperymentatora
        this.#niepewnoscWzorcowania = newValues.niepewnoscWzorcowania
        this.wartosci = newValues.wartosci

        this.onChanged()
    }

    serialize() {
        return {
            niepewnoscEksperymentatora: this.niepewnoscEksperymentatora,
            niepewnoscWzorcowania: this.niepewnoscWzorcowania,
            wartosci: this.wartosci,
        }
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
        return this.#niepewnoscEksperymentatora
    }

    set niepewnoscEksperymentatora(x) {
        this.#niepewnoscEksperymentatora = x
        this.onChanged()
    }

    get niepewnoscWzorcowania() {
        return this.#niepewnoscWzorcowania
    }

    set niepewnoscWzorcowania(x) {
        this.#niepewnoscWzorcowania = x
        this.onChanged()
    }

    sredniaArytmetyczna() {
        if (this.pusty)
            return NaN
        return this.wartosci.reduce((a, b) => a + b) / this.wartosci.length
    }

    /** Metoda A **/
    niepewnoscStandardowaSquared() {
        const n = this.wartosci.length
        const srednia = this.sredniaArytmetyczna()
        const licznik = this.wartosci.reduce((a, b) => a + (b - srednia) ** 2, 0)
        const mianownik = n * (n - 1)

        return licznik / mianownik
    }

    niepewnoscStandardowa() {
        return Math.sqrt(this.niepewnoscStandardowaSquared())
    }

    /** Metoda B - niepewność wzorcowania i eksperymentatora **/
    niepewnoscStandardowaBSquared() {
        const wplywNiepewnosci = function (x) {
            return x * x / 3
        }

        return wplywNiepewnosci(this.niepewnoscWzorcowania) 
             + wplywNiepewnosci(this.niepewnoscEksperymentatora)
    }

    niepewnoscStandardowaB() {
        return Math.sqrt(this.niepewnoscStandardowaBSquared())
    }

    /** Pełna niepewność, wliczająca metody A i B **/
    niepewnoscPomiarowa() {
        if (this.znanaNiepewnoscPomiarowa) {
            return this.znanaNiepewnoscPomiarowa
        }

        return Math.sqrt(
            this.niepewnoscStandardowaSquared() +
            this.niepewnoscStandardowaBSquared()
        )
    }
}

export default Pomiar;
