
const data = {
    employees: require('../model/employees.json'),
    setEmployees: function (data) {
        this.employees = data;
    }
};

const getAllEmployees = (req, res) => {
    res.json(data.employees);
};

const createNewEmployees = (req, res) => {
    const newEmployee = {
        id: data.employees.length
            ? data.employees[data.employees.length - 1].id + 1
            : 1,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    };

    if (!newEmployee.firstname || !newEmployee.lastname) {
        return res.status(400).json({
            message: 'First and Last name are required'
        });
    }

    data.setEmployees([...data.employees, newEmployee]);
    res.status(201).json(data.employees);
};

const updateEmployees = (req, res) => {
    const id = parseInt(req.body.id);
    const employee = data.employees.find(emp => emp.id === id);

    if (!employee) {
        return res.status(404).json({
            message: `Employee ID ${req.body.id} not found`
        });
    }

    if (req.body.firstname) {
        employee.firstname = req.body.firstname;
    }

    if (req.body.lastname) {
        employee.lastname = req.body.lastname;
    }

    const filteredArray = data.employees.filter(emp => emp.id !== id);
    const unsorted = [...filteredArray, employee];

    data.setEmployees(
        unsorted.sort((a, b) => a.id - b.id)
    );

    res.json(data.employees);
};

const deleteEmployees = (req, res) => {
    const id = parseInt(req.body.id);
    const employee = data.employees.find(emp => emp.id === id);

    if (!employee) {
        return res.status(404).json({
            message: `Employee ID ${req.body.id} not found`
        });
    }

    const filteredArray = data.employees.filter(emp => emp.id !== id);

    data.setEmployees(filteredArray);
    res.json(data.employees);
};

const getEmployee = (req, res) => {
    const id = parseInt(req.params.id);
    const employee = data.employees.find(emp => emp.id === id);

    if (!employee) {
        return res.status(404).json({
            message: `Employee ID ${req.params.id} not found`
        });
    }

    res.json(employee);
};

module.exports = {
    getAllEmployees,
    createNewEmployees,
    updateEmployees,
    deleteEmployees,
    getEmployee
};
