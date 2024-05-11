const mysql = require("mysql");

// Create database connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.register = (req, res) => {
  const { schoolNameCode, name, Class, gurdianname, contactno, mediumCode, date } = req.body;

  // Generate studentID
  generateStudentID(schoolNameCode, Class, mediumCode, (studentID) => {
    if (!studentID) {
      return res.status(500).send("Failed to generate student ID");
    }
    const INSERT_USER_QUERY =
      "INSERT INTO users (studentID, schoolNameCode, name, Class, gurdianname, contactno, mediumCode, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      INSERT_USER_QUERY,
      [studentID, schoolNameCode, name, Class, gurdianname, contactno, mediumCode, date],
      (error, result) => {
        if (error) {
          console.error("Error registering user:", error);
          return res.status(500).send("Internal Server Error");
        }
        console.log("User registered successfully");
        //res.send("<h1>Form Submitted Successfully...</h1>");
        res.render("register");
      }
    );
  });
};

function generateStudentID(schoolNameCode, Class, mediumCode, callback) {
  const year = new Date().getFullYear().toString().slice(2);
  let mediumLetter = '';

  // Map mediumCode to corresponding letter representation
  switch (mediumCode) {
    case 'Bengali':
      mediumLetter = 'B';
      break;
    case 'Hindi':
      mediumLetter = 'H';
      break;
    case 'English':
      mediumLetter = 'E';
      break;
    case 'Nepali':
      mediumLetter = 'N';
      break;
    case 'Urdu':
      mediumLetter = 'U';
      break;
    case 'Madrash':
      mediumLetter = 'M';
      break;
    // Add more cases if needed for other medium codes
    default:
      mediumLetter = ''; // Handle unknown medium codes
  }

  const SELECT_MAX_SERIAL_QUERY =
    'SELECT MAX(CAST(SUBSTRING_INDEX(studentID, "_", -1) AS UNSIGNED)) AS max_serial FROM users WHERE schoolNameCode = ? AND mediumCode = ? AND Class = ?';
  db.query(
    SELECT_MAX_SERIAL_QUERY,
    [schoolNameCode, mediumCode, Class], // Changed the order of parameters to match the query
    (error, result) => {
      if (error) {
        console.error("Error generating student ID:", error);
        callback(null);
        return;
      }
      let maxSerial = result[0].max_serial || 0;
      const newSerial = padSerialNumber(maxSerial + 1);
      const studentID = `${year}_${schoolNameCode}_${Class}_${mediumLetter}_${newSerial}`;
      callback(studentID);
    }
  );
}

function padSerialNumber(serial) {
  return serial.toString().padStart(3, "0");
}




/*exports.schoolregister = (req, res) => {
  const { name, city, contact, medium, date } = req.body;

  if (!name || !city || !contact || !medium) {
    return res.status(400).send("All fields are required");
  }

  const schoolCode = generateSchoolCode(name, city);

  const INSERT_SCHOOL_QUERY =
    "INSERT INTO schools (school_code, name, city, contact, medium, date) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    INSERT_SCHOOL_QUERY,
    [schoolCode, name, city, contact, medium, date],
    (error, result) => {
      if (error) {
        console.error("Error registering school:", error);
        return res.status(500).send("Internal Server Error");
      }
      console.log("School registered successfully");
      res.render("school");
    }
  );
};

function generateSchoolCode(name, city) {
  const abbreviation = name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  const cityAbbreviation = city.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  return abbreviation + cityAbbreviation;
}*/
exports.schoolregister = (req, res) => {
  const { name, city, contact, medium, date } = req.body;

  if (!name || !city || !contact || !medium) {
      return res.status(400).send("All fields are required");
  }

  // Check if the school with the same name and code already exists
  const SELECT_SCHOOL_QUERY = "SELECT * FROM schools WHERE name = ? AND city = ?";
  db.query(SELECT_SCHOOL_QUERY, [name, city], (error, result) => {
      if (error) {
          console.error("Error checking for existing school:", error);
          return res.status(500).send("Internal Server Error");
      }

      // If the school already exists, return an error
      if (result.length > 0) {
          //return res.status(400).send("School with the same name and city already exists");
          return res.render("school");
      }

      // If the school doesn't exist, proceed with registration
      const schoolCode = generateSchoolCode(name, city);

      const INSERT_SCHOOL_QUERY =
          "INSERT INTO schools (school_code, name, city, contact, medium, date) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
          INSERT_SCHOOL_QUERY,
          [schoolCode, name, city, contact, medium, date],
          (error, result) => {
              if (error) {
                  console.error("Error registering school:", error);
                  return res.status(500).send("Internal Server Error");
              }
              console.log("School registered successfully");
              res.render("school");
          }
      );
  });
};

function generateSchoolCode(name, city) {
  const abbreviation = name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  const cityAbbreviation = city.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  return abbreviation + cityAbbreviation;
}




// Function to view all students
exports.viewStudents = (req, res) => {
  const SELECT_ALL_STUDENTS_QUERY = "SELECT * FROM users";
  db.query(SELECT_ALL_STUDENTS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.render("viewst", { students: results });
  });
};

// Function to view all schools
exports.viewSchools = (req, res) => {
  const SELECT_ALL_SCHOOLS_QUERY = "SELECT * FROM schools";
  db.query(SELECT_ALL_SCHOOLS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching schools:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.render("viewsc", { schools: results });
  });
};

// Function to search for students by name
exports.searchStudents = (req, res) => {
  const studentName = req.body.studentName;
  const query = `SELECT * FROM users WHERE name LIKE '%${studentName}%'`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error searching for students:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.render("viewst", { students: results });
  });
};
// authController.js

exports.searchBySchoolName = (req, res) => {
  const { schoolName } = req.body;

  const query = `
        SELECT *
        FROM schools
        WHERE name LIKE ?
    `;

  db.query(query, [`%${schoolName}%`], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Internal Server Error");
    }

    console.log("Search Results:", results); // Log the search results
    res.render("viewsc", { schools: results });
  });
};




// Function to get all school names
exports.getAllSchoolNames = (req, res) => {
  const query = `SELECT name FROM schools`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching school names:", error);
      return res.status(500).send("Internal Server Error");
    }
    const schoolNames = results.map((result) => result.name);
    res.json(schoolNames);
  });
};





exports.viewStudents = (req, res) => {
  const SELECT_ALL_STUDENTS_QUERY = "SELECT * FROM users";
  db.query(SELECT_ALL_STUDENTS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.render("viewst", { students: results });
  });
};

exports.viewSchools = (req, res) => {
  const SELECT_ALL_SCHOOLS_QUERY = "SELECT * FROM schools";
  db.query(SELECT_ALL_SCHOOLS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching schools:", error);
      return res.status(500).send("Internal Server Error");
    }

    // Filter out duplicate school names
    const uniqueSchools = [];
    const uniqueNames = new Set();
    results.forEach((school) => {
      const nameWithCity = `${school.name} (${school.city})`;
      if (!uniqueNames.has(nameWithCity)) {
        uniqueNames.add(nameWithCity);
        uniqueSchools.push(school);
      }
    });

    res.render("viewsc", { schools: uniqueSchools });
  });
};

// Function to search for students by name
exports.searchStudents = (req, res) => {
  const studentName = req.body.studentName;
  const query = `SELECT * FROM users WHERE name LIKE '%${studentName}%'`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error searching for students:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.render("viewst", { students: results });
  });
};

/*exports.searchBySchoolName = (req, res) => {
  const { schoolName } = req.body;

  const query = `
        SELECT schools.name, schools.school_code, schools.city, schools.medium, schools.contact
        FROM (
            SELECT name, MIN(school_code) AS school_code, MIN(city) AS city, MIN(medium) AS medium, MIN(contact) AS contact
            FROM schools
            WHERE name LIKE ?
            GROUP BY name
        ) AS schools
    `;

  db.query(query, [`%${schoolName}%`], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Internal Server Error");
    }

    console.log("Search Results:", results); // Log the search results
    res.render("viewsc", { schools: results });
  });
};*/

// In your Express route handler for fetching students by school name

// Function to get all school names
exports.getStudents = (req, res) => {
  const SELECT_ALL_STUDENTS_QUERY = "SELECT * FROM users";
  db.query(SELECT_ALL_STUDENTS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.json({ students: results });
  });
};


exports.getAllSchoolNames = (req, res) => {
  const query = `SELECT DISTINCT name FROM schools`; // Use DISTINCT keyword
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching school names:", error);
      return res.status(500).send("Internal Server Error");
    }
    const schoolNames = results.map((result) => result.name);
    res.json(schoolNames);
  });
};

exports.getTotalSchools = (req, res) => {
  const TOTAL_SCHOOLS_QUERY =
    "SELECT COUNT(DISTINCT name, city) AS totalSchools FROM schools";
  db.query(TOTAL_SCHOOLS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching total schools:", error);
      return res.status(500).send("Internal Server Error");
    }
    const totalSchools = results[0].totalSchools;
    res.json({ totalSchools });
  });
};

// Function to fetch total number of students
exports.getTotalStudents = (req, res) => {
  const TOTAL_STUDENTS_QUERY = "SELECT COUNT(*) AS totalStudents FROM users";
  db.query(TOTAL_STUDENTS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching total students:", error);
      return res.status(500).send("Internal Server Error");
    }
    const totalStudents = results[0].totalStudents;
    res.json({ totalStudents });
  });
};

exports.getStudentById = (req, res) => {
  const studentID = req.params.studentID;
  const SELECT_STUDENT_BY_ID_QUERY = "SELECT * FROM users WHERE studentID = ?";
  db.query(SELECT_STUDENT_BY_ID_QUERY, [studentID], (error, results) => {
    if (error) {
      console.error("Error fetching student by ID:", error);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(404).send("Student not found");
    }
    const student = results[0];
    res.json(student);
  });
};

exports.updateStudent = (req, res) => {
  const { studentID, name, Class, schoolNameCode, gurdianname, contactno } = req.body;

  // Fetch the current mediumCode and school code for the studentID
  const GET_CURRENT_MEDIUM_SCHOOL_QUERY = "SELECT mediumCode, schoolNameCode FROM users WHERE studentID = ?";

  db.query(GET_CURRENT_MEDIUM_SCHOOL_QUERY, [studentID], (error, result) => {
    if (error) {
      console.error("Error fetching current medium and school:", error);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length === 0) {
      console.error("Student not found:", studentID);
      return res.status(404).send("Student not found");
    }

    const currentMediumCode = result[0].mediumCode;
    const currentSchoolNameCode = result[0].schoolNameCode;

    // Fetch the medium name for the new school name
    const GET_MEDIUM_NAME_QUERY = "SELECT mediumCode FROM users WHERE schoolNameCode = ?";

    db.query(GET_MEDIUM_NAME_QUERY, [schoolNameCode], (error, result) => {
      if (error) {
        console.error("Error fetching medium name:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (result.length === 0) {
        console.error("School not found:", schoolNameCode);
        return res.status(404).send("School not found");
      }

      const newMediumCode = result[0].mediumCode.charAt(0); // Get the first letter of the medium code

      const updatedStudentID = generateUpdatedStudentID(studentID, Class, newMediumCode, schoolNameCode);

      const UPDATE_STUDENT_QUERY =
        "UPDATE users SET name = ?, Class = ?, schoolNameCode = ?, mediumCode = ?, gurdianname = ?, contactno = ?, studentID = ? WHERE studentID = ?";
      const queryArgs = [name, Class, schoolNameCode, newMediumCode, gurdianname, contactno, updatedStudentID, studentID];

      db.query(
        UPDATE_STUDENT_QUERY,
        queryArgs,
        (error, result) => {
          if (error) {
            console.error("Error updating student:", error);
            return res.status(500).send("Internal Server Error");
          }
          console.log("Student updated successfully");
          res.send("<h1>Student updated successfully</h1>");
        }
      );
    });
  });
};

function generateUpdatedStudentID(studentID, newClass, newMedium, newSchoolNameCode) {
  const parts = studentID.split('_');
  parts[1] = newSchoolNameCode; // Update schoolNameCode
  parts[2] = newClass; // Update Class
  if (newMedium) {
    parts[3] = newMedium.toUpperCase(); // Update mediumCode with the first letter of the medium name
  }
  return parts.join('_');
}


/*exports.getStudentsBySchool = (req, res) => {
  const { schoolNameCode } = req.query;
  console.log("School Name Code:", schoolNameCode);
  const query = `
    SELECT studentID, name, Class, gurdianname, contactno, mediumCode 
    FROM users 
    WHERE schoolNameCode LIKE '${schoolNameCode}%';
  `;
  db.query(query, [schoolNameCode], (error, results) => {
    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      return res.status(404).send("No students found for this school.");
    }
    res.render("viewst2", { students: results, school_code: schoolNameCode });
    //res.json(results);
  });
};*/
exports.getStudentsBySchool = (req, res) => {
  const { schoolNameCode } = req.query;
  console.log("School Name Code:", schoolNameCode);
  const escapedSchoolNameCode = schoolNameCode.replace("'", "''"); // Escape apostrophes
  const query = `
      SELECT studentID, name, Class, gurdianname, contactno, mediumCode 
      FROM users 
      WHERE schoolNameCode LIKE '${escapedSchoolNameCode}%';
  `;
  db.query(query, [schoolNameCode], (error, results) => {
      if (error) {
          console.error("Error fetching students:", error);
          return res.status(500).send("Internal Server Error");
      }

      if (results.length === 0) {
          return res.status(404).send("No students found for this school.");
      }
      res.render("viewst2", { students: results, school_code: schoolNameCode });
  });
};




exports.searchByMedium = (req, res) => {
  const { medium } = req.body;

  const query = `
    SELECT *
    FROM schools
    WHERE medium = ?
  `;

  db.query(query, [medium], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Internal Server Error");
    }

    console.log("Search Results:", results); // Log the search results
    res.render("viewmdm", { schools: results });
  });
};
exports.searchByClass = (req, res) => {
  const { Class } = req.body;

  const query = `
    SELECT *
    FROM users
    WHERE Class = ?
  `;

  db.query(query, [Class], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Internal Server Error");
    }

    console.log("Search Results:", results); // Log the search results
    res.render("viewcls", { students: results });
    //res.json(results);
  });
};
// Backend code
