# 📊 Module Comptabilité Financière - Documentation Base de Données

> **Version**: 1.0  
> **Date de génération**: 10 Janvier 2026  
> **Base de données**: PostgreSQL 15

Ce document décrit la structure complète de la base de données du module de **Comptabilité Financière** du système hospitalier Fultang.

---

## 📑 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Diagramme des relations](#diagramme-des-relations)
3. [Tables principales](#tables-principales)
   - [Quittance](#1-comptabilite_financiere_quittance)
   - [Compte Comptable (nouvelle structure)](#2-comptabilite_financiere_compte_comptable)
   - [Compte Comptable (structure hiérarchique)](#3-comptabilite_financiere_comptecomptable)
   - [Écriture Comptable (simplifiée)](#4-comptabilite_financiere_ecriture_comptable)
   - [Écriture (complète)](#5-comptabilite_financiere_ecriture)
   - [Ligne d'Écriture](#6-comptabilite_financiere_ligne_ecriture)
   - [Journal Comptable](#7-comptabilite_financiere_journal)
   - [Pièce de Recette](#8-comptabilite_financiere_piece_recette)
   - [Facture](#9-comptabilite_financiere_facture)
4. [Tables de moyens de paiement](#tables-de-moyens-de-paiement)
   - [Chèque](#10-comptabilite_financiere_cheque)
   - [Virement](#11-comptabilite_financiere_virement)
   - [Paiement par Carte](#12-comptabilite_financiere_paiement_carte)
   - [Paiement Mobile](#13-comptabilite_financiere_paiement_mobile)
5. [Tables de liaison](#tables-de-liaison)
   - [Prestation de Service](#14-comptabilite_financiere_prestation_de_service)
6. [Index et Performances](#index-et-performances)
7. [Requêtes SQL Utiles](#requêtes-sql-utiles)

---

## Vue d'ensemble

Le module de comptabilité financière gère :
- 💰 **Les encaissements** (quittances, factures)
- 📒 **La comptabilité générale** (plan comptable, écritures, journaux)
- 💳 **Les moyens de paiement** (espèces, chèques, virements, cartes, mobile money)
- 📄 **Les pièces comptables** (pièces de recette)

### Statistiques de la base de données

| Catégorie | Nombre de tables |
|-----------|------------------|
| Tables principales | 9 |
| Tables de paiement | 4 |
| Tables de liaison | 1 |
| **Total** | **14 tables** |

---

## Diagramme des relations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUX DE LA COMPTABILITÉ                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │    PATIENT      │
                              │   (session)     │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    FACTURE      │
                              │   (caissier)    │
                              └────────┬────────┘
                                       │ validation comptable
                                       ▼
┌──────────────┐              ┌─────────────────┐              ┌──────────────┐
│   CHÈQUE     │◄────────────►│   QUITTANCE     │◄────────────►│   VIREMENT   │
└──────────────┘              └────────┬────────┘              └──────────────┘
                                       │                              
┌──────────────┐                       │                       ┌──────────────┐
│ PAIEMENT     │◄──────────────────────┼──────────────────────►│  PAIEMENT    │
│   CARTE      │                       │                       │   MOBILE     │
└──────────────┘                       ▼                       └──────────────┘
                              ┌─────────────────┐
                              │ PIÈCE RECETTE   │
                              │  (comptable)    │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   ÉCRITURE      │◄────────────►  JOURNAL
                              │  COMPTABLE      │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ LIGNE ÉCRITURE  │◄────────────►  COMPTE
                              │  (débit/crédit) │               COMPTABLE
                              └─────────────────┘
```

---

## Tables principales

### 1. `comptabilite_financiere_quittance`

> **Description**: Représente les reçus de paiement émis aux patients après encaissement.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `idQuittance` | `integer` | ❌ | **PK** (auto) | Identifiant unique de la quittance |
| `numero_quittance` | `varchar(50)` | ❌ | **UNIQUE** | Numéro séquentiel de la quittance (ex: QUIT-2026-00001) |
| `date_paiement` | `timestamp` | ❌ | | Date et heure du paiement |
| `Montant_paye` | `numeric(12,2)` | ❌ | | Montant encaissé |
| `Motif` | `text` | ❌ | | Motif du paiement (consultation, hospitalisation, etc.) |
| `mode_paiement` | `varchar(20)` | ❌ | | Mode de paiement utilisé |
| `type_recette` | `varchar(20)` | ❌ | | Type de recette comptable |
| `validee` | `boolean` | ❌ | | Indique si la quittance a été validée par le comptable |
| `caissier_id` | `bigint` | ✅ | FK → `personnel` | Caissier ayant effectué l'encaissement |
| `id_session_id` | `bigint` | ✅ | FK → `session` | Session patient liée |
| `id_comptable_affectation_id` | `bigint` | ✅ | FK → `personnel` | Comptable ayant affecté au compte |
| `compte_comptable_id` | `integer` | ✅ | FK → `compte` | Compte comptable d'imputation |
| `piece_recette_id` | `bigint` | ✅ | FK → `piece_recette` | Pièce de recette associée |
| `date_affectation_compte` | `timestamp` | ✅ | | Date d'affectation au compte comptable |

#### Valeurs possibles pour `mode_paiement`:
- `ESPECES` - Paiement en espèces
- `CHEQUE` - Paiement par chèque
- `VIREMENT` - Paiement par virement bancaire
- `CARTE` - Paiement par carte bancaire
- `MOBILE` - Paiement mobile (MTN MoMo, Orange Money)

#### Valeurs possibles pour `type_recette`:
- `CONSULTATION` - Frais de consultation
- `HOSPITALISATION` - Frais d'hospitalisation
- `PHARMACIE` - Vente de médicaments
- `LABORATOIRE` - Analyses de laboratoire
- `IMAGERIE` - Examens d'imagerie
- `AUTRE` - Autres recettes

#### Index:
```sql
CREATE INDEX ON comptabilite_financiere_quittance (date_paiement DESC);
CREATE INDEX ON comptabilite_financiere_quittance (numero_quittance);
CREATE INDEX ON comptabilite_financiere_quittance (type_recette);
CREATE INDEX ON comptabilite_financiere_quittance (validee);
CREATE INDEX ON comptabilite_financiere_quittance (compte_comptable_id);
```

---

### 2. `comptabilite_financiere_compte_comptable`

> **Description**: Plan comptable simplifié avec gestion du solde en temps réel.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `bigint` | ❌ | **PK** (auto) | Identifiant unique |
| `code` | `varchar(10)` | ❌ | **UNIQUE** | Code du compte (ex: 411000) |
| `libelle` | `varchar(200)` | ❌ | | Libellé du compte |
| `classe` | `varchar(1)` | ❌ | | Classe comptable (1-7) |
| `type_compte` | `varchar(10)` | ❌ | | Type de compte |
| `solde` | `numeric(15,2)` | ❌ | | Solde actuel du compte |
| `actif` | `boolean` | ❌ | | Indique si le compte est utilisable |
| `date_creation` | `timestamp` | ❌ | | Date de création du compte |
| `derniere_utilisation` | `timestamp` | ✅ | | Date de dernière utilisation |

#### Classes comptables (OHADA):
| Classe | Description |
|:------:|-------------|
| 1 | Comptes de ressources durables |
| 2 | Comptes d'actif immobilisé |
| 3 | Comptes de stocks |
| 4 | Comptes de tiers |
| 5 | Comptes de trésorerie |
| 6 | Comptes de charges |
| 7 | Comptes de produits |

---

### 3. `comptabilite_financiere_comptecomptable`

> **Description**: Plan comptable hiérarchique avec relation parent-enfant.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `integer` | ❌ | **PK** (auto) | Identifiant unique |
| `numero_compte` | `varchar(10)` | ❌ | **UNIQUE** | Numéro du compte |
| `libelle` | `varchar(200)` | ❌ | | Libellé du compte |
| `classe` | `varchar(1)` | ❌ | | Classe comptable |
| `type_compte` | `varchar(20)` | ❌ | | Type de compte (ACTIF, PASSIF, CHARGE, PRODUIT) |
| `description` | `text` | ✅ | | Description détaillée |
| `actif` | `boolean` | ❌ | | Indique si actif |
| `date_creation` | `timestamp` | ❌ | | Date de création |
| `compte_parent_id` | `integer` | ✅ | FK → `self` | Compte parent (hiérarchie) |

---

### 4. `comptabilite_financiere_ecriture_comptable`

> **Description**: Écritures comptables simplifiées avec référence directe à la quittance.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `bigint` | ❌ | **PK** (auto) | Identifiant unique |
| `date` | `timestamp` | ❌ | | Date de l'écriture |
| `libelle` | `varchar(200)` | ❌ | | Libellé de l'écriture |
| `debit` | `numeric(15,2)` | ❌ | | Montant au débit |
| `credit` | `numeric(15,2)` | ❌ | | Montant au crédit |
| `reference_quittance` | `varchar(50)` | ❌ | | Numéro de la quittance source |
| `compte_id` | `bigint` | ❌ | FK → `compte_comptable` | Compte comptable imputé |
| `piece_recette_id` | `bigint` | ❌ | FK → `piece_recette` | Pièce de recette |

---

### 5. `comptabilite_financiere_ecriture`

> **Description**: Écritures comptables complètes avec workflow de validation.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `bigint` | ❌ | **PK** (auto) | Identifiant unique |
| `numero_ecriture` | `varchar(50)` | ❌ | **UNIQUE** | Numéro séquentiel (ex: ECR-2026-00001) |
| `date_ecriture` | `date` | ❌ | | Date comptable de l'écriture |
| `libelle` | `varchar(255)` | ❌ | | Libellé descriptif |
| `piece_justificative` | `varchar(100)` | ✅ | | Référence de la pièce justificative |
| `statut` | `varchar(20)` | ❌ | | Statut de l'écriture |
| `date_creation` | `timestamp` | ❌ | | Date de création |
| `date_modification` | `timestamp` | ❌ | | Dernière modification |
| `journal_id` | `varchar(10)` | ❌ | FK → `journal` | Journal comptable |
| `comptable_id` | `bigint` | ✅ | FK → `personnel` | Comptable créateur |
| `quittance_id` | `integer` | ✅ | FK → `quittance` | Quittance liée |

#### Valeurs possibles pour `statut`:
- `BROUILLON` - Écriture en cours de rédaction
- `A_VALIDER` - En attente de validation
- `VALIDEE` - Écriture validée et définitive
- `ANNULEE` - Écriture annulée

---

### 6. `comptabilite_financiere_ligne_ecriture`

> **Description**: Lignes individuelles composant une écriture comptable (débit/crédit).

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `bigint` | ❌ | **PK** (auto) | Identifiant unique |
| `libelle` | `varchar(255)` | ❌ | | Libellé de la ligne |
| `montant_debit` | `numeric(15,2)` | ❌ | | Montant au débit (0 si crédit) |
| `montant_credit` | `numeric(15,2)` | ❌ | | Montant au crédit (0 si débit) |
| `ordre` | `integer` | ❌ | CHECK >= 0 | Ordre d'affichage dans l'écriture |
| `compte_id` | `integer` | ❌ | FK → `comptecomptable` | Compte comptable |
| `ecriture_id` | `bigint` | ❌ | FK → `ecriture` | Écriture parente |

> ⚠️ **Règle comptable**: Pour chaque écriture, la somme des débits DOIT être égale à la somme des crédits.

---

### 7. `comptabilite_financiere_journal`

> **Description**: Journaux comptables pour organiser les écritures par type d'opération.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `code` | `varchar(10)` | ❌ | **PK** | Code unique du journal |
| `libelle` | `varchar(100)` | ❌ | | Nom du journal |
| `description` | `text` | ✅ | | Description détaillée |
| `actif` | `boolean` | ❌ | | Indique si le journal est utilisable |
| `compte_contrepartie_id` | `integer` | ✅ | FK → `comptecomptable` | Compte de contrepartie par défaut |

#### Journaux standards:
| Code | Libellé | Description |
|------|---------|-------------|
| `AC` | Achats | Journal des achats fournisseurs |
| `VT` | Ventes | Journal des ventes/recettes |
| `BQ` | Banque | Journal des opérations bancaires |
| `CA` | Caisse | Journal des opérations de caisse |
| `OD` | Opérations diverses | Journal des opérations diverses |

---

### 8. `comptabilite_financiere_piece_recette`

> **Description**: Pièces comptables récapitulatives des recettes.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `bigint` | ❌ | **PK** (auto) | Identifiant unique |
| `numero` | `varchar(20)` | ❌ | **UNIQUE** | Numéro de la pièce (ex: PR-2026-00001) |
| `date_creation` | `timestamp` | ❌ | | Date de création |
| `date_piece` | `date` | ❌ | | Date comptable de la pièce |
| `montant_total` | `numeric(15,2)` | ❌ | | Montant total des recettes |
| `description` | `text` | ❌ | | Description des recettes incluses |
| `validee` | `boolean` | ❌ | | Indique si la pièce est validée |
| `date_validation` | `timestamp` | ✅ | | Date de validation |
| `comptable_id` | `bigint` | ❌ | FK → `personnel` | Comptable créateur |

---

### 9. `comptabilite_financiere_facture`

> **Description**: Factures émises par les caissiers, en attente de validation comptable.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id_facture` | `integer` | ❌ | **PK** (auto) | Identifiant unique |
| `numero_facture` | `varchar(50)` | ❌ | **UNIQUE** | Numéro de facture (ex: FAC-2026-00001) |
| `date_creation` | `timestamp` | ❌ | | Date de création |
| `montant` | `numeric(12,2)` | ❌ | | Montant de la facture |
| `motif` | `text` | ❌ | | Motif/description de la facture |
| `statut` | `varchar(20)` | ❌ | | Statut de la facture |
| `date_validation` | `timestamp` | ✅ | | Date de validation/rejet |
| `commentaire_rejet` | `text` | ✅ | | Commentaire si rejetée |
| `id_caissier_id` | `bigint` | ❌ | FK → `personnel` | Caissier créateur |
| `id_session_id` | `bigint` | ❌ | FK → `session` | Session patient |
| `id_comptable_validateur_id` | `bigint` | ✅ | FK → `personnel` | Comptable validateur |
| `quittance_id` | `integer` | ✅ | FK → `quittance` | Quittance générée après validation |

#### Valeurs possibles pour `statut`:
- `EN_ATTENTE` - En attente de validation
- `VALIDEE` - Validée par le comptable
- `REJETEE` - Rejetée avec commentaire
- `PAYEE` - Payée (quittance émise)

---

## Tables de moyens de paiement

### 10. `comptabilite_financiere_cheque`

> **Description**: Informations détaillées sur les paiements par chèque.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `numero_cheque` | `integer` | ❌ | **PK** (auto) | Identifiant interne |
| `numero_cheque_externe` | `varchar(50)` | ❌ | | Numéro imprimé sur le chèque |
| `date_emission` | `timestamp` | ❌ | | Date d'émission du chèque |
| `montant` | `numeric(12,2)` | ❌ | | Montant du chèque |
| `nom_banque` | `varchar(100)` | ❌ | | Nom de la banque émettrice |
| `nom_titulaire` | `varchar(200)` | ❌ | | Nom du titulaire du compte |
| `date_encaissement` | `timestamp` | ✅ | | Date d'encaissement effectif |
| `patient_id` | `bigint` | ❌ | FK → `patient` | Patient payeur |
| `quittance_id` | `integer` | ✅ | FK → `quittance` | Quittance associée |

---

### 11. `comptabilite_financiere_virement`

> **Description**: Informations sur les paiements par virement bancaire.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `integer` | ❌ | **PK** (auto) | Identifiant unique |
| `banque_emettrice` | `varchar(100)` | ❌ | | Nom de la banque du payeur |
| `reference_virement` | `varchar(100)` | ❌ | | Référence du virement |
| `date_virement` | `date` | ❌ | | Date du virement |
| `compte_source` | `varchar(50)` | ✅ | | IBAN/numéro de compte source |
| `quittance_id` | `integer` | ❌ | FK → `quittance` **UNIQUE** | Quittance associée |

---

### 12. `comptabilite_financiere_paiement_carte`

> **Description**: Informations sur les paiements par carte bancaire.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `integer` | ❌ | **PK** (auto) | Identifiant unique |
| `numero_carte_masque` | `varchar(20)` | ❌ | | 4 derniers chiffres (ex: ****1234) |
| `reference_transaction` | `varchar(100)` | ❌ | | Référence de la transaction TPE |
| `terminal_id` | `varchar(50)` | ✅ | | Identifiant du terminal de paiement |
| `quittance_id` | `integer` | ❌ | FK → `quittance` **UNIQUE** | Quittance associée |

---

### 13. `comptabilite_financiere_paiement_mobile`

> **Description**: Informations sur les paiements par mobile money (MTN, Orange, etc.).

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `integer` | ❌ | **PK** (auto) | Identifiant unique |
| `numero_payant` | `varchar(20)` | ❌ | | Numéro de téléphone du payeur |
| `operateur` | `varchar(20)` | ❌ | | Opérateur mobile |
| `reference_transaction` | `varchar(100)` | ❌ | | Référence de la transaction |
| `quittance_id` | `integer` | ❌ | FK → `quittance` **UNIQUE** | Quittance associée |

#### Valeurs possibles pour `operateur`:
- `MTN` - MTN Mobile Money
- `ORANGE` - Orange Money
- `NEXTTEL` - Nexttel Possa
- `CAMTEL` - Camtel Money

---

## Tables de liaison

### 14. `comptabilite_financiere_prestation_de_service`

> **Description**: Association entre les services hospitaliers et leurs codes comptables.

| Colonne | Type | Nullable | Contrainte | Description |
|---------|------|:--------:|------------|-------------|
| `id` | `bigint` | ❌ | **PK** (auto) | Identifiant unique |
| `code_comptable` | `integer` | ❌ | **UNIQUE** combiné | Code comptable associé |
| `service_rendu_id` | `bigint` | ❌ | FK → `service` | Service hospitalier |

> 📌 Contrainte d'unicité sur la combinaison (`code_comptable`, `service_rendu_id`).

---

## Index et Performances

### Index principaux par table

| Table | Index | Colonnes | Type |
|-------|-------|----------|------|
| `quittance` | `comptabilit_date_pa_709e80_idx` | `date_paiement DESC` | B-tree |
| `quittance` | `comptabilit_numero__32fa61_idx` | `numero_quittance` | B-tree |
| `quittance` | `comptabilit_validee_edec5d_idx` | `validee` | B-tree |
| `ecriture` | `comptabilit_date_ec_678953_idx` | `date_ecriture DESC` | B-tree |
| `ecriture` | `comptabilit_journal_277825_idx` | `journal_id` | B-tree |
| `compte_comptable` | `comptabilit_code_e0957d_idx` | `code` | B-tree |
| `piece_recette` | `comptabilit_validee_36c293_idx` | `validee` | B-tree |

### Recommandations de performance

1. **Partitionnement suggéré**: Pour les tables à fort volume (`quittance`, `ecriture_comptable`), envisager un partitionnement par date.

2. **Archivage**: Prévoir une politique d'archivage pour les enregistrements de plus de 5 ans.

3. **Vacuuming**: Configurer l'autovacuum avec des seuils adaptés au volume de transactions.

---

## Requêtes SQL Utiles

### 1. Récapitulatif des recettes par jour

```sql
SELECT 
    DATE(date_paiement) AS jour,
    type_recette,
    COUNT(*) AS nombre_quittances,
    SUM("Montant_paye") AS total_recettes
FROM comptabilite_financiere_quittance
WHERE validee = true
GROUP BY DATE(date_paiement), type_recette
ORDER BY jour DESC, type_recette;
```

### 2. Balance des comptes

```sql
SELECT 
    cc.code,
    cc.libelle,
    cc.classe,
    COALESCE(SUM(ec.debit), 0) AS total_debit,
    COALESCE(SUM(ec.credit), 0) AS total_credit,
    COALESCE(SUM(ec.debit), 0) - COALESCE(SUM(ec.credit), 0) AS solde
FROM comptabilite_financiere_compte_comptable cc
LEFT JOIN comptabilite_financiere_ecriture_comptable ec ON cc.id = ec.compte_id
GROUP BY cc.id, cc.code, cc.libelle, cc.classe
ORDER BY cc.code;
```

### 3. Grand livre d'un compte

```sql
SELECT 
    ec.date,
    ec.libelle,
    ec.reference_quittance,
    ec.debit,
    ec.credit,
    SUM(ec.debit - ec.credit) OVER (ORDER BY ec.date, ec.id) AS solde_cumule
FROM comptabilite_financiere_ecriture_comptable ec
WHERE ec.compte_id = 1  -- Remplacer par l'ID du compte
ORDER BY ec.date, ec.id;
```

### 4. Statistiques par mode de paiement

```sql
SELECT 
    mode_paiement,
    COUNT(*) AS nombre,
    SUM("Montant_paye") AS montant_total,
    AVG("Montant_paye") AS montant_moyen
FROM comptabilite_financiere_quittance
WHERE date_paiement >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mode_paiement
ORDER BY montant_total DESC;
```

### 5. Factures en attente de validation

```sql
SELECT 
    f.numero_facture,
    f.date_creation,
    f.montant,
    f.motif,
    p.nom || ' ' || p.prenom AS caissier
FROM comptabilite_financiere_facture f
JOIN gestion_hospitaliere_personnel p ON f.id_caissier_id = p.id
WHERE f.statut = 'EN_ATTENTE'
ORDER BY f.date_creation ASC;
```

### 6. Vérification de l'équilibre des écritures

```sql
SELECT 
    e.numero_ecriture,
    e.date_ecriture,
    e.libelle,
    SUM(le.montant_debit) AS total_debit,
    SUM(le.montant_credit) AS total_credit,
    CASE 
        WHEN SUM(le.montant_debit) = SUM(le.montant_credit) THEN 'ÉQUILIBRÉE'
        ELSE 'DÉSÉQUILIBRÉE'
    END AS statut_equilibre
FROM comptabilite_financiere_ecriture e
JOIN comptabilite_financiere_ligne_ecriture le ON e.id = le.ecriture_id
GROUP BY e.id, e.numero_ecriture, e.date_ecriture, e.libelle
HAVING SUM(le.montant_debit) != SUM(le.montant_credit);
```

---

## Annexes

### Légende des symboles

| Symbole | Signification |
|---------|---------------|
| ❌ | NOT NULL (obligatoire) |
| ✅ | NULL autorisé (optionnel) |
| **PK** | Clé primaire |
| **FK** | Clé étrangère |
| **UNIQUE** | Contrainte d'unicité |

### Contact

Pour toute question concernant ce schéma de base de données, contacter l'équipe de développement Fultang.

---

*Document généré automatiquement - © 2026 Fultang Hospital Management System*
