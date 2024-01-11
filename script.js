let listsContainer = document.querySelector("#listsContainer");
let lists = [];

class List {
    id = String(Date.now()).slice(-10);
    container;
    cardsContainer;

    constructor(title) {
        this.title = title;
        this.cards = [];
        this.display();
    }

    display() {
        let listHTML = `
        <div class="list" data-id=${this.id}>
            <div class="title">
                <h2>${this.title}</h2> <button class="deleteListBtn">Elimina</button>
            </div>
            <form>
                <input class="cardTextInput" type="text" placeholder="Inserisci un nuovo task">
                <button class="addBtn">Aggiungi alla lista</button>
            </form>
            <div class="cardsContainer">
            </div>
        </div>`;

        listsContainer.insertAdjacentHTML("beforeend", listHTML);

        this.container = document.querySelector(`[data-id="${this.id}"]`);
        this.cardsContainer = this.container.querySelector(".cardsContainer");
        this.form = this.container.querySelector("form");
        this.form.querySelector("input").focus();

        this.buttonsHandler();
    }

    buttonsHandler() {
        this.container.addEventListener("click", (e) => {
            let target = e.target;

            if (target.classList.contains("delete"))
                this.deleteCard(target.closest(".card"));

            if (target.classList.contains("check"))
                this.toggleCardCheck(target.closest(".card"));

            if (target.classList.contains("deleteListBtn"))
                this.delete();
        })

        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.createCard();
        })
    }

    delete() {
        let listIndex = lists.findIndex(list => list.id === this.id);
        lists.splice(listIndex, 1);
        this.removeWithAnimation(this.container);
        saveToLocalStorage();
    }

    createCard() {
        let cardTextInput = this.container.querySelector(".cardTextInput");

        let cardText = cardTextInput.value;
        cardTextInput.value = "";

        if (cardText == "") return;

        let today = new Date();
        let formattedDate = Intl.DateTimeFormat("it-IT").format(today);

        let card = new Card(cardText, formattedDate, this.id, this.cardsContainer);
        this.cards.push(card);

        saveToLocalStorage();
    }

    deleteCard(cardEl) {
        let findCardIndex = this.cards.findIndex(card => card.id === cardEl.dataset.id);
        this.cards.splice(findCardIndex, 1);

        this.removeWithAnimation(cardEl);
        saveToLocalStorage();
    }

    removeWithAnimation(element) {
        element.classList.add("fade-out");
        setTimeout(() => element.remove(), 0.25 * 1000);
    }

    toggleCardCheck(cardEl) {
        let cardObject = this.cards.find(card => card.id === cardEl.dataset.id);
        cardObject.toggleCheck();
    }

    getCard(cardID) {
        return this.cards.find(card => card.id === cardID);
    }
}

class Card {
    id = String(Date.now()).slice(-10);
    checked = false;
    container;

    constructor(text, date, listId) {
        this.text = text;
        this.date = date;
        this.listId = listId;
        this.display();
    }

    display() {
        let cardHTML = `
        <div class="card" data-id=${this.id}>
            <p>
                <span class="cardSpan ${this.checked ? "checked" : ""}">${this.text}</span>
                <span class="date"> - ${this.date}</span>
            </p>
            <div class="images">
                <img src="check-mark.png" class="check"></img>
                <img src="delete.png" class="delete"></img>
            </div>
        </div>
        `;

        this.listContainer = document.querySelector(`[data-id="${this.listId}"]`).querySelector(".cardsContainer");
        this.listContainer.insertAdjacentHTML("afterBegin", cardHTML);

        this.container = this.listContainer.querySelector(`[data-id="${this.id}"]`);
        saveToLocalStorage();
    }

    toggleCheck() {
        let cardSpan = this.container.querySelector(".cardSpan");
        cardSpan.classList.toggle("checked");
        this.checked = !this.checked;
        saveToLocalStorage();
    }
}

document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("newListBtn")) return;
    let formHTML = `
    <div id="listForm">
        <input type="text" placeHolder = "Inserisci il titolo della nuova lista">
        <div class="buttonsContainer">
            <button class="createListBtn">Crea lista</button>
            <button class="revertBtn">x</button>
        </div>
    </div>`;

    let addNewListButton = e.target;
    let formContainer = addNewListButton.closest(".list-form");

    //Display form
    formContainer.insertAdjacentHTML("beforeEnd", formHTML);
    addNewListButton.classList.add("hidden");

    //Add listeners to the buttons
    formContainer.addEventListener("click", fomButtons);
})

let fomButtons = function (e) {
    let target = e.target;
    if (!target.classList.contains("revertBtn") && !target.classList.contains("createListBtn")) return;

    let formContainer = target.closest(".list-form");

    if (target.classList.contains("revertBtn"))
        revertChoice(formContainer);

    if (target.classList.contains("createListBtn"))
        createList(formContainer);
}

let revertChoice = function (formContainer) {
    let listForm = formContainer.querySelector("#listForm");
    formContainer.querySelector(".newListBtn").classList.remove("hidden");
    listForm.remove();
}

let createList = function (formContainer) {
    let title = formContainer.querySelector("input").value;
    if (title == "") return;

    formContainer.remove();

    let list = new List(title);
    lists.push(list);

    saveToLocalStorage();

    createNewListPrompt();
}

let saveToLocalStorage = function () {
    localStorage.setItem("lists", JSON.stringify(lists));
}

let loadLocalStorage = function () {
    let data = JSON.parse(localStorage.getItem("lists"));
    if (!data) return;

    lists = data;

    lists.forEach(list => {
        list.__proto__ = List.prototype;
        list.display();

        list.cards.forEach(card => {
            card.__proto__ = Card.prototype;
            card.display();
        });
    });
}

let createNewListPrompt = function () {
    let addNewListHTML = `
    <div class="list-form">
        <button class="newListBtn">+ Aggiungi Nuova lista</button>
    </div >`;

    listsContainer.insertAdjacentHTML("beforeend", addNewListHTML);
}

let init = function () {
    loadLocalStorage();
    createNewListPrompt();
}

init();



