const inquirer = require("inquirer");
const express = require("express");
const mysql = require("mysql2");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Creates and establishes connection to company_db database.
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "company_db",
  },
  console.log("Connected to the company_db database.")
);

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL server");
});
function add_department() {
    inquirer
      .prompt([
        {
          type: 'input',
          message: 'Please enter the name of the department.',
          name: 'new_dep_name',
          validate: (input) => {
            if (input.trim() !== '') {
              return true;
            }
            return 'Please enter a valid name.';
          },
        }
      ])
      .then((answers) => {
        console.log(answers.new_dep_name);
        const query = 'INSERT INTO departments (name) VALUES (?)';
        const name = answers.new_dep_name;
  
        db.query(query, name, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.table(result);
          init();
        });
      });
  };
  
  // Function to add a role
  function add_role() {
    const query = 'SELECT * FROM departments';
    db.query(query, (err, departments) => {
      if (err) throw err;
  
      inquirer
        .prompt([
          {
            name: 'name',
            type: 'input',
            message: "Enter the role's name",
            validate: (input) => {
              if (input.trim() !== '') {
                return true;
              }
              return 'Please enter a valid role name.';
            },
          },
          {
            name: 'salary',
            type: 'input',
            message: "Enter the role's salary:",
            validate: (input) => {
              if (/^\d+(.\d{1,2})?$/.test(input)) {
                return true;
              }
              return 'Please enter a valid salary (numeric value).';
            },
          },
          {
            name: 'department',
            type: 'list',
            message: "Select the role's department:",
            choices: departments.map((dept) => ({
              name: dept.name,
              value: dept.id,
            })),
          },
        ])
        .then((answer) => {
          const role = {
            name: answer.name,
            salary: answer.salary,
            department_id: answer.department,
          };
  
          const query = 'INSERT INTO roles SET ?';
          db.query(query, role, (err, res) => {
            if (err) throw err;
            console.log(`\nRole '${answer.name}' added successfully.`);
            init();
          });
        });
    });
  }
  
  function add_employee() {
    const query = 'SELECT * FROM roles';
    const empquery = 'SELECT * FROM employees';
    db.query(query, (err, roles) => {
      db.query(empquery, (err, employees) => {
        
        inquirer
          .prompt([
            {
              type: 'input',
              message: "Please enter the employee's first name.",
              name: 'frstname'
            },
            {
              type: 'input',
              message: "Please enter the employee's last name.",
              name: 'lastname'
            },
            {
              type: 'list',
              message: "what is this employee's role?",
              choices: roles.map((role) => ({
                name: role.name,
                value: role.id,
              })),
              name: 'emp_role'
            },
            {
              type: 'list',
              message: "Who is this employee's manager?",
              choices: [{
                  name: 'None',
                  manager_id: null,
                },
                ...employees.map((emplist) => ({
                name: emplist.first_name + ' ' + emplist.last_name,
                manager_id: emplist.id,
              })),
              ],
              name: 'manager'
            }
            ])
            .then((answers) => {
              const employee = {
                first_name: answers.frstname,
                last_name: answers.lastname,
                role_id: answers.emp_role,
                manager_id: answers.manager.manager_id,
              }
              
              const query = 'INSERT INTO employees SET ?';
                db.query(query, employee, (err, res) => {
                  if (err) throw err;
                  console.log(`\nEmployee '${answers.frstname} ${answers.lastname}' added successfully.`);
                  init();
                });
            });
      });
    });
  };