const form = document.getElementById('bookingForm');
const checkInInput = document.getElementById('checkIn');
const checkOutInput = document.getElementById('checkOut');
const statusBox = document.getElementById('formStatus');

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function clearFieldError(field) {
  field.removeAttribute('aria-invalid');
  const errorMessage = field.parentElement.querySelector('.field-error');
  if (errorMessage) {
    errorMessage.textContent = '';
  }
}

function setFieldError(field, message) {
  field.setAttribute('aria-invalid', 'true');
  const errorMessage = field.parentElement.querySelector('.field-error');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
}

function updateDateConstraints() {
  const today = formatDate(new Date());
  checkInInput.min = today;

  const checkInDate = parseDate(checkInInput.value);
  checkOutInput.min = checkInDate ? formatDate(addDays(checkInDate, 1)) : today;
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.classList.remove('success', 'error');
  statusBox.classList.add(type, 'visible');
}

function clearStatus() {
  statusBox.textContent = '';
  statusBox.classList.remove('success', 'error', 'visible');
}

checkInInput.addEventListener('change', () => {
  updateDateConstraints();
  const checkInDate = parseDate(checkInInput.value);
  const checkOutDate = parseDate(checkOutInput.value);

  if (checkInDate && (!checkOutDate || checkOutDate <= checkInDate)) {
    checkOutInput.value = formatDate(addDays(checkInDate, 1));
    clearFieldError(checkOutInput);
  }
});

checkOutInput.addEventListener('change', () => {
  checkOutInput.setCustomValidity('');
  clearFieldError(checkOutInput);
});

form.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('input', () => {
    field.setCustomValidity('');
    clearFieldError(field);
    clearStatus();
  });
  field.addEventListener('change', clearStatus);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearStatus();
  updateDateConstraints();

  checkOutInput.setCustomValidity('');
  const checkInDate = parseDate(checkInInput.value);
  const checkOutDate = parseDate(checkOutInput.value);

  if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
    checkOutInput.setCustomValidity('Check-out must be at least one day after check-in.');
  }

  const fields = [...form.querySelectorAll('input[required], select[required]')];
  let firstInvalidField;

  fields.forEach((field) => {
    if (!field.validity.valid) {
      setFieldError(field, field.validationMessage);
      firstInvalidField ??= field;
    } else {
      clearFieldError(field);
    }
  });

  const optionalNumberFields = [...form.querySelectorAll('input[type="number"]:not([required])')];
  optionalNumberFields.forEach((field) => {
    if (!field.validity.valid) {
      setFieldError(field, field.validationMessage);
      firstInvalidField ??= field;
    } else {
      clearFieldError(field);
    }
  });

  if (firstInvalidField) {
    showStatus('Please review the highlighted fields and try again.', 'error');
    firstInvalidField.focus();
    return;
  }

  const guestName = document.getElementById('fullName').value.trim();
  showStatus(
    `Thanks, ${guestName}. Your availability request has been received. We’ll be in touch soon to confirm your stay.`,
    'success'
  );
});

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    form.querySelectorAll('[aria-invalid]').forEach((field) => clearFieldError(field));
    form.querySelectorAll('input, select, textarea').forEach((field) => field.setCustomValidity(''));
    clearStatus();
    updateDateConstraints();
  });
});

updateDateConstraints();
