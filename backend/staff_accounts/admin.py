from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import StaffUser


@admin.register(StaffUser)
class StaffUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("SELENA access", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("SELENA access", {"fields": ("email", "role")}),)
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
