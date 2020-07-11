"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // массив для хранения объявлений
    const dataBase = JSON.parse(localStorage.getItem("awito")) || [];
    let counter = dataBase.length; // счетчик ID обьявлений
    const addAd = document.querySelector(".add__ad");
    const modalAdd = document.querySelector(".modal__add");
    const modalBtnSubmit = document.querySelector(".modal__btn-submit");
    const modalSubmit = document.querySelector(".modal__submit"); // form
    const modalItem = document.querySelector(".modal__item");
    const catalog = document.querySelector(".catalog");
    const modalBtnWarning = document.querySelector(".modal__btn-warning");
    const modalFileInput = document.querySelector(".modal__file-input");
    const modalFileBtn = document.querySelector(".modal__file-btn");
    const modalImageAdd = document.querySelector(".modal__image-add");
    const modalStatusItem = document.querySelector(".modal__status-item");
    const modalImg = document.querySelector(".modal__image-item");
    const modalHeaderItem = document.querySelector(".modal__header-item");
    const modalDescriptionItem = document.querySelector(".modal__description-item");
    const modalCostItem = document.querySelector(".modal__cost-item");
    const searchInput = document.querySelector(".search__input");

    // сохранение дефолтных значений формы
    const textModalBtn = modalFileBtn.textContent;
    const srcModalImg = modalImageAdd.src;

    // получение всех полей формы в виде массива (кроме кнопок)

    const elementsModalSubmit = [...modalSubmit.elements].filter(
        (elem) => elem.tagName !== "BUTTON" && elem.type !== "submit"
    );
    // временное хранение фото
    const infoPhoto = {};

    // сохранение БД в localStorage

    const saveDB = () => localStorage.setItem("awito", JSON.stringify(dataBase));

    //  Проверка заполнения всех полей формы

    const checkForm = () => {
        const validForm = elementsModalSubmit.every((elem) => elem.value);
        modalBtnSubmit.disabled = !validForm; //разблокировка кнопки отправить
        modalBtnWarning.style.display = validForm ? "none" : ""; // убрать надпись
    };

    //функция закрытия модальных окон
    const closeModal = (event) => {
        const target = event.target;
        if (target.closest(".modal__close") || target.classList.contains("modal") || event.code === "Escape") {
            document.removeEventListener("keydown", closeModal);
            modalAdd.classList.add("hide");
            modalItem.classList.add("hide");
            modalSubmit.reset();
            modalImageAdd.src = srcModalImg;
            modalFileBtn.textContent = textModalBtn;
            checkForm();
        }
    };
    // вывод карточки объявления
    const renderCard = (DB = dataBase) => {
        catalog.textContent = "";

        DB.forEach((item) => {
            //  console.log(item.id);
            catalog.insertAdjacentHTML(
                "beforeend",
                `
                <li class="card" data-id="${item.id}">
					<img class="card__image" src="data:image/jpeg;base64,${item.image}" alt="test">
					<div class="card__description">
						<h3 class="card__header">${item.nameItem}</h3>
						<div class="card__price">${item.costItem} ₽</div>
					</div>
				</li>
                `
            );
        });
    };

    modalFileInput.addEventListener("change", (event) => {
        const target = event.target;
        const reader = new FileReader();
        const file = target.files[0];
        infoPhoto.filename = file.name;
        infoPhoto.size = file.size;
        reader.readAsBinaryString(file);
        reader.addEventListener("load", (event) => {
            if (infoPhoto.size < 200000) {
                modalFileBtn.textContent = infoPhoto.filename;
                infoPhoto.base64 = btoa(event.target.result);
                modalImageAdd.src = `data:image/jpeg;base64,${infoPhoto.base64}`;
            } else {
                modalFileBtn.textContent = "Размер файла не более 200Кб";
                modalFileInput.value = "";
                checkForm();
            }
        });
    });

    //ПОИСК
    searchInput.addEventListener("input", () => {
        const valueSearch = searchInput.value.trim().toLowerCase();
        if (valueSearch.length > 2) {
            const result = dataBase.filter(
                (item) =>
                    item.nameItem.toLowerCase().includes(valueSearch) ||
                    item.descriptionItem.toLowerCase().includes(valueSearch)
            );
            renderCard(result);
        }
    });

    // отправка формы
    modalSubmit.addEventListener("submit", (event) => {
        event.preventDefault(); // отмена дефолтного поведения Submit
        const itemObj = {};
        for (const elem of elementsModalSubmit) {
            itemObj[elem.name] = elem.value;
        }
        itemObj.id = counter++;
        itemObj.image = infoPhoto.base64;
        dataBase.push(itemObj);
        closeModal({ target: modalAdd });
        saveDB();
        renderCard();
    });

    // при заполнении формы - проверка
    modalSubmit.addEventListener("input", checkForm);

    // открыть модальное окно "Объявление"
    addAd.addEventListener("click", () => {
        modalAdd.classList.remove("hide");
        modalBtnSubmit.disabled = true; // блокировать кнопку отправить
        document.addEventListener("keydown", closeModal);
    });

    // открыть модальное окно "Купить"
    catalog.addEventListener("click", (event) => {
        const target = event.target;
        const card = target.closest(".card");
        if (card) {
            const item = dataBase.find((obj) => {
                return obj.id === parseInt(card.dataset.id);
            });
            modalImg.src = `data:image/jpeg;base64,${item.image}`;
            modalHeaderItem.textContent = item.nameItem;
            modalStatusItem.textContent = item.status === "new" ? "Новый" : "Б/У";
            modalDescriptionItem.textContent = item.descriptionItem;
            modalCostItem.textContent = item.costItem + " ₽";
            modalItem.classList.remove("hide");
            document.addEventListener("keydown", closeModal);
        }
    });

    // закрыть модальное окно "Объявление"
    modalAdd.addEventListener("click", closeModal);
    // закрыть модальное окно "Купить"
    modalItem.addEventListener("click", closeModal);
    renderCard();
});
