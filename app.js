/*

1. We will follow MVC based project architecture.
2. CONTROLLER MODULE: All user request (typically in JS it is event driven) will be handled by this controller and 
    serve the final output to the user with the help of other 2 controllers called VIEW & MODEL Modules.
3. UI(View) MODULE: contains all code relating to UI manangement which typically means DOM management in JS. 
4. Model Module: contains all code relating to the domain (Budget) Data Management which means CRUD operations on data. 
5. UI & Model Module will not interact directly rather they will interact will the help of CONTROLLER Module.
6. JS programming concepts we will cover in the project is:

    - IIFE
    - Objects & Functions
    - Closure
    - Module Pattern
    - DOM 
    - Event Delegation
    - MVC Pattern
        - Controller Module : Contains code for request (event binding code) and response(final response) to client.
        - Model Module: contains application data and business logic code.
        - View Module: anything related to UI.
    - value type variable return issue.
    - etc.

7. 
*/

var model = (function() {
  var incomes = [];
  var expenses = [];

  var total = {
    income: 0.0,
    exp: 0.0,
    available: 0.0,
    expPer: 0.0
  };

  function Income(newId, description, amount) {
    this.id = newId;
    this.description = description;
    this.amount = amount;
  }

  function Expense(newId, description, amount) {
    this.id = newId;
    this.description = description;
    this.amount = amount;
    this.calcItemExpPer();
  }

  Expense.prototype.calcItemExpPer = function() {
    this.per = '0';
    if (total.income) {
      this.per = ((this.amount / total.income) * 100).toFixed(2);
    }
  };

  function getDate() {
    var today = new Date();

    var monthsName = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    var displayDate = today.getFullYear() + ', ' + monthsName[today.getMonth()];

    return displayDate;
  }

  function addNewItem(description, amount, type) {
    var newId = 0;
    var item;

    if (type === 'inc') {
      if (incomes.length > 0) {
        var lastId = parseInt(incomes[incomes.length - 1].id);
        newId = lastId + 1;
      }

      item = new Income(newId, description, amount);

      incomes.push(item);
    } else {
      if (expenses.length > 0) {
        var lastId = parseInt(expenses[expenses.length - 1].id);
        newId = lastId + 1;
      }

      var item = new Expense(newId, description, amount);

      expenses.push(item);

      // Add Expense Item
    }

    return item;
  }

  function calcTotal(type, isAdd, amount) {
    if (type === 'inc') {
      calcTotalIncome(isAdd, amount);
      // re-calculate all expenses item percentage.
      reCalcAllExpItemPer();
    } else {
      calcTotalExpenses(isAdd, amount);
    }
    calcTotalExpPer();

    total.available = total.income - total.exp;
  }

  function calcTotalIncome(isAdd, amount) {
    if (isAdd) {
      total.income = total.income + amount;
    } else {
      total.income = total.income - amount;
    }
  }

  function calcTotalExpenses(isAdd, amount) {
    if (isAdd) {
      total.exp = total.exp + amount;
    } else {
      total.exp = total.exp - amount;
    }
  }

  function calcTotalExpPer() {
    if (total.income) {
      total.expPer = ((total.exp / total.income) * 100).toFixed(2);
    }
  }

  function reCalcAllExpItemPer() {
    expenses.forEach(function(value, index) {
      value.calcItemExpPer();
    });
  }

  function deleteIncomeItem(itemId) {
    // delete item from incomes data structure.
    for (var i = 0; i < incomes.length; i++) {
      if (incomes[i].id === itemId) {
        incomes.splice(i, 1);
        break;
      }
    }
  }

  function deleteExpItem(itemId) {
    // delete item from expenses data structure.
    for (var i = 0; i < expenses.length; i++) {
      if (expenses[i].id === itemId) {
        expenses.splice(i, 1);
        break;
      }
    }
  }

  function getItem(type, itemId) {
    var item;
    if (type === 'inc') {
      for (var i = 0; i < incomes.length; i++) {
        if (incomes[i].id === itemId) {
          item = incomes[i];
          break;
        }
      }
    } else {
      for (var i = 0; i < expenses.length; i++) {
        if (expenses[i].id === itemId) {
          item = expenses[i];
          break;
        }
      }
    }

    return item;
  }

  function getExpenses() {
    return expenses.slice();
  }

  function getTotals() {
    return Object.assign({}, total);
  }

  return {
    getDate: getDate,
    addNewItem: addNewItem,
    calcTotal: calcTotal,
    deleteIncomeItem: deleteIncomeItem,
    deleteExpItem: deleteExpItem,
    getExpenses: getExpenses,
    getTotals: getTotals,
    getItem: getItem
  };
})();

var view = (function() {
  var elements = {
    descriptionEl: document.querySelector('.add-description'),
    typeEl: document.querySelector('.add-type'),
    amountEl: document.querySelector('.add-value'),
    addBtnEl: document.querySelector('.add-btn'),
    incomeListEl: document.querySelector('.income-list'),
    expenseListEl: document.querySelector('.expenses-list'),
    budgetDateEl: document.querySelector('.budget-month'),
    totalIncomeEl: document.querySelector('.budget-income-value'),
    totalExpEl: document.querySelector('.budget-expenses-value'),
    availableBudgetEl: document.querySelector('.budget-value'),
    totalExpPerEl: document.querySelector('.budget-expenses-percentage')
  };

  function resetAddNewItem() {
    elements.descriptionEl.value = '';
    elements.amountEl.value = '';
    elements.descriptionEl.focus();
  }

  function showDate(displayDate) {
    elements.budgetDateEl.textContent = displayDate;
  }

  function showItem(item, type) {
    var markup;
    var listEl;

    if (type === 'inc') {
      markup =
        '<div class="item row mb-2 text-white  border border-warning align-middle p-1 ml-1 mr-1"><div class=" col-6 text-left" id="inc-' +
        item.id +
        '"><div>' +
        item.description +
        '</div> </div><div class="col-3">' +
        '<div class="text-left">' +
        item.amount +
        '</div></div> <div class="col-3">' +
        '<button id="btn-item-inc-' +
        item.id +
        '" class="item-delete-btn btn btn-outline-dark">' +
        '<i id="icon-item-inc-' +
        item.id +
        '" class="fa fa-trash"></i></button></div></div>';

      listEl = elements.incomeListEl;
    } else {
      markup =
        '<div class="item row mb-2 text-white  border border-dark align-middle p-1 ml-1 mr-1"><div class=" col-4" id="exp-' +
        item.id +
        '"><div class="text-left">' +
        item.description +
        '</div></div><div class="col-3"><div class="text-right">' +
        item.amount +
        '</div></div><div class="col-2"><small><u><div class="item-percentage text-right">' +
        item.per +
        '%</div></u></small></div><div class="col-3"><button id="btn-item-exp-' +
        item.id +
        '" class="item-delete-btn btn btn-outline-dark"><i id="icon-item-exp-' +
        item.id +
        '" class="fa fa-trash"></i></button></div></div>';

      listEl = elements.expenseListEl;
    }

    listEl.insertAdjacentHTML('beforeend', markup);
  }

  function showTotal(type, total) {
    if (type === 'inc') {
      elements.totalIncomeEl.textContent = total.income;
    } else {
      elements.totalExpEl.textContent = total.exp;
    }

    elements.totalExpPerEl.textContent = total.expPer + '%';
    elements.availableBudgetEl.textContent = total.available;
  }

  function resetTotal() {
    elements.totalIncomeEl.textContent = '0';
    elements.totalExpEl.textContent = '0';

    elements.totalExpPerEl.textContent = '0%';
    elements.availableBudgetEl.textContent = '0';
  }

  function showAllExpItemPer(expenses) {
    var itemsExpPerEl = elements.expenseListEl.querySelectorAll(
      '.item-percentage'
    );

    expenses.forEach(function(value, index) {
      itemsExpPerEl[index].textContent = value.per + '%';
    });
  }

  function toggleTypeClass() {
    elements.typeEl.classList.toggle('text-danger');
    elements.descriptionEl.classList.toggle('text-danger');
    elements.amountEl.classList.toggle('text-danger');
    elements.addBtnEl.classList.toggle('btn-danger');
  }

  function deleteItem(targetEl) {
    var closestRootDiv = targetEl.closest('.item');
    closestRootDiv.parentElement.removeChild(closestRootDiv);
  }

  function parseItemId(elId) {
    var item = elId.split('-');
    return parseInt(item[item.length - 1]);
  }

  return {
    resetAddNewItem: resetAddNewItem,
    resetTotal: resetTotal,
    showDate: showDate,
    showItem: showItem,
    showAllExpItemPer: showAllExpItemPer,
    showTotal: showTotal,
    toggleTypeClass: toggleTypeClass,
    deleteItem: deleteItem,
    parseItemId: parseItemId,
    elements: elements
  };
})();

var controller = (function(model, view) {
  var elements = view.elements;

  function init() {
    view.resetAddNewItem();
    view.resetTotal();

    // Show Year and Month for the Budget.
    view.showDate(model.getDate());

    setupEventHandler();
  }

  function setupEventHandler() {
    elements.typeEl.addEventListener('change', view.toggleTypeClass);

    elements.addBtnEl.addEventListener('click', addNewBudgetItem);

    // document.addEventListener('keydown', function(e) {
    //   if (e.keyCode === 13) {
    //     addNewBudgetItem();
    //   }
    // });

    elements.incomeListEl.addEventListener('click', function(e) {
      // console.log(e.target);
      if (e.target.matches('.item-delete-btn, .item-delete-btn *')) {
        var itemId = view.parseItemId(e.target.id);

        var item = model.getItem('inc', itemId);
        // update income total.

        model.calcTotal('inc', false, item.amount);

        model.deleteIncomeItem(itemId);

        // delete item from ui.
        view.deleteItem(e.target);

        view.showTotal('inc', model.getTotals());
        view.showAllExpItemPer(model.getExpenses());
      }
    });

    elements.expenseListEl.addEventListener('click', function(e) {
      if (e.target.matches('.item-delete-btn, .item-delete-btn *')) {
        var itemId = view.parseItemId(e.target.id);

        var item = model.getItem('exp', itemId);

        // update expenses total.
        model.calcTotal('exp', false, item.amount);

        model.deleteExpItem(itemId);

        // delete item from ui.
        view.deleteItem(e.target);

        view.showTotal('exp', model.getTotals());
      }
    });
  }

  function addNewBudgetItem(e) {
    e.preventDefault();

    var type = elements.typeEl.value;
    var amount = elements.amountEl.value;
    var description = elements.descriptionEl.value;

    if (!(description && amount)) {
      // validation check for FALSY values in description & amount input.
      return;
    }

    amount = parseInt(amount);
    var item = model.addNewItem(description, amount, type);

    model.calcTotal(type, true, amount);

    view.showItem(item, type);
    view.showTotal(type, model.getTotals());

    // Clear Add New Item Input.
    view.resetAddNewItem();

    view.showAllExpItemPer(model.getExpenses());
  }

  return {
    init: init
  };
})(model, view);

controller.init();
