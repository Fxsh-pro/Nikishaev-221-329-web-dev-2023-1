const api_key = '99bc2746-b676-49f8-9383-984c72aa1141';
const routeIdsToNamesMap = new Map();
const itemsPerPage = 3;
let reservations;
let selectedGuidPrice;
let lastReservationId;
let currentPage = 0;

const fetchAndCreateRouteMap = () => {
    const routesUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    routesUrl.searchParams.set('api_key', api_key);

    return fetch(routesUrl)
        .then(response => response.json())
        .then(routes => {
            routes.forEach(route => {
                routeIdsToNamesMap.set(route.id, route.name);
            });
        })
        .catch(error => console.error('Error fetching routes:', error));
}

function populateReservationsTable() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    for (let i = currentPage * itemsPerPage; i < Math.min(reservations.length, currentPage * itemsPerPage + itemsPerPage); i++) {
        const reservation = reservations[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.id}</td>
            <td>${routeIdsToNamesMap.get(reservation.route_id)}</td>
            <td>${reservation.date}</td>
            <td>${reservation.price}</td>
            <td class="d-flex align-items-center justify-content-around">
                <i class="bi bi-eye reservation-action" data-reservation-id="${reservation.id}" data-bs-toggle="modal" data-bs-target="#reservationModal"></i>
                <i class="bi bi-pencil-square reservation-action" data-reservation-id="${reservation.id}" data-bs-toggle="modal" data-bs-target="#reservationModal"></i>
                <i class="bi bi-trash delete-reservation" data-reservation-id="${reservation.id}" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal"></i>   
            </td>
        `;
        tableBody.appendChild(row);
    }

    document.querySelectorAll('.bi-eye').forEach(icon => {
        icon.onclick = viewReservation;
    });
    document.querySelectorAll('.bi-pencil-square').forEach(icon => {
        icon.onclick = editReservation;
    });
    document.querySelectorAll('.bi-trash').forEach(icon => {
        icon.onclick = () => lastReservationId = icon.dataset.reservationId;
    });
}

const viewReservation = (event) => {
    toggleModalInputs(true);
    loadReservationInfoApiRequest(event.target.dataset.reservationId)
}
const editReservation = (event) => {
    toggleModalInputs(false);
    lastReservationId = event.target.dataset.reservationId;
    loadReservationInfoApiRequest();
}
const deleteReservation = (event) => {
    deleteReservationApiRequest().then(
        () => fetchAndPopulateReservationsApiRequest()
    );
}

const fetchAndPopulateReservationsApiRequest = () => {
    const reseravationsUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders');
    reseravationsUrl.searchParams.set('api_key', api_key);
    fetch(reseravationsUrl)
        .then(response => response.json())
        .then(reservationsList => {
            reservations = reservationsList;
            populateReservationsTable();
            setupPagination();
        })
        .catch(error => console.error('Error fetching reservations:', error));
}

const deleteReservationApiRequest = () => {
    const deleteReservationsUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${lastReservationId}`);
    deleteReservationsUrl.searchParams.set('api_key', api_key);
    return fetch(deleteReservationsUrl, {
        method: 'DELETE'
    })
        .then(res => console.log(res.text()))
        .catch(e => console.log(e))

}

window.onload = () => {
    fetchAndCreateRouteMap().then(() => { // Отображение записей после получения названий
        fetchAndPopulateReservationsApiRequest();
    });
};

function loadReservationInfoApiRequest() {
    const reservationInfoUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${lastReservationId}`)
    reservationInfoUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');

    fetch(reservationInfoUrl)
        .then(result => result.json())
        .then(reservation => {
            loadGuidInfoApiRequest(reservation.guide_id);
            document.getElementById('excursionDate').value = reservation.date;
            document.getElementById('routeName').innerText = routeIdsToNamesMap.get(reservation.route_id);
            document.getElementById('excursionStartTime').value = reservation.time.slice(0, 5);
            document.getElementById('duration').value = reservation.duration;
            document.getElementById('peopleCount').value = reservation.persons;
            document.getElementById('option1').checked = reservation.optionFirst;
            document.getElementById('option2').checked = reservation.optionSecond;
            document.getElementById('option2').checked = reservation.optionSecond;
            document.getElementById('totalCost').innerText = reservation.price;
        });
}

function loadGuidInfoApiRequest(guidId) {
    const guidInfoUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${guidId}`)
    guidInfoUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    fetch(guidInfoUrl)
        .then(result => result.json())
        .then(guid => {
            document.getElementById('guideName').innerHTML = guid.name;
            selectedGuidPrice = guid.pricePerHour;
        });
}

function toggleModalInputs(disabledMode) {
    document.getElementById('excursionDate').disabled = disabledMode;
    document.getElementById('excursionStartTime').disabled = disabledMode;
    document.getElementById('duration').disabled = disabledMode;
    document.getElementById('peopleCount').disabled = disabledMode;
    document.getElementById('option1').disabled = disabledMode;
    document.getElementById('option2').disabled = disabledMode;
    document.getElementById('totalCost').disabled = disabledMode;
    document.querySelector('.buttons').style.visibility = disabledMode ? 'hidden' : 'visible';
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
document.getElementById('confirmDeleteBtn').onclick = deleteReservation;

document.getElementById('modal-submit').onclick = event => {
    const errorMessage = validateRequest()
    if (errorMessage.length !== 0) {
        showAlert(errorMessage, 'alert-danger');
    } else {
        updateExcursion().then(
            () => fetchAndPopulateReservationsApiRequest()
        );
        showAlert('Данные экскурсии обновлены!', 'alert-success');
    }
}

function updateExcursion() {
    const updateExcursionUrl = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${lastReservationId}?api_key=${api_key}`;
    const optionFirst = document.getElementById('option1').checked ? 1 : 0;
    const optionSecond = document.getElementById('option2').checked ? 1 : 0;

    const formData = new FormData();

    formData.append("date", document.getElementById('excursionDate').value);
    formData.append("time", document.getElementById('excursionStartTime').value);
    formData.append("duration", document.getElementById('duration').value);
    formData.append("persons", document.getElementById('peopleCount').value);
    formData.append("price", calculatePrice().toString());
    formData.append("optionFirst", optionFirst.toString());
    formData.append("optionSecond", optionSecond.toString());

    return fetch(updateExcursionUrl, {
        method: 'PUT',
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

const createPaginationButton = (content) => {
    const li = document.createElement('li');
    li.classList.add('page-item');
    const a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#pagination';
    a.innerHTML = content;
    li.appendChild(a);
    return li;
};

const setupPagination = () => {
    const totalPages = Math.ceil(reservations.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    let prev = createPaginationButton('<span aria-hidden="true">&laquo;</span>');
    prev.onclick = function () {
        currentPage = Math.max(0, currentPage - 3);
        setupPagination();
    };
    pagination.appendChild(prev);

    for (let i = 0; i <= Math.min(totalPages - 1, currentPage + 3); i++) {
        let item = createPaginationButton(i);
        item.onclick = function () {
            currentPage = i;
            populateReservationsTable();
        };
        pagination.appendChild(item);
    }

    let next = createPaginationButton('<span aria-hidden="true">&raquo;</span>');
    next.onclick = function () {
        if (currentPage + 3 < totalPages - 1) {
            currentPage = currentPage + 3;
            setupPagination();
        }
    };
    pagination.appendChild(next);
};