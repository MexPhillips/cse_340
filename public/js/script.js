// script.js - Client-side JavaScript for CSE Motors

// Form validation for add classification
function validateClassificationForm() {
  const form = document.querySelector('form[action="/inv/add-classification"]');
  if (!form) return;

  const input = form.querySelector('#classification_name');
  const submitBtn = form.querySelector('button[type="submit"]');

  function validateInput() {
    const value = input.value.trim();
    const pattern = /^[A-Za-z0-9]+$/;

    if (!value) {
      input.setCustomValidity('Classification name is required');
      return false;
    }

    if (!pattern.test(value)) {
      input.setCustomValidity('No spaces or special characters allowed');
      return false;
    }

    input.setCustomValidity('');
    return true;
  }

  input.addEventListener('input', validateInput);
  input.addEventListener('blur', validateInput);

  form.addEventListener('submit', function(e) {
    if (!validateInput()) {
      e.preventDefault();
    }
  });
}

// Form validation for add inventory
function validateInventoryForm() {
  const form = document.querySelector('form[action="/inv/add-inventory"]');
  if (!form) return;

  const makeInput = form.querySelector('#inv_make');
  const modelInput = form.querySelector('#inv_model');
  const classificationSelect = form.querySelector('#classificationList');

  function validateForm() {
    let isValid = true;

    if (!makeInput.value.trim()) {
      makeInput.setCustomValidity('Make is required');
      isValid = false;
    } else {
      makeInput.setCustomValidity('');
    }

    if (!modelInput.value.trim()) {
      modelInput.setCustomValidity('Model is required');
      isValid = false;
    } else {
      modelInput.setCustomValidity('');
    }

    if (!classificationSelect.value) {
      classificationSelect.setCustomValidity('Classification is required');
      isValid = false;
    } else {
      classificationSelect.setCustomValidity('');
    }

    return isValid;
  }

  [makeInput, modelInput, classificationSelect].forEach(input => {
    input.addEventListener('input', validateForm);
    input.addEventListener('change', validateForm);
  });

  form.addEventListener('submit', function(e) {
    if (!validateForm()) {
      e.preventDefault();
    }
  });
}

// Inventory table sorting functionality
function initInventoryTableSort() {
  const table = document.querySelector('.inventory-table');
  if (!table) return;

  const headers = table.querySelectorAll('th');
  let currentSort = { column: null, direction: 'asc' };

  headers.forEach((header, index) => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => sortTable(index));
  });

  function sortTable(columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Toggle sort direction if same column
    if (currentSort.column === columnIndex) {
      currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.column = columnIndex;
      currentSort.direction = 'asc';
    }

    rows.sort((a, b) => {
      const aText = a.cells[columnIndex].textContent.trim().toLowerCase();
      const bText = b.cells[columnIndex].textContent.trim().toLowerCase();

      if (currentSort.direction === 'asc') {
        return aText.localeCompare(bText);
      } else {
        return bText.localeCompare(aText);
      }
    });

    // Clear existing rows and append sorted ones
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));

    // Update header indicators
    headers.forEach((h, i) => {
      h.textContent = h.textContent.replace(' ↑', '').replace(' ↓', '');
      if (i === columnIndex) {
        h.textContent += currentSort.direction === 'asc' ? ' ↑' : ' ↓';
      }
    });
  }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  validateClassificationForm();
  validateInventoryForm();
  initInventoryTableSort();
});
