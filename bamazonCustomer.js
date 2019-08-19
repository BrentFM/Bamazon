var con = require("./mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var colors = require('colors');
var cash = 0;

        inquirer.prompt([

            {
                type: "input",
                name: "name",
                message: "What is your name?"
            }, {
                type: "input",
                name: "cash",
                message: "How much cash do you have?"
            }
        ])
            .then(function (user) {
                cash = user.cash
                if (user.name) {
                    console.log("\n" + 'Welcome to Bamazon, ' + user.name + "\n" + "You have $" + cash + " to spend");
                    inventory();
                }
            })

        function inventory() {
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

                            if (result[i].price <= cash) {
                                price = "$".green + colors.green(result[i].price)
                            }
                            if (result[i].price > cash) {
                                price = "$".red + colors.red(result[i].price)
                            }
                        table.push(
                            [item_id, product_name, department_name, price, stock_quantity]
                        );
                    }
                    console.log("\n" + "============================= Current Bamazon Inventory =============================" + "\n");
                    console.log(table.toString()  + "\n");
                    purchaseQuestion();
                })
            }
        }

        function purchaseQuestion() {

            inquirer.prompt([{

                type: "confirm",
                name: "confirm",
                message: "Would you like to purchase an item?",
                default: true

            }]).then(function (user) {
                if (user.confirm === true) {
                    itemIdSearch();
                } else {
                    console.log("Thank you! Come back soon!");
                }
            });

            function itemIdSearch() {
                inquirer.prompt([{

                    type: "input",
                    name: "purchaseID",
                    message: "Please enter the ID number of the item you would like to purchase.",
                },
                {
                    type: "input",
                    name: "purchaseUnits",
                    message: "How many units of this item would you like to purchase?",

                }
                ]).then(function (userPurchase) {
                    con.query("SELECT * FROM products WHERE item_id=?", userPurchase.purchaseID, function (err, result) {
                        if (err) {
                            console.log("An error occurred!")
                        }
                        for (var i = 0; i < result.length; i++) {

                            if (userPurchase.purchaseUnits > result[i].stock_quantity) {

                                console.log("===========================");
                                console.log("Sorry, we are out of stock!".red);
                                console.log("===========================");
                                con.end()

                            } else {
                                console.log("===========================");
                                console.log("You've selected:");
                                console.log("----------------");
                                console.log("Item: " + result[i].product_name);
                                console.log("Price: $" + result[i].price);
                                console.log("Quantity: " + userPurchase.purchaseUnits);
                                console.log("----------------");
                                console.log("Total: $" + result[i].price * userPurchase.purchaseUnits);
                                console.log("===========================");

                                if (cash < result[i].price) {
                                    console.log("Sorry, you dont have enough to buy this! \n".red)
                                    con.end();
                                } else {

                                var newStock = (result[i].stock_quantity - userPurchase.purchaseUnits);
                                var purchaseId = (userPurchase.purchaseID);
                                purchaseOrder(newStock, purchaseId);
                                }
                            }
                        }
                    });
                });
            }

            // --- Confirm Purchase --- //

            function purchaseOrder(newStock, purchaseId) {

                inquirer.prompt([
                    {
                    type: "confirm",
                    name: "confirmPurchase",
                    message: "Does this complete your order?",
                    default: true
                }
            ]).then(function (userConfirm) {
                    if (userConfirm.confirmPurchase === true) {
                        con.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: newStock
                        }, {
                            item_id: purchaseId
                        }
                        ]);

                        console.log("===========================");
                        console.log("Order completed! Thank you! \n".green);
                        con.end();
                    } else {
                        console.log("===========================");
                        console.log("Please come again soon!");
                        console.log("===========================");
                        con.end();
                    }
                });
            }
        }
