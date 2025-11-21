from django.contrib import admin
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.template.response import TemplateResponse
from django.urls import path

from .models import SearchHistory


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ("city", "user", "temperature", "humidity", "description", "searched_at")
    list_filter = ("searched_at", "city")
    search_fields = ("city", "user__username", "description")
    date_hierarchy = "searched_at"
    ordering = ("-searched_at",)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("analytics/popular/", self.admin_site.admin_view(self.popular_cities_view), name="forecast_searchhistory_popular"),
            path("analytics/trends/", self.admin_site.admin_view(self.search_trends_view), name="forecast_searchhistory_trends"),
        ]
        return custom_urls + urls

    def popular_cities_view(self, request):
        popular_cities = (
            SearchHistory.objects.values("city")
            .annotate(search_count=Count("id"))
            .order_by("-search_count")[:20]
        )
        context = {
            **self.admin_site.each_context(request),
            "title": "Popular Cities",
            "section_title": "Top searched cities",
            "dataset": popular_cities,
            "columns": ["City", "Search Count"],
            "rows": [(entry["city"], entry["search_count"]) for entry in popular_cities],
        }
        return TemplateResponse(request, "admin/forecast/searchhistory/analytics.html", context)

    def search_trends_view(self, request):
        search_trends = (
            SearchHistory.objects.annotate(search_date=TruncDate("searched_at"))
            .values("search_date")
            .annotate(search_count=Count("id"))
            .order_by("-search_date")[:30]
        )
        context = {
            **self.admin_site.each_context(request),
            "title": "Search Trends",
            "section_title": "Searches per day",
            "dataset": search_trends,
            "columns": ["Date", "Search Count"],
            "rows": [
                (
                    entry["search_date"].strftime("%Y-%m-%d") if entry["search_date"] else "Unknown",
                    entry["search_count"],
                )
                for entry in search_trends
            ],
        }
        return TemplateResponse(request, "admin/forecast/searchhistory/analytics.html", context)
