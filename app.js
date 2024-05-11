const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = express();
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("view engine", "hbs");
db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySQL Connected...");
  }
});

// Route to handle autocomplete functionality
/*app.post('/autocomplete', (req, res) => {
    const userInput = req.body.input;
    const query = `SELECT name, school_code FROM schools WHERE name LIKE '%${userInput}%'`;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json(results);
        }
    });
});
*/
app.post("/autocomplete", (req, res) => {
  const userInput = req.body.input;
  const query = "SELECT name, school_code FROM schools WHERE name LIKE ?";
  const userInputWithWildcard = userInput + "%";
  db.query(query, [userInputWithWildcard], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "An error occurred" });
    } else {
      res.json(results);
    }
  });
});

// Import your database module or create a database connection

// Route to get the count of students by class
app.get("/backend/studentsByClass", (req, res) => {
  // Implement database query to get the count of students for each class
  const query = `
        SELECT Class, COUNT(*) AS count
        FROM users
        GROUP BY Class;
    `;

  // Execute the query
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching students by class:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Extract the class and count from the results
    const studentsByClass = {};
    results.forEach((row) => {
      studentsByClass[row.Class] = row.count; // Change 'class' to 'Class'
    });

    // Send the response as JSON
    res.json(studentsByClass);
  });
});

// Route to get the count of students by medium
app.get("/backend/studentsByMedium", (req, res) => {
  // Implement database query to get the count of students for each medium
  const query = `
        SELECT medium, COUNT(*) AS count
        FROM schools
        GROUP BY medium;
    `;

  // Execute the query
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching students by medium:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Extract the medium and count from the results
    const studentsByMedium = {};
    results.forEach((row) => {
      studentsByMedium[row.medium] = row.count;
    });

    // Send the response as JSON
    res.json(studentsByMedium);
  });
});

app.get("/api/schools", (req, res) => {
  const query = "SELECT school_code, city FROM schools";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching school data:", error);
      res.status(500).json({ error: "Error fetching school data" });
      return;
    }
    res.json(results); // Return both school code and city
  });
});

app.post("/api/createCenter", (req, res) => {
  const { centerCode, inviteSchools } = req.body;

  // Get current date
  const currentDate = new Date().toISOString().slice(0, 10);

  // Insert the center data into the database with the current date
  const centerQuery = "INSERT INTO centers (center_name, date) VALUES (?, ?)";
  db.query(
    centerQuery,
    [centerCode, currentDate],
    (centerError, centerResult) => {
      if (centerError) {
        console.error("Error creating center:", centerError);
        res.status(500).json({ error: "Error creating center" });
        return;
      }

      //   const centerId = centerResult.insertId;
      const centerId = centerResult.insertId;
      const centerName = centerCode;

      // Insert the invite schools data into the database
      const inviteSchoolsQuery =
        "INSERT INTO center_schools (center_id,center_name, school_code, city, date) VALUES ?";
      const inviteSchoolsData = inviteSchools.map((school) => [
        centerId,
        centerName,
        school.code,
        school.city,
        school.date || currentDate,
      ]);

      db.query(
        inviteSchoolsQuery,
        [inviteSchoolsData],
        (inviteError, inviteResult) => {
          if (inviteError) {
            console.error("Error creating center schools:", inviteError);
            res.status(500).json({ error: "Error creating center schools" });
            return;
          }

          res.json({
            message: "Center created successfully",
            centerId: centerId,
          });
        }
      );
    }
  );
});

app.get("/api/centers", (req, res) => {
  const centersQuery = `
        SELECT center_name
        FROM centers;
    `;
  const schoolsQuery = `
        SELECT school_code, city
        FROM center_schools;
    `;
  const fetchAllDatasQuery = `
      SELECT *
      FROM center_schools;
  `;
  //   const fetchAllDatasQuery = `
  //         SELECT cs.*, c.center_name
  //         FROM center_schools cs
  //         INNER JOIN centers c ON cs.id = c.id;
  //     `;

  db.query(centersQuery, (centersError, centersResults) => {
    if (centersError) {
      console.error("Error fetching centers:", centersError);
      res.status(500).json({ error: "Error fetching centers" });
      return;
    }

    db.query(schoolsQuery, (schoolsError, schoolsResults) => {
      if (schoolsError) {
        console.error("Error fetching schools:", schoolsError);
        res.status(500).json({ error: "Error fetching schools" });
        return;
      }

      db.query(fetchAllDatasQuery, (fetchAllError, fetchAllResults) => {
        if (fetchAllError) {
          console.error("Error fetching all data:", fetchAllError);
          res.status(500).json({ error: "Error fetching all data" });
          return;
        }

        const centers = centersResults.map((center) => center.center_name);
        const schools = schoolsResults.map((school) => ({
          school_code: school.school_code,
          city: school.city,
        }));
        const allDatas = fetchAllResults;

        const combinedResults = centers.map((center, index) => ({
          center_name: center,
          school_code: schools[index].school_code,
          city: schools[index].city,
        }));

        res.json(allDatas);
        // res.json({ centers: combinedResults, allDatas: allDatas });
      });
    });
  });
});

// Backend route for searching centers by name
app.post("/auth/searchBycenterName", (req, res) => {
  const { centerName } = req.body;

  // Query to search centers by name
  const query = `
        SELECT center_name
        FROM center_schools
        WHERE center_name LIKE ?
    `;

  // Execute the query for center_name
  db.query(query, [`%${centerName}%`], (err, centerResults) => {
    if (err) {
      console.error("Error searching centers by name:", err);
      res.status(500).json({ error: "Error searching centers by name" });
      return;
    }

    // Query to search cities by center name
    const cityQuery = `
            SELECT city, school_code
            FROM center_schools
            WHERE center_id IN (
                SELECT id
                FROM centers
                WHERE center_name LIKE ?
            )
        `;

    // Execute the query for cities
    db.query(cityQuery, [`%${centerName}%`], (err, cityResults) => {
      if (err) {
        console.error("Error searching cities by center name:", err);
        res
          .status(500)
          .json({ error: "Error searching cities by center name" });
        return;
      }

      // Combine the results
      const combinedResults = centerResults.map((center, index) => ({
        center_name: center.center_name,
        city: cityResults[index].city,
        school_code: cityResults[index].school_code,
      }));

      res.json(combinedResults);
    });
  });
});
app.get("/api/centers/suggestions", (req, res) => {
  const { query } = req.query;
  console.log("Query:", query); // Log the received query

  // Query to fetch center names from the database based on the provided query
  const sql = `
        SELECT center_name
        FROM centers
        WHERE center_name LIKE ?
    `;
  console.log("SQL:", sql); // Log the SQL query

  // Execute the query
  db.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error("Error fetching center suggestions:", err);
      res.status(500).json({ error: "Error fetching center suggestions" });
      return;
    }

    // Extract center names from the results
    const suggestions = results.map((result) => result.center_name);
    console.log("Suggestions:", suggestions); // Log the suggestions

    res.json(suggestions);
  });
});

app.get("/backend/totalCenters", (req, res) => {
  // Query to get the count of exam centers
  const sql = `
        SELECT COUNT(*) AS totalCenters
        FROM centers
    `;

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching total centers:", err);
      res.status(500).json({ error: "Error fetching total centers" });
      return;
    }

    // Extract the total number of centers from the results
    const totalCenters = results[0].totalCenters;

    // Send the total centers count as a JSON response
    res.json({ totalCenters });
  });
});
// Assuming you have already configured your database connection

app.post("/updateSchool", (req, res) => {
  const { id, name, school_code, city, medium, contact } = req.body;
  const sql = `UPDATE schools SET name = ?, school_code = ?, city = ?, medium = ?, contact = ? WHERE id = ?`;
  db.query(
    sql,
    [name, school_code, city, medium, contact, id],
    (err, result) => {
      if (err) {
        console.error("Error updating school:", err);
        res
          .status(500)
          .json({ success: false, message: "Failed to update school" });
        return;
      }
      console.log("School updated successfully");

      // Fetch the updated data and send it back to the frontend
      db.query("SELECT * FROM schools", (err, rows) => {
        if (err) {
          console.error("Error fetching schools:", err);
          res
            .status(500)
            .json({ success: false, message: "Failed to fetch schools" });
          return;
        }
        console.log("Updated schools:", rows); // Add this line to check the updated data
        res.json({
          success: true,
          message: "School updated successfully",
          schools: rows,
        });
      });
    }
  );
});

app.get("/getSchoolNameCodes", (req, res) => {
  const query = "SELECT schoolNameCode FROM users"; // Change 'users' to your actual table name
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching school names and codes:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const schoolNameCodes = result.map((row) => {
      const [name, code] = row.schoolNameCode.split(" "); // Assuming name and code are separated by a space
      return { name, code };
    });

    res.json(schoolNameCodes);
  });
});
app.get("/backend/schoolsByMedium", (req, res) => {
  db.query(
    "SELECT medium, COUNT(*) AS count FROM schools GROUP BY medium",
    (err, result) => {
      if (err) {
        throw err;
      }
      const data = {};
      result.forEach((row) => {
        data[row.medium] = row.count;
      });
      res.json(data);
    }
  );
});
app.get("/backend/classesByMedium", (req, res) => {
  db.query(
    `
        SELECT mediumCode AS medium, COUNT(*) AS count 
        FROM users
        GROUP BY mediumCode
    `,
    (err, result) => {
      if (err) {
        throw err;
      }
      const data = {};
      result.forEach((row) => {
        data[row.medium] = row.count;
      });
      res.json(data);
    }
  );
});
app.get("/backend/recentStudents", (req, res) => {
  const query = `
        SELECT * FROM users
        ORDER BY id DESC
        LIMIT 5;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching recent students:", error);
      res.status(500).json({ error: "Error fetching recent students" });
      return;
    }
    res.json(results);
  });
});
app.get("/backend/recentSchools", (req, res) => {
  const query = `
        SELECT * FROM schools
        ORDER BY school_code DESC
        LIMIT 5;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching recent schools:", error);
      res.status(500).json({ error: "Error fetching recent schools" });
      return;
    }
    res.json(results);
  });
});
app.get("/backend/recentCenters", (req, res) => {
  const query = `
        SELECT center_id, school_code, city
        FROM center_schools
        ORDER BY center_id DESC
        LIMIT 5;
    `;

  const query2 = `
        SELECT center_name
        FROM centers;
    `;

  // Execute the queries
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching recent centers:", err);
      res.status(500).json({ error: "Failed to fetch recent centers" });
    } else {
      db.query(query2, (err, centerNames) => {
        if (err) {
          console.error("Error fetching center names:", err);
          res.status(500).json({ error: "Failed to fetch center names" });
        } else {
          // Combine the results
          const mergedResults = results.map((result) => {
            const centerName = centerNames[0]; // Since there's only one column, we can directly take the first element
            return {
              ...result,
              center_name: centerName ? centerName.center_name : "",
            };
          });
          res.json(mergedResults);
        }
      });
    }
  });
});
// Endpoint to fetch schools
app.get("/schools", (req, res) => {
  const SELECT_SCHOOLS_QUERY = "SELECT DISTINCT name, school_code FROM schools";

  db.query(SELECT_SCHOOLS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});
app.get("/users", (req, res) => {
  const SELECT_USERS_QUERY = "SELECT DISTINCT schoolNameCode FROM users";

  db.query(SELECT_USERS_QUERY, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Other routes
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

app.listen(8000, () => {
  console.log("server is running on port on 8000");
});
