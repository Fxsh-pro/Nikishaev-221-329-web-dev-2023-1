function populateReservationsTable(reservations) {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.date}</td>
            <td>${reservation.name}</td>
            <td>${reservation.date}</td>
            <td>${reservation.price}</td>
            <td class="d-flex align-items-center justify-content-around">
                <i class="bi bi-eye reservation-action" data-reservation-id="${reservation.id}" data-bs-toggle="modal" data-bs-target="#reservationModal"></i>
                <i class="bi bi-pencil-square reservation-action" data-reservation-id="${reservation.id}"></i>
                <i class="bi bi-trash reservation-action" data-reservation-id="${reservation.id}"></i>   
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.reservation-action').forEach(icon => {
        icon.addEventListener('click', handleReservationAction);
    });
}

const handleReservationAction = (event) => {
    loadReservationInfo(event.target.dataset.reservationId)
    disableModalOnView();
}
function fetchAndPopulateRequests(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(reservations => {
            populateReservationsTable(reservations);
        })
        .catch(error => console.error('Error fetching reservations:', error));
}

window.onload = () => {
    const allRoutesUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders');
    allRoutesUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    fetchAndPopulateRequests(allRoutesUrl);
};
function loadReservationInfo(reservationId) {
    const reservationInfoUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${reservationId}`)
    reservationInfoUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    var modal = document.getElementById('reservationModal');
    fetch(reservationInfoUrl)
        .then(result => result.json())
        .then(reservation => {
            loadGuidInfo(reservation.guide_id);
            document.getElementById('excursionDate').value = reservation.date;
            document.getElementById('excursionStartTime').value = reservation.time;
            document.getElementById('duration').value = reservation.duration;
            document.getElementById('peopleCount').value = reservation.persons;
            document.getElementById('option1').checked = reservation.optionFirst;
            document.getElementById('option2').checked = reservation.optionSecond;
            document.getElementById('option2').checked = reservation.optionSecond;
            document.getElementById('totalCost').innerHTML = reservation.price;
            console.log(reservation.price);
        });
}

function loadGuidInfo(guidId) {
    const guidInfoUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${guidId}`)
    guidInfoUrl.searchParams.set('api_key', '99bc2746-b676-49f8-9383-984c72aa1141');
    fetch(guidInfoUrl)
        .then(result => result.json())
        .then(guid => {
            document.getElementById('guideName').innerHTML = guid.name;
        });
}

function disableModalOnView() {
    document.getElementById('excursionDate').disabled = true;
    document.getElementById('excursionStartTime').disabled = true;
    document.getElementById('duration').disabled = true;
    document.getElementById('peopleCount').disabled = true;
    document.getElementById('option1').disabled = true;
    document.getElementById('option2').disabled = true;
    document.getElementById('totalCost').disabled = true;
}