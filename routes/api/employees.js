
const express = require('express');
const router = express.Router();

const employeesController = require('../../controller/employeesController');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(verifyJWT, employeesController.getAllEmployees)
    .post(verifyJWT, employeesController.createNewEmployees)
    .put(verifyJWT, employeesController.updateEmployees)
    .delete(verifyJWT, employeesController.deleteEmployees);

router.route('/:id')
    .get(verifyJWT, employeesController.getEmployee);

module.exports = router;

