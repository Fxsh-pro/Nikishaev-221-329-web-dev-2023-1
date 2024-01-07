const api_key = '99bc2746-b676-49f8-9383-984c72aa1141';
let routes;
let filteredRoutes;
let currentPage = 0;
let routesPerPage = 3;
let selectedRouteId = -1;
let selectedRouteName = '';
let guids;
let filteredGuids;
let selectedGuidPrice;
let selectedGuidId;

function fetchAndPopulateRoutes(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            routes = data;
            filteredRoutes = [...routes];
            populateRoutesTable();
            setupPagination();
            fillRouteFilterOptions();
        })
        .catch(error => console.error('Error fetching routes:', error));
}

function fetchAndPopulateGuides() {
    const apiUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${selectedRouteId}/guides`);
    apiUrl.searchParams.set('api_key', api_key);

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            guids = data;
            filteredGuids = [...data];
            fillLanguageOptions();
            populateGuidesTable();
        })
        .catch(error => console.error('Error fetching guides:', error));
}

function populateGuidesTable() {
    const tableBody = document.querySelector('#guidesTable tbody');
    tableBody.innerHTML = '';

    filteredGuids.forEach(guide => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class = 'd-flex align-items-center justify-content-around'>
                 <img src="images/account.png" alt=""> 
                 <button class="btn btn-success guide-select-button" data-guid-id="${guide.id}" data-guid-name="${guide.name}" data-guid-price="${guide.pricePerHour}" data-bs-toggle="modal" data-bs-target="#reservationModal">Выбрать</button>
            </td>
            <td>${guide.name}</td>
            <td>${guide.language}</td>
            <td>${guide.workExperience}</td>
            <td>${guide.pricePerHour}</td>
        `;
        tableBody.appendChild(row);
    });
    document.getElementById('guidesTableContainer').style.display = 'block';

    document.querySelectorAll('.guide-select-button').forEach(btn => {
        btn.onclick = () => {
            chooseGuide(btn.dataset.guidName, btn.dataset.guidPrice, btn.dataset.guidId);
        };
    });
}

const chooseGuide = (guideName, guidPricePerHour, guideId) => {
    document.querySelector('#modalGuidInfo #guideName').innerHTML = guideName;
    document.querySelector('#modalRouteInfo #routeName').innerHTML = selectedRouteName;
    selectedGuidPrice = guidPricePerHour;
    selectedGuidId = guideId;
};


const fillLanguageOptions = () => {
    let selectElement = document.querySelector('#languageFilter');
    selectElement.innerHTML = '';
    const uniqueLanguages = new Set();
    selectElement.appendChild(createOption('Язык экскурсии'));
    filteredGuids.forEach(guide => {
        uniqueLanguages.add(guide.language);
    })
    uniqueLanguages.forEach(language => {
        selectElement.appendChild(createOption(language));
    });
}

document.getElementById('guidesFilterBtn').onclick = () => {
    const language = document.getElementById('languageFilter').value;
    const minExp = parseInt(document.getElementById('minExperience').value);
    const maxExp = parseInt(document.getElementById('maxExperience').value);

    if (language === 'Язык экскурсии' && isNaN(minExp) && isNaN(maxExp)) {
        filteredGuids = [...guids];
    } else {
        filteredGuids = guids.filter(guide => (
            (language === 'Язык экскурсии' || guide.language === language) &&
            (isNaN(minExp) || parseInt(guide.workExperience) >= minExp) &&
            (isNaN(maxExp) || parseInt(guide.workExperience) <= maxExp)
        ));
        if (filteredGuids.length === 0) {
            showAlert("Извините, гидов с такими критериями не найдено", 'alert-warning');
        }
    }
    populateGuidesTable();
}


const populateRoutesTable = () => {
    const tableBody = document.querySelector('#routesTable tbody');
    tableBody.innerHTML = '';

    for (let i = currentPage * routesPerPage; i < Math.min(filteredRoutes.length, currentPage * routesPerPage + routesPerPage); i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class = 'text-center'>
                <h5>${filteredRoutes[i].name}</h5>
                <button class="btn btn-success btn-sm route-select-button" data-route-id="${filteredRoutes[i].id}" data-route-name="${filteredRoutes[i].name}" >Записаться</button>
            </td>
            <td>${filteredRoutes[i].description}</td>
            <td>${filteredRoutes[i].mainObject}</td>
        `;
        if (selectedRouteId == filteredRoutes[i].id) {
            row.classList.add('selected-route');
        }
        tableBody.appendChild(row);
    }

    document.querySelectorAll('.route-select-button').forEach(btn => {
        btn.onclick = function () {
            chooseRoute(btn.dataset.routeId, btn.dataset.routeName);
        };
    });
}

const chooseRoute = (routeId, routeName) => {
    selectedRouteId = routeId;
    selectedRouteName = routeName;
    populateRoutesTable();
    fetchAndPopulateGuides(routeId);
};

const createPaginationButton = (content) => {
    const li = document.createElement('li');
    li.classList.add('page-item');
    const a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#pagination'
    a.innerHTML = content;
    li.appendChild(a);
    return li;
}

const fillRouteFilterOptions = () => {
    let selectElement = document.querySelector('.form-select');
    selectElement.innerHTML = '';
    const uniqueNames = new Set();
    selectElement.appendChild(createOption("Не выбрано"));
    filteredRoutes.forEach(route => {
        const names = extractNames(route.mainObject);
        names.forEach(name => {
            uniqueNames.add(name);
        });
    });
    uniqueNames.forEach(name => {
        selectElement.appendChild(createOption(name));
    });
}

const createOption = (content) => {
    const option = document.createElement('option');
    option.value = content;
    option.text = content;
    return option;
}

const extractNames = (inputString) => {
    const matches = [];
    let startIndex = 0;
    let left, right;

    while (startIndex < inputString.length) {
        left = inputString.indexOf('«', startIndex);
        if (left !== -1) {
            right = inputString.indexOf('»', left + 1);
            if (right !== -1) {
                const word = inputString.slice(left + 1, right).trim();
                if (word.length > 0 && word.length < 15) {
                    matches.push(word);
                }
                startIndex = right + 1;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return matches;
}

const setupPagination = () => {
    const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
    const pagination = document.querySelector('#pagination');
    pagination.innerHTML = '';
    let prev = createPaginationButton('<span aria-hidden="true">&laquo;</span>');
    prev.onclick = function () {
        currentPage = Math.max(0, currentPage - 7);
        setupPagination();
    };
    pagination.appendChild(prev);

    for (let i = currentPage; i <= Math.min(totalPages - 1, currentPage + 7); i++) {
        let item = createPaginationButton(i);
        item.onclick = function () {
            currentPage = i;
            populateRoutesTable();
        };
        pagination.appendChild(item);
    }
    let next = createPaginationButton('<span aria-hidden="true">&raquo;</span>');
    next.onclick = function () {
        if (currentPage + 7 < totalPages - 1) {
            currentPage = currentPage + 7;
            setupPagination();
        }
    };
    pagination.appendChild(next);
}

const filterRoutes = () => {
    const searchValue = document.getElementById('routes-search').value.toLowerCase().trim();
    const selectedWord = document.querySelector('.form-select').value;
    if (searchValue.length === 0 && selectedWord === "Не выбрано") {
        filteredRoutes = [...routes];
    } else {
        filteredRoutes = routes.filter(route =>
            (route.name.toLowerCase().includes(searchValue) || searchValue.length === 0) &&
            (route.mainObject.includes(selectedWord) || selectedWord === "Не выбрано")
        );
        if (filteredRoutes.length === 0) {
            showAlert("Извините, маршрутов с такими критериями не найдено", 'alert-warning');
        }
    }
    currentPage = 0;
    populateRoutesTable();
    setupPagination();
}

document.getElementById('searchIcon').onclick = filterRoutes;
document.querySelector('.form-select').onchange = filterRoutes;

const showAlert = (message, alertType) => {
    const alertContainer = document.querySelector('#notifications .container');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', alertType, 'alert-dismissible', 'm-0', 'my-2');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);
    window.scrollTo({top: 0, behavior: 'smooth'});
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

window.onload = () => {
    const allRoutesUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    allRoutesUrl.searchParams.set('api_key', api_key);
    fetchAndPopulateRoutes(allRoutesUrl);
};

document.getElementById('modal-submit').onclick = event => {
    const errorMessage = validateRequest()
    if (errorMessage.length !== 0) {
        showAlert(errorMessage, 'alert-danger');
    } else {
        createExcursion();
        showAlert('Вы записались на эксукрсию!', 'alert-success');
    }
}

async function createExcursion() {
    const createExcursionUrl = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;
    const optionFirst = document.getElementById('option1').checked ? 1 : 0;
    const optionSecond = document.getElementById('option2').checked ? 1 : 0;

    const formData = new FormData();

    formData.append("guide_id", selectedGuidId);
    formData.append("route_id", selectedRouteId);
    formData.append("date", document.getElementById('excursionDate').value);
    formData.append("time", document.getElementById('excursionStartTime').value);
    formData.append("duration", document.getElementById('duration').value);
    formData.append("persons", document.getElementById('peopleCount').value);
    formData.append("price", calculatePrice().toString());
    formData.append("optionFirst", optionFirst.toString());
    formData.append("optionSecond", optionSecond.toString());

    fetch(createExcursionUrl, {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const validateRequest = () => {
    let errors = [validateDate(), validateTime(), validatePersonsCount()];
    let errorMessage = errors.filter(error => error.length !== 0).join('<br>');
    return errorMessage;
}
const validateDate = () => {
    let date = new Date(document.getElementById('excursionDate').value);
    if (isNaN(date)) {
        return "Дата экскурсии должна быть заполнена";
    }
    if (date < new Date()) {
        return "Дата экскурсии не может быть ранее или равна текущей дате";
    }
    return '';
}

const validateTime = () => {
    const time = document.getElementById('excursionStartTime').value.trim();
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (time.length === 0) {
        return "Время экскурсии должно быть заполнено";
    }
    if (timeRegex.test(time)) {
        const [hours, minutes] = time.split(':').map(Number);
        if (hours >= 9 && hours < 23 && minutes >= 0 && minutes < 60) {
            return '';
        } else {
            return 'Время должно соответствовать диапазону 9-23 часов';
        }
    } else {
        return 'Время должно соответствовать шаблону HH:MM';
    }
}
const validatePersonsCount = () => {
    let personsCount = document.getElementById('peopleCount').value.trim();
    if (personsCount.length === 0) {
        return "Количество людей должно быть заполнено";
    }
    try {
        personsCount = Number(personsCount);
    } catch (e) {
        return "Количество людей должно быть числом"
    }
    if (!(personsCount > 0 && personsCount < 21)) {
        return "Размер экскурсионной группы может составлять от 1 до 20 человек"
    }
    return '';
}

const calculatePrice = () => {
    const date = new Date(document.getElementById('excursionDate').value);
    const time = document.getElementById('excursionStartTime').value.trim();
    const personsCount = document.getElementById('peopleCount').value.trim();
    const duration = parseInt(document.getElementById('duration').value)
    const option1 = document.getElementById('option1').checked;
    const option2 = document.getElementById('option2').checked;
    let isThisDayOff;
    if (validateDate() === '') {
        isThisDayOff = date.getDay() === 0 || date.getDay() === 6 ? 1.5 : 1;
    } else {
        isThisDayOff = 1;
    }
    let hour;
    if (validateTime() === '') {
        hour = time.split(':').map(Number)[0];
    } else {
        hour = 15;
    }
    const isItMorning = hour < 12 ? 400 : 0;
    const isItEvening = hour >= 20 ? 1000 : 0;
    let numberOfVisitor;
    if (validatePersonsCount() === '') {
        numberOfVisitor = personsCount < 5 ? 0 :
            personsCount <= 10 ? 1000 :
                1500;
    } else {
        numberOfVisitor = 1;
    }

    let totalPrice = selectedGuidPrice * duration * isThisDayOff + isItMorning + isItEvening + numberOfVisitor;
    if (option1) totalPrice *= 1.3;
    if (option2) totalPrice += 500 * personsCount;
    return Math.round(totalPrice);
}

const modalInputIds = ['duration', 'excursionDate', 'excursionStartTime', 'peopleCount', 'option1', 'option2'];
modalInputIds.forEach(id => {
    document.getElementById(id).onchange = () => {
        document.getElementById('totalCost').innerHTML = calculatePrice().toString();
    }
})
document.getElementById('excursionStartTime').onblur = calculatePrice;


