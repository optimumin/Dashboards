import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'securitykey1234'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:Vishwa@localhost/Dashboard'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwtsecurity987'
