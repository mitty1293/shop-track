from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Manufacturer, Origin, Product, ShoppingRecord, Store, Unit
from .serializers import (
    CategorySerializer,
    ManufacturerSerializer,
    OriginSerializer,
    ProductSerializer,
    ShoppingRecordSerializer,
    StoreSerializer,
    UnitSerializer,
    UserSerializer,
)


class UserDetailView(APIView):
    """
    API endpoint that allows users to be viewed.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Category instances.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class UnitViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Unit instances.
    """

    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]


class ManufacturerViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Manufacturer instances.
    """

    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAuthenticated]


class OriginViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Origin instances.
    """

    queryset = Origin.objects.all()
    serializer_class = OriginSerializer
    permission_classes = [IsAuthenticated]


class StoreViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Store instances.
    """

    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Product instances.
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


class ShoppingRecordViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing ShoppingRecord instances.
    """

    queryset = ShoppingRecord.objects.all().order_by("purchase_date")
    serializer_class = ShoppingRecordSerializer
    permission_classes = [IsAuthenticated]
