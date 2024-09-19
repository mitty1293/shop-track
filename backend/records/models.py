from django.db import models


class Category(models.Model):
    """
    Represents a product category.
    Example: Meat, Vegetables, Snacks, Alcohol.
    """
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Unit(models.Model):
    """
    Represents a unit of measurement.
    Example: ml, g, pieces.
    """
    name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

class Manufacturer(models.Model):
    """
    Represents a product manufacturer.
    Example: Glico, Kirin Brewery.
    """
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Origin(models.Model):
    """
    Represents the origin of fresh products.
    Example: Shiga, Hokkaido, USA, Brazil.
    """
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Store(models.Model):
    """
    Represents the store where the product was purchased.
    Example: Supermarket, Department Store.
    """
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.location})"

class Product(models.Model):
    """
    Represents a product with its associated details.
    Includes category, unit, manufacturer, and origin.
    """
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.PROTECT, null=True, blank=True)
    origin = models.ForeignKey(Origin, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return self.name

class ShoppingRecord(models.Model):
    """
    Represents a record of a shopping transaction.
    Includes price, purchase date, store, quantity, and product.
    """
    price = models.IntegerField()
    purchase_date = models.DateField()
    store = models.ForeignKey(Store, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.product.name} from {self.store.name} on {self.purchase_date}"
