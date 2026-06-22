
const {
    Component,
    mount,
    signal,
    xml,
    onMounted,
    onPatched
} = owl;

class ExpenseTracker extends Component {

    static template = xml`
        <div>

            <!-- NAVBAR -->
            <nav class="navbar navbar-expand-lg custom-navbar">
                <div class="container">

                    <a class="navbar-brand fw-bold">
                        <i class="bi bi-wallet2"></i>
                        Expense Tracker Pro
                    </a>

                    <div class="d-flex align-items-center gap-3">

                        <span>
                            <t t-out="new Date().toLocaleDateString()"/>
                        </span>

                    </div>

                </div>
            </nav>

            <div class="container py-4">

                <!-- DASHBOARD -->

                <div class="row g-4 mb-4">

                    <div class="col-md-3">

                        <div class="stat-card balance-card">
                            <small>Total Balance</small>
                            <h2 id="balanceAmount">$<t t-out="this.balance()"/></h2>
                        </div>

                    </div>

                    <div class="col-md-3">

                        <div class="stat-card income-card">
                            <small>Total Income</small>
                            <h2 id="incomeAmount">$<t t-out="this.totalIncome()"/></h2>
                        </div>

                    </div>

                    <div class="col-md-3">

                        <div class="stat-card expense-card">
                            <small>Total Expense</small>
                            <h2 id="expenseAmount">$<t t-out="this.totalExpense()"/></h2>
                        </div>

                    </div>

                    <div class="col-md-3">

                        <div class="stat-card savings-card">
                            <small>Savings</small>
                            <h2 id="savingAmount">$<t t-out="this.totalSaving()"/></h2>
                        </div>

                    </div>

                </div>

                <!-- BUDGET -->

                <div class="glass-card p-4 mb-4">

                    <div class="row align-items-center">

                        <div class="col-lg-4">

                            <h4>Budget Goal</h4>

                            <div class="input-group mt-3">

                                <span class="input-group-text">$</span>

                                <input type="number"
                                    id="budgetGoal"
                                    t-model="this.budgetGoal"
                                    class="form-control"
                                    placeholder="Set Monthly Budget"/>

                                <button class="btn btn-primary" id="saveBudgetBtn" t-on-click="this.saveData">
                                    Save
                                </button>

                            </div>

                        </div>

                        <div class="col-lg-8">

                            <div class="mt-4 mt-lg-0">

                                <div class="d-flex justify-content-between">

                                    <span>Budget Usage</span>
                                    <span id="budgetPercent"><t t-out="this.budgetPercentValue()"/></span>

                                </div>

                                <div class="progress mt-2">

                                    <div id="budgetProgress"
                                        class="progress-bar bg-danger"
                                        t-att-class="this.expenseRateValue() > 0.8 ? 'bg-danger' : 'bg-success'"
                                        t-att-style="'width:' + this.budgetPercentValue()">
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- FORM -->
                <!-- MAIN CONTENT -->

                <div class="row g-4">

                    <!-- FORM -->

                    <div class="col-lg-4">

                        <div class="glass-card p-4">

                            <h4 class="text-center">
                                <t t-out="this.editMode() ? 'Edit Transaction' : 'Add Transaction'"/>
                            </h4>

                            <form id="transactionForm" t-on-submit.prevent="this.addTransaction">

                                <input type="hidden" id="editId"/>

                                <div class="mb-3 mt-3">

                                    <label class="form-label">
                                        Title
                                    </label>

                                    <input type="text"
                                        id="title"
                                        placeholder="Title"
                                        class="form-control"
                                        t-att-value="this.transaction().title"
                                        t-on-input="ev => this.updateField('title', ev.target.value)"
                                        required="required"/>

                                </div>

                                <div class="mb-3">

                                    <label class="form-label">
                                        Amount
                                    </label>

                                    <input type="number"
                                        id="amount"
                                        class="form-control"
                                        placeholder="Amount"
                                        t-att-value="this.transaction().amount"
                                        t-on-input="ev => this.updateField('amount', ev.target.value)"
                                        required="required"/>

                                </div>

                                <div class="mb-3">

                                    <label class="form-label">
                                        Type
                                    </label>

                                    <select id="type" class="form-select"
                                        t-att-value="this.transaction().type"
                                        t-on-change="ev => this.updateField('type', ev.target.value)"
                                    >

                                        <option value="income">
                                            Income
                                        </option>

                                        <option value="expense">
                                            Expense
                                        </option>

                                    </select>

                                </div>

                                <div class="mb-3">

                                    <label class="form-label">
                                        Category
                                    </label>

                                    <!-- CATEGORY -->
                                    <select class="form-select"
                                            t-att-value="this.transaction().category"
                                            t-on-change="ev => this.updateField('category', ev.target.value)">

                                        <t t-foreach="this.categories()"
                                        t-as="cat"
                                        t-key="cat">

                                            <option t-att-value="cat">
                                                <t t-out="cat"/>
                                            </option>

                                        </t>

                                    </select>
                                </div>

                                <div class="mb-3">

                                    <label class="form-label">
                                        Date
                                    </label>

                                    <input type="date"
                                        id="date"
                                        class="form-control"
                                        t-att-value="this.transaction().date"
                                        t-on-input="ev => this.updateField('date', ev.target.value)"
                                        required="required"/>

                                </div>

                                <button class="btn btn-primary w-100">
                                    Add Transaction
                                </button>

                            

                            </form>

                        </div>

                    </div>

                    <!-- CHARTS -->

                    <div class="col-lg-8">

                        <div class="glass-card p-4">

                            <div class="row">

                                <div class="col-md-6">

                                    <h5 class="mb-3">
                                        Expense Categories
                                    </h5>

                                    <canvas id="categoryChart"/>

                                </div>

                                <div class="col-md-6">

                                    <h5 class="mb-3">
                                        Income vs Expense
                                    </h5>

                                    <canvas id="incomeExpenseChart"/>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- FILTERS -->

                <div class="glass-card p-4 mt-4">

                    <div class="row g-3">

                        <div class="col-md-3">

                            <input type="text"
                                   id="searchInput"
                                   class="form-control"
                                   placeholder="Search"/>

                        </div>

                        <div class="col-md-3">

                            <select id="filterCategory" class="form-select">

                                <option value="">
                                    All Categories
                                </option>

                            </select>

                        </div>

                        <div class="col-md-3">

                            <input type="date"
                                   id="filterDate"
                                   class="form-control"/>

                        </div>

                        <div class="col-md-3">

                            <button class="btn btn-success w-100"
                                    id="exportBtn" t-on-click="this.exportCSV">

                                <i class="bi bi-download"/>
                                Export CSV

                            </button>

                        </div>

                    </div>

                </div>

                <!-- TABLE -->

                <div class="glass-card p-4 mt-4">

                    <div id="emptyState"
                         class="empty-state d-none">

                        <i class="bi bi-wallet2"/>

                        <h4>No Transactions Found</h4>

                        <p>
                            Add your first transaction.
                        </p>

                    </div>

                    <div class="table-responsive">

                        <table class="table align-middle">

                            <thead>

                                <tr>

                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody id="transactionTable">

                                <t t-foreach="this.paginatedTransactions()"
                                       t-as="t"
                                       t-key="t.id">

                                        <tr>

                                            <td><t t-out="t.title"/></td>
                                            <td><t t-out="t.category"/></td>
                                            <td>
                                                <span t-att-class="t.type === 'income' ? 'badge-income' : 'badge-expense'">
                                                    <t t-out="t.type"/>
                                                </span>
                                            </td>
                                            <td>$<t t-out="t.amount"/></td>
                                            <td><t t-out="t.date"/></td>

                                            <td>
                                                <button class="action-btn edit-btn" t-on-click="() => this.editTransaction(t.id)">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="action-btn delete-btn" t-on-click="() => this.deleteTransaction(t.id)">
                                                    <i class="bi bi-trash"></i>
                                                </button>

                                            </td>

                                        </tr>

                                    </t>

                            </tbody>

                        </table>

                    </div>

                    <!-- PAGINATION -->

                    <nav class="mt-4">

                        <ul id="pagination"
                            class="pagination justify-content-center">
                        </ul>

                    </nav>

                </div>

            </div>

        </div>
    `;

    setup() {

        /* ================= STATE ================= */

        this.transactions = signal(JSON.parse(localStorage.getItem("transactions")) || []);

        this.categories = signal([
            "Salary", "Food", "Transport", "Shopping", "Bills", "Health"
        ]);

        this.budgetGoal = signal(Number(localStorage.getItem("budgetGoal")) || 0);
        this.budgetPercentValue = signal("0%");
        this.expenseRateValue = signal(0);

        this.transaction = signal({
            id: null,
            title: "",
            amount: "",
            type: "income",
            category: "",
            date: ""
        });

        this.editMode = signal(false);
        this.editId = signal(null);

        this.currentPage = signal(1);
        this.rowsPerPage = 5;

        /* ================= COMPUTED FUNCTIONS ================= */

        this.totalIncome = () =>
            this.transactions()
                .filter(t => t.type === "income")
                .reduce((a, b) => a + Number(b.amount), 0);

        this.totalExpense = () =>
            this.transactions()
                .filter(t => t.type === "expense")
                .reduce((a, b) => a + Number(b.amount), 0);

        this.balance = () =>
            this.totalIncome() - this.totalExpense();

        this.totalSaving = () =>
            this.balance();

        this.expenseRate = () =>
            this.budgetGoal()
                ? this.totalExpense() / this.budgetGoal()
                : 0;

        this.budgetPercent = () =>
            this.budgetGoal()
                ? Math.min(this.expenseRate() * 100, 100).toFixed(1) + "%"
                : "0%";

        onMounted(() => {
            this.recalculateBudget();
            this.updateCharts();
        });

        onPatched(() => {
            this.updateCharts();
        });
    }

    /* ================= UPDATE FIELD (IMPORTANT) ================= */

    updateField(field, value) {
        this.transaction.set({
            ...this.transaction(),
            [field]: value
        });
    }

    /* ================= CRUD ================= */

    addTransaction() {

        const isEdit = this.editMode();

        const current = this.transaction();

        const data = {
            id: isEdit ? this.editId() : Date.now(), // ALWAYS VALID ID
            title: current.title,
            amount: Number(current.amount),
            type: current.type,
            category: current.category,
            date: current.date,
        };

        let list = [...this.transactions()];

        if (isEdit) {
            const i = list.findIndex(
                t => Number(t.id) === Number(this.editId())
            );

            if (i >= 0) {
                list[i] = data;
            }

        } else {
            list.push(data);
        }

        this.transactions.set(list);

        this.save();
        this.recalculateBudget();
        this.resetForm();
    }

    editTransaction(id) {

        console.log(id, "ID")
        console.log(this.transactions(), "this.transactions()")

        const safeId = Number(id);

        const t = this.transactions().find(x => Number(x.id) === safeId);

        if (!t) return;

        this.transaction.set({
            id: t.id,
            title: t.title,
            amount: t.amount,
            type: t.type,
            category: t.category,
            date: t.date
        });

        this.editId.set(safeId);
        this.editMode.set(true);
    }

    deleteTransaction(id) {

        const safeId = Number(id);

        const list = this.transactions().filter(
            t => Number(t.id) !== safeId
        );

        this.transactions.set(list);

        this.editMode.set(false);
        this.editId.set(null);
        this.resetForm();

        this.updateCharts?.();
        this.recalculateBudget?.();

        this.save();
    }

    resetForm() {

        this.transaction.set({
            id: null,
            title: "",
            amount: "",
            type: "income",
            category: "",
            date: ""
        });

        this.editMode.set(false);
        this.editId.set(null);
    }

    /* ================= STORAGE ================= */

    save() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions()));
        localStorage.setItem("budgetGoal", this.budgetGoal());
    }

    /* ================= CHARTS ================= */

    updateCharts() {

        const transactions = this.transactions();

        const expenseData = {};
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {

            if (t.type === "expense") {
                expenseData[t.category] =
                    (expenseData[t.category] || 0) + Number(t.amount);
                expense += Number(t.amount);
            } else {
                income += Number(t.amount);
            }

        });

        /* ================= CATEGORY CHART ================= */

        const ctx1 = document.getElementById("categoryChart");

        if (this.categoryChartInstance) {
            this.categoryChartInstance.destroy();
        }

        this.categoryChartInstance = new Chart(ctx1, {
            type: "doughnut",
            data: {
                labels: Object.keys(expenseData),
                datasets: [{
                    data: Object.values(expenseData),
                    backgroundColor: [
                        "#6366f1",
                        "#10b981",
                        "#ef4444",
                        "#f59e0b",
                        "#06b6d4",
                        "#8b5cf6"
                    ]
                }]
            }
        });

        /* ================= INCOME VS EXPENSE ================= */

        const ctx2 = document.getElementById("incomeExpenseChart");

        if (this.incomeExpenseChartInstance) {
            this.incomeExpenseChartInstance.destroy();
        }

        this.incomeExpenseChartInstance = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: ["Income", "Expense"],
                datasets: [{
                    data: [income, expense],
                    backgroundColor: ["#10b981", "#ef4444"]
                }]
            }
        });
    }

    /* ================= BUDGET ================= */

    recalculateBudget() {

        const expense = this.totalExpense();
        const goal = this.budgetGoal();

        const rate = goal ? expense / goal : 0;
        const percent = goal ? Math.min(rate * 100, 100) : 0;

        this.expenseRateValue.set(rate);
        this.budgetPercentValue.set(percent.toFixed(1) + "%");
    }

    /* ================= PAGINATION ================= */

    paginatedTransactions() {

        const start = (this.currentPage() - 1) * this.rowsPerPage;

        return this.transactions().slice(start, start + this.rowsPerPage);
    }

    /* ================= EXPORT CSV ================= */

    exportCSV() {

        const data = this.transactions();

        let csv = "Title,Category,Type,Amount,Date\n";

        data.forEach(t => {
            csv += `${t.title},${t.category},${t.type},${t.amount},${t.date}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();

        URL.revokeObjectURL(url);
    }

    /* ================= THEME ================= */

    toggleTheme() {
        document.documentElement.classList.toggle("dark");
    }
}

mount(ExpenseTracker, document.getElementById("app"));
