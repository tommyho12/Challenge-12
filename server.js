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
  
  function view_departments() {
    const query = 'SELECT * FROM departments';
    db.query(query, (err, departments) => {if (err) throw err;
    
      inquirer
        .prompt([
          {
            type: 'list',
            message: "Select a department to view",
            choices: departments.map((dept) => ({
              name: dept.name,
              id: dept.id,
            })),
            name: 'department'
          },
          {
            type: 'list',
            message: 'What action would you like to take for this department?',
            choices: ['Delete Department', 'Rename Department', 'Return'],
            name: 'options'
          }
        ])
        .then((answers) => {
          const ans = answers.options;
          const selected = answers.department;
          console.log(selected);
          if (ans === 'Delete Department') {
            db.query(`DELETE FROM departments WHERE name='${selected}'`);
            if (err) {
              console.log('Error deleting department!');
            }
            init();
          } else if (ans === 'Rename Department') {
            rename_dep(answers.department);
          } else if (ans === 'Return') {
            view_departments();
          }
        });
    });
  };
  
  function rename_dep(dept) {
    inquirer
      .prompt(
        {
          type: 'input',
          message: 'What would you like the new name to be?',
          name: 'new_name'
        }
      )
      .then((answers) => {
        const ans = answers.new_name;
  
        db.query(`UPDATE departments SET name='${ans}' WHERE name='${dept}'`);
        console.log(`Department '${dept}', successfully updated to '${ans}'!`);
  
        init();
      });
  };
  
  function view_roles() {
    const query = 'SELECT * FROM roles';
    db.query(query, (err, roles) => {if (err) throw err;
  
      inquirer
      .prompt([
        {
          type: 'list',
          message: 'which role would you like to view?',
          choices: roles.map((role) => ({
            name: role.name
          })),
          name: 'role',
        },
        {
          type: 'list',
          message: 'What action would you like to take for this role?',
          choices: ['Delete Role', 'Rename Role', 'Return'],
          name: 'options'
        }
      ])
      .then((answers) => {
        const selected = answers.role;
        const ans = answers.options;
        
        if (ans === 'Delete Role') {
          db.query(`DELETE FROM roles WHERE name='${selected}'`);
          if (err) {
            console.log('Error deleting role!');
          }
          init();
        } else if (ans === 'Rename Role') {
          rename_role(answers.role);
        } else if (ans === 'Return') {
          view_roles();
        }
      });
    });
  };
  
  function rename_role(role) {
    inquirer
      .prompt(
        {
          type: 'input',
          message: 'What would you like the new name to be?',
          name: 'new_name'
        }
      )
      .then((answers) => {
        const ans = answers.new_name;
  
        db.query(`UPDATE roles SET name='${ans}' WHERE name='${role}'`);
        console.log(`Role '${role}', successfully updated to '${ans}'!`);
  
        init();
      });
  }
  
  function view_employees() {
    const query = 'SELECT * FROM employees';
    db.query(query, (err, employees) => {if (err) throw err;
  
      inquirer
      .prompt([
        {
          type: 'list',
          message: 'which employee would you like to view?',
          choices: employees.map((emp) => ({
            name: emp.first_name + ' ' + emp.last_name,
            value: emp.id
          })),
          name: 'employee',
        },
        {
          type: 'list',
          message: 'What action would you like to take for this employee?',
          choices: ['Delete Employee', 'Rename Employee', 'View Info', 'Return'],
          name: 'options'
        }
      ])
      .then((answers) => {
        const selected = answers.employee;
        const ans = answers.options;
        const empName = answers.employee.name;
        
        if (ans === 'Delete Employee') {
          db.query(`DELETE FROM employees WHERE id='${selected}'`);
          if (err) {
            console.log('Error deleting employee!');
          }
          init();
        } else if (ans === 'Rename Employee') {
          rename_employee(selected);
        } else if (ans === 'View Info') {
          view_info(selected);
        } else if (ans === 'Return') {
          view_employees();
        }
      });
      
    });
  };
  
  function rename_employee(selected) {
    inquirer
      .prompt([
        {
          type: 'input',
          message: 'What would you like the new first name to be?',
          name: 'first',
        },
        {
          type: 'input',
          message: 'What would you like the new last name to be?',
          name: 'last'
        }
      ])
      .then((answers) => {
        const ans = answers.first + ' ' + answers.last;
  
        db.query(`UPDATE employees SET first_name='${answers.first}' WHERE id='${selected}'`);
        db.query(`UPDATE employees SET last_name='${answers.last}' WHERE id='${selected}'`);
        console.log(`Employee's name successfully updated to '${ans}'!`);
  
        init();
      });
  }
  
  function view_info(id) {
  
    db.query(`SELECT * FROM employees WHERE id='${id}'`, function(err, data) {
      if (err) {
        console.error(err);
        return;
      }
      
      if (data.length > 0) {
        const employee = data[0]; // Access the first element of the data array
        console.log(`First name: ${employee.first_name}\nLast name: ${employee.last_name}\nRole ID: ${employee.role_id}\nManager ID: ${employee.manager_id}`);
        init();
      } else {
        console.log('Employee not found.');
      }
    });
  };
  
  
  init();