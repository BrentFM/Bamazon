var con = require("./mysql");
var inquirer = require("inquirer");
const boxen = require('boxen');
var cash = 500;

con.connect(function (err) {
    if (err) throw err;
    con.query("SELECT * FROM products", function (err, result, fields) {
        if (err) throw err;
        //   console.log(result)


        inquirer.prompt([

            {
                type: "input",
                name: "name",
                message: "What is your name?"
            },{
                type: "input",
                name: "cash",
                message: "How much cash do you have?"
            }
        ])
        .then(function (user) {
            cash = user.cash
            if (user) {
                console.log(boxen('Welcome to Bamazon, ' + user.name + "\n" + "You have $" + cash + " to spend", { padding: 1, margin: 1, borderStyle: 'double' }));

                inquirer.prompt([
                    {
                        type: "list",
                        pageSize: 100,
                        message: "Here is our catalog!",
                        choices: function() {
                            var choiceArray = [];
                            for (var i = 0; i < result.length; i++) {
                              choiceArray.push(result[i].product_name + "\n" + "Current bid - $" + result[i].price + "\n");
                            }
                            return choiceArray;
                          },
                        name: "catalog"
                    }
                ]).then(function (user) {
                    if (user.catalog) {
                        inquirer.prompt([
                            {
                                type: "confirm",
                                message: "Purchase?",
                                name: "confirm",
                                default: true
                            }
                        ]).then(function (user) {
                            if (user.confirm === false) {
                                console.log("Please come again soon!");
                                process.exit();
                            }
                            if (user.confirm === true) {
                                if (cash < result[i].price) {
                                    console.log("Sorry, you dont have enough to buy this!");
                                    process.exit();
                                }
                                if (result[i].stock_quantity === 0) {
                                    console.log("Sorry, we are out of stock!");
                                    process.exit();
                                }
                                if (cash >= result[i].price) {
                                    var total = cash - result[i].price;
                                    console.log("Thank you for purchasing our " + result[i].product_name)
                                    console.log("You have $" + total + " remaining!")
                                    con.query("UPDATE products SET stock_quantity = stock_quantity - 1 WHERE item_id = '1'")
                                }
                                
                            }
                        })
                    }
                })

            }

        })




    });
});