use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Wallet {
    pub id: String,
    pub name: String,
    pub balance: f64,
}

impl Wallet {
    pub fn new(id: String, name: String, balance: f64) -> Self {
        Wallet { id, name, balance }
    }

    pub fn add_funds(&mut self, amount: f64) {
        self.balance += amount;
    }

    pub fn withdraw_funds(&mut self, amount: f64) -> Result<f64, String> {
        if amount > self.balance {
            Err("Insufficient funds".to_string())
        } else {
            self.balance -= amount;
            Ok(self.balance)
        }
    }
}