import Pomiar from "./pomiar.js";
import * as functions from "./functions.js";

const pomiaryList = document.getElementById("pomiaryList");

function createPomiarLi(id, nazwa) {
    const pomiarHtml = document.createElement("li")

    pomiarHtml.innerHTML = (`
        <li>${nazwa}</li>
        <label for="${id}npEksperymentatora">Niepewność eksperymentatora:</label>
        <input type="text" id="${id}npEksperymentatora" name="${id}npEksperymentatora"></input><br>
        <label for="${id}npWz">Niepewność wzorcowania:</label>
        <input type="text" id="${id}npWz" name="${id}npWz"></input><br>
        <label for="${id}nowy"> Nowy pomiar: </label>
        <input type="text" id="${id}nowy" name="${id}nowy"></input>
        <button id="${id}dodaj">Dodaj</button><br>

        <ol type="I" id="${id}listaPomiarow"></ol>

        Średnia arytmetyczna: <span id="${id}srednia"></span><br>
        Niepewność pomiarowa: <span id="${id}np"></span><br>
    `)

    pomiaryList.appendChild(pomiarHtml)
}

function addPomiarHtml(id, nazwa) {
    const pomiar = new Pomiar();
    createPomiarLi(id, nazwa)

    const listaPomiarow = document.getElementById(`${id}listaPomiarow`)
    const nowyPomiarInput = document.getElementById(`${id}nowy`)
    const sredniaSpan = document.getElementById(`${id}srednia`)
    const npSpan = document.getElementById(`${id}np`)
    const npEksperymentatoraEl = document.getElementById(`${id}npEksperymentatora`)
    const npWzorcowaniaEl = document.getElementById(`${id}npWz`)

    function update() {
        sredniaSpan.textContent = pomiar.sredniaArytmetyczna()
        npSpan.textContent = pomiar.niepewnoscPomiarowa()

        listaPomiarow.innerHTML = ""
        pomiar.wartosci.forEach((nowyPomiar, i) => {
            const delButton = document.createElement("button")
            delButton.textContent = "-"
            delButton.addEventListener("click", () => {
                pomiar.usunWymiarPoIndeksie(i)
            })

            const listItem = document.createElement("li")
            listItem.textContent = nowyPomiar
            listItem.appendChild(delButton)
            listaPomiarow.appendChild(listItem)
        });

        // Update the text input element's value to newValue, 
        // if the numerical value of that text input isn't equal to the newValue.
        // The check is needed to allow the user to type '.' without it being reset.
        function updateInputTextIfNeeded(inputEl, newValue) {
            if (parseFloat(inputEl.value) !== newValue)
                inputEl.value = newValue
        }

        updateInputTextIfNeeded(npEksperymentatoraEl, pomiar.niepewnoscEksperymentatora)
        updateInputTextIfNeeded(npWzorcowaniaEl, pomiar.niepewnoscWzorcowania)
    }
    pomiar.hook(update)

    // We have to use `function()` instead of `() =>` here, so that `this` is set to the HTMLElement instance
    // - arrow functions do not have their own `this` value
    npEksperymentatoraEl.addEventListener("input", function() {
        const nowa = parseFloat(this.value)
        if (!Number.isNaN(nowa))
            pomiar.niepewnoscEksperymentatora = nowa
    })
    npWzorcowaniaEl.addEventListener("input", function() {
        const nowa = parseFloat(this.value)
        if (!Number.isNaN(nowa))
            pomiar.niepewnoscWzorcowania = nowa
    })

    const dodajPomiar = () => {
        const nowyPomiar = parseFloat(nowyPomiarInput.value)
        if (!Number.isNaN(nowyPomiar)) {
            pomiar.dodajPomiar(nowyPomiar)
        }

        nowyPomiarInput.value = ""
    }

    document.getElementById(`${id}dodaj`).addEventListener("click", dodajPomiar)
    nowyPomiarInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter")
            dodajPomiar()
    })

    update()

    return pomiar
}

const gestoscEl = document.getElementById("gestosc")
const zlozonaNiepewnoscStandardowaEl = document.getElementById("zlozonaNiepewnoscStandardowa")
const niepewnoscRozszerzonaEl = document.getElementById("niepewnoscRozszerzona")

const m = addPomiarHtml("m", "m[g] (masa)")
const d = addPomiarHtml("d", "d[mm] (średnica)")
const h = addPomiarHtml("h", "h[mm] (wysokość)")
const mdh_arr = [m, d, h];

function pomiarZmieniony() {
    const VAvg = Math.PI * d.sredniaArytmetyczna() * d.sredniaArytmetyczna() * h.sredniaArytmetyczna() / 4
    const pAvg = m.sredniaArytmetyczna() / VAvg

    const cm = pAvg / m.sredniaArytmetyczna()
    const cd = -2 * pAvg / d.sredniaArytmetyczna()
    const ch = -pAvg / h.sredniaArytmetyczna()

    const carr2 = [cm, cd, ch];

    gestoscEl.textContent = pAvg
    zlozonaNiepewnoscStandardowaEl.textContent = functions.zlozonaNiepewnoscStandardowa(mdh_arr, carr2)
    niepewnoscRozszerzonaEl.textContent = functions.niepewnoscRozszerzona(mdh_arr, carr2, 2)
}
mdh_arr.forEach(pomiar => pomiar.hook(pomiarZmieniony))

document.getElementById("skopiujPomiary").addEventListener("click", () =>
    navigator.clipboard.writeText(JSON.stringify(mdh_arr.map(x => x.serialize())))
        .then(() => console.log("Copying to clipboard was successful!"))
        .catch(err => console.error("Could not copy text: ", err))
)

document.getElementById("wklejPomiary").addEventListener("click", () =>
    navigator.clipboard.readText().then(txt => {
        const pomiary = JSON.parse(txt)

        if (Array.isArray(pomiary) && pomiary.length === 3) {
            m.applyChanges(pomiary[0])
            d.applyChanges(pomiary[1])
            h.applyChanges(pomiary[2])
        }
    })
)

/** Archived */

/*
const p1 = fizlib.nowyPomiar();
p1.dodajPomiar(7.35);           // https://ftims.edu.p.lodz.pl/course/view.php?id=24
p1.dodajPomiar(7.3);
p1.dodajPomiar(7.35);
p1.dodajPomiar(7.4);
p1.dodajPomiar(7.3);
p1.dodajPomiar(7.3);
p1.dodajPomiar(7.35);

p1.niepewnoscWzorcowania = 0.05;
p1.niepewnoscEksperymentatora = 0.10;

console.log("standardowaA", p1.niepewnoscStandardowa());
console.log("standardowaB", p1.niepewnoscStandardowaB());
console.log("pomiarowa", p1.niepewnoscPomiarowa());
*/

/*
// Przykład 8
const d = fizlib.nowyPomiar();
const h = fizlib.nowyPomiar();
const m = fizlib.nowyPomiar();

for (let i = 0; i < 5; i++) {
    d.dodajPomiar(20.332);
    h.dodajPomiar(2.106);
    m.dodajPomiar(0.78242);
}

d.znanaNiepewnoscPomiarowa = 3.051 * Math.pow(10, -2);
h.znanaNiepewnoscPomiarowa = 4.623 * Math.pow(10, -2);
m.znanaNiepewnoscPomiarowa = 1.121 * Math.pow(10, -4);

const pAvg = (4 * m.sredniaArytmetyczna()) / (Math.PI * Math.pow(d.sredniaArytmetyczna(), 2) * h.sredniaArytmetyczna());

console.log("pAvg", pAvg);

const cm = pAvg / m.sredniaArytmetyczna()
const cd = -2*pAvg / d.sredniaArytmetyczna()
const ch = -pAvg / h.sredniaArytmetyczna()

console.log("cm", cm);
console.log("cd", cd);
console.log("ch", ch);

console.log("niepewnoscPomiarowa", d.niepewnoscPomiarowa());
console.log("np", fizlib.zlozonaNiepewnoscStandardowa(
    [m, d, h],
    [cm, cd, ch]
));
console.log("U", fizlib.niepewnoscRozszerzona(
    [m, d, h],
    [cm, cd, ch],
    2
));
*/
