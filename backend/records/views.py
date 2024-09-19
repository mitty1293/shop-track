from rest_framework import viewsets

from .models import Category, Manufacturer, Origin, Product, ShoppingRecord, Store, Unit
from .serializers import (
    CategorySerializer,
    ManufacturerSerializer,
    OriginSerializer,
    ProductSerializer,
    ShoppingRecordSerializer,
    StoreSerializer,
    UnitSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Category instances.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class UnitViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Unit instances.
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class ManufacturerViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Manufacturer instances.
    """
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

class OriginViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Origin instances.
    """
    queryset = Origin.objects.all()
    serializer_class = OriginSerializer

class StoreViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Store instances.
    """
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Product instances.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ShoppingRecordViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing ShoppingRecord instances.
    """
    queryset = ShoppingRecord.objects.all().order_by("purchase_date")
    serializer_class = ShoppingRecordSerializer
