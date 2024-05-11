const express = require('express');
const router = express.Router();
const { viewStudents, viewSchools, searchStudents, searchBySchoolName, getAllSchoolNames, getStudents, getTotalSchools, getTotalStudents, updateStudent, getStudentById, getStudentsBySchool, searchByMedium, searchByClass } = require('../controllers/auth');

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.get("/school", (req, res) => {
    res.render("school");
});
router.get("/viewsc", viewSchools);
router.get("/viewst", viewStudents);
router.post("/search", searchStudents);
router.post("/searchBySchoolName", searchBySchoolName);
router.get("/schoolNames", getAllSchoolNames);
router.get('/studentsData', getStudents);
router.get('/backend/totalSchools', getTotalSchools);
router.get('/backend/totalStudents', getTotalStudents);
router.get('/student/:studentID', getStudentById);
router.post('/student/update', updateStudent);
router.get('/StudentsBySchool', getStudentsBySchool);
router.post('/searchByMedium', searchByMedium);
router.post('/searchByClass', searchByClass);
router.get("/center", (req, res) => {
    res.render("center");
});
router.get("/viewct", (req, res) => {
    res.render("viewct");
});


module.exports = router;
