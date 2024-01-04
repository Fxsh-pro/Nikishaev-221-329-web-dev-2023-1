let routes;
let filteredRoutes;
let currentPage = 0;
let routesPerPage = 3;
let selectedRouteId = -1;
let selectedRouteName = '';
let guids;
let filteredGuids;
let selectedGuidPrice;

function fetchAndPopulateRoutes(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            routes = data;
            filteredRoutes = [...routes];
            populateTable();
            setupPagination();
            fillRouteFilterOptions();
        })
        .catch(error => console.error('Error fetching routes:', error));
}

function fetchAndPopulateGuides() {
    const apiUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${selectedRouteId}/guides`);
    apiUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');

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
                 <button class="btn btn-success guide-select-button" data-guid-name="${guide.name}" data-guid-price="${guide.pricePerHour}" data-bs-toggle="modal" data-bs-target="#reservationModal">Выбрать</button>
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
            chooseGuide(btn.dataset.guidName, btn.dataset.guidPrice);
        };
    });
}

chooseGuide = (guideName, guidPricePerHour) => {
    document.querySelector('#modalGuidInfo #guideName').innerHTML = guideName;
    document.querySelector('#modalRouteInfo #routeName').innerHTML = selectedRouteName;
    selectedGuidPrice = guidPricePerHour;
    console.log(selectedGuidPrice)
};


function fillLanguageOptions() {
    var selectElement = document.querySelector('#languageFilter');
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
            showAlert("Извините, гидов с такими критериями не найдено");
        }
    }
    populateGuidesTable();
}


function populateTable() {
    const tableBody = document.querySelector('#routesTable tbody');
    tableBody.innerHTML = '';

    for (var i = currentPage * routesPerPage; i < Math.min(filteredRoutes.length, currentPage * routesPerPage + routesPerPage); i++) {
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

function createPaginationButton(content) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    const a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#pagination'
    a.innerHTML = content;
    li.appendChild(a);
    return li;
}

function fillRouteFilterOptions() {
    var selectElement = document.querySelector('.form-select');
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

function createOption(content) {
    const option = document.createElement('option');
    option.value = content;
    option.text = content;
    return option;
}

function extractNames(inputString) {
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

function setupPagination() {
    const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);

    const pagination = document.querySelector('#pagination');
    pagination.innerHTML = '';

    var prev = createPaginationButton('<span aria-hidden="true">&laquo;</span>');
    prev.onclick = function () {
        currentPage = Math.max(0, currentPage - 7);
        setupPagination();
    };
    pagination.appendChild(prev);

    for (let i = currentPage; i <= Math.min(totalPages - 1, currentPage + 7); i++) {
        var item = createPaginationButton(i);
        item.onclick = function () {
            currentPage = i;
            populateTable();
        };
        pagination.appendChild(item);
    }
    var next = createPaginationButton('<span aria-hidden="true">&raquo;</span>');
    next.onclick = function () {
        if (currentPage + 7 < totalPages - 1) {
            currentPage = currentPage + 7;
            setupPagination();
        }
    };
    pagination.appendChild(next);
}

document.getElementById('searchIcon').onclick = filterRoutes;
document.querySelector('.form-select').onchange = filterRoutes;

function filterRoutes() {
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
            showAlert("Извините, маршрутов с такими критериями не найдено");
        }
    }
    currentPage = 0;
    populateTable();
    setupPagination();
}

function showAlert(message) {
    const alertContainer = document.querySelector('#notifications .container');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', 'alert-warning', 'alert-dismissible', 'm-0', 'my-2');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);
    window.scrollTo({top: 0, behavior: 'smooth'});
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

chooseRoute = function (routeId, routeName) {
    selectedRouteId = routeId;
    selectedRouteName = routeName;
    populateTable();
    fetchAndPopulateGuides(routeId);
};

window.onload = function () {
    const allRoutesUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    allRoutesUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    fetchAndPopulateRoutes(allRoutesUrl);
};

function calculateTotalCost() {
    const guideServiceCost = selectedGuidPrice;
    const hoursNumber = parseInt(document.getElementById('duration').value);
    const isThisDayOff = 1
    const isItMorning = 0
    const isItEvening = 0
    const numberOfVisitors = parseInt(document.getElementById('peopleCount').value);

    let totalCost = guideServiceCost * hoursNumber * isThisDayOff + isItMorning + isItEvening + numberOfVisitors;
    document.getElementById('totalCost').innerText = `${totalCost}`;
    showAlert("sdfdf")

    return totalCost;
}
document.getElementById('modal-submit').onclick = event => {
    calculateTotalCost();
}
