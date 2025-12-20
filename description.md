# Description des tables à créer

## Table 'services'

-> __id_service__ : entier, auto-incrément, clé primaire de la table.
-> __nom_service__: chaine de caractères, obligatoire lors de l'enregistrement, unique et non nul.
-> __desc_service__: texte, optionnel (peut etre nul, n'est pas obligatoire lors de l'enregistrement).
-> __chef_service__: entier, clé étrangère relative à la table __personnel__ (voir plus bas).
-> __date_creation__: date, enregistrée automatiquement comme étant la date d'enregistrement du service (pas fournie lors de l'enregistrement).

## Table 'personnel'

-> __id_personnel__: entier, auto-incrément, clé primaire de la table.
-> __nom__         : chaine de caractères, non nul, obligatoire lors de l'enregistrement.
-> __prenom__      : chaine de caractères, optionnel.
-> __date_naissance__: date, obligatoire lors de l'enregistrement, non nul.
-> __adresse__     : chaine de caractères, optionel.
-> __email__       : chaine de caractères, unique, non nul, ogligatoire lors de l'enregistrement, verification de la validité du mail.
-> __contact__     : chaine de carctères, unique, non nul, ogligatoire lors de l'enregistrement, contient exactement 9 chiffres et commence par 6.
-> __matricule__   : chaine de caractères, généré par le système (sous la forme : <deux-derniers-chiffres-l'annee-en-cours>FUL<numero-du-personnel-dans-la-bd>, le numéro du personnel devant être écrit sur 4 chiffres, par exemple 0000 pour le premier, 0001 pour le suivant et ainsi de suite. un exemple de matricule serait : 25FUL0025 pour le 25e personnel de 2025).
-> __date_embauche__: date, enregistrée automatiquement comme étant la date d'enregistrement du personnel (pas demandée lors de l'enregistrement).
-> __salaire__     : nombre flotant strictement positif, n'est pas obligatoire lors de l'enregistrement.
-> __poste__       : réceptioniste, caissier, infirmier, médecin, laborantin, pharmacien, comptable, directeur (nécessaire lors de l'enregistrement).
-> __statut__      : licencié, retraité, actif (pas nécessaire lors de l'enregistrement : par défaut à actif).
-> __mot_de_passe__: mot de passe hashé du personnel. Lors de l'enregistrement, l'utilisateur ne fournit pas le mot de passe; ce-dernier est généré automatiquement (en respectant la robustesse), envoyé par mail (le mail saisi lors de l'enregistrement), puis hashé avant d'être mis en base de données. Il doit y avoir la possibilité de changer son mot de passe.
-> __statut_de_connexion__: actif, inactif (pas nécessaire lors de l'enregistrement : actif lorsque le personnel se connecte au système et inactif lorsqu'il se déconnecte).
-> __service__     : id du service auquel est rattaché le personnel (peut être null).
-> __les champs pour les informations liées à l'authentification__.

## Table 'medecins'
Hérite de la table __personnel__ (et donc de tous ses attributs et contraintes); en plus de cela, ajoute l'attribut : 
-> __spécialité__ : chaine de caractères, non nul, nécessaire lors de l'enregistrement.


## Table 'patients'

-> __id_patient__ : entier, auto-increment, clé primaire de la table.
-> __nom__         : chaine de caractères, non nul, obligatoire lors de l'enregistrement.
-> __prenom__      : chaine de caractères, optionnel.
-> __date_naissance__: date, obligatoire lors de l'enregistrement, non nul.
-> __adresse__     : chaine de caractères, optionel.
-> __email__       : chaine de caractères, unique, peut être nul, n'est pas ogligatoire lors de l'enregistrement, verification de la validité du mail.
-> __contact__     : chaine de carctères, unique, non nul, ogligatoire lors de l'enregistrement, contient exactement 9 chiffres et commence par 6.
-> __nom_proche__  : chaine de caractères (le nom d'un proche du patient, à contacter en cas d'urgence), obligatoire lors de l'enregistrement.
-> __contact_proche__: contact du proche en question. chaine de carctères, unique, non nul, ogligatoire lors de l'enregistrement, contient exactement 9 chiffres et commence par 6.
-> __matricule__   : chaine de caractères, généré par le système (sous la forme : <deux-derniers-chiffres-l'annee-en-cours>PAT<numero-du-personnel-dans-la-bd>, le numéro du patient devant être écrit sur 5 chiffres, par exemple 00000 pour le premier, 00001 pour le suivant et ainsi de suite. un exemple de matricule serait : 25PAT00025 pour le 25e patient de 2025).
-> __date_inscription__: date, automatiquement prise comme la date d'enregistrement (pas necessaire lors de  l'enregistrement).
-> __id_personnel__: entier, clé étrangère relative à la table __personnel__ (l'id du personnel ayant enregistré le patient). Obligatoire lors de l'enregistrement.


## Table 'Sessions'

-> __id_session__: entier, auto-increment, clé primaire de la table.
-> __debut__     : datetime, la date et l'heure de début (prises comme la date et l'heure de l'enregistrement).
-> __fin__       : datetime, pas necessaire lors de l'enregistrement.
-> __id_patient__: entier, clé étrangère relative à la table __patient__.
-> __id_personnel__: entier, clé étrangère relative à la table __personnel__. (celui qui a ouvert la session en question)
-> __service_courant__: chaine de caractères (doit correspondre à un nom de service dans la table service).
-> __personnel_responsable__ chaine de caractères (doit correspondre à un poste dans la table personnel).
-> __statut__: en attente, en cours, terminée. (pas necessaire lors de l'enregistrement, par défaut à en cours).
-> __situation_patient__: en attente, reçu (pas necessaire lors de l'enregistrement, par défaut à en attente).

## Table 'Chambres'

-> __id_chambre__: entier, auto-increment, clé primaire de la table.
-> __numero_chambre__: chaine de caractères, unique, non nul, obligatoire lors de l'enregistrement.
-> __nombre_places_total__: entier positif et différent de 0.
-> __nombre_places_dispo__: entier positif ou nul et inférieur ou égal à __nombre_places_total__. (pas necessaire lors de l'enregistrement)
-> __tarif_journalier__: nombre flottant strictement positif.

## Table 'observations-medicales'

-> __id_observation__: entier, auto-increment, clé primaire de la table.
-> __id_personnel__  : entier, clé étrangère relative à la table __personnel__.
-> __observation__   : texte, le contenu de l'observation.
-> __date_heure__    : datetime (pris directement comme la date et l'heure de l'enregistrement, donc pas demandé lors de l'enregistrement).
-> __id_session__    : entier, clé étrangère relative à la table __sessions__.

## Table 'prescriptions-medicaments'

-> __id_prescription__ : entier, auto-increment, clé primaire de la table.
-> __id_medecin__      : entier, clé étrangère relative à la table __medecins__.
-> __liste_medicaments__: texte.
-> __id_session__      : entier, clé étrangère relative à la table __sessions__.
-> __date_heure__    : datetime (pris directement comme la date et l'heure de l'enregistrement, donc pas demandé lors de l'enregistrement).

## Table 'prescriptions-examens'

-> __id_prescription__ : entier, auto-increment, clé primaire de la table.
-> __id_medecin__      : entier, clé étrangère relative à la table __medecins__.
-> __nom_examen__      : chaine de caractères.
-> __id_session__      : entier, clé étrangère relative à la table __sessions__.
-> __date_heure__    : datetime (pris directement comme la date et l'heure de l'enregistrement, donc pas demandé lors de l'enregistrement).

## Table 'resultats-examens'

-> __id_resultat__ : entier, auto-increment, clé primaire de la table.
-> __id_medecin__      : entier, clé étrangère relative à la table __medecins__.
-> __resultat__: texte.
-> __id_prescription__      : entier, clé étrangère relative à la table __prescriptions-examens__.
-> __date_heure__    : datetime (pris directement comme la date et l'heure de l'enregistrement, donc pas demandé lors de l'enregistrement).


## Table 'hospitalisations'

-> __id_hospitalisation__: entier, auto-increment, clé primaire de la table.
-> __id_session__        : entier, clé étrangère relative à la table __sessions__.
-> __id_chambre__        : entier, clé étrangère relative à la table __chambres__.
-> __debut__     : datetime, la date et l'heure de début (prises comme la date et l'heure de l'enregistrement).
-> __fin__       : datetime, pas necessaire lors de l'enregistrement.
-> __statut__    : en cours, terminée (pas nécessaire lors de l'enregistrment, par défaut à en cours).
-> __id_medecin__: entier, clé étrangère relative à la table __medecins__.

## Table 'rendez-vous'

-> __id_rendez-vous__: entier, auto-increment, clé primaire de la table.
-> __date_heure__    : datetime (necessaire lors de l'enregistrment).
-> __id_medecin__    : entier, clé étrangère relative à la table __medecins__.
-> __id_patient__    : entier, clé étrangère relative à la table __patients__.

## Table 'dossier-patient'

-> __id_dossier__: entier, auto-increment, clé primaire de la table.
-> __id_patient__: entier, clé étrangère relative à la table __patients__ (unique champ obligatoire lors de l'enregistrement).
-> __groupe-sanguin__: chaine de caractères.
-> __facteur-rhesus__: chaine de caractères.
-> __poids__: nombre flottant strictement positif.
-> __taille__: nombre flottant strictement positif.
-> __allergies__: texte.
-> __antécédants__: texte.

# Description du workflow et des 'endpoints'

## La table 'admin'
Cette table aura une seule entrée (un seul élément). Ses colonnes sont : login et password. Elle stocke les paramètres de connexion du responsable informantique de l'hopital. Il n'y aura pas d'insertion possible dans cette table (il sera quand même possible de modifier les valeurs existantes).

## Création des services de l'hopital

-> __Créer un service__ : Pour créer un service, on fournit non seulement les informations propres au service à créer, mais aussi tous les champs du chef de service (qui sera donc ajouté dans la table personnel s'il n'y est pas encore). Cependant, ce n'est que l'id du chef de service qui est stocké dans la table service. Après enregistrement, on retourne le service créé (tous les champs).

-> __Modifier un service__ : on peut modifier les valeurs des différents champs d'un service (put ou patch) en précisant l'id ou le nom du service en question. On retourne le service mis à jour.
-> __Lire tous les services__: Pas de corps de requête. On retourne la liste de tous les services.
-> __Voir tous le personnel affecté à un service__: corps de la requête : id ou nom du service. On retourne la liste du personnel.
-> __Voir tous les médecins d'un service__: corps de la requête : id ou nom du service. On retourne la liste des médecins

## Création du personnel
-> __Créer un membre du personnel__ : corps de la requête : tous les champs de la table __personnel__ sauf ceux qui sont auto-générés ou marqués comme non obligatoire lors de l'enregistrement. Une fois la création faite, on envoie un mail au membre qui vient d'être créé; le mail contient son mot de passe et l'invite à se connecter au système pour le modifier. Ce mail n'est valide que pendant 3 jours (un timer qui calcule). Passés ces trois jours, si la connexion n'a pas encore été faite, on place la valeur __interdit__ dans le champ __mot de passe__, ce qui empêche toute connexion de la part de l'utilisateur (i.e si un utilisateur à la valeur __interdit__ (en clair) dans sa colonne __mot de passe__ sa connexion échoue). Pour arranger cela, il faut que l'admin (celui qui enregistre les membres du personnel) demande au système de générer un nouveau mot de passe pour le membre (voir le endpoint suivant). Ce endpoint retourne le nouveau personnel créé.
Note : dans le cas où le membre du personnel se connecte dans les trois jours, son mot de passe n'expire plus!!!

-> __Générer un nouveau mot de passe pour un membre__ : on fournit le mail du membre en question, le système génère un nouveau mot de passe et l'envoie au membre en question (encore pour une durée de 3 jours max). Ce endpoint retourne un message et un code de succès.
-> __Modification du mot de passe__: lorsque l'utilisateur reçoit son mail, il se connecte au système (dans les trois jours) a la possibilité de changer son mot de passe. Il fournit l'ancien, le nouveau (robuste) et une confirmation du nouveau et enfin son mail (ou bien son id). On retourne le personnel mis à jour.
-> __Modification des champs du personnel__: endpoints de modification des autres champs.

## Le réceptioniste
-> __Connexion au système__ : Il se connecte au système en fournissant son mail (ou matricule) et son mot de passe. Le système vérifie ses informations et en cas de succès retourne toutes les informations du user. En cas de problème, un message clair est renvoyé. (cette procédure de connexion est la même pour les membres du personnel).
-> __Voir la liste des patients__: corps de la requête vide. Le système retourne tous les patients.
-> __Inscrire un nouveau patient__: Il fournit toutes les informations des champs de la table patient (sauf ceux auto-générés et ceux marqués comme non obligatoires lors de l'enregistrement) ainsi que l'id du réceptioniste effectuant l'inscription. Le système vérifie systématiquement la validité et chaque donnée, et en cas de problème retourne un message clair. En cas de succès, le patient est créé et on retourne toutes les informations dudit patient.
-> __Rechercher un patient__: prend en entrée des caractères et recherche les patients ayant la suite de caractères reçue dans leur nom ou prenom puis renvoie la liste des patients trouvés.
-> __Voir la liste des patiens hospitalisés__: aucune donnée en entrée. Le système recherche tous les patients hospitalisés (leurs id se sont dans la table hospitalisation), et retourne la liste des patients trouvés (en ajoutant aux champs de la table patient les champs comme debut de l'hospitalisation,statut, chambre). Pour cela on récupère aussi l'id de la chambre dans la table hospitalisation et on recherche le numéro de chambre correspondant.
-> __Prendre un rendez-vous__ : prend en entrée le matricule du patient, celui du medecin, la date et l'heure du rendez-vous. Le sytème recherche l'id du paatient à partir de son matricule, pareil pour le médecin, puis fait une insertion dans la table rendez-vous avec les informations obtenues.

## L'infirmier
-> __Voir la liste des patients en attente dans un service (pour infirmier)__: prend en entrée le service auquel appartient l'infirmier. Recherche dans la table des sessions toutes les sessions dont le status est différent de 'terminée' et dont la valeur du champ 'situation_patient' est 'en attente' et dont la valeur du champ 'personnel_responsable' est égale à infirmier. Une fois ces sessions trouvées, on recherche les patients correspondants (en se servant du lien entre les tables 'sessions' et 'patients') puis on retourne la liste de tous les patients retenus ayant ajouté un attribut : id_session à chaque patient.
-> __Selectionner un patient de la liste__ : prend en entrée l'id de la session correspondante. Lorsque l'infirmier sélectionne un patient de la liste, la valeur du champ 'situation_patient' passe à 'reçu'. (endpoint de mise à jour de ce champ).
-> __Enregistrer des observations médicales__: prend en entrée l'id du personnel qui réalise l'observation, ainsi que tous les champs de la table observations-medicales sauf ceux marqués comme non obligatoire lors de l'insertion et ceux auto-générés.
-> __Redirection du patient__: prend en entrée le type de redirection (vers un service ou vers un personnel) ainsi que la redirection elle-même (nom du service ou poste du personnel) et enfin l'id de la session. Si c'est une redirection vers un service, on change la valeur du champ 'service_courant' de la session en y plaçant la valeur du nom du service reçu en paramètre. Si c'est une redirection vers un personnel, on change plutôt la valeur du champ 'personnel_responsable' en la valeur reçue. Dans les deux cas la valeur du champ 'situation_patient' prend la valeur : en attente.


## Le médecin
-> __Voir la liste des patients en attente dans un service (pour médecin)__: prend en entrée le service auquel appartient le médecin. Recherche dans la table des sessions toutes les sessions dont le status est différent de 'terminée' et dont la valeur du champ 'situation_patient' est 'en attente' et dont la valeur du champ 'personnel_responsable' est égale à medecin. Une fois ces sessions trouvées, on recherche les patients correspondants (en se servant du lien entre les tables 'sessions' et 'patients') puis on retourne la liste de tous les patients retenus ayant ajouté un attribut : id_session à chaque patient.
-> __Selectionner un patient de la liste__ (pareil que pour l'infirmier): prend en entrée l'id de la session correspondante. Lorsque le medecin sélectionne un patient de la liste, la valeur du champ 'situation_patient' passe à 'reçu'. (endpoint de mise à jour de ce champ).
-> __Enregistrer des observations médicales__: (pareil que pour l'infirmier).
-> __consulter le dossier d'un patient__: prend en entrée l'id du patient correspondant.
-> __Enregistrer une prescription de médicaments__: prend tous les champs de la table prescriptions-medicaments sauf ceux auto-générés et ceux marqués comme non obligatoire lors de l'enregistrement. (faire de meme pour l'ajout d'une prescription d'examen, resultats d'examen, hospitalisation, chambre). Pour ces tables ajoute les lectures suivantes : toutes les priscriptions, toutes les prescriptions d'un medecin donné (par son id), pareil pour les résultats, toutes les chambres, toutes les chambres ayant encore au moins un place disponible, les chambres dont le tarif est sup à une valeur, inf à une valeur.
Note : lorsque l'on enregistre une hospitalisation avec l'id d'une chambre, le nombre de places disponibles de la chambre correspondante diminue de 1.
       On ne peut enregistrer une hospitalisation avec l'id d'une chambre dont le nombre de places n'est pas strictement positif.

Les tests unitaires!!!!!!!!
Un endpoint pour tester si l'api est fonctionnelle (tester la santé de l'api) avant l'envoie de requêtes.

On ne peut pas creer une nouvelle session avec un patient donné s'il existe deja une session avec ce patient et  dont le statut n'est pas : 'terminee' 
