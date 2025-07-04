from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework import routers
from rest_framework_simplejwt.views import TokenVerifyView

from .views import (
    CategoryViewSet,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    ManufacturerViewSet,
    OriginViewSet,
    ProductViewSet,
    ShoppingRecordViewSet,
    StoreViewSet,
    UnitViewSet,
    UserDetailView,
)

router = routers.DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"units", UnitViewSet)
router.register(r"manufacturers", ManufacturerViewSet)
router.register(r"origins", OriginViewSet)
router.register(r"stores", StoreViewSet)
router.register(r"products", ProductViewSet)
router.register(r"shopping-records", ShoppingRecordViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    path("auth/token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("auth/user/", UserDetailView.as_view(), name="user_detail"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
]
