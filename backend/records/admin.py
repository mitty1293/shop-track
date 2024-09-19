from django.contrib import admin

from .models import Category, Manufacturer, Origin, Product, ShoppingRecord, Store, Unit

admin.site.register(Category)
admin.site.register(Manufacturer)
admin.site.register(Origin)
admin.site.register(Product)
admin.site.register(ShoppingRecord)
admin.site.register(Store)
admin.site.register(Unit)
