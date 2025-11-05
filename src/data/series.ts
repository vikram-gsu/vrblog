export interface SeriesPost {
  id: number;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  posts: SeriesPost[];
}

export const series: Series[] = [
  {
    id: "python-design-patterns",
    title: "Python Design Patterns",
    description: "A comprehensive guide to classic design patterns implemented in Python. Learn how to write cleaner, more maintainable code using proven architectural solutions.",
    posts: [
      {
        id: 1,
        title: "Singleton Pattern: One Instance to Rule Them All",
        date: "2024-10-01",
        readTime: "10 min",
        excerpt: "Ensuring a class has only one instance and providing a global access point to it.",
        content: `The Singleton pattern is one of the simplest yet most controversial design patterns. It ensures a class has only one instance and provides a global point of access to it.

## When to Use Singleton

Use the Singleton pattern when:
- You need exactly one instance of a class
- The instance needs to be accessible from multiple points in your application
- You want lazy initialization with global access

## Python Implementation

Here's a clean Python implementation using a metaclass:

\`\`\`python
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        self.connection = None
    
    def connect(self, connection_string):
        if not self.connection:
            self.connection = connection_string
            print(f"Connected to {connection_string}")

# Usage
db1 = Database()
db1.connect("postgresql://localhost:5432")

db2 = Database()
print(db1 is db2)  # True - same instance
\`\`\`

## The Controversy

Singletons are often considered an anti-pattern because:
- They introduce global state
- They make testing difficult
- They violate the Single Responsibility Principle
- They can hide dependencies

## When Singletons Make Sense

Despite the criticism, Singletons are appropriate for:
- Logging systems
- Configuration managers
- Connection pools
- Caches

Use them wisely and sparingly.`
      },
      {
        id: 2,
        title: "Factory Pattern: Object Creation Made Easy",
        date: "2024-10-08",
        readTime: "12 min",
        excerpt: "Delegate object creation to factory methods, making your code more flexible and maintainable.",
        content: `The Factory pattern provides an interface for creating objects without specifying their exact classes. It's one of the most widely used design patterns.

## The Problem

Imagine you're building a notification system that sends messages via email, SMS, or push notifications:

\`\`\`python
# Without Factory - rigid and hard to extend
def send_notification(type, message):
    if type == "email":
        email = EmailNotification(message)
        email.send()
    elif type == "sms":
        sms = SMSNotification(message)
        sms.send()
    elif type == "push":
        push = PushNotification(message)
        push.send()
\`\`\`

This code violates the Open-Closed Principle. Every time you add a new notification type, you modify this function.

## The Factory Solution

\`\`\`python
from abc import ABC, abstractmethod

class Notification(ABC):
    @abstractmethod
    def send(self, message):
        pass

class EmailNotification(Notification):
    def send(self, message):
        print(f"Sending email: {message}")

class SMSNotification(Notification):
    def send(self, message):
        print(f"Sending SMS: {message}")

class NotificationFactory:
    @staticmethod
    def create_notification(type):
        notifications = {
            "email": EmailNotification,
            "sms": SMSNotification,
            "push": PushNotification
        }
        
        notification_class = notifications.get(type)
        if not notification_class:
            raise ValueError(f"Unknown notification type: {type}")
        return notification_class()

# Usage
factory = NotificationFactory()
notification = factory.create_notification("email")
notification.send("Hello, World!")
\`\`\`

Now adding new notification types is as simple as creating a new class and registering it in the factory.

## Real-World Applications

The Factory pattern shines in:
- Plugin systems
- Database connection managers
- UI component libraries
- API clients with multiple auth methods

Next time you find yourself with a long chain of if-elif statements creating objects, consider the Factory pattern.`
      },
      {
        id: 3,
        title: "Observer Pattern: Event-Driven Architecture",
        date: "2024-10-15",
        readTime: "11 min",
        excerpt: "Create a subscription mechanism to notify multiple objects about events happening to the object they're observing.",
        content: `The Observer pattern is fundamental to event-driven programming. It defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically.

## Real-World Analogy

Think of a newsletter subscription:
- The publisher (subject) maintains a list of subscribers
- Subscribers can subscribe or unsubscribe
- When there's news, all subscribers get notified

## Python Implementation

\`\`\`python
from abc import ABC, abstractmethod

class Observer(ABC):
    @abstractmethod
    def update(self, subject):
        pass

class Subject:
    def __init__(self):
        self._observers = []
        self._state = None
    
    def attach(self, observer):
        self._observers.append(observer)
    
    def detach(self, observer):
        self._observers.remove(observer)
    
    def notify(self):
        for observer in self._observers:
            observer.update(self)
    
    @property
    def state(self):
        return self._state
    
    @state.setter
    def state(self, value):
        self._state = value
        self.notify()

class EmailAlert(Observer):
    def update(self, subject):
        print(f"Email Alert: State changed to {subject.state}")

class SMSAlert(Observer):
    def update(self, subject):
        print(f"SMS Alert: State changed to {subject.state}")

# Usage
stock_ticker = Subject()

email = EmailAlert()
sms = SMSAlert()

stock_ticker.attach(email)
stock_ticker.attach(sms)

stock_ticker.state = "PRICE_DROP"  # Both observers notified
\`\`\`

## Use Cases

The Observer pattern is perfect for:
- Event handling systems
- MVC architectures
- Real-time data feeds
- Social media notifications
- Pub/sub messaging systems

Modern frameworks like React use Observer pattern principles extensively under the hood.`
      },
      {
        id: 4,
        title: "Decorator Pattern: Dynamic Behavior Extension",
        date: "2024-10-22",
        readTime: "9 min",
        excerpt: "Add new functionality to objects without altering their structure. Not to be confused with Python decorators!",
        content: `The Decorator pattern (not to be confused with Python's @ decorators) allows you to attach new behaviors to objects by placing them inside wrapper objects.

## The Problem

You're building a coffee shop app. Coffee can have various add-ons: milk, sugar, whipped cream, etc. Without the Decorator pattern, you'd need a class for every combination:

- Coffee
- CoffeeWithMilk
- CoffeeWithSugar
- CoffeeWithMilkAndSugar
- CoffeeWithMilkSugarAndWhippedCream

This explodes exponentially with each option.

## The Decorator Solution

\`\`\`python
from abc import ABC, abstractmethod

class Coffee(ABC):
    @abstractmethod
    def cost(self):
        pass
    
    @abstractmethod
    def description(self):
        pass

class SimpleCoffee(Coffee):
    def cost(self):
        return 2.0
    
    def description(self):
        return "Simple coffee"

class CoffeeDecorator(Coffee):
    def __init__(self, coffee):
        self._coffee = coffee
    
    def cost(self):
        return self._coffee.cost()
    
    def description(self):
        return self._coffee.description()

class Milk(CoffeeDecorator):
    def cost(self):
        return self._coffee.cost() + 0.5
    
    def description(self):
        return self._coffee.description() + ", milk"

class Sugar(CoffeeDecorator):
    def cost(self):
        return self._coffee.cost() + 0.2
    
    def description(self):
        return self._coffee.description() + ", sugar"

# Usage
my_coffee = SimpleCoffee()
my_coffee = Milk(my_coffee)
my_coffee = Sugar(my_coffee)

print(my_coffee.description())  # "Simple coffee, milk, sugar"
print(f"$\\{my_coffee.cost()}")   # "$2.7"
\`\`\`

## Benefits

The Decorator pattern:
- Provides flexible alternative to subclassing
- Allows adding responsibilities at runtime
- Avoids class explosion
- Follows Single Responsibility Principle

You'll find this pattern in I/O streams, middleware, and plugin systems everywhere.`
      },
      {
        id: 5,
        title: "Strategy Pattern: Algorithms Made Interchangeable",
        date: "2024-10-29",
        readTime: "10 min",
        excerpt: "Define a family of algorithms, encapsulate each one, and make them interchangeable at runtime.",
        content: `The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

## The Scenario

You're building a payment processing system that needs to support multiple payment methods: credit card, PayPal, cryptocurrency, etc.

## Without Strategy

\`\`\`python
def process_payment(method, amt):
    if method == "credit_card":
        # Credit card logic
        print(f"Processing $\\{amt} via credit card")
    elif method == "paypal":
        # PayPal logic
        print(f"Processing $\\{amt} via PayPal")
    elif method == "crypto":
        # Crypto logic
        print(f"Processing $\\{amt} via cryptocurrency")
\`\`\`

This violates Open-Closed Principle and becomes unmaintainable.

## With Strategy Pattern

\`\`\`python
from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amt):
        pass

class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number, cvv):
        self.card_number = card_number
        self.cvv = cvv
    
    def pay(self, amt):
        print(f"Paid $\\{amt} using Credit Card ending in \\{self.card_number[-4:]}")

class PayPalPayment(PaymentStrategy):
    def __init__(self, email):
        self.email = email
    
    def pay(self, amt):
        print(f"Paid $\\{amt} using PayPal account \\{self.email}")

class CryptoPayment(PaymentStrategy):
    def __init__(self, wallet_address):
        self.wallet_address = wallet_address
    
    def pay(self, amt):
        print(f"Paid $\\{amt} using Crypto wallet \\{self.wallet_address[:8]}...")

class ShoppingCart:
    def __init__(self):
        self.items = []
        self.payment_strategy = None
    
    def set_payment_strategy(self, strategy: PaymentStrategy):
        self.payment_strategy = strategy
    
    def checkout(self):
        total = sum(item['price'] for item in self.items)
        self.payment_strategy.pay(total)

# Usage
cart = ShoppingCart()
cart.items = [{'name': 'Book', 'price': 12.99}]

# Customer chooses payment method at runtime
cart.set_payment_strategy(CreditCardPayment("1234567890123456", "123"))
cart.checkout()

# Later, customer changes mind
cart.set_payment_strategy(PayPalPayment("user@example.com"))
cart.checkout()
\`\`\`

## When to Use

The Strategy pattern excels when:
- You have multiple algorithms for a specific task
- You want to switch algorithms at runtime
- You want to isolate algorithm implementation details
- You have conditional statements selecting different behaviors

This pattern is everywhere: sorting algorithms, compression strategies, rendering engines, validation rules.

## Conclusion

These five patterns—Singleton, Factory, Observer, Decorator, and Strategy—form the foundation of object-oriented design. Master these, and you'll write cleaner, more maintainable code across any language.

Remember: patterns are tools, not rules. Use them when they solve a problem, not because they're fashionable.`
      }
    ]
  }
];
