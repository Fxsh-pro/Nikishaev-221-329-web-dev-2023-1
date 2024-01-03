var routes;
var filteredRoutes;
var currentPage = 0;
var routesPerPage = 3;

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

function populateTable() {
    const tableBody = document.querySelector('#routesTable tbody');
    tableBody.innerHTML = '';

    for (var i = currentPage * routesPerPage; i < Math.min(filteredRoutes.length, currentPage * routesPerPage + routesPerPage); i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class = 'text-center'>
                <h5>${filteredRoutes[i].name}</h5>
                <button class="btn btn-success btn-sm route-select-button" data-route-id="${routes[i].id}">Записаться</button>
            </td>
            <td>${filteredRoutes[i].description}</td>
            <td>${filteredRoutes[i].mainObject}</td>
        `;
        tableBody.appendChild(row);
    }

    document.querySelectorAll('.route-select-button').forEach(btn => {
        btn.onclick = function () {
            chooseRoute(btn.dataset.routeId);
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
    filteredRoutes.forEach(route => {
        const names = extractNames(route.mainObject);
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.text = name;
            selectElement.appendChild(option);
        });
    });
}

function extractNames(inputString) {
    const separators = ['-', '«', '»'];
    const matches = [];
    let startIndex = 0;

    while (startIndex < inputString.length) {
        let minIndex = inputString.length;

        separators.forEach(separator => {
            const index = inputString.indexOf(separator, startIndex);
            if (index !== -1 && index < minIndex) {
                minIndex = index;
            }
        });

        if (minIndex < inputString.length) {
            const name = inputString.slice(startIndex, minIndex).trim().substring(0, 25);
            if (name.length > 0) {
                matches.push(name);
            }
            startIndex = minIndex + 1;
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

document.getElementById('searchIcon').addEventListener('click', () => {
    const searchValue = document.getElementById('routes-search').value.toLowerCase().trim();
    if (searchValue.length === 0) {
        filteredRoutes = [...routes];
    } else {
        filteredRoutes = routes.filter(route => route.name.toLowerCase().includes(searchValue));
        if (filteredRoutes.length === 0) {
            showAlert("Извините, маршрутов с таким названием не найдено");
        }
    }
    currentPage = 0;
    populateTable();
    setupPagination();
});

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

chooseRoute = function (routeId) {
    console.log('Route chosen with ID:', routeId);
};

window.onload = function () {
    const apiUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    apiUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    fetchAndPopulateRoutes(apiUrl);
};


