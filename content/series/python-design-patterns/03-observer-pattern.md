---
title: "The Observer Pattern"
date: "2024-10-15"
readTime: "11 min"
excerpt: "Implement event-driven architectures with the Observer pattern for loose coupling between components."
---

The Observer pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

## Real-World Analogy

Think of a newsletter subscription. When you subscribe, you receive updates whenever new content is published. You don't need to check the website constantly—you get notified.

## Basic Implementation

```python
from abc import ABC, abstractmethod
from typing import List

class Observer(ABC):
    @abstractmethod
    def update(self, message: str) -> None:
        pass

class Subject:
    def __init__(self):
        self._observers: List[Observer] = []
    
    def attach(self, observer: Observer) -> None:
        self._observers.append(observer)
    
    def detach(self, observer: Observer) -> None:
        self._observers.remove(observer)
    
    def notify(self, message: str) -> None:
        for observer in self._observers:
            observer.update(message)
```

## Practical Example: Stock Price Tracker

```python
class StockTicker(Subject):
    def __init__(self, symbol: str):
        super().__init__()
        self.symbol = symbol
        self._price = 0.0
    
    @property
    def price(self) -> float:
        return self._price
    
    @price.setter
    def price(self, value: float) -> None:
        self._price = value
        self.notify(f"{self.symbol}: ${value:.2f}")

class PriceAlert(Observer):
    def __init__(self, name: str):
        self.name = name
    
    def update(self, message: str) -> None:
        print(f"[{self.name}] Alert: {message}")

# Usage
apple = StockTicker("AAPL")
trader = PriceAlert("Trading Bot")
logger = PriceAlert("Price Logger")

apple.attach(trader)
apple.attach(logger)

apple.price = 150.00  # Both observers get notified
```

## Python's Built-in Alternative

Python's `property` decorator and descriptors can achieve similar results for simpler cases. For complex event systems, consider libraries like `PyPubSub` or `blinker`.

The Observer pattern is foundational for building reactive, event-driven systems in Python.
