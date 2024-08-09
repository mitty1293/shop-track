from datetime import date

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Category, Manufacturer, Origin, Product, ShoppingRecord, Store, Unit


class CategoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Meat")

    def test_category_creation(self):
        self.assertEqual(self.category.name, "Meat")


class UnitModelTest(TestCase):
    def setUp(self):
        self.unit = Unit.objects.create(name="g")

    def test_unit_creation(self):
        self.assertEqual(self.unit.name, "g")


class ManufacturerModelTest(TestCase):
    def setUp(self):
        self.manufacturer = Manufacturer.objects.create(name="Glico")

    def test_manufacturer_creation(self):
        self.assertEqual(self.manufacturer.name, "Glico")


class OriginModelTest(TestCase):
    def setUp(self):
        self.origin = Origin.objects.create(name="Hokkaido")

    def test_origin_creation(self):
        self.assertEqual(self.origin.name, "Hokkaido")


class StoreModelTest(TestCase):
    def setUp(self):
        self.store = Store.objects.create(name="Supermarket", location="Tokyo")

    def test_store_creation(self):
        self.assertEqual(self.store.name, "Supermarket")
        self.assertEqual(self.store.location, "Tokyo")


class ProductModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Meat")
        self.unit = Unit.objects.create(name="g")
        self.manufacturer = Manufacturer.objects.create(name="Glico")
        self.origin = Origin.objects.create(name="Hokkaido")
        self.product = Product.objects.create(
            name="Beef", category=self.category, unit=self.unit, manufacturer=self.manufacturer, origin=self.origin
        )

    def test_product_creation(self):
        self.assertEqual(self.product.name, "Beef")
        self.assertEqual(self.product.category.name, "Meat")
        self.assertEqual(self.product.unit.name, "g")
        self.assertEqual(self.product.manufacturer.name, "Glico")
        self.assertEqual(self.product.origin.name, "Hokkaido")


class ShoppingRecordModelTest(TestCase):
    def setUp(self):
        self.store = Store.objects.create(name="Supermarket", location="Tokyo")
        self.category = Category.objects.create(name="Meat")
        self.unit = Unit.objects.create(name="g")
        self.product = Product.objects.create(name="Beef", category=self.category, unit=self.unit)
        self.shopping_record = ShoppingRecord.objects.create(
            price=1000, purchase_date=date(2024, 1, 1), store=self.store, quantity=500, product=self.product
        )

    def test_shopping_record_creation(self):
        self.assertEqual(self.shopping_record.price, 1000)
        self.assertEqual(self.shopping_record.purchase_date.strftime("%Y-%m-%d"), "2024-01-01")
        self.assertEqual(self.shopping_record.store.name, "Supermarket")
        self.assertEqual(self.shopping_record.quantity, 500)
        self.assertEqual(self.shopping_record.product.name, "Beef")


class CategoryAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.category_data = {"name": "Vegetables"}
        self.response = self.client.post("/api/categories/", self.category_data, format="json")

    def test_create_category(self):
        self.assertEqual(self.response.status_code, status.HTTP_201_CREATED)

    def test_get_categories(self):
        Category.objects.create(name="Fruits")
        response = self.client.get("/api/categories/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class ShoppingRecordAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.shopping_record_data = {
            "price": 1000,
            "purchase_date": date(2024, 1, 1),
            "store": {"name": "Supermarket", "location": "Tokyo"},
            "quantity": 500,
            "product": {"name": "Beef", "category": {"name": "Meat"}, "unit": {"name": "g"}},
        }
        self.response = self.client.post("/api/shopping-records/", self.shopping_record_data, format="json")

    def test_create_shopping_record(self):
        self.assertEqual(self.response.status_code, status.HTTP_201_CREATED)

    def test_get_shopping_records(self):
        response = self.client.get("/api/shopping-records/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
