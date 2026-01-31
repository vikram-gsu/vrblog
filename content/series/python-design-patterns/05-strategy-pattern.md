---
title: "The Strategy Pattern"
date: "2024-10-29"
readTime: "10 min"
excerpt: "Define a family of interchangeable algorithms with the Strategy pattern for flexible, maintainable code."
---

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

## The Problem

Consider a payment processing system that needs to support multiple payment methods. Without Strategy, you might end up with a massive if-else chain:

```python
# Anti-pattern
def process_payment(method, amount):
    if method == "credit_card":
        # Credit card logic
    elif method == "paypal":
        # PayPal logic
    elif method == "crypto":
        # Crypto logic
    # Adding new methods requires modifying this function
```

## Strategy Implementation

```python
from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: float) -> bool:
        pass

class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number: str, cvv: str):
        self.card_number = card_number
        self.cvv = cvv
    
    def pay(self, amount: float) -> bool:
        print(f"Paid ${amount} with credit card ending in {self.card_number[-4:]}")
        return True

class PayPalPayment(PaymentStrategy):
    def __init__(self, email: str):
        self.email = email
    
    def pay(self, amount: float) -> bool:
        print(f"Paid ${amount} via PayPal ({self.email})")
        return True

class CryptoPayment(PaymentStrategy):
    def __init__(self, wallet_address: str):
        self.wallet = wallet_address
    
    def pay(self, amount: float) -> bool:
        print(f"Paid ${amount} in crypto to {self.wallet[:8]}...")
        return True
```

## Context Class

```python
class ShoppingCart:
    def __init__(self):
        self.items = []
        self._payment_strategy: PaymentStrategy = None
    
    def set_payment_strategy(self, strategy: PaymentStrategy):
        self._payment_strategy = strategy
    
    def checkout(self) -> bool:
        total = sum(item.price for item in self.items)
        return self._payment_strategy.pay(total)
```

## Usage

```python
cart = ShoppingCart()
cart.add_item(Product("Laptop", 999.99))

# Customer chooses payment method at runtime
cart.set_payment_strategy(CreditCardPayment("1234567890123456", "123"))
cart.checkout()

# Or switch to PayPal
cart.set_payment_strategy(PayPalPayment("user@email.com"))
cart.checkout()
```

## Python's Functional Approach

For simpler cases, you can use first-class functions:

```python
def credit_card_payment(amount: float) -> bool:
    print(f"Credit card: ${amount}")
    return True

def paypal_payment(amount: float) -> bool:
    print(f"PayPal: ${amount}")
    return True

class ShoppingCart:
    def __init__(self, payment_func):
        self.payment_func = payment_func
    
    def checkout(self, amount):
        return self.payment_func(amount)
```

The Strategy pattern is perfect for scenarios where you need runtime flexibility in choosing algorithms or behaviors.
