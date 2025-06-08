from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Obtains a token pair and sets the refresh token in a secure, HttpOnly cookie.

    This view extends the default `TokenObtainPairView` to enhance security.
    Instead of returning the refresh token in the response body, it sets it
    as an HttpOnly cookie, making it inaccessible to client-side JavaScript.
    The access token is still returned in the response body as usual.
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            refresh_token = response.data.get("refresh")
            if refresh_token:
                # リフレッシュトークンをHttpOnlyクッキーに設定
                response.set_cookie(
                    key="refresh_token",
                    value=refresh_token,
                    httponly=True,
                    samesite="Lax",  # CSRF対策
                    secure=not settings.DEBUG,  # 本番環境ではTrueに
                    path="/api/auth/",  # Cookieの有効パスをAPIの認証周りに限定
                )
                # レスポンスボディからはリフレッシュトークンを削除
                del response.data["refresh"]
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Refreshes an access token using a refresh token stored in an HttpOnly cookie.

    This view extends `TokenRefreshView` to work with HttpOnly cookies.
    It expects the refresh token to be sent in the `refresh_token` cookie.
    If the token is valid, it returns a new access token in the response body.
    If the token is invalid or expired, it clears the cookie and returns an
    unauthorized error.
    """

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"detail": "Refresh token not found in cookie."}, status=status.HTTP_401_UNAUTHORIZED)

        # simple-jwtのシリアライザが`request.data`を期待するため、値を設定
        request.data["refresh"] = refresh_token

        try:
            response = super().post(request, *args, **kwargs)
        except (InvalidToken, TokenError) as e:
            # トークンが無効な場合、クッキーを削除してエラーを返す
            err_response = Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            err_response.delete_cookie("refresh_token", path="/api/auth/")
            return err_response

        # レスポンスに新しいアクセストークンが含まれる
        return response


class LogoutView(APIView):
    """
    Handles user logout by deleting the HttpOnly refresh token cookie.
    """

    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie("refresh_token", path="/api/auth/")
        return response


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
