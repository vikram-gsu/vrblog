---
title: "The Decorator Pattern"
date: "2024-10-22"
readTime: "13 min"
excerpt: "Extend object behavior dynamically without modifying original classes using the Decorator pattern."
---

The Decorator pattern allows you to attach new behaviors to objects by placing them inside wrapper objects that contain these behaviors.

## Don't Confuse with Python Decorators

While Python has a feature called "decorators" (using the @ syntax), the Decorator design pattern is a different concept—though Python decorators can be used to implement it!

## The Problem

Imagine a coffee shop system. You have a basic coffee, and customers can add various extras (milk, sugar, whipped cream). Without the Decorator pattern, you'd need classes for every combination.

## Implementation

```python
from abc import ABC, abstractmethod

class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float:
        pass
    
    @abstractmethod
    def description(self) -> str:
        pass

class SimpleCoffee(Coffee):
    def cost(self) -> float:
        return 2.00
    
    def description(self) -> str:
        return "Simple coffee"

class CoffeeDecorator(Coffee):
    def __init__(self, coffee: Coffee):
        self._coffee = coffee
    
    def cost(self) -> float:
        return self._coffee.cost()
    
    def description(self) -> str:
        return self._coffee.description()

class MilkDecorator(CoffeeDecorator):
    def cost(self) -> float:
        return self._coffee.cost() + 0.50
    
    def description(self) -> str:
        return f"{self._coffee.description()}, milk"

class WhippedCreamDecorator(CoffeeDecorator):
    def cost(self) -> float:
        return self._coffee.cost() + 0.75
    
    def description(self) -> str:
        return f"{self._coffee.description()}, whipped cream"
```

## Usage

```python
# Start with simple coffee
my_coffee = SimpleCoffee()
print(f"{my_coffee.description()}: ${my_coffee.cost()}")

# Add milk
my_coffee = MilkDecorator(my_coffee)
print(f"{my_coffee.description()}: ${my_coffee.cost()}")

# Add whipped cream
my_coffee = WhippedCreamDecorator(my_coffee)
print(f"{my_coffee.description()}: ${my_coffee.cost()}")
```

## Using Python Function Decorators

```python
def add_milk(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result + 0.50
    return wrapper

def add_whipped_cream(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result + 0.75
    return wrapper

@add_whipped_cream
@add_milk
def coffee_price():
    return 2.00

print(coffee_price())  # 3.25
```

The Decorator pattern provides a flexible alternative to subclassing for extending functionality.
