# ============================================
# ÉTAPE 1 : Image de base
# ============================================
FROM python:3.11-slim

# ============================================
# ÉTAPE 2 : Variables d'environnement
# ============================================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=off
ENV PIP_DISABLE_PIP_VERSION_CHECK=on

# ============================================
# ÉTAPE 3 : Installation des dépendances système
# ============================================
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        postgresql-client \
        libpq-dev \
        curl \
        netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# ÉTAPE 4 : Répertoire de travail
# ============================================
WORKDIR /app

# ============================================
# ÉTAPE 5 : Installation des dépendances Python
# ============================================
COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ============================================
# ÉTAPE 6 : Copie du code source
# ============================================
COPY . .


# ============================================
# ÉTAPE 7 : Point d'entrée et commande par défaut
# ============================================
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ============================================
# ÉTAPE 8 : Création d'un utilisateur non-root
# ============================================
RUN useradd -m -u 1000 django \
    && chown -R django:django /app

USER django

# ============================================
# ÉTAPE 9 : Exposition du port
# ============================================
EXPOSE 8000


ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "api.wsgi:application"]
