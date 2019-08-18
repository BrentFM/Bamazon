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
    console.log("Welcome to the Manager Dashboard " + name.name + "!")
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
                            var updatedstock = result[i].stock_quantity
                        }                    }
                    console.log("\n" + "======== Current Bamazon Inventory ======== \n");
                    console.log(table.toString());
                    console.log("Products less than 4 in stock are shown here!".red + "\n")
                    managerInventory(updatedstock);
                })
            }
        }
        function managerInventory(updatedstock) {
            inquirer.prompt([
                {
                type: "input",
                name: "inventoryID",
                message: "Please enter the ID number of the item you want to adjust.",
            },
            {
                type: "input",
                name: "inventory",
                message: "How many would you like to add to the stock?",
            }
            ]).then(function (stockadjust) {
                con.query("SELECT * FROM products WHERE item_id=?", stockadjust.inventoryID, function (err, result) {
                    if (err) {
                        console.log("An error occurred!")
                    } else {
                        con.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: parseInt(updatedstock) + parseInt(stockadjust.inventory)
                        }, {
                            item_id: stockadjust.inventoryID
                        }
                        ]);

                        console.log("\n" + "Inventory updated!".green)
                        con.end();

                    }
                })
            })
        }

    })
}