from django.conf import settings
from django.db import models


class SearchHistory(models.Model):
    city = models.CharField(max_length=255)
    searched_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="weather_searches",
    )
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    description = models.CharField(max_length=512, blank=True)

    class Meta:
        ordering = ["-searched_at"]
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["searched_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.city} @ {self.searched_at:%Y-%m-%d %H:%M:%S}"
