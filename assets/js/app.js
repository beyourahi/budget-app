//! Budget Controller
let budgetController = (() => {
    //// Income & Expense Constructors
    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    //// Items Data Structure
    let data = {
        allItems: {
            exp: [],
            inc: [],
        },

        total: {
            exp: 0,
            inc: 0,
        },

        budget: 0,

        percentage: -1,
    };

    let calculateTotal = (type) => {
        let sum = 0;

        data.allItems[type].forEach((current) => {
            sum += current.value;
        });

        data.total[type] = sum;
    };

    return {
        addItem: (type, des, val) => {
            let newItem, ID;

            //? Create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //?  Create new item based on type [inc or exp]
            if (type === "inc") {
                newItem = new Income(ID, des, val);
            } else if (type === "exp") {
                newItem = new Expense(ID, des, val);
            }

            //? Push new item to our data structure
            data.allItems[type].push(newItem);

            //? Return the new item
            return newItem;
        },

        deleteItem: (type, id) => {
            let ids, index;

            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {
            //? 1. Calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            //? 2. Calculate the budget: income - expense
            data.budget = data.total.inc - data.total.exp;

            //? 3. Calculate % of income spent
            if (data.total.inc > 0) {
                data.percentage = Math.round(
                    (data.total.exp / data.total.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: () => {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.total.inc);
            });
        },

        getPercentages: () => {
            let allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage,
            };
        },

        testing: () => {
            console.log(data);
        },
    };
})();

//! UI Controller
let UIController = (() => {
    //// Input classes object
    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",

        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",

        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        expensesPercLabel: ".item__percentage",

        container: ".container",

        dateLabel: ".budget__title--month",
    };

    let formatNumber = (num, type) => {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");
        int = numSplit[0];

        if (int.length > 3) {
            int =
                int.substr(0, int.length - 3) +
                "," +
                int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //* will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

        addListItem: (obj, type) => {
            let html, newHtml, element;

            if (type === "inc") {
                element = DOMstrings.incomeContainer;

                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMstrings.expenseContainer;

                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: (selectorID) => {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            let fields, fieldsArr;

            fields = document.querySelectorAll(
                DOMstrings.inputDescription + "," + DOMstrings.inputValue
            );

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: (obj) => {
            let type = obj.budget > 0 ? "inc" : "exp";

            document.querySelector(
                DOMstrings.budgetLabel
            ).textContent = formatNumber(obj.budget, type);

            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(obj.totalInc, "inc");

            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(obj.totalExp, "exp");

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    "---";
            }
        },

        displayPercentages: (percentages) => {
            let fields = document.querySelectorAll(
                DOMstrings.expensesPercLabel
            );

            // let nodeListForEach = (list, callback) => {
            //     for (let i = 0; i < list.length; i++) {
            //         callback(list[i], i);
            //     }
            // };

            // nodeListForEach(fields, (current, index) => {
            //     if (percentages[index] > 0) {
            //         current.textContent = percentages[index] + "%";
            //     } else {
            //         current.textContent = "---";
            //     }
            // });

            let fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: () => {
            let now, year, month, months;

            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent =
                months[month] + " " + year;
        },

        changedType: () => {
            let fields = document.querySelectorAll(
                `${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue} `
            );

            let fieldsarr = Array.prototype.slice.call(fields);

            fieldsarr.forEach((cur) => {
                cur.classList.toggle("red-focus");
            });

            document
                .querySelector(DOMstrings.inputButton)
                .classList.toggle("red");
        },

        getDOMstrings: () => {
            return DOMstrings;
        },
    };
})();

//! App Controller
let appController = ((budgetCtrl, UICtrl) => {
    let DOMstrings = UICtrl.getDOMstrings();
    let setupEventListeners = () => {
        //// Click Event Listenter
        document
            .querySelector(DOMstrings.inputButton)
            .addEventListener("click", ctrlAddItem);
        //// Enter Key
        document.addEventListener("keypress", (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOMstrings.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOMstrings.inputType)
            .addEventListener("change", UICtrl.changedType);
    };

    function updateBudget() {
        //? 1. Calculate the budget
        budgetCtrl.calculateBudget();

        //? 2. Return the budget
        let budget = budgetCtrl.getBudget();

        //? 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    function updatePercentages() {
        //? 1. calculate the percentages
        budgetCtrl.calculatePercentages();

        //? 2. read percentages from budget controller
        let percentages = budgetCtrl.getPercentages();

        //? 3. update UI with new percentages
        UICtrl.displayPercentages(percentages);
    }

    function ctrlAddItem() {
        //? 1. Get input data
        let input = UICtrl.getInput();
        // console.log(input);

        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            //? 2. Add items to BUDGET CONTROLLER
            let newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );
            // console.log(newItem);

            //? 3. Add items to UI
            UICtrl.addListItem(newItem, input.type);

            //? 4. Clear the fields
            UICtrl.clearFields();

            //? 5. Calculate and update budget
            updateBudget();

            //? 6. Calculate and update percentages
            updatePercentages();
        }
    }

    function ctrlDeleteItem(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //? inc-0 exp-0
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //? 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //? 2. delete item from UI
            UICtrl.deleteListItem(itemID);

            //? 3. update UI
            updateBudget();

            //? 4. Calculate and update percentages
            updatePercentages();
        }
    }

    //// Returns Initialization Function
    return {
        init: () => {
            console.log("Application has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            UICtrl.displayMonth();
            setupEventListeners();
        },
    };
})(budgetController, UIController);

//! Initialization Function
appController.init();
