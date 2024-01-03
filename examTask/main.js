var routes;
var currentPage = 0;
var routesPerPage = 3;

function fetchAndPopulateRoutes(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            routes = data;
            populateTable();
            setupPagination();
        })
        .catch(error => console.error('Error fetching routes:', error));
}

function populateTable() {
    const tableBody = document.querySelector('#routesTable tbody');
    tableBody.innerHTML = '';
    for (var i = currentPage * routesPerPage; i < Math.min(routes.length, currentPage * routesPerPage + routesPerPage); i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${routes[i].name}</td>
            <td>${routes[i].description}</td>
            <td>${routes[i].mainObject}</td>
            <td><button class="route-select-button" data-route-id="${routes[i].id}">Выбрать</button></td>
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
    a.innerHTML = content;
    li.appendChild(a);
    return li;
}

function setupPagination() {
    const totalPages = Math.ceil(routes.length / routesPerPage);

    const pagination = document.querySelector('#pagination');
    pagination.innerHTML = '';

    var prev = createPaginationButton('<span aria-hidden="true">&laquo;</span>');
    prev.onclick = function () {
        currentPage = Math.max(0,currentPage - 10);
        setupPagination();
    };
    pagination.appendChild(prev);

    for (let i = currentPage; i <= Math.min(totalPages - 1,currentPage + 10); i++) {
        var item = createPaginationButton(i);
        item.onclick = function () {
            currentPage = i;
            populateTable();
        };
        pagination.appendChild(item);
    }
    var next = createPaginationButton('<span aria-hidden="true">&raquo;</span>');
    next.onclick = function () {
            if (currentPage + 10 < totalPages - 1) {
                currentPage = currentPage + 10;
                setupPagination();
            }
    };
    pagination.appendChild(next);
}

chooseRoute = function (routeId) {
    console.log('Route chosen with ID:', routeId);
};

window.onload = function () {
    const apiUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    apiUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    fetchAndPopulateRoutes(apiUrl);
};
