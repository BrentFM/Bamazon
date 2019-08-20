var con = require("./mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var colors = require('colors');

inquirer.prompt([

    {
        type: "input",
        name: "name",
        message: "What is your name?"
    }
]).then(function (name) {
    console.log("\n Welcome to the Manager Dashboard " + name.name + "! \n")
    managerMenu();
})

function managerMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: "Menu Selection",
            choices: ["View Products for Sale", "Inventory Settings", "Add New Product"],
            name: "managermenu"
        }
    ]).then(function (managerView) {
        if (managerView.managermenu === "Add New Product") {
            inquirer.prompt([
                {
                    type: "input",
                    name: "addproduct_name",
                    message: "What is the product name you want to add?",
                },
                {
                    type: "input",
                    name: "addproduct_department",
                    message: "What is the department name?",
                },
                {
                    type: "input",
                    name: "addproduct_price",
                    message: "What is the price?",
                },
                {
                    type: "input",
                    name: "addproduct_stock",
                    message: "What is the stock amount?",
                },
            ]).then(function (addproduct) {
                if (addproduct) {
                    var add_name = addproduct.addproduct_name;
                    var add_department = addproduct.addproduct_department;
                    var addproduct_price = addproduct.addproduct_price;
                    var addproduct_stock = addproduct.addproduct_stock;
                    con.query("INSERT INTO products SET ?",
                        {
                            product_name: add_name,
                            department_name: add_department,
                            price: addproduct_price,
                            stock_quantity: addproduct_stock
                        }
                    );
                    console.log("\n" + "Product Added! \n".green)
                    con.end();
                }
            })
        }

        if (managerView.managermenu === "View Products for Sale") {
            var table = new Table({
                head: ['Item ID'.blue, 'Product Name'.blue, 'Department Name'.blue, 'Price'.blue, 'Stock'.blue],
                colWidths: [10, 20, 20, 20, 10]
            });
            listInventory();
            function listInventory() {
                con.query("SELECT * FROM products", function (err, result) {
                    if (err) {
                        console.log("An error occurred!")
                    }
                    for (var i = 0; i < result.length; i++) {

                        var item_id = result[i].item_id,
                            product_name = result[i].product_name,
                            department_name = result[i].department_name,
                            price = "$" + result[i].price,
                            stock_quantity = result[i].stock_quantity;

                        table.push(
                            [item_id, product_name, department_name, price, stock_quantity]
                        );
                    }
                    console.log("\n" + "============================= Current Bamazon Inventory =============================" + "\n");
                    console.log(table.toString() + "\n");
                    managerMenu();
                })
            }
        }

        if (managerView.managermenu === "Inventory Settings") {
            var table = new Table({
                head: ['Item ID'.blue, 'Product Name'.blue, 'Stock'.blue],
                colWidths: [10, 20, 10]
            });
            listInventory();
            function listInventory() {
                con.query("SELECT * FROM products", function (err, result) {
                    if (err) {
                        console.log("An error occurred!")
                    }
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].stock_quantity <= 3) {

                            var item_id = result[i].item_id,
                                product_name = result[i].product_name,
                                stock_quantity = colors.red(result[i].stock_quantity);

                            table.push(
                                [item_id, product_name, stock_quantity]
                            );
                        }
                        var currentstock = result[i].stock_quantity
                    }
                    console.log("\n" + "======== Current Bamazon Inventory ======== \n");
                    console.log(table.toString());
                    console.log("Products less than 4 in stock are shown here!".red + "\n")
                    managerInventory(currentstock);
                })
            }
        }

        function managerInventory(currentstock) {
            inquirer.prompt([
                {
                    type: "input",
                    name: "inventoryID",
                    message: "Please enter the ID number of the item you want to adjust.",
                },
                {
                    type: "input",
                    name: "inventory",
                    message: "Update the stock to what amount?",
                }
            ]).then(function (stockadjust) {
                con.query("UPDATE products SET ? WHERE ?", [{
                    stock_quantity: parseInt(stockadjust.inventory)
                }, {
                    item_id: stockadjust.inventoryID
                }
                ]);
                console.log("\n" + "Inventory updated! \n".green)
                con.end();

            })
        }
    })
}

