from django.urls import include, path
from rest_framework import routers

from .views import (
    CategoryViewSet,
    ManufacturerViewSet,
    OriginViewSet,
    ProductViewSet,
    ShoppingRecordViewSet,
    StoreViewSet,
    UnitViewSet,
)

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'units', UnitViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'origins', OriginViewSet)
router.register(r'stores', StoreViewSet)
router.register(r'products', ProductViewSet)
router.register(r'shopping-records', ShoppingRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
