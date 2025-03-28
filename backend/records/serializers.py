from rest_framework import serializers

from .models import Category, Manufacturer, Origin, Product, ShoppingRecord, Store, Unit


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    """

    class Meta:
        model = Category
        fields = ["id", "name"]


class UnitSerializer(serializers.ModelSerializer):
    """
    Serializer for Unit model.
    """

    class Meta:
        model = Unit
        fields = ["id", "name"]


class ManufacturerSerializer(serializers.ModelSerializer):
    """
    Serializer for Manufacturer model.
    """

    class Meta:
        model = Manufacturer
        fields = ["id", "name"]


class OriginSerializer(serializers.ModelSerializer):
    """
    Serializer for Origin model.
    """

    class Meta:
        model = Origin
        fields = ["id", "name"]


class StoreSerializer(serializers.ModelSerializer):
    """
    Serializer for Store model.
    """

    class Meta:
        model = Store
        fields = ["id", "name", "location"]


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model.
    """

    category = CategorySerializer(read_only=True)
    unit = UnitSerializer(read_only=True)
    manufacturer = ManufacturerSerializer(read_only=True)
    origin = OriginSerializer(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.all(), write_only=True)
    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufacturer.objects.all(), required=False, allow_null=True, write_only=True
    )
    origin_id = serializers.PrimaryKeyRelatedField(
        queryset=Origin.objects.all(), required=False, allow_null=True, write_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "unit",
            "manufacturer",
            "origin",
            "category_id",
            "unit_id",
            "manufacturer_id",
            "origin_id",
        ]

    def create(self, validated_data):
        validated_data["category"] = validated_data.pop("category_id")
        validated_data["unit"] = validated_data.pop("unit_id")
        validated_data["manufacturer"] = validated_data.pop("manufacturer_id", None)
        validated_data["origin"] = validated_data.pop("origin_id", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.category = validated_data.pop("category_id", instance.category)
        instance.unit = validated_data.pop("unit_id", instance.unit)
        instance.manufacturer = validated_data.pop("manufacturer_id", instance.manufacturer)
        instance.origin = validated_data.pop("origin_id", instance.origin)
        return super().update(instance, validated_data)


class ShoppingRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for ShoppingRecord model.
    """

    store = StoreSerializer()
    product = ProductSerializer()

    class Meta:
        model = ShoppingRecord
        fields = ["id", "price", "purchase_date", "store", "quantity", "product"]

    def create(self, validated_data):
        store_data = validated_data.pop("store")
        product_data = validated_data.pop("product")

        store, created = Store.objects.get_or_create(**store_data)
        category_data = product_data.pop("category")
        unit_data = product_data.pop("unit")
        manufacturer_data = product_data.pop("manufacturer", None)
        origin_data = product_data.pop("origin", None)

        category, created = Category.objects.get_or_create(**category_data)
        unit, created = Unit.objects.get_or_create(**unit_data)

        if manufacturer_data:
            manufacturer, created = Manufacturer.objects.get_or_create(**manufacturer_data)
        else:
            manufacturer = None

        if origin_data:
            origin, created = Origin.objects.get_or_create(**origin_data)
        else:
            origin = None

        product, created = Product.objects.get_or_create(
            name=product_data["name"], category=category, unit=unit, manufacturer=manufacturer, origin=origin
        )

        shopping_record = ShoppingRecord.objects.create(store=store, product=product, **validated_data)

        return shopping_record
