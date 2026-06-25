//
//  ViewController.swift
//  KFC
//
//  Created by Shreyash Gajbhiye  on 11/08/22.
//

import UIKit

class ViewController: UIViewController {
    @IBOutlet weak var orderLabel: UILabel!
    //Option BUttons
    @IBOutlet weak var option1Button: UIButton!
    @IBOutlet weak var option2Button: UIButton!
    
    var TakingOrderBrain = takingorderBrain()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        updateUI()
    }
    
    @IBAction func choiseMade(_ sender: UIButton) {
        TakingOrderBrain.nextOrder(userChoice: sender.currentTitle!)
        
        updateUI()
    }
    
    
    
    func updateUI(){
        orderLabel.text = TakingOrderBrain.getOrderQues()
        option1Button.setTitle(TakingOrderBrain.getOption1(), for: .normal)
        option2Button.setTitle(TakingOrderBrain.getOption2(), for: .normal)
    }
    
}

