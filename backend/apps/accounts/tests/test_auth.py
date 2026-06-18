import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_register_creates_user(api_client):
    payload = {
        "username": "newbie",
        "email": "newbie@example.com",
        "password": "Sup3rSecret!",
        "password_confirm": "Sup3rSecret!",
    }
    response = api_client.post(reverse("register"), payload)
    assert response.status_code == 201
    assert response.data["username"] == "newbie"


def test_register_password_mismatch(api_client):
    payload = {
        "username": "newbie",
        "email": "newbie@example.com",
        "password": "Sup3rSecret!",
        "password_confirm": "different",
    }
    response = api_client.post(reverse("register"), payload)
    assert response.status_code == 400
    assert "password_confirm" in response.data


def test_login_returns_tokens_and_user(api_client, user):
    response = api_client.post(reverse("login"), {"username": "tester", "password": "testpass123"})
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["username"] == "tester"


def test_me_requires_auth(api_client):
    assert api_client.get(reverse("me")).status_code == 401


def test_me_returns_profile(auth_client, user):
    response = auth_client.get(reverse("me"))
    assert response.status_code == 200
    assert response.data["username"] == user.username
