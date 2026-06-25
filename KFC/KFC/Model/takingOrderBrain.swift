//
//  takingOrderBrain.swift
//  KFC
//
//  Created by Shreyash Gajbhiye  on 11/08/22.
//

import Foundation

struct takingorderBrain{
    //Order number starting from 0
    var orderNumber = 0
    
    let orders = [
        //0
        order(
            question: "What you would like to eat?",
            option1: "10pc Strips with Dynamic Sauce", option1Destination: 1,
            option2: "Smoky Grilled Chicken Biryani Combo", option2Destination: 2
        ),
        //1
        order(
            question: "What you would like to add with it?",
            option1: "Dynamite Spicy Mayo", option1Destination: 3,
            option2: "Nothing", option2Destination: 5
        ),
        //2
        order(
            question: "What you would like to have with it?",
            option1: "Crispy Chicken with 2 Spicy Gravies", option1Destination: 4,
            option2: "Nothing", option2Destination: 6
        ),
        //with
        //3
        order(
            question: "Thankyou for choosing KFC. Your total is : 10pc Strips with Dynamic Sauce and Dynamite Spicy Mayo", option1:"Start Over", option1Destination: 0, option2: "StartOver", option2Destination: 0
        ),
        //4
        order(
            question: "Thankyou for choosing KFC. Your total is : Smoky Grilled Chicken Biryani Combo and Crispy Chicken with 2 Spicy Gravies", option1:"Start Over", option1Destination: 0, option2: "StartOver", option2Destination: 0
        ),
        //Nothing
        //5
        order(
            question: "Thankyou for choosing KFC. Your total is : 10pc Strips with Dynamic Sauce", option1:"Start Over", option1Destination: 0, option2: "StartOver", option2Destination: 0
        ),
        
        //6
        order(
            question: "Thankyou for choosing KFC. Your total is : Smoky Grilled Chicken Biryani Combo", option1:"Start Over", option1Destination: 0, option2: "StartOver", option2Destination: 0)
    ]
    
    func getOrderQues() -> String {
        return orders[orderNumber].question
    }
    func getOption1() -> String {
        return orders[orderNumber].option1
    }
    
    func getOption2() -> String {
        return orders[orderNumber].option2
    }
    
    mutating func nextOrder(userChoice: String) {
        
        let currentOrder = orders[orderNumber]
        if userChoice == currentOrder.option1 {
            orderNumber = currentOrder.option1Destination
        } else if userChoice == currentOrder.option2 {
            orderNumber = currentOrder.option2Destination
        }
    }
}
